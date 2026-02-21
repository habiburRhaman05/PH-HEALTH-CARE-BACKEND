import { AppError } from "./AppError";
import { mailTransport } from "./mailTransporter";

type MailType = 'verify' | 'reset' | 'prescription-email';

interface MailData {
    email: string;
    name: string;
    link?: string;
    type: MailType;
    html?:any
}

async function sendMail(data: MailData) {
    console.log(data);
    
    try {
        const isVerify = data.type === 'verify';
        
        const subject = isVerify 
            ? 'Verify your PH-Health Care Account' 
            : 'Reset your PH-Health Care Password';

        const title = isVerify 
            ? `Welcome to PH-Health Care, ${data.name}!` 
            : `Password Reset Request`;

        const bodyText = isVerify
            ? 'Thanks for signing up. Please click the button below to verify your email address:'
            : 'We received a request to reset your password. Click the button below to choose a new one:';

        const buttonText = isVerify ? 'Verify Email' : 'Reset Password';
        
        // Adjust these routes based on your frontend setup
        const link = isVerify 
            ? `${data.link}`
            : `${data.link}`;

        const mailOptions = {
            from: '"PH-Health Care" <noreply@phhealth.com>',
            to: data.email,
            subject: subject,
            html: data.html || `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
                <h2 style="color: #333;">${title}</h2>
                <p style="color: #555; line-height: 1.5;">${bodyText}</p>
                <div style="margin: 30px 0;">
                    <a href="${link}" style="background: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                        ${buttonText}
                    </a>
                </div>
                <p style="font-size: 12px; color: #888;">If the button doesn't work, copy and paste this link: <br>${link}</p>
                <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px;">
                <p style="font-size: 11px; color: #aaa;">If you did not request this email, please ignore it.</p>
            </div>
            `
        };

        return await mailTransport.sendMail(mailOptions);
    } catch (error) {
        console.error("Mail Error:", error);
        throw new AppError("Failed to send mail", 400);
    }
}

export const mailServices = { sendMail };