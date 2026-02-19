import Stripe from "stripe";
import { envConfig } from "../../config/env";
import { stripe } from "../../config/stripe";
import { sendError, sendSuccess } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { prisma } from "../../lib/prisma";
import { PaymentStatus } from "../../generated/prisma/enums";
import { AppError } from "../../utils/AppError";

const handleStripeWebHookEventController = asyncHandler(async (req, res) => {
  const endpointSecret = envConfig.STRIPE_WEBHOOK_SECRET;
  let event: any;
  if (endpointSecret) {
    // Get the signature sent by Stripe
    const signature = req.headers['stripe-signature'];
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature!,
        endpointSecret
      );
    } catch (err: any) {
      console.log(`⚠️ Webhook signature verification failed.`, err.message);
      return sendError(res, {
        statusCode: 400,
        message: err.message || "Error  occurred by stripe webhook"
      });
    }
  }


  const existingPayment = await prisma.payment.findFirst({
    where: {
      stripeEventId: event.id
    }
  })

  if (existingPayment) {
    console.log(`Event ${event.id} already processed. Skipping`);
    return { message: `Event ${event.id} already processed. Skipping` }
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object

      const appointmentId = session.metadata?.appointmentId

      const paymentId = session.metadata?.paymentId

      if (!appointmentId || !paymentId) {
        console.error("Missing appointmentId or paymentId in session metadata");
        return { message: "Missing appointmentId or paymentId in session metadata" }
      }

      const appointment = await prisma.appointment.findUnique({
        where: {
          id: appointmentId
        }
      })

      if (!appointment) {
        console.error(`Appointment with id ${appointmentId} not found`);
        return { message: `Appointment with id ${appointmentId} not found` }
      }

      await prisma.$transaction(async (tx) => {
        await tx.appointment.update({
          where: {
            id: appointmentId
          },
          data: {
            paymentStatus: session.payment_status === "paid" ? PaymentStatus.COMPLETE : PaymentStatus.PENDING
          }
        });

        await tx.payment.update({
          where: {
            id: paymentId
          },
          data: {
            stripeEventId: event.id,
            status: session.payment_status === "paid" ? PaymentStatus.COMPLETE : PaymentStatus.PENDING,
            paymentGatewayData: session as any,
          }
        });
      });

      console.log(`Processed checkout.session.completed for appointment ${appointmentId} and payment ${paymentId}`);
      break;
    }
    case "checkout.session.expired": {
      const session = event.data.object

      console.log(`Checkout session ${session.id} expired. Marking associated payment as failed.`);
      throw new AppError(`Checkout session ${session.id} expired. Marking associated payment as failed.`)


    }
    case "payment_intent.payment_failed": {
      const session = event.data.object
      console.log(`Payment intent ${session.id} failed. Marking associated payment as failed.`);
      throw new AppError(`Payment intent ${session.id} failed. Marking associated payment as failed.`, 400)
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return { message: `Webhook Event ${event.id} processed successfully` }

})

export const stripeControllers = { handleStripeWebHookEventController }