import express from 'express'
import { PaymentController } from './payment.controller';
import roleBasedAuth from '../../middlewares/roleBasedAuth';
import { UserRole } from '@prisma/client';

/*
This route should be set on top of app.ts

app.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  PaymentController.handleStripeWebhookEvent
);

*/




const router = express.Router();


router.get('/all-payments',
  roleBasedAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.HOST),
  PaymentController.getAllPayments
)


export const PaymentRoutes = router;