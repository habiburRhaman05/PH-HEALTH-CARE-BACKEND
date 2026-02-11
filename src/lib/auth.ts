import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
// If your Prisma file is located elsewhere, you can change the path
import { bearer } from "better-auth/plugins";
import { envConfig } from "../config/env";
import { redis } from "../config/redis";
import { UserRole, UserStatus } from "../generated/prisma/enums";
import { emailQueue } from "../queue/emailQueue";
const isProduction = process.env.NODE_ENV === "production";
export const auth = betterAuth({
     baseURL: envConfig.BETTER_AUTH_URL,
    secret: envConfig.BETTER_AUTH_SECRET,
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    redis, //
    trustedOrigins: [process.env.BETTER_AUTH_URL || "http://localhost:5000", envConfig.CLIENT_URL],
        redirectURLs:{
        signIn : `${envConfig.BETTER_AUTH_URL}/api/v1/auth/google/success`,
    },


 
    plugins: [bearer(),
    ],
    user: {
        additionalFields: {

            role: {
                type: "string",
                required: true,
                defaultValue: UserRole.PATIENT
            },
            status: {
                type: "string",
                required: true,
                defaultValue: UserStatus.ACTIVE
            },
            needPasswordChange: {
                type: "boolean",
                defaultValue: false
            },
            isDeleted: {
                type: "boolean",
                defaultValue: false
            },

        }
    },

    emailAndPassword: {
        enabled: true,
        autoSignIn: false,
        requireEmailVerification: true,
          sendResetPassword: async ({user, url, token}, request) => {
  try {
    console.log("sedning reset mail");
    
                await emailQueue.add("reset-password-mail", { user, url }, {
                    priority: 1,
                    attempts: 3, // retry 3 times if fails
                    backoff: { type: "exponential", delay: 1000 },
                });

             
            } catch (error) {
                console.log("Failed to send reset-password email");
            }
    },
    onPasswordReset: async ({ user }, request) => {
      // your logic here
      console.log(`Password for user ${user.email} has been reset.`);
    },
    },

    advanced: {
        defaultCookieAttributes: {
            sameSite: isProduction ? "none" : "lax",
            secure: isProduction, // secure in production
            httpOnly: true,
        },
        trustProxy: true,
        useSecureCookies : false,
        cookies:{
            state:{
                attributes:{
                    sameSite: "none",
                    secure: true,
                    httpOnly: true,
                    path: "/",
                }
            },
            sessionToken:{
                attributes:{
                    sameSite: "none",
                    secure: true,
                    httpOnly: true,
                    path: "/",
                }
            }
        }
    },
    
    session: {
        expiresIn: 60 * 60 * 60 * 24, // 1 day in seconds
        updateAge: 60 * 60 * 60 * 24, // 1 day in seconds
        cookieCache: {
            enabled: true,
            maxAge: 60 * 60 * 60 * 24, // 1 day in seconds
        }
    },
    emailVerification: {
        sendOnSignUp:true,
        sendVerificationEmail: async ({ user, url, token }, request) => {
            try {
                await emailQueue.add("verification-mail", { user, url }, {
                    priority: 1,
                    attempts: 3, // retry 3 times if fails
                    backoff: { type: "exponential", delay: 1000 },
                });

             
            } catch (error) {
                console.log("Failed to send verification email");
            }
        

        }

    },
socialProviders:{
        google:{
            clientId: envConfig.GOOGLE_CLIENT_ID,
            clientSecret: envConfig.GOOGLE_CLIENT_SECRET,
            // callbackUrl: envVars.GOOGLE_CALLBACK_URL,
            mapProfileToUser: ()=>{
                return {
                    role : UserRole.PATIENT,
                    status : UserStatus.ACTIVE,
                    needPasswordChange : false,
                    emailVerified : true,
                    isDeleted : false,
                    deletedAt : null,
                }
            }
        }
    },
});
