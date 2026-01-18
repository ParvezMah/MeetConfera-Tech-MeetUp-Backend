import { Host, Prisma, UserStatus } from "@prisma/client";
import prisma from "../../shared/prisma";
import { IOptions, paginationHelper } from "../../helpers/paginationHelper";



// Admin call view all Host
const getAllHosts = async () => {
  const result =  await prisma.host.findMany({
    include: { user: true, events: true },
  });

  if (!result) throw new Error("No hosts found!");

  return result
};

// Get a single Host by ID
const getSingleHost = async (hostId: string) => {
    const result = await prisma.host.findUnique({
        where: { id: hostId },
        include: { user: true, events: true },
    });

    if (!result) throw new Error("Host not found!");
    return result;
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
        // Relation to Participant Table 
        include: { participants: true }
    });

    const total = await prisma.event.count({ where: whereConditions });

    return {
        meta: { total, page, limit },
        data
    };
};

// Host cav View participants of a specific event
const getAllParticipantsOfThisEvents = async (eventId: string, hostId: string) => {
    // Ensure event belongs to logged-in host
    const result = await prisma.event.findFirst({
        where: { id: eventId, hostId },
        include: {
            participants: {
                include: {
                    user: true,
                },
            },
        },
    });

    if (!result) throw new Error("Event not found or you are not authorized!");

    return result
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


const updateHost = async (id: string, data: Partial<Host>): Promise<Host> => {
    await prisma.host.findUniqueOrThrow({
        where: {
            id,
            isDeleted: false
        }
    });

    const result = await prisma.host.update({
        where: {
            id
        },
        data
    });

    return result;
};

const deleteHost = async (id: string): Promise<Host | null> => {
    await prisma.host.findUniqueOrThrow({
        where: {
            id
        }
    });

    const result = await prisma.$transaction(async (transactionClient) => {
        const hostDeletedData = await transactionClient.host.delete({
            where: {
                id
            }
        });

        await transactionClient.user.delete({
            where: {
                email: hostDeletedData.email
            }
        });

        return hostDeletedData;
    });

    return result;
};

const softDeleteHost = async (id: string): Promise<Host | null> => {
    await prisma.host.findUniqueOrThrow({
        where: {
            id,
            isDeleted: false
        }
    });

    const result = await prisma.$transaction(async (transactionClient) => {
        const hostDeletedData = await transactionClient.host.update({
            where: {
                id
            },
            data: {
                isDeleted: true
            }
        });

        await transactionClient.user.update({
            where: {
                email: hostDeletedData.email
            },
            data: {
                status: UserStatus.DELETED  // Changed from ACTIVE to DELETED for consistency
            }
        });

        return hostDeletedData;
    });

    return result;
};





export const HostService = {
  getAllHosts,
  getSingleHost,
  getMyEvents,
  getAllParticipantsOfThisEvents,
  getEventPayments,
  updateEvent,
  deleteEvent,
  updateHost,
  deleteHost,
  softDeleteHost
};
