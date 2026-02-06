import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import hpp from "hpp";
import { rateLimit } from "express-rate-limit";
import { corsConfig } from "../config/cors";
import { httpLogger } from "../utils/logger";

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === "/health",
});

export const applyMiddleware = (app: Express): void => {
  app.use(httpLogger);
  app.use(helmet());
  app.use(hpp());
  app.use(apiLimiter);
  app.use(cors(corsConfig));
  app.use(compression());
  app.use(cookieParser());
  app.use(express.json({ limit: "1mb" }));
};
