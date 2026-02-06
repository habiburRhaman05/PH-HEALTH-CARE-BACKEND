export const corsConfig = {
  origin: ['http://localhost:3000',"https://skill-bridge-frontend-gamma.vercel.app",'https://skill-bridge-frontend-4vp4.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS','PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
};
