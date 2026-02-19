import express ,{ Router } from "express";
import { stripeControllers } from "./stripe.controller";

const stripeRouter = Router();

stripeRouter.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  stripeControllers.handleStripeWebHookEventController
);

export default stripeRouter 