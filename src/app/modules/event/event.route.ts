import { UserRole } from "@prisma/client";
import { Router } from "express";
import roleBasedAuth from "../../middlewares/roleBasedAuth";
import { EventController } from "./event.controller";


const router = Router();


// getAllEvents -> Only ADMIN & SUPER_ADMIN
router.get("/",
    roleBasedAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.HOST, UserRole.USER),
    EventController.getAllEvents
)

router.get("/:id",
    roleBasedAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.HOST, UserRole.USER),
    EventController.getSingleEventById
)

export const EventRoutes = router;
