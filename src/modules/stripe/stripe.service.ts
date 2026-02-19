import { envConfig } from "../../config/env"
import { stripe } from "../../config/stripe"
import { ICreatePaymentSession } from "./stripe.interface"

const createPaymentSession = async (sessionData:ICreatePaymentSession)=>{
     const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items :[
                {
                    price_data:{
                        currency:"bdt",
                        product_data:{
                            name : `Book Appointment with Dr. ${sessionData.doctorname}`,
                        },
                        unit_amount : sessionData.appointmentFee * 100,
                    },
                    quantity : 1,
                }
            ],
            metadata:{
                appointmentId : sessionData.appointmentId,
                paymentId : sessionData.paymentId,
            },
            success_url: `${envConfig.CLIENT_URL}/dashboard/patient/payment/payment-success`,
            // cancel_url: `${envConfig.CLIENT_URL}/dashboard/patient/payment/payment-failed`,
            cancel_url: `${envConfig.CLIENT_URL}/dashboard/patient/appointments`,
        });

        return {
            paymentUrl:session.url
        }
}

export const stripeServices = {createPaymentSession}