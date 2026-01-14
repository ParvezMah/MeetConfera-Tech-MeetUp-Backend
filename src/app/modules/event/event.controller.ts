import { Request, Response } from "express"
import catchAsync from "../../shared/catchAsync"
import sendResponse from "../../shared/sendResponse"
import { EventService } from "./event.service"
import prisma from "../../shared/prisma"




// Create Event
const createEvent = catchAsync(async (req: Request & { user?: any }, res: Response) => {

    const userEmail = req.user?.email;
    if (!userEmail) throw new Error("User not logged in.");

    // Fetching user ID using userEmail
    const host = await prisma.host.findUnique({
        where : { email : userEmail},
    });
    if (!host) {
        throw new Error("Host profile not found for this user.");
    }
    const result = await EventService.createEvent(req.body, host.id);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Event created successfully!",
    data: result,
  })
})
// const createEvent = catchAsync(async (req: Request, res: Response) => {
//   console.log("req.body : ", req.body)
//   const result = await EventService.createEvent(req.body)

//   sendResponse(res, {
//     statusCode: 201,
//     success: true,
//     message: "Event created successfully!",
//     data: result,
//   })
// })


// Update Event
const updateEvent = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const eventId = req.params.id;
  const payload = req.body;

  const userEmail = req.user?.email;
  if (!userEmail) throw new Error("User not logged in.");

  // Fetch the host using user email
  const host = await prisma.host.findUnique({
    where: { email: userEmail },
  });
  const hostId = host?.id;

  if (!hostId) throw new Error("Host not found.");

  // Check if user owns the event
  const isOwner = await EventService.isEventOwner(eventId, hostId);
  if (!isOwner) {
    return sendResponse(res, {
      statusCode: 403,
      success: false,
      message: "Forbidden: You do not have permission to update this event.",
      data: null,
    });
  }

  const result = await EventService.updateEvent(eventId, payload);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Event updated successfully!",
    data: result,
  });
});


// Delete Event
const deleteEvent = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const eventId = req.params.id;

  const userEmail = req.user?.email;
  if (!userEmail) throw new Error("User not logged in.");

  // Fetch the host using user email
  const host = await prisma.host.findUnique({
    where: { email: userEmail },
  });
  const hostId = host?.id;

  if (!hostId) throw new Error("Host not found.");

  // Check if user owns the event
  const isOwner = await EventService.isEventOwner(eventId, hostId);
  if (!isOwner) {
    return sendResponse(res, {
      statusCode: 403,
      success: false,
      message: "Forbidden: You do not have permission to delete this event.",
      data: null,
    });
  }

  const result = await EventService.deleteEvent(eventId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Event deleted successfully!",
    data: result,
  });
});






export const EventController = {
  createEvent,
  updateEvent,
  deleteEvent
}