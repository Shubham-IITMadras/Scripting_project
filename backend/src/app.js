import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import dotenv from "dotenv"

import userRouter from "./routers/user.routes.js"
import bookRouter from "./routers/book.routes.js"
import borrowRouter from "./routers/borrowRecord.routes.js"
import requestRouter from "./routers/request.routes.js"
import notificationRouter from "./routers/notification.routes.js"

dotenv.config({
    path: "./.env"
})

const app = express()

app.use(cors({
    origin: [process.env.CORS_ORIGIN, "http://localhost:5500", "http://127.0.0.1:5500"],
    credentials: true
}))

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())

app.use("/api/users", userRouter)
app.use("/api/books", bookRouter)
app.use("/api/borrow", borrowRouter)
app.use("/api/request", requestRouter)
app.use("/api/notification", notificationRouter)

export { app } 