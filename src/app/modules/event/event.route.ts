import { NextFunction, Request, Response, Router } from "express";
import { EventController } from "./event.controller";
import roleBasedAuth from "../../middlewares/roleBasedAuth";
import { UserRole } from "@prisma/client";
import { fileUploader } from "../../helpers/fileUploader";
import { EventsValidation } from "./event.validation";


const router = Router();

router.post("/create-event",
  roleBasedAuth(UserRole.HOST),
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = EventsValidation.createEventZodSchema.parse(
      JSON.parse(req.body.data)
    );
    return EventController.createEvent(req, res, next);
  }
);

router.patch("/update-event/:id",
  roleBasedAuth(UserRole.HOST),
  EventController.updateEvent
);

router.delete("/delete-event/:id",
  roleBasedAuth(UserRole.HOST),
  EventController.deleteEvent
);

// getAllEvents -> Only ADMIN & SUPER_ADMIN

export const EventRoutes = router;
