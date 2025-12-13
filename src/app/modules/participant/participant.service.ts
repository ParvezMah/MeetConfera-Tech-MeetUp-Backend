import { Payment } from './../../../../node_modules/.pnpm/@prisma+client@6.16.3_prism_be57e26363a729e491225dc990c89636/node_modules/.prisma/client/index.d';
import { participantStatus, PaymentStatus } from "@prisma/client";
import prisma from "../../shared/prisma";
import { stripe } from "../../helpers/stripe";
import { v4 as uuidv4 } from "uuid";


// Join Event
// const joinEventAsParticipant = async (payload: any) => {
//   const { userId, eventId }: any = payload;

//   const event = await prisma.event.findUnique({ where: { id: eventId } });
//   if (!event) throw new Error("Event not found!");
//   if (event.status !== "OPEN") throw new Error("Event is not open for joining.");

//   const alreadyJoined = await prisma.participant.findFirst({ where: { userId, eventId } });
//   if (alreadyJoined) throw new Error("You already joined this event.");

//   const count = await prisma.participant.count({ where: { eventId } });
//   if (count >= event.maxParticipants) throw new Error("Event is full.");

//   const result =  prisma.participant.create({
//     data: { userId, eventId, status: "JOINED" },
//   });

//   return result;
// };



// const joinEventAsParticipantWithPayment = async (userId: string, eventId: string) => {
//     // 1. Check event exists
//     const event = await prisma.event.findUnique({ where: { id: eventId } });
//     if (!event) throw new Error("Event not found!");

//     // 2. Create participant with status WAITING
//     const participant = await prisma.participant.create({
//         data: {
//             userId,
//             eventId,
//             status: participantStatus.JOINED
//         }
//     });

//     // 3. If event has joiningFee > 0, create Payment record and Stripe session
//     if (event.joiningFee && event.joiningFee > 0) {
//         const payment = await prisma.payment.create({
//             data: {
//                 userId,
//                 eventId,
//                 participantId: participant.id,
//                 amount: event.joiningFee,
//                 status: PaymentStatus.SUCCESS,
//                 gatewayName: "STRIPE"
//             }
//         });

//         // 4. Create Stripe checkout session
//         const session = await stripe.checkout.sessions.create({
//             payment_method_types: ["card"],
//             mode: "payment",
//             line_items: [
//                 {
//                     price_data: {
//                         currency: "usd",
//                         product_data: {
//                             name: event.eventName,
//                             description: event.description || "",
//                         },
//                         unit_amount: event.joiningFee * 100 // Stripe expects cents
//                     },
//                     quantity: 1
//                 }
//             ],
//             metadata: {
//                 participantId: participant.id,
//                 userId,
//                 eventId,
//                 paymentId: payment.id
//             },
//             // success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
//             // cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`
//             success_url: `https://www.programming-hero.com/`,
//             cancel_url: `https://web.programming-hero.com/home/level2`
//         });

//         return session;
//     }

//     // If free event, immediately mark participant as JOINED
//     await prisma.participant.update({
//         where: { id: participant.id },
//         data: { status: participantStatus.JOINED }
//     });

//     return { message: "Joined free event successfully!" };
// };


// stripe login
// stripe listen --forward-to localhost:5000/webhook
// stripe trigger payment_intent.succeeded


interface JoinEventPayload {
  userId: string;
  eventId: string;
  successUrl?: string;
  cancelUrl?: string;
}

const joinEventAsParticipantWithPayment = async (payload: JoinEventPayload) => {
  const { userId, eventId, successUrl, cancelUrl } = payload;

  // Use a transaction for atomic operations
  const result = await prisma.$transaction(async (tx) => {
    // 1. Validate event
    const event = await tx.event.findUnique({ where: { id: eventId } });
    if (!event) throw new Error("Event not found!");

    // 2. Create participant (status JOINED or WAITING)
    const participant = await tx.participant.create({
      data: {
        userId,
        eventId,
        status: participantStatus.WAITING, // Initially waiting until payment success
      },
    });

    let stripeSessionUrl: string | null = null;

    // 3. Paid event: create payment and Stripe session
    if (event.joiningFee && event.joiningFee > 0) {
      const payment = await tx.payment.create({
        data: {
          userId,
          eventId,
          participantId: participant.id,
          amount: event.joiningFee,
          status: PaymentStatus.PENDING, // Initially pending
          gatewayName: "STRIPE",
        },
      });

      // 4. Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "bdt",
              product_data: {
                name: event.eventName,
                description: event.description || "",
              },
              unit_amount: event.joiningFee * 100, // Stripe expects cents
            },
            quantity: 1,
          },
        ],
        metadata: {
          participantId: participant.id,
          userId,
          eventId,
          paymentId: payment.id,
        },
        success_url: successUrl || "https://www.programming-hero.com/",
        cancel_url: cancelUrl || "https://web.programming-hero.com/home/level2",
      });

      stripeSessionUrl = session.url!;
    } else {
      // Free event: directly mark participant as JOINED
      await tx.participant.update({
        where: { id: participant.id },
        data: { status: participantStatus.JOINED },
      });
    }

    return {
      participant,
      stripeUrl: stripeSessionUrl,
    };
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
    // joinEventAsParticipant,
    joinEventAsParticipantWithPayment,
    cancelParticipation,
    getMyAllEventParticipations
}