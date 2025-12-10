import { Request, Response } from "express"
import { JwtPayload } from "jsonwebtoken"
import catchAsync from "../../shared/catchAsync"
import sendResponse from "../../shared/sendResponse"
import { EventService } from "./event.service"
import pick from "../../helpers/pick"
import { IJWTPayload } from "../../types/common"
import httpStatus from "http-status"
import prisma from "../../shared/prisma"




// Create Event
const createEvent = catchAsync(async (req: Request, res: Response) => {
  const result = await EventService.createEvent(req.body)

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Event created successfully!",
    data: result,
  })
})







export const EventController = {
  createEvent
}