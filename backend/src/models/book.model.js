import mongoose, {Schema} from "mongoose";

const bookSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        author: {
            type: String,
            required: true,
            trim: true,
        },
        edition: {
            type: Number
        },
        branch:{
            type: String,
            enum : ["CSE", "CE", "IT", "ME", "EE", "ECE","Other"],
            default : "Other"
        },
        isbn_no:{
            type: String,
            required: true,
            unique: true,
            trim: true,
            index:true
        },
        publish_year:{
            type: Number,
        },
        totalCopies: {
            type: Number,
            required: true,
            min: 0
        },
        availableCopies: {
            type: Number,
            required: true,
            min: 0
        },
        coverImage: {
            type: String,
            default: ""
        }
        
    }
)


export const Book = mongoose.model("Book", bookSchema)