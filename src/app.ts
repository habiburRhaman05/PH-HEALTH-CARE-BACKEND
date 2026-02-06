import express, { type Express } from "express";
import { envConfig } from "./config/env";
import { applyMiddleware } from "./middleware";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";
import authRoutes from "./modules/auth/auth.route";

const app: Express = express();
app.set("trust proxy", 1);
applyMiddleware(app);

app.use("/api/auth", authRoutes); // auth routes
app.get("/health", (_req, res) =>
  res.status(200).json({
    status: "ok",
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  })
);

app.get("/", (req, res) => res.send("Hello Welcome"));

export const startServer = async () => {



  
  try {
    const PORT = envConfig.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    })

  } catch (error) {
    console.error('❌ Error initializing app:', error);
    process.exit(1);
  }
};
app.use(notFound);
app.use(errorHandler);



export default app;
