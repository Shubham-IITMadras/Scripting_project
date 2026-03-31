import { Router } from "express";

import {
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
} from "../controllers/borrowRecord.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import { verifyLibrarian } from "../middlewares/librarian.middleware.js";

const router = Router();

// Issue Book
router.route("/issue").post(
    verifyJWT,
    issueBook
);


router.route("/return/:recordId").patch(
    verifyJWT,
    returnBook
);


router.route("/my-records").get(
    verifyJWT,
    getMyRecords
);


router.route("/my-issued").get(
    verifyJWT,
    getMyIssuedRecords
);


router.route("/my-overdue").get(
    verifyJWT,
    getMyOverdueBooks
);


router.route("/my-due-soon").get(
    verifyJWT,
    getMyDueSoonBooks
);


router.route("/issued-records").get(
    verifyJWT,
    verifyLibrarian,
    getAllIssuedRecords
);

router.route("/all-records").get(
    verifyJWT,
    getAllRecords 
);


router.route("/overdue").get(
    verifyJWT,
    verifyLibrarian,
    getAllOverdueBooks
);


router.route("/due-soon").get(
    verifyJWT,
    verifyLibrarian,
    getAllDueSoonBooks
);

export default router;