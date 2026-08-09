import { Router } from "express";
import { razorpayWebhook } from "../controllers/paymentController";
import { whatsappWebhookVerify, whatsappWebhook } from "../controllers/whatsappController";

export const paymentsWebhookRouter = Router();
paymentsWebhookRouter.post("/", razorpayWebhook);

export const whatsappWebhookRouter = Router();
whatsappWebhookRouter.get("/", whatsappWebhookVerify);
whatsappWebhookRouter.post("/", whatsappWebhook);
