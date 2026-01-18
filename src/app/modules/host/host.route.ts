// src/app/modules/Host/host.routes.ts
import express, { NextFunction, Request, Response } from "express";
import { HostController } from "./host.controller";
import roleBasedAuth from "../../middlewares/roleBasedAuth";
import { UserRole } from "@prisma/client";
import { EventsValidation } from "../event/event.validation";
import { fileUploader } from "../../helpers/fileUploader";

const router = express.Router();
// Host can view their own events (Static route must be defined before dynamic routes)
router.get("/my-events",
  roleBasedAuth(UserRole.HOST),
  HostController.getMyEvents
);

// Admin & Super_Admin call view all Host
router.get("/",
    roleBasedAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.HOST),
    HostController.getAllHosts
);

// Get a single Host by ID
router.get("/:hostId",
    roleBasedAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.HOST),
    HostController.getSingleHost
);


// Host cav View participants of a specific event
router.get("/:eventId/participants", 
    roleBasedAuth(UserRole.HOST),
    HostController.getAllParticipantsOfThisEvents

);

// Host can receive Payments from participants
router.get("/:eventId/payments",
    roleBasedAuth("HOST"),
    HostController.getEventPayments
);


router.post("/create-event",
  roleBasedAuth(UserRole.HOST),
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = EventsValidation.createEventZodSchema.parse(
      JSON.parse(req.body.data)
    );
    return HostController.createEvent(req, res, next);
  }
);

// Update an event (only by the host who owns it)
router.patch("/update-event/:id",
    roleBasedAuth(UserRole.HOST),
    HostController.updateEvent
);

router.delete('/:id',
    roleBasedAuth(UserRole.HOST),
    HostController.deleteHost
);

// Delete an event (only by the host who owns it)
router.delete("/:eventId",
    roleBasedAuth(UserRole.HOST),
    HostController.deleteEvent
);

router.patch('/update-host/:id',
    roleBasedAuth(UserRole.HOST),
    HostController.updateHost
);

router.delete('/soft-delete/:id',
    roleBasedAuth(UserRole.HOST),
    HostController.softDeleteHost
);



export const HostRoutes = router;

