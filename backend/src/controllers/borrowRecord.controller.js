import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler} from "../utils/asyncHandler.js"
import mongoose from "mongoose"
import { BorrowRecord } from "../models/borrowRecord.model.js"
import { Book } from "../models/book.model.js"

const issueBook = asyncHandler(async (req, res) => {

    const { bookId, dueDate } = req.body
    const userId = req.user._id

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
        throw new ApiError(400, "Invalid book id")
    }

    const alreadyIssued = await BorrowRecord.findOne({
        user: userId,
        book: bookId,
        status: "issued"
    })

    if (alreadyIssued) {
        throw new ApiError(400, "You already have this book issued")
    }

    const book = await Book.findOneAndUpdate(
        { _id: bookId, availableCopies: { $gt: 0 } },
        { $inc: { availableCopies: -1 } },
        { new: true }
    )

    if (!book) {
        throw new ApiError(400, "Book not available")
    }

    const record = await BorrowRecord.create({
        user: userId,
        book: bookId,
        dueDate
    })

    return res.status(201).json(
        new ApiResponse(201, record, "Book issued successfully")
    )
})


const returnBook = asyncHandler(async (req, res) => {

    const { recordId } = req.params
    const userId = req.user._id

    if (!mongoose.Types.ObjectId.isValid(recordId)) {
        throw new ApiError(400, "Invalid record id")
    }

    const record = await BorrowRecord.findOne({
        _id: recordId,
        user: userId,
        status: "issued"
    })

    if (!record) {
        throw new ApiError(404, "Active borrow record not found")
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

    return res.status(200).json(
        new ApiResponse(200, record, "Book returned successfully")
    )
})


const getAllIssuedRecords = asyncHandler(async (req, res) => {

    const records = await BorrowRecord.find({ status: "issued" })
        .populate("user", "fullName email")
        .populate("book")

    return res.status(200).json(
        new ApiResponse(200, records, "All issued records")
    )
})

const getMyIssuedRecords = asyncHandler(async (req, res) => {

    const userId = req.user._id

    const records = await BorrowRecord.find({
        user : userId,
        status: "issued"
        })
        .populate("user", "fullName email")
        .populate("book")

    return res.status(200).json(
        new ApiResponse(200, records, "All issued records")
    )
})

const getMyRecords = asyncHandler(async (req, res) => {

    const userId = req.user._id

    const records = await BorrowRecord.find({ user: userId })
        .populate("book")

    return res.status(200).json(
        new ApiResponse(200, records, "My borrow records")
    )
})

const getAllRecords = asyncHandler(async (req, res) => {

    const userId = req.user._id

    const records = await BorrowRecord.find()
        .populate("book").populate("user")

    return res.status(200).json(
        new ApiResponse(200, records, "My borrow records")
    )
})

const getAllOverdueBooks = asyncHandler(async (req, res) => {

    const today = new Date()

    const overdue = await BorrowRecord.find({
        status: "issued",
        dueDate: { $lt: today }
    })
    .populate("user", "fullName email")
    .populate("book")

    for (let record of overdue) {
        const due = new Date(record.dueDate);
        const late = Math.floor((today - due) / (1000 * 60 * 60 * 24));

        const newFine = late * 10;

        // Update only if changed (avoid unnecessary DB writes)
        if (record.fine !== newFine) {
            record.fine = newFine;
            await record.save();
        }
    }

    return res.status(200).json(
        new ApiResponse(200, overdue, "Overdue books")
    )
})

const getMyOverdueBooks = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const today = new Date();

    const overdue = await BorrowRecord.find({
        user: userId,
        status: "issued",
        dueDate: { $lt: today }
    })
    .populate("user", "fullName email")
    .populate("book");

    for (let record of overdue) {
        const due = new Date(record.dueDate);
        const late = Math.floor((today - due) / (1000 * 60 * 60 * 24));

        const newFine = late * 10;

        // Update only if changed (avoid unnecessary DB writes)
        if (record.fine !== newFine) {
            record.fine = newFine;
            await record.save();
        }
    }

    return res.status(200).json(
        new ApiResponse(200, overdue, "Overdue books")
    );
});

const getAllDueSoonBooks = asyncHandler(async (req, res) => {

    const today = new Date()

    const threeDaysLater = new Date()
    threeDaysLater.setDate(today.getDate() + 3)

    const dueSoon = await BorrowRecord.find({
        status: "issued",
        dueDate: {
            $gte: today,
            $lte: threeDaysLater
        }
    })
    .populate("user", "fullName email")
    .populate("book")

    return res.status(200).json(
        new ApiResponse(200, dueSoon, "Books due within 3 days")
    )
})


const getMyDueSoonBooks = asyncHandler(async (req, res) => {
    const userId = req.user._id

    const today = new Date()

    const threeDaysLater = new Date()
    threeDaysLater.setDate(today.getDate() + 3)

    const dueSoon = await BorrowRecord.find({
        user : userId,
        status: "issued",
        dueDate: {
            $gte: today,
            $lte: threeDaysLater
        }
    })
    .populate("user", "fullName email")
    .populate("book")

    return res.status(200).json(
        new ApiResponse(200, dueSoon, "Books due within 3 days")
    )
})



export {
    issueBook,
    returnBook,
    getAllIssuedRecords,
    getMyRecords,
    getAllOverdueBooks,
    getMyIssuedRecords,
    getAllDueSoonBooks,
    getMyDueSoonBooks,
    getMyOverdueBooks,
    getAllRecords 
}