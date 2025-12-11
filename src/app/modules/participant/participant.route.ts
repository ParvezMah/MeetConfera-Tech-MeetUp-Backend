import { Router } from "express";
import validateRequest from "../../middlewares/validateRequest";
import { ParticipantController } from "./participant.controller";
import { ParticipantValidation } from "./participant.validation";
import roleBasedAuth from "../../middlewares/roleBasedAuth";
import { UserRole } from "@prisma/client";

const router = Router();


// Join event as Participant
router.post("/join",
//   roleBasedAuth(UserRole.USER),
  validateRequest(ParticipantValidation.createParticipantSchema),
  ParticipantController.joinEventAsParticipant
);

// getAllParticipantsOfThisEvents - API Get All participants impletented on Host Module

// Cancel participation
router.put("/cancel",
    // roleBasedAuth(UserRole.USER),
    ParticipantController.cancelParticipation
);



// List events joined by the currently logged-in user
router.get(
    "/my-event-participations",
    roleBasedAuth(UserRole.USER),
    ParticipantController.getMyAllEventParticipations
);


export const ParticipantRoutes = router;