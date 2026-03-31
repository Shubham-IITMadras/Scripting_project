import { Router } from "express"

import {
    createRequest,
    handleRequest,
    getMyRequests,
    getAllRequests,
    cancelRequest
} from "../controllers/request.controller.js"



import { verifyJWT } from "../middlewares/auth.middleware.js"
import { verifyLibrarian } from "../middlewares/librarian.middleware.js"

const router = Router()


router.route("/create")
.post(verifyJWT, createRequest)


router.route("/my")
.get(verifyJWT, getMyRequests)


router.route("/cancel/:reqId")
.delete(verifyJWT, cancelRequest)


router.route("/all")
.get(verifyJWT, verifyLibrarian, getAllRequests)


router.route("/handle")
.patch(verifyJWT, verifyLibrarian, handleRequest)


export default router