import prisma from "../../shared/prisma";



const joinEventAsParticipant = async (payload: any) => {
  const { userId, eventId }: any = payload;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new Error("Event not found!");
  if (event.status !== "OPEN") throw new Error("Event is not open for joining.");

  const alreadyJoined = await prisma.participant.findFirst({ where: { userId, eventId } });
  if (alreadyJoined) throw new Error("You already joined this event.");

  const count = await prisma.participant.count({ where: { eventId } });
  if (count >= event.maxParticipants) throw new Error("Event is full.");

  const result =  prisma.participant.create({
    data: { userId, eventId, status: "JOINED" },
  });

  return result;
};


// Node Crob Job -> Automatic delete canceled participants -> should be implement here
const cancelParticipation = async (payload: any) => {
    const { userId, eventId } = payload.body;

    const participant = await prisma.participant.findFirst({
        where : {
            userId,
            eventId
        }
    });

    if (!participant) throw new Error("Participant not found.");
    if (participant.userId !== userId) throw new Error("This Participant is not matched to cancel.");

    return prisma.participant.update({
        where: { id: participant.id },
        data: { status: "CANCELLED" }
    });
};


const getMyAllEventParticipations = async (userId: string) => {
  // Ensure the user exists and is a normal USER
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found.");
  if (user.role !== "USER") throw new Error("Only individual participants can access this.");

  // Fetch all participant records for this user
  const participations = await prisma.participant.findMany({
    where: { userId },
    include: {
      event: {
        select: {
          id: true,
          eventName: true,
          description: true,
          date: true,
          location: true,
          minParticipants: true,
          maxParticipants: true,
          status: true,
          image: true,
          joiningFee: true,
          category: true,
          hostId: true,
        },
      },
    },
  });

  return participations;
};




export const ParticipantService = {
    joinEventAsParticipant,
    cancelParticipation,
    getMyAllEventParticipations
}