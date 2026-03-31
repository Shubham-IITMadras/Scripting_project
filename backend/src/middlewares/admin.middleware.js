import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

export const verifyAdmin = asyncHandler(
    async(req, res , next) =>{
        
            const user = req.user;

            if(!user) throw new ApiError(401,"Invalid Access")

            if(user.role != "admin"){
                throw new ApiError(403, "Invalid Access")
            }
            next()
        

    }
)