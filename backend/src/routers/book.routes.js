import { Router } from "express";
import {
    addBook,
    getAllBooks,
    removeBook,
    updateBook,
    getUserBooks,
    getOverdueBooks,
    getDueSoonBooks
} from "../controllers/book.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import { verifyLibrarian } from "../middlewares/librarian.middleware.js";

const router = Router();

router.route("/add-book").post(
    verifyJWT,
    verifyLibrarian,
    addBook
);

router.route("/remove-book/:isbn_no").delete(
    verifyJWT,
    verifyLibrarian,
    removeBook
);

router.route("/update-book/:bookId").patch(
    verifyJWT,
    verifyLibrarian, 
    updateBook
);

router.route("/get-all-books").get(
    verifyJWT,
    getAllBooks
);

router.route("/user-books").get(verifyJWT,getUserBooks);
router.route("/overdue-books").get(verifyJWT,getOverdueBooks);
router.route("/due-soon-books").get(verifyJWT,getDueSoonBooks);



export default router;