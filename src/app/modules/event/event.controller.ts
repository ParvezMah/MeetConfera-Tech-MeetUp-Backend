import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { EventService } from "./event.service";
import prisma from "../../shared/prisma";
import { Request, Response } from "express";


// Create Event -> hostId provided by user
// add hostId to interface & validation
// const createEvent = catchAsync(async (req: Request, res: Response) => {
//   const result = await EventService.createEvent(req);

//   sendResponse(res, {
//     statusCode: httpStatus.CREATED,
//     success: true,
//     message: "Event created successfully!",
//     data: result,
//   });
// });

const createEvent = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const result = await EventService.createEvent(req);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Event created successfully!",
    data: result,
  });
});

// Update Event
const updateEvent = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const eventId = req.params.id;
    const payload = req.body;
    const userEmail = req.user?.email;
    if (!userEmail) {
      return sendResponse(res, {
        statusCode: 401,
        success: false,
        message: "Unauthorized: User not logged in.",
        data: null,
      });
    }

    // Fetch the host using user email
    const host = await prisma.host.findUnique({
      where: { email: userEmail },
    });
    if (!host) {
      return sendResponse(res, {
        statusCode: 403,
        success: false,
        message: "Forbidden: No host profile found for this user.",
        data: null,
      });
    }

    // Check if user owns the event
    const isOwner = await EventService.isEventOwner(eventId, host.id);
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
      statusCode: httpStatus.OK,
      success: true,
      message: "Event updated successfully!",
      data: result,
    });
  }
);

// Delete Event
const deleteEvent = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const eventId = req.params.id;

    const userEmail = req.user?.email;
    if (!userEmail) {
      return sendResponse(res, {
        statusCode: 401,
        success: false,
        message: "Unauthorized: User not logged in.",
        data: null,
      });
    }

    // Fetch the host using user email
    const host = await prisma.host.findUnique({
      where: { email: userEmail },
    });
    const hostId = host?.id;

    if (!hostId) {
      return sendResponse(res, {
        statusCode: 401,
        success: false,
        message: "Unauthorized: Host not found in deleteEvent.",
        data: null,
      });
    }

    // Check if user owns the event
    const isOwner = await EventService.isEventOwner(eventId, hostId);
    if (!isOwner) {
      return sendResponse(res, {
        statusCode: httpStatus.FORBIDDEN,
        success: false,
        message: "Forbidden: You do not have permission to delete this event.",
        data: null,
      });
    }

    const result = await EventService.deleteEvent(eventId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Event deleted successfully!",
      data: result,
    });
  }
);

export const EventController = {
  createEvent,
  updateEvent,
  deleteEvent,
};
