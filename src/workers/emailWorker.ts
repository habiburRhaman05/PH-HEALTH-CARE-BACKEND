import {Worker} from "bullmq"
import {redis} from "../config/redis"
import { mailServices } from "../utils/mailServices";

 const emailWorker = new Worker(
  "emailQueue",
  async (job) => {
   const {user,verifyLink} = job.data;
    switch (job.name) {
      case "verification-mail":
        await mailServices.sendMail({
           email:user.email,
           name:user.name,
         link:verifyLink,type:"verify"
        })
        break;
      case "reset-password-mail":
        await mailServices.sendMail({
           email:user.email,
           name:user.name,
         link:verifyLink,
         type:"reset"
        })
        break;


      default:
        break;
    }
  },
  { connection:redis }
);

emailWorker.on("completed", (job) => console.log(`✅ Job ${job.id} completed`));
emailWorker.on("failed", (job, err) =>
  console.error(`❌ Job ${job?.id} failed:`, err)
);

export default emailWorker