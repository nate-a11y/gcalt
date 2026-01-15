# Sideline Setup Guide

Complete setup instructions for running Sideline locally and deploying to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Running Locally](#running-locally)
6. [Mobile App Setup](#mobile-app-setup)
7. [Third-Party Services](#third-party-services)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20.x or later
- **pnpm** 9.x (`npm install -g pnpm`)
- **Git**
- **PostgreSQL** 15+ (or use a cloud provider)

For mobile development:
- **Expo CLI** (`npm install -g expo-cli`)
- **EAS CLI** (`npm install -g eas-cli`)
- **Xcode** (for iOS development, macOS only)
- **Android Studio** (for Android development)

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/sideline.git
cd sideline

# Install dependencies
pnpm install

# Copy environment files
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env

# Start development servers
pnpm dev
```

This will start:
- Web app at http://localhost:3000
- API server at http://localhost:3001

---

## Environment Configuration

### Web App (`apps/web/.env.local`)

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Optional: Analytics
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
```

### API Server (`apps/api/.env`)

```bash
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/sideline

# JWT
JWT_SECRET=your-jwt-secret-key

# Cloudflare R2 (Media Storage)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=sideline-media
R2_PUBLIC_URL=

# Mux (Video Streaming)
MUX_TOKEN_ID=
MUX_TOKEN_SECRET=
MUX_WEBHOOK_SECRET=

# Expo Push Notifications
EXPO_ACCESS_TOKEN=

# Optional: Redis (for caching/sessions)
REDIS_URL=
```

### Mobile App (`apps/mobile/.env`)

```bash
EXPO_PUBLIC_API_URL=http://localhost:3001
EXPO_PUBLIC_WS_URL=ws://localhost:3001/ws
```

---

## Database Setup

### Option 1: Local PostgreSQL

```bash
# Create database
createdb sideline

# Set DATABASE_URL in apps/api/.env
DATABASE_URL=postgresql://localhost:5432/sideline
```

### Option 2: Neon (Recommended for production)

1. Create account at https://neon.tech
2. Create a new project
3. Copy the connection string to `DATABASE_URL`

### Option 3: Supabase

1. Create project at https://supabase.com
2. Go to Settings > Database
3. Copy the connection string (use "Connection pooling" for serverless)

### Running Migrations

```bash
# Generate migrations from schema changes
pnpm --filter @sideline/db db:generate

# Apply migrations
pnpm --filter @sideline/db db:migrate

# Or push schema directly (development only)
pnpm --filter @sideline/db db:push
```

---

## Running Locally

### Development Mode

```bash
# Start all apps
pnpm dev

# Or start specific apps
pnpm --filter @sideline/web dev    # Web only
pnpm --filter @sideline/api dev    # API only
pnpm --filter @sideline/mobile dev # Mobile only
```

### Building for Production

```bash
# Build all packages
pnpm build

# Build specific app
pnpm --filter @sideline/web build
pnpm --filter @sideline/api build
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

---

## Mobile App Setup

### iOS (macOS only)

1. Install Xcode from the App Store
2. Install CocoaPods: `sudo gem install cocoapods`
3. Start the iOS simulator:

```bash
cd apps/mobile
pnpm ios
```

### Android

1. Install Android Studio
2. Create an Android Virtual Device (AVD)
3. Start the emulator:

```bash
cd apps/mobile
pnpm android
```

### Using Expo Go (Easiest for testing)

1. Install Expo Go on your device (iOS/Android)
2. Start the dev server:

```bash
cd apps/mobile
pnpm start
```

3. Scan the QR code with Expo Go

### Building for Production

```bash
# Configure EAS
cd apps/mobile
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Build for both
eas build --platform all
```

---

## Third-Party Services

### Cloudflare R2 (Media Storage)

1. Create Cloudflare account
2. Go to R2 in dashboard
3. Create a bucket named `sideline-media`
4. Create R2 API token with read/write permissions
5. Set up public access (custom domain or R2.dev subdomain)
6. Add credentials to `.env`:

```bash
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET=sideline-media
R2_PUBLIC_URL=https://media.yourdomain.com
```

### Mux (Live Streaming & Video)

1. Create account at https://mux.com
2. Go to Settings > API Access Tokens
3. Create a new token with all permissions
4. Add credentials to `.env`:

```bash
MUX_TOKEN_ID=your-token-id
MUX_TOKEN_SECRET=your-token-secret
```

5. Set up webhooks:
   - URL: `https://api.yourdomain.com/webhooks/mux`
   - Events: All Live Stream and Asset events
   - Copy the signing secret to `MUX_WEBHOOK_SECRET`

### Expo Push Notifications

1. Create account at https://expo.dev
2. Go to Account Settings > Access Tokens
3. Create a new token
4. Add to `.env`:

```bash
EXPO_ACCESS_TOKEN=your-token
```

---

## Deployment

### Web App (Vercel)

1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Configure:
   - Framework Preset: Next.js
   - Root Directory: `apps/web`
   - Build Command: `cd ../.. && pnpm build --filter @sideline/web`
   - Output Directory: `.next`

Or use the CLI:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### API Server Options

#### Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up
```

#### Fly.io

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Launch (first time)
cd apps/api
fly launch

# Deploy
fly deploy
```

#### Docker

```dockerfile
# apps/api/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace files
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml ./

# Copy packages
COPY packages ./packages
COPY apps/api ./apps/api

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build
RUN pnpm --filter @sideline/api build

EXPOSE 3001

CMD ["node", "apps/api/dist/index.js"]
```

### Database Migrations (Production)

```bash
# Run migrations via GitHub Actions
# Or manually:
DATABASE_URL=your-production-url pnpm --filter @sideline/db db:migrate
```

---

## Troubleshooting

### Common Issues

#### "Cannot find module" errors
```bash
# Clean and reinstall
rm -rf node_modules
pnpm install
```

#### Database connection errors
- Check `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check firewall/security group settings

#### Mobile app not connecting to API
- Use your machine's IP instead of localhost
- Update `EXPO_PUBLIC_API_URL` to `http://192.168.x.x:3001`

#### Build failures
```bash
# Clear Turbo cache
pnpm clean

# Rebuild
pnpm build
```

#### TypeScript errors after pulling changes
```bash
# Regenerate TypeScript
pnpm typecheck
```

### Getting Help

- Check existing issues on GitHub
- Join our Discord community
- Email: support@sideline.app

---

## Architecture Overview

```
sideline/
├── apps/
│   ├── web/          # Next.js web app
│   ├── api/          # Hono API server
│   └── mobile/       # React Native/Expo app
├── packages/
│   ├── ui/           # Shared React components
│   ├── db/           # Database schema & client
│   ├── shared/       # Shared types & utilities
│   ├── config/       # Shared configs
│   ├── stats-engine/ # Sport statistics calculations
│   ├── realtime/     # WebSocket real-time updates
│   ├── media/        # Photo/video upload & processing
│   ├── streaming/    # Live video streaming (Mux)
│   ├── notifications/# Push notifications
│   ├── league/       # League & tournament management
│   └── highlights/   # AI-powered highlight detection
└── .github/
    └── workflows/    # CI/CD pipelines
```

---

## Next Steps

1. Set up your development environment
2. Configure required services (database, R2)
3. Run the app locally
4. Customize for your needs
5. Deploy to production

For feature requests or contributions, please open an issue or PR on GitHub.
