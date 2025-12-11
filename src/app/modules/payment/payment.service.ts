import Stripe from "stripe";
import { PaymentStatus, participantStatus } from "@prisma/client";
import prisma from "../../shared/prisma";


// const handleStripeWebhookEvent = async (event: Stripe.Event) => {
//     switch (event.type) {
//         case "checkout.session.completed": {
//             const session = event.data.object as any;

//             // Metadata sent during Stripe session creation
//             const participantId = session.metadata?.participantId;
//             const userId = session.metadata?.userId;
//             const eventId = session.metadata?.eventId;

//             if (!participantId) {
//                 console.error("Participant ID missing in webhook metadata!");
//                 break;
//             }

//             // 1. Update Payment record linked to this participant
//             await prisma.payment.updateMany({
//                 where: { participantId },
//                 data: {
//                     status: PaymentStatus.SUCCESS,
//                     transactionId: session.payment_intent,
//                     gatewayData: session
//                 }
//             });

//             // 2. Update Participant status to JOINED
//             await prisma.participant.update({
//                 where: { id: participantId },
//                 data: {
//                     status: participantStatus.JOINED
//                 }
//             });

//             console.log(`✅ Payment successful for participant ${participantId}`);
//             break;
//         }

//         default:
//             console.log(`ℹ️ Unhandled Stripe event type: ${event.type}`);
//     }

//     return { received: true };
// };

const handleStripeWebhookEvent = async (event: Stripe.Event) => {
    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object as any;

            const participantId = session.metadata?.participantId;
            const userId = session.metadata?.userId;
            const eventId = session.metadata?.eventId;
            const paymentId = session.metadata?.paymentId;

            if (!participantId || !paymentId) {
                console.error("Participant ID or Payment ID missing in webhook metadata!");
                break;
            }

            // Use transaction to safely update both Payment and Participant
            await prisma.$transaction(async (tx) => {
                // 1. Update Payment
                await tx.payment.update({
                    where: { id: paymentId },
                    data: {
                        status: PaymentStatus.SUCCESS,
                        transactionId: session.payment_intent,
                        gatewayData: session,
                    },
                });

                // 2. Update Participant
                await tx.participant.update({
                    where: { id: participantId },
                    data: { status: participantStatus.JOINED },
                });
            });

            console.log(`✅ Payment successful for participant ${participantId}`);
            return { participantId, paymentId, status: "JOINED" };
        }

        default:
            console.log(`ℹ️ Unhandled Stripe event type: ${event.type}`);
            return { status: "ignored" };
    }
};




export const PaymentService = {
    handleStripeWebhookEvent
};
