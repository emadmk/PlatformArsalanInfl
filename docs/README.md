# MicroInfluencer Platform - Complete Documentation

## Overview

MicroInfluencer Platform is a comprehensive influencer marketing solution that connects businesses with influencers for campaign management, with integrated Safira affiliate tracking system.

---

## Table of Contents

1. [Architecture](#architecture)
2. [Tech Stack](#tech-stack)
3. [Features](#features)
4. [Project Structure](#project-structure)
5. [Installation](#installation)
6. [Configuration](#configuration)
7. [Running the Application](#running-the-application)
8. [Documentation Links](#documentation-links)
9. [User Roles](#user-roles)
10. [Safira Integration](#safira-integration)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js 14)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Admin      │  │   Business   │  │  Influencer  │          │
│  │   Panel      │  │   Dashboard  │  │   Dashboard  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Backend (Express.js)                         │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌──────────────┐       │
│  │  Auth   │  │  Admin  │  │Business │  │  Influencer  │       │
│  │ Routes  │  │ Routes  │  │ Routes  │  │    Routes    │       │
│  └─────────┘  └─────────┘  └─────────┘  └──────────────┘       │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌──────────────┐       │
│  │  Chat   │  │ Project │  │ Payment │  │    Safira    │       │
│  │ Routes  │  │ Routes  │  │ Routes  │  │   Webhooks   │       │
│  └─────────┘  └─────────┘  └─────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Database Layer                            │
│  ┌──────────────────────────┐  ┌──────────────────────────┐    │
│  │       MongoDB            │  │     PostgreSQL           │    │
│  │  - Users                 │  │  - Transactions          │    │
│  │  - Projects              │  │  - Payments              │    │
│  │  - Tasks                 │  │  - Wallets               │    │
│  │  - Chats/Messages        │  │                          │    │
│  │  - Safira Stats          │  │                          │    │
│  └──────────────────────────┘  └──────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External Integrations                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Safira     │  │   Email      │  │   Social     │          │
│  │   Webhooks   │  │   Service    │  │    APIs      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express.js | Web framework |
| TypeScript | Type safety |
| MongoDB | Primary database |
| Mongoose | MongoDB ODM |
| PostgreSQL | Transactions database (optional) |
| JWT | Authentication |
| bcryptjs | Password hashing |
| Winston | Logging |

### Frontend
| Technology | Purpose |
|------------|---------|
| Next.js 14 | React framework |
| React 18 | UI library |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Axios | HTTP client |
| Lucide React | Icons |

### Shared
| Technology | Purpose |
|------------|---------|
| TypeScript | Shared types |
| Enums | Consistent values |

---

## Features

### For Businesses
- Create and manage campaigns/projects
- Search and filter influencers
- Accept/reject influencer applications
- Review task submissions
- Track campaign analytics
- Real-time messaging with influencers

### For Influencers
- Browse available projects
- Apply to campaigns
- Submit task deliverables
- Track earnings and wallet
- Safira affiliate dashboard
- Slot-based earning system
- Real-time messaging with businesses

### For Admins
- Complete user management
- Project approval workflow
- Payment/withdrawal management
- Chat monitoring and moderation
- Platform analytics
- Safira integration management
- Audit logging

### Safira Integration
- Automatic referral link generation
- Real-time tracking webhooks
- Slot-based commission system ($40 × 20 = $800)
- Conversion tracking
- Daily stats aggregation
- Withdrawal management

---

## Project Structure

```
PlatformArsalanInfl/
├── backend/
│   ├── src/
│   │   ├── config/           # Configuration files
│   │   ├── controllers/      # Route controllers
│   │   ├── middleware/       # Express middleware
│   │   ├── models/           # Mongoose models
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   └── utils/            # Utilities
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/              # Next.js pages
│   │   ├── components/       # React components
│   │   ├── lib/              # Utilities
│   │   ├── hooks/            # Custom hooks
│   │   └── types/            # TypeScript types
│   ├── package.json
│   └── next.config.js
├── shared/
│   ├── src/
│   │   ├── types/            # Shared types
│   │   └── enums/            # Shared enums
│   └── package.json
└── docs/
    ├── README.md             # This file
    ├── API.md                # API documentation
    ├── FRONTEND.md           # Frontend documentation
    └── MODELS.md             # Database models
```

---

## Installation

### Prerequisites
- Node.js 18+
- MongoDB 6+
- npm or yarn

### Steps

1. **Clone the repository**
```bash
git clone https://github.com/your-repo/PlatformArsalanInfl.git
cd PlatformArsalanInfl
```

2. **Install dependencies**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

# Shared
cd ../shared
npm install
npm run build
```

3. **Configure environment variables**
```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your values

# Frontend
cp frontend/.env.example frontend/.env.local
# Edit frontend/.env.local with your values
```

---

## Configuration

### Backend Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/microinfluencer

# PostgreSQL (optional)
DATABASE_URL=postgresql://user:pass@localhost:5432/microinfluencer

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d

# Safira Integration
SAFIRA_API_KEY=your-safira-api-key
SAFIRA_WEBHOOK_SECRET=your-webhook-secret
SAFIRA_BASE_URL=https://api.safira.com

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password

# Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

### Frontend Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_UPLOAD_URL=http://localhost:5000/uploads
```

---

## Running the Application

### Development

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Production

```bash
# Build
cd backend && npm run build
cd ../frontend && npm run build

# Start
cd backend && npm start
cd ../frontend && npm start
```

### Docker

```bash
docker-compose up -d
```

---

## Documentation Links

| Document | Description |
|----------|-------------|
| [API.md](./API.md) | Complete API reference with endpoints, request/response examples |
| [FRONTEND.md](./FRONTEND.md) | Frontend architecture, pages, components |
| [MODELS.md](./MODELS.md) | Database schemas and relationships |

---

## User Roles

### Admin
- Full platform access
- User management (create, edit, ban, delete)
- Project approval/rejection
- Payment processing
- Chat moderation
- Analytics access

### Business
- Create campaigns/projects
- Search and hire influencers
- Review task submissions
- Track campaign performance
- Manage payments

### Influencer
- Browse and apply to projects
- Submit task deliverables
- Track earnings
- Safira affiliate dashboard
- Withdrawal requests

---

## Safira Integration

### Overview
Safira is an affiliate tracking system integrated into the platform. Influencers can earn commissions through a slot-based system.

### Slot System
- Each influencer has 20 slots
- Each slot is worth $40
- Total earning potential: $800 per cycle
- Slots fill with successful conversions
- After all slots fill, withdrawal is available
- After withdrawal, a new cycle begins

### Webhook Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/api/webhooks/safira-tracking` | Receive click/view/signup events |
| `/api/webhooks/safira-conversion` | Receive conversion notifications |
| `/api/webhooks/safira-daily-stats` | Receive daily summary stats |

### Flow
1. Influencer gets unique referral link
2. Shares link on social media
3. Safira tracks clicks, views, signups
4. Conversions fill slots and add to balance
5. When all 20 slots filled, withdrawal available
6. After withdrawal, new cycle starts

---

## API Quick Reference

### Authentication
```
POST /api/auth/register/influencer
POST /api/auth/register/business
POST /api/auth/login
POST /api/auth/refresh
GET  /api/auth/me
```

### Admin
```
GET    /api/admin/dashboard/stats
GET    /api/admin/users
PUT    /api/admin/users/:id
POST   /api/admin/users/:id/ban
DELETE /api/admin/users/:id
GET    /api/admin/projects
POST   /api/admin/projects/:id/approve
GET    /api/admin/withdrawals
POST   /api/admin/withdrawals/:id/approve
GET    /api/admin/chats
```

### Business
```
GET  /api/business/dashboard/stats
POST /api/business/projects
GET  /api/business/influencers
POST /api/business/influencers/search
```

### Influencer
```
GET  /api/influencer/dashboard/stats
GET  /api/influencer/projects/browse
POST /api/influencer/tasks/:id/submit
GET  /api/influencer/safira/dashboard
GET  /api/influencer/safira/referral-link
POST /api/influencer/safira/withdraw
```

---

## Deployment

### Server Requirements
- Ubuntu 20.04+
- Node.js 18+
- MongoDB 6+
- Nginx
- PM2

### PM2 Configuration

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'backend',
      script: 'dist/index.js',
      cwd: '/var/www/platform/backend',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    },
    {
      name: 'frontend',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/platform/frontend',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploads
    location /uploads {
        alias /var/www/platform/backend/uploads;
    }
}
```

---

## Support

For issues and feature requests, please create a GitHub issue or contact the development team.

---

## License

Proprietary - All rights reserved.
