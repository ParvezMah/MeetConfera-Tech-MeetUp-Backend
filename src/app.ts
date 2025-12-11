import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import config from './config';
import router from './app/routes';
import cookieParser from "cookie-parser"
import { PaymentController } from './app/modules/payment/payment.controller';

const app: Application = express();

app.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  PaymentController.handleStripeWebhookEvent
);


app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

//json-parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser())

app.get('/', (req: Request, res: Response) => {
    res.send({
        message: "MeetConfera : A Tech MeetUp Platform..",
        environment: config.node_env,
        uptime: process.uptime().toFixed(2) + " sec",
        timeStamp: new Date().toISOString()
    })
});

// routes
app.use("/api/v1", router);

app.use(globalErrorHandler);

app.use(notFound);

export default app;