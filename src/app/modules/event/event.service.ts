import { Request } from "express";
import { fileUploader } from "../../helpers/fileUploader";
import prisma from "../../shared/prisma";
import { IEvent } from "./event.interface";


// const createEvent = async (req: Request & { user?: any }) => {

//   // Get user email from req.user to find host from host table
//   const userEmail = req.user?.email;
//   if (!userEmail) {
//   throw new Error("No logged in host email found");
//   }
//   // Fetch the host using user email
//   const host = await prisma.host.findUnique({
//     where: { email: userEmail },
//   });

//   // Get hostId
//   const loggedInHostId = host?.id;
//   if (!loggedInHostId) {
//     throw new Error("No logged in host found");
//   }

//   const file = req.file;
//   if (file) {
//     const uploadedImage = await fileUploader.uploadToCloudinary(file);
//     req.body.image = uploadedImage?.secure_url;
//   }

//   req.body.joinedParticipants = 0;

//   const result = await prisma.event.create({
//     data: {
//       eventName: req.body.eventName,
//       description: req.body.description,
//       date: new Date(req.body.date),
//       maxParticipants: req.body.maxParticipants,
//       minParticipants: req.body.minParticipants,
//       joinedParticipants: req.body.joinedParticipants,
//       image: req.body.image,
//       joiningFee: req.body.joiningFee,
//       location: req.body.location,
//       category: req.body.category,
//       hostId: loggedInHostId, // Use logged in hostId
//     },
//   });

//   return result;
// };


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

  if (!event) {
    throw new Error("Event not found");
  }

  return event.hostId === hostId;
};


// const updateEvent = async (eventId: string, payload: Partial<IEvent>) => {
//   // 1. Check event exists
//   const eventExists = await prisma.event.findFirstOrThrow({
//     where: { id: eventId },
//   });

//   if (!eventExists) {
//     throw new Error("Event not found");
//   }

//   // 2. Update event
//   return await prisma.event.update({
//     where: { id: eventId },
//     data: payload as any,
//   });
// };


// const deleteEvent = async (eventId: string) => {
//   // 1. Check event exists
//   const eventExists = await prisma.event.findUnique({
//     where: { id: eventId },
//   });

//   if (!eventExists) {
//     throw new Error("Event not found");
//   }

//   // 2. Delete event
//   return await prisma.event.delete({
//     where: { id: eventId },
//   });
// };






export const EventService = {
  // createEvent,
  getEventById,
  isEventOwner,
  // updateEvent,
  // deleteEvent
}