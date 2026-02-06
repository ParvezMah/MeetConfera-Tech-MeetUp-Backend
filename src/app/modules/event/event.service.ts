import ApiError from "../../errors/ApiError";
import prisma from "../../shared/prisma";
import httpStatus from "http-status";


const getAllEvents = async () => {
  const result = await prisma.event.findMany({
    include : {
      host : true
    }
  })

  return result;
}


const getSingleEventById = async (eventId: string) => {
  const result = await prisma.event.findUnique({
    where : { id : eventId},
    include : {
      host : true
    }
  })

  if(!result){
    throw new ApiError(httpStatus.NOT_FOUND, "Event Not Found")
  }


  return result
}







export const EventService = {
  getAllEvents,
  getSingleEventById
}