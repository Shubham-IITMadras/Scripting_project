import mongoose, {Schema} from "mongoose";

const borrowRecordSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        book: {
            type: Schema.Types.ObjectId,
            ref: "Book",
            required: true,
            index: true
        },
        issueDate: {
            type: Date,
            default: Date.now
        },
        dueDate: {
            type: Date,
            required: true
        },
        returnDate: {
            type: Date,
            default: null
        },
        status: {
            type: String,
            enum: ["issued", "returned"],
            default: "issued"
        },
        fine: {
            type: Number,
            default: 0,
            min: 0
        }

    },
    {timestamps : true}
)

export const BorrowRecord = mongoose.model("BorrowRecord", borrowRecordSchema)