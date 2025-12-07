# MicroInfluencer Platform - API Documentation

## Table of Contents
- [Overview](#overview)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Authentication APIs](#authentication-apis)
- [Admin APIs](#admin-apis)
- [Business APIs](#business-apis)
- [Influencer APIs](#influencer-apis)
- [Chat APIs](#chat-apis)
- [Project APIs](#project-apis)
- [Payment APIs](#payment-apis)
- [Safira Integration APIs](#safira-integration-apis)
- [Webhook APIs](#webhook-apis)
- [Upload APIs](#upload-apis)
- [CMS APIs](#cms-apis)

---

## Overview

The MicroInfluencer Platform API is a RESTful API that enables influencer marketing campaigns, affiliate tracking via Safira integration, and comprehensive admin management.

**Tech Stack:**
- Node.js + Express.js
- MongoDB (Mongoose)
- JWT Authentication
- TypeScript

---

## Base URL

```
Production: https://api.yourplatform.com/api
Development: http://localhost:5000/api
```

---

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### User Roles
- `admin` - Platform administrators
- `business` - Business accounts
- `influencer` - Influencer accounts

### Admin Roles
- `super_admin` - Full access
- `admin` - General admin access
- `financial` - Financial operations access

---

## Authentication APIs

**Base Path:** `/api/auth`

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | General user registration |
| POST | `/register/influencer` | Influencer registration with profile |
| POST | `/register/business` | Business registration with company details |
| POST | `/login` | User login |
| POST | `/refresh` | Refresh access token |
| POST | `/verify-2fa` | Verify two-factor authentication code |
| POST | `/forgot-password` | Request password reset |
| POST | `/reset-password` | Reset password with token |

### Protected Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/setup-2fa` | Setup two-factor authentication | Required |
| POST | `/enable-2fa` | Enable 2FA | Required |
| POST | `/disable-2fa` | Disable 2FA | Required |
| GET | `/me` | Get current user profile | Required |
| POST | `/logout` | Logout user | Required |

### Request/Response Examples

#### Register Influencer
```http
POST /api/auth/register/influencer
Content-Type: application/json

{
  "email": "influencer@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "profile": {
    "bio": "Professional content creator",
    "category": "Lifestyle",
    "socialAccounts": [
      {
        "platform": "instagram",
        "username": "johndoe",
        "profileUrl": "https://instagram.com/johndoe",
        "followersCount": 50000
      }
    ]
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "user@example.com",
    "role": "influencer",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

---

## Admin APIs

**Base Path:** `/api/admin`
**Required Role:** `admin`

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Get legacy dashboard stats |
| GET | `/dashboard/stats` | Get comprehensive dashboard stats |
| GET | `/activity` | Get recent platform activity |
| GET | `/approvals/pending` | Get all pending approvals |

### User Management

| Method | Endpoint | Description | Admin Role |
|--------|----------|-------------|------------|
| GET | `/users` | List all users with filters | Any |
| GET | `/users/:id` | Get user details | Any |
| PUT | `/users/:id` | Update user | Any |
| PUT | `/users/:id/status` | Update user status | Any |
| POST | `/users/:id/ban` | Ban user | super_admin, admin |
| POST | `/users/:id/unban` | Unban user | super_admin, admin |
| POST | `/users/:id/verify` | Verify user | Any |
| DELETE | `/users/:id` | Delete user | super_admin |

#### Query Parameters for `/users`
- `role` - Filter by user role
- `verified` - Filter by verification status
- `banned` - Filter by ban status
- `search` - Search by name/email
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

### Project Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects` | List all projects with filters |
| GET | `/projects/pending` | Get pending approval projects |
| PUT | `/projects/:id` | Update project |
| DELETE | `/projects/:id` | Delete project |
| POST | `/projects/:id/approve` | Approve project |
| POST | `/projects/:id/reject` | Reject project |

### Withdrawal Management

| Method | Endpoint | Description | Admin Role |
|--------|----------|-------------|------------|
| GET | `/withdrawals` | List all withdrawals | Any |
| GET | `/withdrawals/pending` | Get pending withdrawals | Any |
| POST | `/withdrawals/:id/approve` | Approve withdrawal | super_admin, financial |
| POST | `/withdrawals/:id/reject` | Reject withdrawal | super_admin, financial |
| PUT | `/withdrawals/:id/complete` | Mark withdrawal complete | Any |

### Transaction Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/transactions` | List all transactions |

### Chat Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/chats` | List all chats |
| GET | `/chats/stats` | Get chat statistics |
| GET | `/chats/:id/messages` | Get chat messages |
| POST | `/chats/:id/messages` | Send message as admin |
| POST | `/chats/create` | Create admin chat with user |
| PUT | `/chats/:id/suspend` | Suspend chat |
| PUT | `/chats/:id/unsuspend` | Unsuspend chat |
| DELETE | `/chats/:id` | Delete chat and messages |

### Safira Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/safira/stats` | Get Safira overview stats |
| GET | `/safira/influencers` | List Safira influencers |
| GET | `/safira/conversions` | List Safira conversions |
| POST | `/safira/sync` | Sync Safira data |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics` | Get platform analytics |
| GET | `/audit-logs` | Get admin audit logs |

---

## Business APIs

**Base Path:** `/api/business`
**Required Role:** `business`

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/stats` | Get business dashboard stats |

### Project Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/projects` | Create new project |
| GET | `/projects` | List business projects |
| PUT | `/projects/:id` | Update project |
| DELETE | `/projects/:id` | Delete project |

### Influencer Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/influencers` | List working influencers |
| GET | `/influencers/:id` | Get influencer profile |
| POST | `/influencers/search` | Search influencers |
| POST | `/projects/:projectId/influencers/:influencerId/accept` | Accept influencer |
| POST | `/projects/:projectId/influencers/:influencerId/reject` | Reject influencer |

### Task Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | List all tasks |
| POST | `/tasks/:id/review` | Review task submission |

### Request Example - Create Project
```http
POST /api/business/projects
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Instagram Campaign for Summer Collection",
  "description": "Looking for fashion influencers to promote our summer collection",
  "category": "Fashion",
  "budget": 5000,
  "deadline": "2024-08-01",
  "maxInfluencers": 10,
  "requirements": {
    "minFollowers": 10000,
    "platforms": ["instagram", "tiktok"],
    "contentTypes": ["post", "story", "reel"]
  },
  "deliverables": [
    {
      "title": "Instagram Post",
      "description": "High-quality product photo",
      "quantity": 2
    }
  ]
}
```

---

## Influencer APIs

**Base Path:** `/api/influencer`
**Required Role:** `influencer`

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/stats` | Get influencer dashboard stats |

### Profile

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profile` | Get influencer profile |
| PUT | `/profile` | Update profile |

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects` | List my projects (applied/accepted) |
| GET | `/projects/browse` | Browse available projects |
| GET | `/projects/applied` | List applied projects |

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | List all my tasks |
| GET | `/tasks/upcoming` | List upcoming tasks (7 days) |
| POST | `/tasks/:id/submit` | Submit task completion |

### Earnings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/earnings` | Get wallet balance |
| POST | `/earnings/withdraw` | Request withdrawal |

### Safira Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/safira/dashboard` | Get Safira dashboard overview |
| GET | `/safira/referral-link` | Get referral links |
| GET | `/safira/slots` | Get slot details |
| GET | `/safira/conversions` | Get conversion history |
| GET | `/safira/tracking` | Get tracking events |
| GET | `/safira/analytics` | Get Safira analytics |
| POST | `/safira/withdraw` | Request Safira earnings withdrawal |

### Safira Dashboard Response Example
```json
{
  "referralCode": "INF_ABC123",
  "referralUrl": "https://safira.com/?ref=INF_ABC123",
  "totalSlots": 10,
  "filledSlots": 3,
  "amountPerSlot": 100,
  "totalEarned": 300,
  "availableBalance": 250,
  "stats": {
    "totalClicks": 1500,
    "totalPageViews": 2300,
    "totalSignups": 45,
    "totalConversions": 12,
    "conversionRate": 0.52
  }
}
```

---

## Chat APIs

**Base Path:** `/api/chat`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List user's chats |
| POST | `/` | Create new chat |
| GET | `/:id` | Get chat details |
| GET | `/:id/messages` | Get chat messages |
| POST | `/:id/messages` | Send message |
| PUT | `/:id/read` | Mark messages as read |

---

## Project APIs

**Base Path:** `/api/projects`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List public projects |
| GET | `/:id` | Get project details |
| POST | `/:id/apply` | Apply to project (influencer) |
| POST | `/:id/withdraw` | Withdraw application |

---

## Payment APIs

**Base Path:** `/api/payments`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/balance` | Get wallet balance |
| GET | `/transactions` | List transactions |
| POST | `/withdraw` | Request withdrawal |
| GET | `/withdrawals` | List withdrawal requests |

---

## Safira Integration APIs

### Webhook Endpoints

**Base Path:** `/api/webhooks`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/safira-tracking` | Receive tracking events |
| POST | `/safira-conversion` | Receive conversion events |
| POST | `/safira-daily-stats` | Receive daily stats |

### Safira API Endpoints

**Base Path:** `/api/safira`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/influencer/:id/stats` | Get influencer Safira stats |
| POST | `/assign/:influencerId` | Assign Safira project to influencer |

### Webhook Payload Examples

#### Tracking Event
```json
{
  "event_id": "evt_123456",
  "event_type": "CLICK",
  "referral_code": "INF_ABC123",
  "timestamp": "2024-01-15T10:30:00Z",
  "device_type": "mobile",
  "browser": "Chrome",
  "country": "US",
  "city": "New York",
  "page_url": "https://safira.com/product/123"
}
```

#### Conversion Event
```json
{
  "conversion_id": "conv_789",
  "conversion_type": "PURCHASE",
  "referral_code": "INF_ABC123",
  "timestamp": "2024-01-15T11:00:00Z",
  "transaction": {
    "amount": 150.00,
    "commission": 15.00,
    "product_value": 150.00
  },
  "product": {
    "id": "prod_456",
    "name": "Premium Package"
  },
  "customer": {
    "is_new": true
  }
}
```

---

## Upload APIs

**Base Path:** `/api/upload`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/image` | Upload image file |
| POST | `/file` | Upload any file |
| DELETE | `/:fileId` | Delete uploaded file |

---

## CMS APIs

**Base Path:** `/api/cms`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/pages` | List CMS pages |
| GET | `/pages/:slug` | Get page by slug |
| POST | `/pages` | Create page (admin) |
| PUT | `/pages/:id` | Update page (admin) |
| DELETE | `/pages/:id` | Delete page (admin) |

---

## Error Responses

All API endpoints return errors in the following format:

```json
{
  "error": "Error message here",
  "code": "ERROR_CODE",
  "details": {}
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

---

## Rate Limiting

- Auth endpoints: 5 requests per minute
- Webhook endpoints: 100 requests per minute
- General API: 100 requests per minute per user

---

## Pagination

Paginated endpoints accept the following query parameters:

| Parameter | Default | Description |
|-----------|---------|-------------|
| `page` | 1 | Page number |
| `limit` | 20 | Items per page (max: 100) |
| `sort` | `-createdAt` | Sort field (prefix `-` for descending) |

Response format:
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "totalPages": 5
}
```
