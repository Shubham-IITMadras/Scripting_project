import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

const generateAccessAndRefreshToken = async(userId) =>{
    try{
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave : false })

        return {accessToken,refreshToken}
    }catch(error){
        throw new ApiError(500,"Something went wrong while generating access and refresh Token")
    }
}

const registerUser = asyncHandler(async(req ,res) =>{

    const {fullName, email, username, password } = req.body

    if(
        [fullName, email, username, password].some((field) => !field || field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if(existedUser){
        throw new ApiError(409, "User With Given email or username already exists ")

    }

    const user = await User.create({
        fullName,
        email,
        username,
        password,
        role: "student"
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
})

const loginUser = asyncHandler(
    async(req, res) =>{

        const {email, password} = req.body

        if(!password || !email) {
            throw new ApiError(400, "email and password are required")
        }

        const user = await User.findOne( {email} )

        if(!user){
            throw new ApiError(404, "User does not Exist")
        }

        const isPasswordValid = await user.isPasswordCorrect(password)

        if(!isPasswordValid){
            throw new ApiError(401, "Invalid Credentials")
        }

        const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

        const options = {
            httpOnly: true,
            sameSite: "lax",
            secure: false
        }

        return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged In successFully"
            )
        )
    }
)


const logoutUser = asyncHandler(
    async(req , res) =>{
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $unset:{
                    refreshToken: 1
                }
            },
            {
                new: true
            }
        )

        const options = {
            httpOnly: true,
            sameSite: "lax",
            secure: false
        }

        return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "USer Logged Out Successfully")
        )
    }
)

const refreshToken = asyncHandler(
    async(req, res) =>{
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

        if(!incomingRefreshToken){
            throw new ApiError(401,"Unauthorized request")
        }

        try{
            const decodedToken = jwt.verify(
                incomingRefreshToken,
                process.env.REFRESH_TOKEN_SECRET
            )

            const user = await User.findById(decodedToken?._id)

            if(!user){
                throw new ApiError(401,"Invalid refresh token")
            }

            if(incomingRefreshToken !== user?.refreshToken){
                throw new ApiError(401, "Refresh token is expired or used")
            }

            const options = {
                httpOnly: true,
                sameSite: "lax",
                secure: false
                
            }

            const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id)

            return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {accessToken,refreshToken: newRefreshToken},
                    "Access Token refreshed"
                )
            )
        }catch(error ){
            throw new ApiError(401, error?.message || "Invalid refresh token")
        }
    }
)


const changeCurrentPassword = asyncHandler(
    async(req,res) =>{
        const {oldPassword, newPassword} = req.body

        const user = await User.findById(req.user?._id)

        const isPasswordValid = await user.isPasswordCorrect(oldPassword)

        if(!isPasswordValid){
            throw new ApiError(400,"Invalid Old Password ")
        }

        user.password = newPassword
        await user.save({validateBeforeSave: false})

        return res.status(200)
        .json(new ApiResponse(200, {}, "Passwordchanged successfullly"))

    }
)

const getAllUsers = asyncHandler(
    async(req,res) =>{
        const users = await User.find()

        if(!users){
            throw new ApiError(404, " Users are not fetched ")
        }

        return res.status(200).json(
            new ApiResponse(200, users, " Users fetched successfully")
        )
    }
)







const removeUser = asyncHandler(async(req, res) => {
    const { id } = req.params;
    if (!id) throw new ApiError(400, "User ID is required");

    const user = await User.findByIdAndDelete(id);
    if (!user) throw new ApiError(404, "User not found");

    return res.status(200).json(new ApiResponse(200, {}, "User removed successfully"));
});

const addUser = asyncHandler(async(req, res) => {
    const {fullName, email, username, password, role } = req.body;
    
    // Automatically generate username if not provided
    const userRole = role || "student";
    const userHandle = username || email.split("@")[0] + Math.floor(Math.random() * 1000);

    if([fullName, email, password].some((field) => !field || field?.trim() === "")) {
        throw new ApiError(400, "FullName, Email, and Password are required");
    }

    const existedUser = await User.findOne({ $or: [{ username: userHandle }, { email }] });
    if(existedUser) throw new ApiError(409, "User with this email or username already exists");

    const user = await User.create({
        fullName, 
        email, 
        username: userHandle, 
        password, 
        role: userRole
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    return res.status(201).json(new ApiResponse(200, createdUser, "User added successfully"));
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshToken,
    changeCurrentPassword,
    getAllUsers,
    addUser,
    removeUser
}


