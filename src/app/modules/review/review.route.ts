// routes/review.routes.ts
import { Router } from "express";
import { ReviewController } from "./review.controller";
import roleBasedAuth from "../../middlewares/roleBasedAuth";
import { UserRole } from "@prisma/client";


const router = Router();

router.get('/', ReviewController.getAllReview);

router.post("/", 
    roleBasedAuth(UserRole.USER),
    ReviewController.createReview
);


export const ReviewRoutes =  router;
