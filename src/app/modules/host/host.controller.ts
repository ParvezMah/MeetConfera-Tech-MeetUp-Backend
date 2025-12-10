// src/app/modules/Host/host.controller.ts
import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { HostService } from "./host.service";
import pick from "../../helpers/pick";
import prisma from "../../shared/prisma";
import httpStatus from "http-status"


// Admin call view all Host
const getHosts = catchAsync(async (req: Request, res: Response) => {
  const result = await HostService.getAllHosts();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Hosts fetched successfully!",
    data: result,
  });
});

// Host can view their own events
const getMyEvents = catchAsync(async (req: Request & { user?: any }, res: Response) => {
    const filters = pick(req.query, ["category", "status", "startDate", "endDate"]);
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);

    // Getting Logged in Host
    const userEmail = req.user.email; 
    const host = await prisma.host.findUnique({
      where: {email : userEmail}
    })

    const result = await HostService.getMyEvents(host?.id as string, filters, options);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "My events fetched successfully!",
        meta: result.meta,
        data: result.data
    });
});
// Host can view their own participants who joined thier event
const getEventParticipants = catchAsync(async (req: Request & { user?: any }, res: Response) => {
    const { eventId } = req.params;

    // Getting Logged in Host
    const userEmail = req.user.email; 
    const host = await prisma.host.findUnique({
      where: {email : userEmail}
    })

    const result = await HostService.getEventParticipants(eventId, host?.id as string);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Event participants fetched successfully!",
        data: result,
    });
});

const getEventPayments = catchAsync(async (req: Request & { user?: any }, res: Response) => {
    const { eventId } = req.params;

    // Getting Logged in Host
    const userEmail = req.user.email; 
    const host = await prisma.host.findUnique({
      where: {email : userEmail}
    })

    const payments = await HostService.getEventPayments(eventId, host?.id as string);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Event payments fetched successfully!",
        data: payments,
    });
});

// Update an event (only by the host who owns it)
const updateEvent = catchAsync(async (req: Request & { user?: any }, res: Response) => {
    const eventId = req.params.eventId;
    const payload = req.body;
    
    // Getting Logged in Host
    const userEmail = req.user.email; 
    const host = await prisma.host.findUnique({
      where: {email : userEmail}
    })

    const updatedEvent = await HostService.updateEvent(host?.id as string, eventId, payload);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Event updated successfully!",
        data: updatedEvent
    });
});


// Delete an event (only by the host who owns it)
const deleteEvent = catchAsync(async (req: Request & { user?: any }, res: Response) => {
    const eventId = req.params.eventId;
    // Getting Logged in Host
    const userEmail = req.user.email; 
    const host = await prisma.host.findUnique({
      where: {email : userEmail}
    })

    const deletedEvent = await HostService.deleteEvent(host?.id as string, eventId);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Event deleted successfully!",
        data: deletedEvent
    });
});


export const HostController = {
  getHosts,
  getMyEvents,
  getEventParticipants,
  getEventPayments,
  updateEvent,
  deleteEvent
};
