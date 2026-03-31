import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Book } from "../models/book.model.js";
import { BorrowRecord } from "../models/borrowRecord.model.js";
import mongoose from "mongoose";

const addBook = asyncHandler(
    async(req,res) =>{
        const {title, author, isbn_no, edition, branch, publish_year, totalCopies} = req.body

        if (
            !title?.trim() ||
            !author?.trim() ||
            !isbn_no?.trim() ||
            !branch?.trim() ||
            !publish_year ||
            totalCopies === undefined ||
            totalCopies === null
        ) {
            throw new ApiError(400, "All required fields must be provided")
        }

        const existedBook = await Book.findOne({ isbn_no })

        if(existedBook) throw new ApiError(409,"Given Book Already Exists");

        const book = await Book.create({
            title,
            author,
            isbn_no,
            publish_year,
            edition,
            branch,
            totalCopies,
            availableCopies : totalCopies
        })

        


        return res.status(201).json(
            new ApiResponse(201, book, "Book Added  successfully")
        )

    }
)

const removeBook = asyncHandler(
    async (req, res) => {
        const { isbn_no } = req.params


        if (!isbn_no) {
            throw new ApiError(400, "ISBN number is required")
        }

        const deletedBook = await Book.findOne({ isbn_no })

        if (!deletedBook) {
            throw new ApiError(404, "Book with given ISBN does not exist")
        }

        const isIssued = await BorrowRecord.findOne(
            {
                book: deletedBook._id,
                status : "issued"
            }
        )

        if(isIssued){
            throw new ApiError(409, " Book is currently Issued by Some Users")
        }

        await deletedBook.deleteOne();

        return res.status(200).json(
            new ApiResponse(200, {}, "Book removed successfully")
        )
    }
)


const updateBook = asyncHandler(
    async(req,res) =>{
        
        const bookId = req.params.bookId

        if(!mongoose.Types.ObjectId.isValid(bookId)){
            throw new ApiError(400, "Invalid book id")
        }

        const updatedBook = await Book.findByIdAndUpdate(
            bookId,
            { $set : req.body},
            {new: true, runValidators: true}
        )

        if(!updatedBook) throw new ApiError(404, "Book with given id doesn't exists");

        return res.status(200).json(
            new ApiResponse(200, updatedBook, "Book updated successfully")
        )
            
        


    }
)



const getAllBooks = asyncHandler(
    async(req,res) =>{
        const books = await Book.find()

        return res.status(200).json(
            new ApiResponse(200, books, "Books loaded successsfully")
        )
    }
)


const getUserBooks = asyncHandler(
    async(req,res) =>{
        const userId = req.user._id
        const borrowRecord = await BorrowRecord.find({ 
            user : userId,
            status : "issued"
        } ).populate("book")
        const books = []

        for(let i=0; i<borrowRecord.length; i++){
            books.push(borrowRecord[i].book)
        }

        return res.status(200).json(
            new ApiResponse(200 , books, "User Book fetched successfully")
        )
    }
)


const getOverdueBooks = asyncHandler(async (req,res)=>{

    const today = new Date()
    today.setHours(0,0,0,0)

    const records = await BorrowRecord.find({
        status: "issued",
        dueDate: { $lt: today }
    }).populate("book")

    for(let i=0;i<records.length;i++){

        const dueDate = new Date(records[i].dueDate)
        dueDate.setHours(0,0,0,0)

        const daysLate = Math.floor(
            (today - dueDate) / (1000 * 60 * 60 * 24)
        )

        const fine = daysLate * 3

        records[i].fine = fine

        await records[i].save()
    }

    return res.status(200).json(
        new ApiResponse(200, records, "Overdue books fetched successfully")
    )

})


const getDueSoonBooks = asyncHandler(async (req,res)=>{

    const today = new Date()

    const threeDaysLater = new Date()
    threeDaysLater.setDate(today.getDate() + 3)

    const records = await BorrowRecord.find({
        status: "issued",
        dueDate: {
            $gte: today,
            $lte: threeDaysLater
        }
    }).populate("book")

    return res.status(200).json(
        new ApiResponse(200, records, "Due soon books fetched successfully")
    )

})

export {
    addBook,
    removeBook,
    updateBook,
    getAllBooks,
    getUserBooks,
    getDueSoonBooks,
    getOverdueBooks
}