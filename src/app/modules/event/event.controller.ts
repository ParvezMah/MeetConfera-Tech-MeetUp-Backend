import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { EventService } from "./event.service";


const getAllEvents = catchAsync(async (req: Request, res: Response) => {
  const result =await EventService.getAllEvents();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All Events fetched successfully",
    data : result
  })

})


const getSingleEventById = catchAsync(async (req: Request, res: Response) => {
  const eventId = req.params.id;
  const result = await EventService.getSingleEventById(eventId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Your Event Fetched Successfully",
    data: result
  })
})

export const EventController = {
  getAllEvents,
  getSingleEventById
};
