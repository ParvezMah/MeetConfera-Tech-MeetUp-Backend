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
    const hostId = host?.id;
  const result = await EventService.createEvent(req.body, hostId as string)

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
const updateEvent = catchAsync(async (req: Request, res: Response) => {
  const eventId = req.params.id;
  const payload = req.body;

  const result = await EventService.updateEvent(eventId, payload);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Event updated successfully!",
    data: result,
  });
});


// Delete Event
const deleteEvent = catchAsync(async (req: Request, res: Response) => {
  const eventId = req.params.id;

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