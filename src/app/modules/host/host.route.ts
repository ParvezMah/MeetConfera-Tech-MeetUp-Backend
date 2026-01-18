// src/app/modules/Host/host.routes.ts
import express from "express";
import { HostController } from "./host.controller";
import roleBasedAuth from "../../middlewares/roleBasedAuth";
import { UserRole } from "@prisma/client";

const router = express.Router();

// Admin & Super_Admin call view all Host
router.get("/",
    roleBasedAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.HOST),
    HostController.getAllHosts
);

router.get("/:hostId",
    roleBasedAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.HOST),
    HostController.getSingleHost
);

// Host can view their own events
router.get("/my-events",
    roleBasedAuth(UserRole.HOST),
    HostController.getMyEvents
)

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


// Update an event (only by the host who owns it)
router.patch("/:eventId",
    roleBasedAuth(UserRole.HOST),
    HostController.updateEvent
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

router.delete('/:id',
    roleBasedAuth(UserRole.HOST),
    HostController.deleteHost
);

router.delete('/soft-delete/:id',
    roleBasedAuth(UserRole.HOST),
    HostController.softDeleteHost
);



export const HostRoutes = router;

