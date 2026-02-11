import path from "path";
import { startServer } from "./app";
import { connectToDatabase } from "./config/db";
import "./workers/emailWorker"; 

(async () => {
 
  
  await connectToDatabase();
  await startServer();
  // await auth.api.signUpEmail({
  //   body:{
  //     name:"Super Admin",
  //     email:"super_admin@gmail.com",
  //     password:"superadmin1234",
  //     role:UserRole.SUPER_ADMIN,
  //     needPasswordChange:false,
     
  //   }
  // })
})();
