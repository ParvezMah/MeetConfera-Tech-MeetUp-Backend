import { Router } from "express";
import { EventController } from "./event.controller";
import roleBasedAuth from "../../middlewares/roleBasedAuth";
import { UserRole } from "@prisma/client";
import { fileUploader } from "../../helpers/fileUploader";


const router = Router()



router.post("/create-event", 
    fileUploader.upload.single('file'),
    roleBasedAuth(UserRole.HOST),
    EventController.createEvent
)

router.patch(
  "/update-event/:id",
  roleBasedAuth(UserRole.HOST),
  EventController.updateEvent
);

router.delete(
  "/delete-event/:id",
  roleBasedAuth(UserRole.HOST),
  EventController.deleteEvent
);


// getAllEvents -> Only ADMIN & SUPER_ADMIN


export const EventRoutes = router