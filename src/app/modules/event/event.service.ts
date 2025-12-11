import { Prisma } from "@prisma/client";
import prisma from "../../shared/prisma"
import { ICreateEvent } from "./event.interface"
import { IOptions, paginationHelper } from "../../helpers/paginationHelper";


const createEvent = async (payload: ICreateEvent) => {

  console.log({payload})
  // 1. Check if host exists
  const hostExists = await prisma.host.findUnique({
    where: { id: payload.hostId }
  });

  if (!hostExists) {
    throw new Error("Host not found. Cannot create event.");
  }


  return await prisma.event.create({ data: payload as any })
}




export const EventService = {
  createEvent
}