# Micro-Influencer Platform

A complete, enterprise-grade platform for managing micro-influencers and connecting them with businesses for marketing campaigns.

## 🌟 Features

### For Influencers
- **Multi-Platform Integration**: Connect Instagram, Facebook, Twitter, YouTube, and TikTok accounts
- **Profile Management**: Showcase skills, portfolio, and pricing plans
- **Project Discovery**: Browse and apply for business projects
- **Task Management**: Track deliverables with deadline countdowns
- **Real-time Chat**: Direct communication with businesses
- **Earnings Dashboard**: Track income, completed projects, and pending payments
- **Crypto Wallet**: USDT payments on Ethereum, BSC, and Tron networks

### For Businesses
- **Project Creation**: Define campaigns with detailed requirements
- **Influencer Search**: Advanced filtering by followers, platform, region, content type
- **Contract Management**: Digital signature system with terms and conditions
- **Task Review**: Approve or reject submitted work with feedback
- **Analytics Dashboard**: Monitor campaign performance
- **Multi-project Management**: Handle multiple campaigns simultaneously

### Admin Panel
- **Complete User Monitoring**: Track user activity, sessions, login locations
- **Project Approval System**: Review and approve/reject new projects
- **Financial Management**: Monitor transactions, approve withdrawals
- **CMS Integration**: Edit landing page content in multiple languages
- **Analytics & Reporting**: Platform statistics, revenue tracking
- **Audit Logs**: Complete history of all actions
- **Role-based Access Control**: Super Admin, Admin, Moderator, Support, Financial roles

## 🏗️ Architecture

### Tech Stack

**Backend:**
- Node.js + Express + TypeScript
- MongoDB (Users, Projects, Chats, CMS)
- PostgreSQL (Transactions, Analytics, Audit Logs)
- Redis (Sessions, Cache, Rate Limiting)
- Elasticsearch (Search & Analytics)
- Socket.io (Real-time chat & notifications)
- Web3.js (Crypto payments)

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React Query (Data fetching)
- Zustand (State management)
- Socket.io Client (Real-time features)
- i18next (10 languages support)

**DevOps:**
- Docker & Docker Compose
- PM2 (Process management)
- Nginx (Reverse proxy - to be configured)

**External Services:**
- OneSignal (Push notifications)
- Social Media APIs (Instagram, Facebook, Twitter, YouTube, TikTok)
- SMTP (Email notifications)

### Database Schema

**MongoDB Collections:**
- `users` - User accounts (Influencers, Businesses, Admins)
- `projects` - Business campaigns
- `tasks` - Influencer deliverables
- `chats` - Chat conversations
- `messages` - Chat messages
- `cms_content` - Landing page content
- `notifications` - In-app notifications
- `platform_settings` - System configuration

**PostgreSQL Tables:**
- `transactions` - Financial transactions
- `wallets` - Crypto wallet information
- `analytics_events` - User activity tracking
- `user_sessions` - Active sessions
- `audit_logs` - System audit trail
- `commission_settings` - Commission rates

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker & Docker Compose
- MongoDB 7.0+
- PostgreSQL 16+
- Redis 7+
- Elasticsearch 8.11+

## 🚀 Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd PlatformArsalanInfl
```

### 2. Install dependencies

```bash
# Install root dependencies
npm install

# Install all workspaces
npm install --workspaces
```

### 3. Environment Configuration

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

**Required Environment Variables:**

```env
# JWT Secrets (CHANGE THESE!)
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this

# Social Media API Keys
INSTAGRAM_APP_ID=your-instagram-app-id
INSTAGRAM_APP_SECRET=your-instagram-app-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
TWITTER_API_KEY=your-twitter-api-key
TWITTER_API_SECRET=your-twitter-api-secret
TWITTER_BEARER_TOKEN=your-twitter-bearer-token
YOUTUBE_API_KEY=your-youtube-api-key
TIKTOK_CLIENT_KEY=your-tiktok-client-key
TIKTOK_CLIENT_SECRET=your-tiktok-client-secret

# Crypto Wallet
PLATFORM_WALLET_ADDRESS=your-platform-wallet-address
PLATFORM_WALLET_PRIVATE_KEY=your-wallet-private-key

# OneSignal
ONESIGNAL_APP_ID=your-onesignal-app-id
ONESIGNAL_REST_API_KEY=your-onesignal-rest-api-key

# Email
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
```

### 4. Start with Docker (Recommended)

```bash
# Start all services
npm run docker:up

# View logs
npm run docker:logs

# Stop services
npm run docker:down
```

### 5. Start without Docker (Development)

```bash
# Terminal 1: Start databases manually
# MongoDB on port 27017
# PostgreSQL on port 5432
# Redis on port 6379
# Elasticsearch on port 9200

# Terminal 2: Start backend
npm run dev:backend

# Terminal 3: Start frontend
npm run dev:frontend
```

## 📁 Project Structure

```
PlatformArsalanInfl/
├── backend/
│   ├── src/
│   │   ├── config/           # Configuration files
│   │   ├── controllers/      # Route controllers
│   │   ├── middleware/       # Express middleware
│   │   ├── models/           # Database models
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   │   ├── auth/        # Authentication
│   │   │   ├── influencer/  # Influencer features
│   │   │   ├── business/    # Business features
│   │   │   ├── project/     # Project management
│   │   │   ├── task/        # Task management
│   │   │   ├── chat/        # Chat system
│   │   │   ├── payment/     # Crypto payments
│   │   │   ├── admin/       # Admin features
│   │   │   ├── analytics/   # Analytics & tracking
│   │   │   ├── cms/         # CMS management
│   │   │   └── social/      # Social media APIs
│   │   ├── utils/           # Utility functions
│   │   └── index.ts         # Entry point
│   ├── logs/                # Application logs
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js 14 app directory
│   │   ├── components/      # React components
│   │   │   ├── landing/    # Landing page
│   │   │   ├── influencer/ # Influencer dashboard
│   │   │   ├── business/   # Business dashboard
│   │   │   ├── admin/      # Admin panel
│   │   │   └── shared/     # Shared components
│   │   ├── lib/            # Libraries & utilities
│   │   ├── hooks/          # Custom React hooks
│   │   ├── types/          # TypeScript types
│   │   └── styles/         # Global styles
│   ├── public/             # Static assets
│   └── package.json
│
├── shared/
│   ├── src/
│   │   ├── types/          # Shared TypeScript types
│   │   └── utils/          # Shared utilities
│   └── package.json
│
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   ├── mongo-init.js
│   └── postgres-init.sql
│
├── docker-compose.yml
├── ecosystem.config.js      # PM2 configuration
└── package.json
```

## 🔧 Development

### Running Tests

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

### Building for Production

```bash
# Build all workspaces
npm run build

# Build backend only
npm run build:backend

# Build frontend only
npm run build:frontend
```

### Deployment with PM2

```bash
# Start with PM2
npm start

# Stop
npm stop

# Restart
npm restart

# View logs
npm run logs
```

## 🌐 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Endpoints

#### Register Influencer
```http
POST /api/v1/auth/register/influencer
Content-Type: application/json

{
  "email": "influencer@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe",
  "profile": {
    "bio": "Content creator specializing in tech reviews",
    "category": "technology"
  }
}
```

#### Register Business
```http
POST /api/v1/auth/register/business
Content-Type: application/json

{
  "email": "business@example.com",
  "password": "SecurePass123",
  "firstName": "Jane",
  "lastName": "Smith",
  "profile": {
    "companyName": "Tech Corp",
    "industry": "technology",
    "description": "Leading tech company"
  }
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}

Response:
{
  "message": "Login successful",
  "user": { ... },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

#### Get Current User
```http
GET /api/v1/auth/me
Authorization: Bearer {accessToken}
```

## 🎨 Frontend Pages

### Public Pages
- `/` - Landing page (multi-language)
- `/about` - About us
- `/contact` - Contact form
- `/login` - Login page
- `/register` - Registration (Influencer/Business selection)
- `/register/influencer` - Influencer registration flow
- `/register/business` - Business registration flow

### Influencer Dashboard
- `/influencer/dashboard` - Overview, stats, recent tasks
- `/influencer/projects` - Browse and apply for projects
- `/influencer/tasks` - Active tasks with deadlines
- `/influencer/earnings` - Financial dashboard
- `/influencer/chat` - Messages with businesses
- `/influencer/profile` - Edit profile and rates

### Business Dashboard
- `/business/dashboard` - Overview, stats
- `/business/projects` - Manage projects
- `/business/projects/create` - Create new project
- `/business/influencers` - Search influencers
- `/business/tasks` - Review submitted work
- `/business/chat` - Messages with influencers
- `/business/financials` - Billing and payments

### Admin Panel
- `/admin/dashboard` - Platform statistics
- `/admin/users` - User management
- `/admin/projects` - Project approval
- `/admin/tasks` - Task monitoring
- `/admin/transactions` - Financial overview
- `/admin/withdrawals` - Withdrawal requests
- `/admin/cms` - Content management
- `/admin/settings` - Platform settings
- `/admin/analytics` - Advanced analytics
- `/admin/audit-logs` - System audit trail

## 🔐 Security Features

- JWT Authentication with refresh tokens
- Two-Factor Authentication (2FA) support
- Password hashing with bcrypt
- Rate limiting on all endpoints
- CORS protection
- Helmet.js security headers
- Input validation with Zod
- SQL injection prevention (TypeORM)
- XSS protection
- Session management with Redis
- Audit logging for all admin actions

## 💳 Payment System

### Supported Cryptocurrencies
- USDT on Ethereum
- USDT on Binance Smart Chain (BSC)
- USDT on Tron

### Payment Flow
1. Business creates project → Funds locked in escrow
2. Influencer completes tasks → Submits work
3. Business reviews → Approves tasks
4. Funds released → Commission deducted
5. Influencer withdraws → USDT sent to wallet

### Commission Model
- Default: 20% platform commission
- Configurable per project type
- Automatic calculation and deduction

## 📊 Analytics & Tracking

### User Tracking
- Page views and sessions
- User journey mapping
- Device, browser, OS detection
- Geographic location (country, city)
- Login history and IP tracking
- Session duration and activity

### Business Metrics
- Total users (with multiplier for display)
- Active projects count
- Revenue and commission tracking
- Conversion rates
- Average project value

## 🌍 Internationalization

### Supported Languages
1. English (en) - Default
2. Persian/Farsi (fa)
3. French (fr)
4. Spanish (es)
5. Arabic (ar)
6. German (de)
7. Portuguese (pt)
8. Chinese (zh)
9. Korean (ko)
10. Japanese (ja)

### Translation Scope
- Landing page and static content
- Dashboard UI
- Email templates
- Error messages
- Project listings remain in original language

## 🔄 Real-time Features

### Socket.io Events

**Chat:**
- `chat:join` - Join chat room
- `chat:leave` - Leave chat room
- `chat:message` - Send message
- `chat:typing` - Typing indicator
- `chat:read` - Mark messages as read

**Notifications:**
- `notification:new` - New notification
- `notification:read` - Mark as read

**Live Updates:**
- `project:updated` - Project status changed
- `task:submitted` - New task submission
- `payment:received` - Payment confirmed

## 📝 TODO: Features to Implement

### High Priority
1. ✅ Project Structure & Docker Setup
2. ✅ Database Models & Schemas
3. ✅ Authentication System (JWT + 2FA)
4. ⏳ Social Media API Integrations
5. ⏳ Complete Registration Flows
6. ⏳ Project Management System
7. ⏳ Task Management & Approval
8. ⏳ Real-time Chat System
9. ⏳ Crypto Payment Integration
10. ⏳ Admin Panel Features

### Medium Priority
11. ⏳ Elasticsearch Integration
12. ⏳ OneSignal Push Notifications
13. ⏳ Email Service (SMTP)
14. ⏳ File Upload System
15. ⏳ CMS Content Management
16. ⏳ Analytics Dashboard
17. ⏳ Influencer Search & Filters
18. ⏳ Contract Generation & Signing

### Low Priority
19. ⏳ Frontend Landing Page
20. ⏳ Frontend Dashboards
21. ⏳ i18n Translation Files
22. ⏳ Responsive Mobile Design
23. ⏳ Performance Optimization
24. ⏳ SEO Optimization
25. ⏳ Unit & Integration Tests
26. ⏳ API Documentation (Swagger)
27. ⏳ Deployment Scripts

## 🐛 Known Issues

- Social media API integration requires valid API keys
- Crypto wallet integration needs proper testing on testnets
- Frontend components are not yet implemented
- Email service requires SMTP configuration
- OneSignal requires app setup

## 🤝 Contributing

This is a private project. For questions or issues, contact the development team.

## 📄 License

Proprietary - All rights reserved

## 👥 Support

For technical support or questions:
- Email: support@microinfluencer.com
- Documentation: (To be added)

## 🚧 Development Roadmap

### Phase 1: Foundation (Current)
- ✅ Project setup and architecture
- ✅ Database design and models
- ✅ Basic authentication
- ⏳ Core API endpoints

### Phase 2: Core Features
- Social media integrations
- Complete user flows
- Project and task management
- Chat system

### Phase 3: Financial
- Crypto wallet integration
- Payment processing
- Withdrawal system
- Commission calculation

### Phase 4: Admin & Analytics
- Admin dashboard
- User monitoring
- Analytics system
- CMS integration

### Phase 5: Frontend
- Landing page
- User dashboards
- Admin panel UI
- Mobile responsive design

### Phase 6: Polish & Launch
- Testing and QA
- Performance optimization
- Security audit
- Documentation
- Deployment

## 📚 Additional Resources

### Getting Social Media API Keys

**Instagram:**
1. Create Facebook Developer account
2. Create an app
3. Add Instagram Basic Display product
4. Get App ID and App Secret

**Facebook:**
1. Use same app from Instagram
2. Enable Facebook Login
3. Get credentials from app dashboard

**Twitter:**
1. Apply for Twitter Developer account
2. Create project and app
3. Generate API keys and bearer token

**YouTube:**
1. Create project in Google Cloud Console
2. Enable YouTube Data API v3
3. Create credentials (API Key)

**TikTok:**
1. Register for TikTok for Developers
2. Create app
3. Get Client Key and Client Secret

### Web3 Provider Setup

**Ethereum:**
- Infura: https://infura.io
- Alchemy: https://www.alchemy.com

**BSC:**
- Public RPC: https://bsc-dataseed.binance.org/

**Tron:**
- TronGrid: https://www.trongrid.io

### OneSignal Setup
1. Create account at https://onesignal.com
2. Create Web Push app
3. Get App ID and REST API Key
4. Configure for web push

---

**Built with ❤️ for the micro-influencer community**
