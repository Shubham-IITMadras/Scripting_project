import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Request } from "../models/request.model.js"
import mongoose from "mongoose"
import { BorrowRecord } from "../models/borrowRecord.model.js"
import { Book } from "../models/book.model.js"
import { Notification } from "../models/notification.model.js"


const createRequest = asyncHandler(
    async(req,res) =>{
        const { bookId, type } = req.body
        const userId = req.user._id

        const existedRequest = await Request.findOne({
            user: userId,
            book: bookId,
            type
        })
        if(existedRequest) throw new ApiError(409, "Given Request alreay exists ");

        const request = await Request.create({
            user: userId,
            book: bookId,
            type
        })

        return res.status(200).json(
            new ApiResponse(200,request, "Request created successfully")
        )
    }
)


const handleRequest = asyncHandler(async (req, res) => {

    const { reqId, status } = req.body

    if (!["approved", "rejected"].includes(status)) {
        throw new ApiError(400, "Invalid status")
    }

    const request = await Request.findById(reqId)

    if (!request) {
        throw new ApiError(404, "Request not found")
    }

    let message = ""

    if (status === "approved") {

        if (request.type === "issue") {

            const bookId = request.book
            const userId = request.user
            const dueDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)

            const book = await Book.findOneAndUpdate(
                { _id: bookId, availableCopies: { $gt: 0 } },
                { $inc: { availableCopies: -1 } },
                { new: true }
            )

            if (!book) {
                throw new ApiError(400, "Book not available")
            }

            await BorrowRecord.create({
                user: userId,
                book: bookId,
                dueDate
            })

            message = `Your request has been approved. The book "${book.title}" has been issued.`
        }

        if (request.type === "return") {

            const record = await BorrowRecord.findOne({
                user: request.user,
                book: request.book,
                status: "issued"
            })

            if (!record) {
                throw new ApiError(404, "Borrow record not found")
            }

            record.returnDate = new Date()
            record.status = "returned"

            if (record.returnDate > record.dueDate) {

                const lateDays = Math.ceil(
                    (record.returnDate - record.dueDate) / (1000 * 60 * 60 * 24)
                )

                record.fine = lateDays * 10
            }

            await record.save()

            await Book.findByIdAndUpdate(
                record.book,
                { $inc: { availableCopies: 1 } }
            )

            message = "Your return request has been approved. Thank you for returning the book."
        }

    } else {

        message = `Your ${request.type} request has been rejected by the librarian.`
    }

    await Notification.create({
        user: request.user,
        message
    })

    await Request.findByIdAndDelete(reqId)

    return res.status(200).json(
        new ApiResponse(200, {}, `Request ${status} successfully`)
    )
})


const getMyRequests = asyncHandler(
    async (req, res) => {

        const userId = req.user._id

        const requests = await Request.find({
            user: userId
        })
        .populate("book")
        .sort({ createdAt: -1 })

        return res.status(200).json(
            new ApiResponse(
                200,
                requests,
                "User requests fetched successfully"
            )
        )
    }
)


const getAllRequests = asyncHandler(
    async (req, res) => {

        const requests = await Request.find()
        .populate("book user")
        .sort({ createdAt: -1 })

        return res.status(200).json(
            new ApiResponse(
                200,
                requests,
                "All requests fetched successfully"
            )
        )
    }
)

const cancelRequest = asyncHandler(
    async (req, res) => {

        const { reqId } = req.params
        const userId = req.user._id

        const request = await Request.findById(reqId)

        if (!request) {
            throw new ApiError(404, "Request not found")
        }

        if (request.user.toString() !== userId.toString()) {
            throw new ApiError(403, "You are not allowed to cancel this request")
        }

        if (request.status !== "pending") {
            throw new ApiError(400, "Only pending requests can be cancelled")
        }

        await request.deleteOne()

        return res.status(200).json(
            new ApiResponse(200, {}, "Request cancelled successfully")
        )
    }
)

export {
    createRequest,
    handleRequest,
    getMyRequests,
    getAllRequests,
    cancelRequest
}

