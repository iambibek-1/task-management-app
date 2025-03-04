import express from "express";
import bodyParser from 'body-parser';
import userRoutes from "./userRoutes";
import authRoutes from "./authRoutes";



const router = express.Router();


router.use(bodyParser.urlencoded({extended:true}));

router.use(bodyParser.json());

router.use('/user', userRoutes);
router.use('/auth',authRoutes);

export default router;