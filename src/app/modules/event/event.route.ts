import { Router } from "express";
import { EventController } from "./event.controller";
import roleBasedAuth from "../../middlewares/roleBasedAuth";
import { UserRole } from "@prisma/client";


const router = Router()

router.post("/create-event", 
    roleBasedAuth(UserRole.HOST),
    EventController.createEvent
)


// getAllEvents -> Only ADMIN & SUPER_ADMIN


export const EventRoutes = router