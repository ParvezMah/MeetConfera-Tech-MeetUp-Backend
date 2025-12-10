import { Prisma } from "@prisma/client";
import prisma from "../../shared/prisma"
import { ICreateEvent } from "./event.interface"
import { IOptions, paginationHelper } from "../../helpers/paginationHelper";


const createEvent = async (payload: ICreateEvent) => {
  return await prisma.event.create({ data: payload })
}




export const EventService = {
  createEvent
}