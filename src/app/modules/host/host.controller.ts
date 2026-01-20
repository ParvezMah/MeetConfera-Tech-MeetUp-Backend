// src/app/modules/Host/host.controller.ts
import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { HostService } from "./host.service";
import pick from "../../helpers/pick";
import prisma from "../../shared/prisma";
import httpStatus from "http-status"


// Admin call view all Host
const getAllHosts = catchAsync(async (req: Request, res: Response) => {
  const result = await HostService.getAllHosts();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Hosts fetched successfully!",
    data: result,
  });
});

// Get a single Host by ID
const getSingleHost = catchAsync(async (req: Request, res: Response) => {
    const { hostId } = req.params;
    const result = await HostService.getSingleHost(hostId);
    sendResponse(res, {
        statusCode:httpStatus.OK,
        success: true,
        message: "Host fetched successfully!",
        data: result,
    });
});


export const getMyEvents = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    // Extract filters & options from query
    const filters = pick(req.query, ["category", "status", "startDate", "endDate"]);
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);

    // Logged-in host ID from JWT (cookie)
    const userEmail = req.user?.email;
    const host = await prisma.host.findUnique({
      where: { email: userEmail },
    });
    const hostId = host?.id;
    if (!hostId) {
      throw new Error("No logged in host found in getMyEvents");
    }
    const result = await HostService.getMyEvents(hostId as string, filters, options);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "My events fetched successfully!",
      meta: result.meta,
      data: result.data,
    });
  }
);



// Host can view their own participants who joined thier event
const getAllParticipantsOfThisEvents = catchAsync(async (req: Request & { user?: any }, res: Response) => {
    const { eventId } = req.params;

    // Getting Logged in Host
    const userEmail = req.user.email; 
    const host = await prisma.host.findUnique({
      where: {email : userEmail}
    })

    const hostId = host?.id;
    if (!hostId) { 
      throw new Error("No logged in host found in getMyEvents");
    }

    const result = await HostService.getAllParticipantsOfThisEvents(eventId, hostId as string);

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
// const updateEvent = catchAsync(async (req: Request & { user?: any }, res: Response) => {
//     const eventId = req.params.eventId;
//     const payload = req.body;
    
//     // Getting Logged in Host
//     const userEmail = req.user.email; 
//     const host = await prisma.host.findUnique({
//       where: {email : userEmail}
//     })

//     const updatedEvent = await HostService.updateEvent(host?.id as string, eventId, payload);

//     sendResponse(res, {
//         statusCode: 200,
//         success: true,
//         message: "Event updated successfully!",
//         data: updatedEvent
//     });
// });


const createEvent = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const result = await HostService.createEvent(req);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Event created successfully!",
    data: result,
  });
});

const updateEvent = catchAsync(async (req: Request & { user?: any }, res: Response) => {
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
    
    const payload = req.body;

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

    const result = await HostService.updateEvent(eventId, payload);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Event updated successfully!",
      data: result,
    });
  }
);

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


const updateHost = catchAsync(async (req: Request & { user?: any }, res: Response) => {
    const { id } = req.params;

    // Authorization check
    const userEmail = req.user?.email;
    const userRole = req.user?.role;

    if (!userEmail) {
        return sendResponse(res, {
            statusCode: httpStatus.UNAUTHORIZED,
            success: false,
            message: "Unauthorized: User not authenticated.",
            data: null,
        });
    }
    // Check if user is the host being updated or has admin role
    const host = await prisma.host.findUnique({
        where: { id },
        select: { email: true }
    });

    if (!host) {
        return sendResponse(res, {
            statusCode: 404,
            success: false,
            message: "Host not found in updateHost.",
            data: null,
        });
    }

    const isOwner = userEmail === host.email;
    const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";

    if (!isOwner && !isAdmin) {
        return sendResponse(res, {
            statusCode: 403,
            success: false,
            message: "Forbidden: You do not have permission to update this host.",
            data: null,
        });
    }

    const result = await HostService.updateHost(id, req.body);
    
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Host data updated successfully!",
        data: result
    });
});

const deleteHost = catchAsync(async (req: Request & { user?: any }, res: Response) => {
    const { id } = req.params;

    // Authorization check
    const userEmail = req.user?.email;
    const userRole = req.user?.role;

    if (!userEmail) {
        return sendResponse(res, {
            statusCode: 403,
            success: false,
            message: "Forbidden: User not authenticated.",
            data: null,
        });
    }

    // Check if user is the host being deleted or has admin role
    const host = await prisma.host.findUnique({
        where: { id },
        select: { email: true }
    });

    if (!host) {
        return sendResponse(res, {
            statusCode: 404,
            success: false,
            message: "Host not found in deleteHost.",
            data: null,
        });
    }

    // const isOwner = userEmail === host.email;
    // const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";

    // if (!isOwner && !isAdmin) {
    //     return sendResponse(res, {
    //         statusCode: 403,
    //         success: false,
    //         message: `Forbidden: You are ${userRole}. You do not have permission to delete this host.`,
    //         data: null,
    //     });
    // }

    const result = await HostService.deleteHost(id);
    
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Host deleted successfully!",
        data: result
    });
});

const softDeleteHost = catchAsync(async (req: Request & { user?: any }, res: Response) => {
    const { id } = req.params;

    // Authorization check
    const userEmail = req.user?.email;
    const userRole = req.user?.role;

    if (!userEmail) {
        return sendResponse(res, {
            statusCode: 403,
            success: false,
            message: "Forbidden: User not authenticated.",
            data: null,
        });
    }

    // Check if user is the host being soft deleted or has admin role
    const host = await prisma.host.findUnique({
        where: { id },
        select: { email: true }
    });

    if (!host) {
        return sendResponse(res, {
            statusCode: 404,
            success: false,
            message: "Host not found in softDeleteHost.",
            data: null,
        });
    }

    const result = await HostService.softDeleteHost(id);
    
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Host soft deleted successfully!",
        data: result
    });
});



export const HostController = {
  getAllHosts,
  getSingleHost,
  getMyEvents,
  getAllParticipantsOfThisEvents,
  getEventPayments,
  createEvent,
  updateEvent,
  deleteEvent,
  updateHost,
  deleteHost,
  softDeleteHost
};
