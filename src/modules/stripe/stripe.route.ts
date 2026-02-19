import express ,{ Router } from "express";

const stripeRouter = Router();

stripeRouter.post(
  "/webhook",
  express.raw({ type: "application/json" })
);

export default stripeRouter 