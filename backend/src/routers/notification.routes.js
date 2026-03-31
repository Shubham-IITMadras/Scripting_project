import { verifyJWT } from "../middlewares/auth.middleware.js"
import { verifyLibrarian } from "../middlewares/librarian.middleware.js"
import { Router } from "express"
import { loadNotifications } from "../controllers/notification.contoller.js"

const router = new Router()

router.route("/loadNotifications").get(verifyJWT, loadNotifications)

export default router