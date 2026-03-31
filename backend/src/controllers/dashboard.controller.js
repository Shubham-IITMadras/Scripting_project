import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Book } from "../models/book.model.js";
import { BorrowRecord } from "../models/borrowRecord.model.js";

const getDashboardStats = asyncHandler(async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: { $in: ["student", "faculty"] } });
        const totalLibrarians = await User.countDocuments({ role: "librarian" });

        const booksAgg = await Book.aggregate([
            {
                $group: {
                    _id: null,
                    totalBooks: { $sum: "$totalCopies" }
                }
            }
        ]);
        const totalBooks = booksAgg.length > 0 ? booksAgg[0].totalBooks : 0;

        const issuedBooks = await BorrowRecord.countDocuments({ status: "issued" });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const overdueBooks = await BorrowRecord.countDocuments({
            status: "issued",
            dueDate: { $lt: today }
        });

        const finesAgg = await BorrowRecord.aggregate([
            {
                $group: {
                    _id: null,
                    totalFines: { $sum: "$fine" }
                }
            }
        ]);
        const totalFines = finesAgg.length > 0 ? finesAgg[0].totalFines : 0;

        return res.status(200).json(
            new ApiResponse(200, {
                totalUsers,
                totalLibrarians,
                totalBooks,
                issuedBooks,
                overdueBooks,
                totalFines
            }, "Dashboard stats fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Something went wrong while fetching dashboard stats");
    }
});

export { getDashboardStats };
