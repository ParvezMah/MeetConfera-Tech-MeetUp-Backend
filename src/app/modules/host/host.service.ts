import { Prisma } from "@prisma/client";
import prisma from "../../shared/prisma";
import { IOptions, paginationHelper } from "../../helpers/paginationHelper";



// Admin call view all Host
const getAllHosts = async () => {
  const result =  await prisma.host.findMany({
    include: { user: true, events: true },
  });

  return result
};

// Host cav View their own event
const getMyEvents = async (hostId: string, filters: any, options: IOptions) => {
    const { page, limit, skip } = paginationHelper.calculatePagination(options);

    const andConditions: Prisma.EventWhereInput[] = [
        { hostId }
    ];

    if (filters.startDate && filters.endDate) {
        andConditions.push({
            date: {
                gte: new Date(filters.startDate),
                lte: new Date(filters.endDate)
            }
        });
    }

    if (filters.category) {
        andConditions.push({
            category: { equals: filters.category }
        });
    }

    if (filters.status) {
        andConditions.push({
            status: { equals: filters.status }
        });
    }

    const whereConditions: Prisma.EventWhereInput = {
        AND: andConditions
    };

    const data = await prisma.event.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy:
            options.sortBy && options.sortOrder
                ? { [options.sortBy]: options.sortOrder }
                : { date: "desc" },
        include: { participants: true }
    });

    const total = await prisma.event.count({ where: whereConditions });

    return {
        meta: { total, page, limit },
        data
    };
};

// Host cav View participants of a specific event
const getEventParticipants = async (eventId: string, hostId: string) => {
    // Ensure event belongs to logged-in host
    const event = await prisma.event.findFirst({
        where: { id: eventId, hostId },
        include: {
            participants: {
                include: {
                    user: true,
                },
            },
        },
    });

    if (!event) throw new Error("Event not found or you are not authorized!");

    // return event.participants.map(p => ({
    //     id: p.user.id,
    //     name: p.user.email, // You can add other fields like name, email
    //     status: p.status,
    //     joinedAt: p.joinedAt,
    // }));

    // Dummy payments message when table will created dummy will removed
    return [
        {
            message: "No Participants table is created in prisma.",
        }
    ];
};

// Host can receive Payments from participants
const getEventPayments = async (eventId: string, hostId: string) => {
    // Ensure the event belongs to the host
    const event = await prisma.event.findFirst({ where: { id: eventId, hostId } });
    if (!event) throw new Error("Event not found or you are not authorized!");

    // Dummy payments message
    return [
        {
            message: "No Payment table is created in prisma.",
        }
    ];
};

// Update an event (only by the host who owns it)
const updateEvent = async (hostId: string, eventId: string, payload: any) => {
    // Ensure the host owns the event
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event || event.hostId !== hostId) {
        throw new Error("You are not authorized to update this event!");
    }

    return prisma.event.update({
        where: { id: eventId },
        data: payload
    });
};

// Delete an event (only by the host who owns it)
const deleteEvent = async (hostId: string, eventId: string) => {
    // Ensure the host owns the event
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event || event.hostId !== hostId) {
        throw new Error("You are not authorized to delete this event!");
    }

    return prisma.event.delete({ where: { id: eventId } });
};




export const HostService = {
  getAllHosts,
  getMyEvents,
  getEventParticipants,
  getEventPayments,
  updateEvent,
  deleteEvent
};
