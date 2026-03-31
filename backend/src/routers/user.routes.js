import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshToken,
    changeCurrentPassword,
    getAllUsers,
    addUser,
    removeUser
} from "../controllers/user.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import { verifyLibrarian } from "../middlewares/librarian.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshToken);

router.route("/logout").post(verifyJWT, logoutUser);
router.route("/all-users").get(verifyJWT, verifyAdmin,getAllUsers);

router.route("/add").post(verifyJWT, verifyAdmin, addUser);
router.route("/remove/:id").delete(verifyJWT, verifyAdmin, removeUser);

router.route("/change-password").patch(
    verifyJWT,
    changeCurrentPassword
);

export default router;