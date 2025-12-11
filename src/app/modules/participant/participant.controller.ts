import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import prisma from "../../shared/prisma";
import sendResponse from "../../shared/sendResponse";
import { ParticipantService } from "./participant.service";


// Join Event
// const joinEventAsParticipant = catchAsync(async (req: Request, res: Response) => {
//     console.log("req.body : ", req.body)
//     const result = await ParticipantService.joinEventAsParticipant(req.body);

//     sendResponse(res, {
//         statusCode: 201,
//         success: true,
//         message: "Participant joined the event successfully.",
//         data: result,
//     });
// });




// Join Event with Payment Feature
// const joinEventAsParticipantWithPayment = catchAsync(async (req: Request & { user?: any }, res: Response) => {
//     const { eventId } = req.body;
//     console.log("eventId : ", eventId);
//     console.log("req.user : ", req.user);
//     const userEmail = req.user?.email;
//     if (!userEmail) throw new Error("User not logged in.");

//     // Fetching user ID using userEmail
//     const user = await prisma.user.findUnique({
//         where : { email : userEmail},
//         select : { id : true, role : true}
//     });

//     // Check if user exists
//     if (!user) throw new Error("User not found.");
    
//     console.log("user.id : ", user?.id)
//     // Ensure the user is a regular participant
//     if (user.role !== "USER") throw new Error("Only individual participants can access this.");

//     const result = await ParticipantService.joinEventAsParticipantWithPayment(user.id, eventId);

//     // Check if result has url (Stripe session)
//     if ("url" in result) {
//         // Paid Event
//         sendResponse(res, {
//             statusCode: 200,
//             success: true,
//             message: "Stripe session created, proceed to payment",
//             data: { stripeUrl: result.url },
//         });
//     } else {
//         // Free event
//         sendResponse(res, {
//             statusCode: 200,
//             success: true,
//             message: result.message,
//             data: null,
//         });
//     }
// });



const joinEventAsParticipantWithPayment = catchAsync(async (req: Request & { user?: any }, res: Response) => {
    const userEmail = req.user?.email;
    if (!userEmail) throw new Error("User not logged in.");

    // Fetching user ID using userEmail
    const user = await prisma.user.findUnique({
        where : { email : userEmail},
        select : { id : true, role : true}
    });



        // Check if user exists
  if (!user) throw new Error("User not found.");
  const { eventId, successUrl, cancelUrl } = req.body;

  const result = await ParticipantService.joinEventAsParticipantWithPayment({
    userId: user.id,
    eventId,
    successUrl,
    cancelUrl,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.stripeUrl
      ? "Stripe session created, proceed to payment"
      : "Joined free event successfully",
    data: result,
  });
});






// Cancel Participation
const cancelParticipation = catchAsync(async (req: Request, res: Response) => {
    const result = await ParticipantService.cancelParticipation(req);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Participation cancelled.",
        data: result
    });
});


const getMyAllEventParticipations = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    // Logged-in user's ID from JWT
    const userEmail = req.user?.email;
    if (!userEmail) throw new Error("User not logged in.");

    // Fetching user ID using userEmail
    const user = await prisma.user.findUnique({
        where : { email : userEmail},
        select : { id : true, role : true}
    });

        // Check if user exists
    if (!user) throw new Error("User not found.");

    // Ensure the user is a regular participant
    if (user.role !== "USER") throw new Error("Only individual participants can access this.");


    // Fetch participant records
    const result = await ParticipantService.getMyAllEventParticipations(user.id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Your All joined events fetched successfully!",
      data: result,
    });
  }
);



export const ParticipantController = {
    // joinEventAsParticipant,
    joinEventAsParticipantWithPayment,
    cancelParticipation,
    getMyAllEventParticipations
}