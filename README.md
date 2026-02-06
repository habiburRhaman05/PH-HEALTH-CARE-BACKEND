# Prisma TypeScript Backend Template

**Overview**
Lightweight Express + Prisma backend starter with JWT auth helpers, request validation, and production-ready middleware defaults.

**Features**
- Express 5 with TypeScript
- Prisma (PostgreSQL adapter)
- JWT + bcrypt utilities
- Zod request validation
- Centralized error handling
- Security middleware: Helmet, HPP, rate limiting
- `GET /health` endpoint

**Quick Start**
1. Copy `.env.example` to `.env` and fill required values.
2. Install dependencies: `npm install`
3. Generate Prisma client: `npx prisma generate`
4. Run the dev server: `npm run dev`

**Scripts**
- `npm run dev` starts the dev server with hot reload.
- `npm run build` generates Prisma client, runs migrations, and bundles with `tsup`.
- `npm start` runs the production build.

**Environment Variables**
- `NODE_ENV` environment mode.
- `PORT` server port.
- `DATABASE_URL` PostgreSQL connection string.
- `JWT_SECRET` secret key for signing tokens.
- `JWT_EXPIRES_IN` token expiration, e.g. `1d` or `12h`.
- `BCRYPT_SALT_ROUNDS` bcrypt cost factor, usually `10` to `12`.
- `BETTER_AUTH_SECRET` only if using `better-auth`.
- `CLOUDINARY_NAME` Cloudinary cloud name.
- `CLOUDINARY_KEY` Cloudinary API key.
- `CLOUDINARY_SECRET` Cloudinary API secret.

**Project Layout**
- `src/app.ts` Express app setup.
- `src/server.ts` server bootstrap.
- `src/config` environment, CORS, and DB config.
- `src/middleware` request and error middleware.
- `src/modules` feature modules (auth, etc).
- `src/utils` shared utilities.
- `prisma/schema/schema.prisma` Prisma schema.
- `generated/prisma` Prisma client output.
