import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { PaymentService } from "./payment.service";
import { stripe } from "../../helpers/stripe";
import config from "../../../config";

// const handleStripeWebhookEvent = catchAsync(async (req: Request, res: Response) => {
//     const sig = req.headers["stripe-signature"] as string;
//     const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

//     let event;
//     try {
//         event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
//     } catch (err: any) {
//         console.error("⚠️ Webhook signature verification failed:", err.message);
//         return res.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     const result = await PaymentService.handleStripeWebhookEvent(event);

//     sendResponse(res, {
//         statusCode: 200,
//         success: true,
//         message: 'Webhook processed successfully',
//         data: result,
//     });
// });


const handleStripeWebhookEvent = catchAsync(async (req: Request, res: Response) => {
    console.log("Webhook is Called")
    const sig = req.headers["stripe-signature"] as string;
    const webhookSecret = config.stripeWebhookSecretKey as string;

    let event;
    try {
        // Use raw body for webhook verification
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
        console.error("⚠️ Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    const result = await PaymentService.handleStripeWebhookEvent(event);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Stripe webhook processed successfully",
        data: result,
    });
});




export const PaymentController = {
    handleStripeWebhookEvent
};
