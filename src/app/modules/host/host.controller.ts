// src/app/modules/Host/host.controller.ts
import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { HostService } from "./host.service";
import pick from "../../helpers/pick";
import prisma from "../../shared/prisma";
import httpStatus from "http-status"



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


export const HostController = {
  getHosts,
  getMyEvents
};
