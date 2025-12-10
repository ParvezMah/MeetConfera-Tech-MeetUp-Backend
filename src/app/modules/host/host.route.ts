// src/app/modules/Host/host.routes.ts
import express from "express";
import { HostController } from "./host.controller";
import { EventController } from "../event/event.controller";
import roleBasedAuth from "../../middlewares/roleBasedAuth";
import { UserRole } from "@prisma/client";

const router = express.Router();


router.get("/", HostController.getHosts);

// Host can view their own events
router.get("/my-events",
    roleBasedAuth(UserRole.HOST),
    HostController.getMyEvents
)



export const HostRoutes = router;

