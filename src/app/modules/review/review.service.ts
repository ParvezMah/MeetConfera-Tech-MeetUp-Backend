import { Prisma } from "@prisma/client";
import httpStatus from "http-status";
import { IOptions, paginationHelper } from "../../helpers/paginationHelper";

import ApiError from "../../errors/ApiError";
import prisma from "../../shared/prisma";

const createReview = async (user: any, payload: any) => {
  // Find participant
const participantData = await prisma.participant.findFirstOrThrow({
  where: {
    userId: user.id,
    eventId: payload.eventId,
  },
});


  console.log({participantData})

  // Find event
  const eventData = await prisma.event.findUniqueOrThrow({
    where: { id: payload.eventId },
  });
  
  console.log({eventData})

  // Ensure participant belongs to this event
  if (participantData.eventId !== eventData.id) {
    throw new ApiError(httpStatus.BAD_REQUEST, "You did not join this event!");
  }

  return await prisma.$transaction(async (tnx) => {
    // Insert review
    const result = await tnx.review.create({
      data: {
        participantId: participantData.id,
        hostId: eventData.hostId,
        eventId: eventData.id,
        rating: payload.rating,
        comment: payload.comment,
      },
    });

    // Update host average rating
    const avgRating = await tnx.review.aggregate({
      _avg: { rating: true },
      where: { hostId: eventData.hostId },
    });

    await tnx.host.update({
      where: { id: eventData.hostId },
      data: { averageRating: avgRating._avg.rating as number },
    });

    return result;
  });
};

const getAllReview = async (filters: any, options: IOptions) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);
  const { participantEmail, hostEmail, eventId } = filters;

  const andConditions: Prisma.ReviewWhereInput[] = [];

  if (participantEmail) {
    andConditions.push({
      participant: { user: { email: participantEmail } },
    });
  }

  if (hostEmail) {
    andConditions.push({
      host: { email: hostEmail },
    });
  }

  if (eventId) {
    andConditions.push({ eventId });
  }

  const whereConditions: Prisma.ReviewWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.review.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: options.sortBy && options.sortOrder
      ? { [options.sortBy]: options.sortOrder }
      : { createdAt: "desc" },
    include: {
      participant: { include: { user: true } },
      host: true,
      event: true,
    },
  });

  const total = await prisma.review.count({ where: whereConditions });

  return {
    meta: { total, page, limit },
    data: result,
  };
};

export const ReviewService = {
  createReview,
  getAllReview,
};
