import { Request, Response } from "express"
import catchAsync from "../../shared/catchAsync"
import sendResponse from "../../shared/sendResponse"
import { EventService } from "./event.service"




// Create Event
const createEvent = catchAsync(async (req: Request, res: Response) => {
  console.log("req.body : ", req.body)
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