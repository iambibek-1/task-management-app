import express from "express";
import bodyParser from "body-parser";
import userRoutes from "./userRoutes";
import authRoutes from "./authRoutes";
import taskRoutes from "./taskRoutes";

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));

router.use(bodyParser.json());

router.use("/user", userRoutes);
router.use("/auth", authRoutes);
router.use("/task", taskRoutes);

export default router;
