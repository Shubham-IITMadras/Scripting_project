import mongoose,{ Schema } from "mongoose";

const requestSchema = new Schema({
    user: {
        type : mongoose.Schema.ObjectId,
        ref:"User",
        required: true
    },
    book: {
        type: mongoose.Schema.ObjectId,
        ref:"Book",
        required: true
    },
    type: {
        type: String,
        enum: ["issue", "return"],
        required: true
    },
    status : {
        type: String,
        enum:["pending","approved","rejected"],
        default: "pending"

    },
},{timestamps : true})

export const Request = mongoose.model("Request", requestSchema)