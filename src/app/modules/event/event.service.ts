import { EventCategory, EventStatus } from "@prisma/client";
import prisma from "../../shared/prisma";
import { ICreateEvent } from "./event.interface";



const createEvent = async (payload: ICreateEvent, hostId: string) => {
  console.log("Payload in service: ", payload);
  console.log("Host ID in service: ", hostId);
  // Use hostId from authentication middleware, ignore payload.hostId
  const result = await prisma.event.create({
    data: {
      eventName: payload.eventName,
      description: payload.description,
      date: new Date(payload.date),
      location: payload.location,
      joiningFee: Number(payload.joiningFee),
      maxParticipants: Number(payload.maxParticipants),
      minParticipants: Number(payload.minParticipants),
      joinedParticipants: Number(payload.joinedParticipants),
      category: payload.category as EventCategory,
      status: payload.status as EventStatus,
      hostId: hostId, // ✅ Use logged-in host ID
      image: payload.image || null,
    },
    include : { host: true}
  });

  return result
};

export default createEvent;

// const createEvent = async (payload: ICreateEvent) => {

//   console.log({payload})
//   // 1. Check if host exists
//   const hostExists = await prisma.host.findUnique({
//     where: { id: payload.hostId }
//   });

//   if (!hostExists) {
//     throw new Error("Host not found. Cannot create event.");
//   }


//   return await prisma.event.create({ data: payload as any })
// }


const getEventById = async (eventId: string) => {
  return await prisma.event.findUnique({
    where: { id: eventId },
    include: { host: true }
  });
};


const isEventOwner = async (eventId: string, hostId: string): Promise<boolean> => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { hostId: true }
  });

  return event?.hostId === hostId;
};


const updateEvent = async (eventId: string, payload: Partial<ICreateEvent>) => {
  // 1. Check event exists
  const eventExists = await prisma.event.findFirstOrThrow({
    where: { id: eventId },
  });

  if (!eventExists) {
    throw new Error("Event not found");
  }

  // 2. Update event
  return await prisma.event.update({
    where: { id: eventId },
    data: payload as any,
  });
};


const deleteEvent = async (eventId: string) => {
  // 1. Check event exists
  const eventExists = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!eventExists) {
    throw new Error("Event not found");
  }

  // 2. Delete event
  return await prisma.event.delete({
    where: { id: eventId },
  });
};






export const EventService = {
  createEvent,
  getEventById,
  isEventOwner,
  updateEvent,
  deleteEvent
}