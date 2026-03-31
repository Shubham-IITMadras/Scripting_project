import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import { Notification } from "../models/notification.model.js"




const loadNotifications = asyncHandler(async (req, res) => {

    const userId = req.user._id

    const notifications = await Notification.find({
        user: userId
    }).sort({ createdAt: -1 })

    return res.status(200).json(
        new ApiResponse(
            200,
            notifications,
            "Notifications loaded successfully"
        )
    )
})

export{
    loadNotifications
}