import Stripe from "stripe";
import { envConfig } from "../../config/env";
import { stripe } from "../../config/stripe";
import { sendError, sendSuccess } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

const handleStripeWebHookEventController = asyncHandler(async (req,res)=>{
    const endpointSecret = envConfig.STRIPE_WEBHOOK_SECRET;
     let event:any;
  if (endpointSecret) {
    // Get the signature sent by Stripe
    const signature = req.headers['stripe-signature'];
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature!,
        endpointSecret
      );
    } catch (err:any) {
      console.log(`⚠️ Webhook signature verification failed.`, err.message);
      return sendError(res,{
        statusCode:400,
        message:err.message || "Error  occurred by stripe webhook"
      });
    }
}
  // Handle the event
  switch (event?.type) {
    case 'payment_intent.succeeded':
     console.log("succcess payment");
     
      break;
    case 'payment_method.attached':
 
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  return sendSuccess(res,{})
})

export const stripeControllers = {handleStripeWebHookEventController}