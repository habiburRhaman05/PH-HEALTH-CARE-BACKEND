import path from "path";
import { startServer } from "./app";
import { connectToDatabase } from "./config/db";
import "./workers/emailWorker"; 
import { cwd } from "process";
(async () => {
 
  
  await connectToDatabase();
  await startServer();
})();
