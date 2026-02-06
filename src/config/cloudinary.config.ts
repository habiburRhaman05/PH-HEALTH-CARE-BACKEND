import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import { envConfig } from "./env";
dotenv.config();

cloudinary.config({
  cloud_name:envConfig.CLOUDINARY_NAME,
  api_key: envConfig.CLOUDINARY_KEY,
  api_secret: envConfig.CLOUDINARY_SECRET,
  secure: true,
});

export default cloudinary;
