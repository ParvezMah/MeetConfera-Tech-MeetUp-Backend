import { Prisma } from "@prisma/client";
import prisma from "../../shared/prisma";
import { IOptions, paginationHelper } from "../../helpers/paginationHelper";




const getAllHosts = async () => {
  const result =  await prisma.host.findMany({
    include: { user: true, events: true },
  });

  return result
};

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

export const HostService = {
  getAllHosts,
  getMyEvents
};
