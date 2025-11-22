# 📚 مستندات کامل API

## 🔗 Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## 🔐 احراز هویت

تمام درخواست‌های احراز شده نیاز به header زیر دارند:

```
Authorization: Bearer <access_token>
```

---

## 📑 فهرست مطالب

1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [Influencer Endpoints](#influencer-endpoints)
4. [Business Endpoints](#business-endpoints)
5. [Admin Endpoints](#admin-endpoints)
6. [Project/Campaign Management](#project-management)
7. [Task Management](#task-management)
8. [Payment & Wallet](#payment--wallet)
9. [Chat & Messaging](#chat--messaging)
10. [Notifications](#notifications)
11. [CMS & Content](#cms--content)
12. [Social Media Integration](#social-media-integration)
13. [Upload & Media](#upload--media)

---

## 🔑 Authentication

### ثبت‌نام کاربر

```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "influencer" | "business",
  "profile": {
    "companyName": "Company Name" // فقط برای business
  }
}
```

**Response (201):**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "influencer"
  },
  "tokens": {
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

---

### ورود به سیستم

```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "influencer"
  },
  "tokens": {
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

---

### تمدید توکن

```http
POST /auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**Response (200):**
```json
{
  "accessToken": "new_access_token",
  "refreshToken": "new_refresh_token"
}
```

---

### فعال‌سازی 2FA

```http
POST /auth/2fa/enable
```

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "secret": "2fa_secret",
  "qrCode": "data:image/png;base64,..."
}
```

---

### تایید 2FA

```http
POST /auth/2fa/verify
```

**Request Body:**
```json
{
  "token": "123456"
}
```

**Response (200):**
```json
{
  "message": "2FA verified successfully"
}
```

---

### بازیابی رمز عبور

```http
POST /auth/forgot-password
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "Password reset email sent"
}
```

---

### ریست رمز عبور

```http
POST /auth/reset-password
```

**Request Body:**
```json
{
  "token": "reset_token",
  "newPassword": "NewSecurePass123!"
}
```

**Response (200):**
```json
{
  "message": "Password reset successfully"
}
```

---

## 👤 User Management

### دریافت پروفایل کاربر

```http
GET /user/profile
```

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "https://...",
    "role": "influencer",
    "profile": {
      "bio": "Professional influencer",
      "location": "Tehran, Iran",
      "categories": ["Fashion", "Lifestyle"],
      "socialMedia": {
        "instagram": {
          "username": "john_doe",
          "followers": 50000,
          "engagement": 4.5
        }
      }
    }
  }
}
```

---

### بروزرسانی پروفایل

```http
PUT /user/profile
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "avatar": "https://...",
  "profile": {
    "bio": "Updated bio",
    "location": "Tehran, Iran",
    "categories": ["Fashion", "Beauty"]
  }
}
```

**Response (200):**
```json
{
  "user": { /* updated user object */ }
}
```

---

### آپلود آواتار

```http
POST /user/avatar
```

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Request Body (FormData):**
```
avatar: [File]
```

**Response (200):**
```json
{
  "avatarUrl": "https://..."
}
```

---

## 🌟 Influencer Endpoints

### دریافت آمار داشبورد

```http
GET /influencer/dashboard/stats
```

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "activeProjects": 5,
  "completedTasks": 23,
  "totalEarnings": 15000.50,
  "pendingPayments": 2500.00,
  "currentBalance": 12500.50
}
```

---

### دریافت لیست پروژه‌ها

```http
GET /influencer/projects
```

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)

**Response (200):**
```json
{
  "projects": [
    {
      "id": "project_id",
      "title": "Product Review Campaign",
      "description": "Review our new product",
      "budget": 5000,
      "deadline": "2024-12-31",
      "status": "active",
      "businessId": {
        "firstName": "Company",
        "lastName": "Name",
        "avatar": "https://..."
      }
    }
  ],
  "total": 10
}
```

---

### مرور پروژه‌های در دسترس

```http
GET /influencer/projects/browse
```

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `category` (optional)
- `minBudget` (optional)

**Response (200):**
```json
{
  "projects": [/* list of approved projects */],
  "total": 50
}
```

---

### درخواست همکاری در پروژه

```http
POST /influencer/projects/:projectId/apply
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "coverLetter": "I am interested in this project because...",
  "proposedBudget": 4500 // optional
}
```

**Response (200):**
```json
{
  "message": "Applied successfully",
  "application": {
    "id": "application_id",
    "projectId": "project_id",
    "status": "pending"
  }
}
```

---

### لغو درخواست همکاری

```http
DELETE /influencer/projects/:projectId/withdraw
```

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Application withdrawn"
}
```

---

### دریافت لیست تسک‌ها

```http
GET /influencer/tasks
```

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `status` (optional: pending, in_progress, submitted, completed)

**Response (200):**
```json
{
  "tasks": [
    {
      "id": "task_id",
      "title": "Create Instagram Post",
      "description": "Post about our product",
      "reward": 1000,
      "deadline": "2024-12-15",
      "status": "in_progress",
      "projectId": "project_id"
    }
  ],
  "total": 5
}
```

---

### ثبت تسک

```http
POST /influencer/tasks/:taskId/submit
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "submissionUrl": "https://instagram.com/p/...",
  "notes": "Completed as requested",
  "attachments": ["https://..."]
}
```

**Response (200):**
```json
{
  "message": "Task submitted successfully",
  "task": {/* updated task */}
}
```

---

### اتصال حساب اینستاگرام

```http
POST /influencer/social/instagram/connect
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "code": "instagram_oauth_code"
}
```

**Response (200):**
```json
{
  "message": "Instagram connected",
  "profile": {
    "username": "john_doe",
    "followers": 50000,
    "verified": true
  }
}
```

---

### دریافت کیف پول

```http
GET /influencer/wallet
```

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "balance": 12500.50,
  "pendingBalance": 2500.00,
  "totalEarnings": 15000.50,
  "totalWithdrawals": 2500.00
}
```

---

### درخواست برداشت

```http
POST /influencer/wallet/withdraw
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "amount": 5000,
  "method": "usdt" | "btc" | "eth" | "bank",
  "address": "wallet_address_or_account_number"
}
```

**Response (200):**
```json
{
  "withdrawalId": "withdrawal_id",
  "message": "Withdrawal request submitted"
}
```

---

## 🏢 Business Endpoints

### دریافت آمار داشبورد

```http
GET /business/dashboard/stats
```

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "activeCampaigns": 3,
  "totalInfluencers": 15,
  "completedProjects": 8,
  "totalSpent": 45000.00
}
```

---

### ایجاد پروژه جدید

```http
POST /business/projects
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Product Review Campaign",
  "description": "We need influencers to review our new product",
  "budget": 10000,
  "deadline": "2024-12-31",
  "requirements": {
    "categories": ["Fashion", "Lifestyle"],
    "minFollowers": 10000,
    "platforms": ["instagram", "youtube"]
  },
  "maxInfluencers": 5,
  "tasks": [
    {
      "title": "Instagram Post",
      "description": "Create 1 Instagram post",
      "reward": 2000,
      "deadline": "2024-12-25"
    }
  ]
}
```

**Response (201):**
```json
{
  "project": {
    "id": "project_id",
    "title": "Product Review Campaign",
    "status": "pending_approval",
    "createdAt": "2024-11-22T10:00:00Z"
  }
}
```

---

### دریافت لیست پروژه‌ها

```http
GET /business/projects
```

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `status` (optional)

**Response (200):**
```json
{
  "projects": [/* list of projects */],
  "total": 10
}
```

---

### بروزرسانی پروژه

```http
PUT /business/projects/:projectId
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "budget": 12000
}
```

**Response (200):**
```json
{
  "project": {/* updated project */}
}
```

---

### حذف پروژه

```http
DELETE /business/projects/:projectId
```

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Project deleted"
}
```

---

### قبول اینفلوئنسر

```http
POST /business/projects/:projectId/influencers/:influencerId/accept
```

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Influencer accepted",
  "project": {/* updated project */}
}
```

---

### رد اینفلوئنسر

```http
POST /business/projects/:projectId/influencers/:influencerId/reject
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "reason": "Not a good fit for this campaign"
}
```

**Response (200):**
```json
{
  "message": "Influencer rejected"
}
```

---

### دریافت لیست اینفلوئنسرهای همکار

```http
GET /business/influencers
```

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)

**Response (200):**
```json
{
  "influencers": [
    {
      "id": "user_id",
      "name": "John Doe",
      "avatar": "https://...",
      "category": "Fashion",
      "followers": 50000,
      "engagement": 4.5,
      "tasksCompleted": 5,
      "totalTasks": 7,
      "status": "active"
    }
  ],
  "total": 15
}
```

---

### جستجوی اینفلوئنسر

```http
POST /business/influencers/search
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "page": 1,
  "limit": 20,
  "profile.categories": "Fashion",
  "profile.socialMedia.totalFollowers": { "$gte": 10000 },
  "profile.socialMedia.averageEngagement": { "$gte": 3.0 }
}
```

**Response (200):**
```json
{
  "influencers": [/* matching influencers */],
  "total": 50
}
```

---

### دریافت تسک‌ها

```http
GET /business/tasks
```

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)

**Response (200):**
```json
{
  "tasks": [/* list of tasks */],
  "total": 20
}
```

---

### بررسی تسک

```http
POST /business/tasks/:taskId/review
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "status": "approved" | "rejected",
  "feedback": "Great work!" | "Please revise...",
  "rating": 5 // 1-5
}
```

**Response (200):**
```json
{
  "message": "Task reviewed",
  "task": {/* updated task */}
}
```

---

## 👨‍💼 Admin Endpoints

### دریافت آمار داشبورد

```http
GET /admin/dashboard/stats
```

**Headers:** `Authorization: Bearer <admin_token>`

**Response (200):**
```json
{
  "totalUsers": 1500,
  "totalInfluencers": 900,
  "totalBusinesses": 550,
  "activeProjects": 120,
  "pendingApprovals": 15,
  "totalRevenue": 250000.00,
  "monthlyRevenue": 45000.00
}
```

---

### دریافت لیست کاربران

```http
GET /admin/users
```

**Headers:** `Authorization: Bearer <admin_token>`

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `role` (optional: influencer, business, admin)
- `verified` (optional: true, false)
- `banned` (optional: true, false)
- `search` (optional: جستجو در نام و ایمیل)

**Response (200):**
```json
{
  "users": [
    {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "influencer",
      "profile": {
        "verified": true,
        "banned": false
      },
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "total": 1500
}
```

---

### دریافت جزئیات کاربر

```http
GET /admin/users/:userId
```

**Headers:** `Authorization: Bearer <admin_token>`

**Response (200):**
```json
{
  "user": {/* complete user details */},
  "stats": {
    "totalProjects": 15,
    "totalEarnings": 25000.00,
    "averageRating": 4.8
  }
}
```

---

### بن کردن کاربر

```http
POST /admin/users/:userId/ban
```

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "reason": "Violation of terms of service"
}
```

**Response (200):**
```json
{
  "message": "User banned successfully"
}
```

---

### رفع بن کاربر

```http
POST /admin/users/:userId/unban
```

**Headers:** `Authorization: Bearer <admin_token>`

**Response (200):**
```json
{
  "message": "User unbanned successfully"
}
```

---

### تایید کاربر

```http
POST /admin/users/:userId/verify
```

**Headers:** `Authorization: Bearer <admin_token>`

**Response (200):**
```json
{
  "message": "User verified successfully"
}
```

---

### دریافت پروژه‌های در انتظار تایید

```http
GET /admin/projects/pending
```

**Headers:** `Authorization: Bearer <admin_token>`

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)

**Response (200):**
```json
{
  "projects": [/* pending projects */]
}
```

---

### تایید پروژه

```http
POST /admin/projects/:projectId/approve
```

**Headers:** `Authorization: Bearer <admin_token>`

**Response (200):**
```json
{
  "message": "Project approved",
  "project": {/* updated project */}
}
```

---

### رد پروژه

```http
POST /admin/projects/:projectId/reject
```

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "reason": "Does not meet quality standards"
}
```

**Response (200):**
```json
{
  "message": "Project rejected"
}
```

---

### دریافت درخواست‌های برداشت

```http
GET /admin/withdrawals/pending
```

**Headers:** `Authorization: Bearer <admin_token>`

**Response (200):**
```json
{
  "withdrawals": [
    {
      "id": "withdrawal_id",
      "userId": "user_id",
      "amount": 5000,
      "method": "usdt",
      "status": "pending",
      "createdAt": "2024-11-22T10:00:00Z"
    }
  ]
}
```

---

### تایید برداشت

```http
POST /admin/withdrawals/:withdrawalId/approve
```

**Headers:** `Authorization: Bearer <admin_token>`

**Response (200):**
```json
{
  "message": "Withdrawal approved and processed"
}
```

---

### رد برداشت

```http
POST /admin/withdrawals/:withdrawalId/reject
```

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "reason": "Insufficient verification"
}
```

**Response (200):**
```json
{
  "message": "Withdrawal rejected"
}
```

---

### دریافت آنالیتیکس

```http
GET /admin/analytics
```

**Headers:** `Authorization: Bearer <admin_token>`

**Query Parameters:**
- `period` (day, week, month, year)

**Response (200):**
```json
{
  "users": {
    "total": 1500,
    "growth": 12.5,
    "chart": [/* time series data */]
  },
  "revenue": {
    "total": 250000,
    "growth": 8.3,
    "chart": [/* time series data */]
  },
  "projects": {
    "total": 450,
    "growth": 15.2,
    "chart": [/* time series data */]
  }
}
```

---

### دریافت لاگ‌های ممیزی

```http
GET /admin/audit-logs
```

**Headers:** `Authorization: Bearer <admin_token>`

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 50)
- `adminId` (optional)
- `action` (optional)
- `entityType` (optional)

**Response (200):**
```json
{
  "logs": [
    {
      "id": "log_id",
      "adminId": "admin_id",
      "action": "ban_user",
      "entityType": "user",
      "entityId": "user_id",
      "details": "Banned for ToS violation",
      "timestamp": "2024-11-22T10:00:00Z"
    }
  ],
  "total": 500
}
```

---

### دریافت تاییدیه‌های در انتظار

```http
GET /admin/approvals/pending
```

**Headers:** `Authorization: Bearer <admin_token>`

**Query Parameters:**
- `limit` (default: 10)

**Response (200):**
```json
{
  "approvals": [
    {
      "id": "item_id",
      "type": "project" | "withdrawal",
      "title": "Product Review Campaign",
      "requester": "Company Name",
      "amount": 10000,
      "createdAt": "2024-11-22T10:00:00Z"
    }
  ]
}
```

---

### دریافت فعالیت‌های اخیر

```http
GET /admin/activity
```

**Headers:** `Authorization: Bearer <admin_token>`

**Query Parameters:**
- `limit` (default: 10)

**Response (200):**
```json
{
  "activities": [
    {
      "id": "activity_id",
      "type": "approve_project",
      "description": "Project approved - Product Review Campaign",
      "user": "Admin Name",
      "timestamp": "2024-11-22T10:00:00Z"
    }
  ]
}
```

---

## 📁 Project Management

### دریافت پروژه خاص

```http
GET /projects/:projectId
```

**Headers:** `Authorization: Bearer <token>` (optional)

**Response (200):**
```json
{
  "project": {
    "id": "project_id",
    "title": "Product Review Campaign",
    "description": "...",
    "budget": 10000,
    "deadline": "2024-12-31",
    "status": "active",
    "requirements": {
      "categories": ["Fashion"],
      "minFollowers": 10000,
      "platforms": ["instagram"]
    },
    "businessId": {
      "firstName": "Company",
      "lastName": "Name",
      "profile": {
        "companyName": "Tech Corp"
      }
    },
    "tasks": [/* list of tasks */],
    "acceptedInfluencers": [/* list of accepted influencers */],
    "appliedInfluencers": [/* list of applicants */]
  }
}
```

---

### مرور تمام پروژه‌های تایید شده

```http
GET /projects
```

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `category` (optional)
- `search` (optional)

**Response (200):**
```json
{
  "projects": [/* list of approved projects */],
  "total": 100
}
```

---

## ✅ Task Management

### دریافت تسک خاص

```http
GET /tasks/:taskId
```

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "task": {
    "id": "task_id",
    "title": "Instagram Post",
    "description": "Create 1 post about our product",
    "reward": 2000,
    "deadline": "2024-12-25",
    "status": "in_progress",
    "projectId": "project_id",
    "influencerId": "user_id",
    "submission": {
      "url": "https://instagram.com/p/...",
      "notes": "...",
      "submittedAt": "2024-11-22T10:00:00Z"
    },
    "review": {
      "status": "pending",
      "feedback": "",
      "rating": null
    }
  }
}
```

---

## 💳 Payment & Wallet

### دریافت تاریخچه تراکنش‌ها

```http
GET /payment/transactions
```

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `type` (optional: credit, debit, withdrawal)
- `status` (optional: pending, completed, failed)

**Response (200):**
```json
{
  "transactions": [
    {
      "id": "transaction_id",
      "type": "credit",
      "amount": 2000,
      "status": "completed",
      "description": "Payment for Instagram Post task",
      "createdAt": "2024-11-22T10:00:00Z",
      "metadata": {
        "taskId": "task_id",
        "projectId": "project_id"
      }
    }
  ],
  "total": 50
}
```

---

### پرداخت با کریپتو

```http
POST /payment/crypto/pay
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "projectId": "project_id",
  "amount": 10000,
  "currency": "USDT",
  "network": "ethereum" | "polygon" | "bsc"
}
```

**Response (200):**
```json
{
  "paymentAddress": "0x...",
  "amount": 10000,
  "paymentId": "payment_id",
  "qrCode": "data:image/png;base64,..."
}
```

---

### تایید پرداخت کریپتو

```http
POST /payment/crypto/verify/:paymentId
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "transactionHash": "0x..."
}
```

**Response (200):**
```json
{
  "message": "Payment verified",
  "transaction": {/* transaction details */}
}
```

---

## 💬 Chat & Messaging

### دریافت لیست چت‌ها

```http
GET /chat/conversations
```

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "conversations": [
    {
      "id": "chat_id",
      "participants": [
        {
          "id": "user_id",
          "firstName": "John",
          "lastName": "Doe",
          "avatar": "https://..."
        }
      ],
      "lastMessage": {
        "content": "Hello!",
        "senderId": "user_id",
        "createdAt": "2024-11-22T10:00:00Z"
      },
      "unreadCount": 2
    }
  ]
}
```

---

### دریافت پیام‌های یک چت

```http
GET /chat/:chatId/messages
```

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 50)

**Response (200):**
```json
{
  "messages": [
    {
      "id": "message_id",
      "content": "Hello!",
      "senderId": "user_id",
      "chatId": "chat_id",
      "read": true,
      "createdAt": "2024-11-22T10:00:00Z"
    }
  ]
}
```

---

### ارسال پیام

```http
POST /chat/:chatId/messages
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "content": "Hello, how are you?",
  "attachments": ["https://..."] // optional
}
```

**Response (201):**
```json
{
  "message": {
    "id": "message_id",
    "content": "Hello, how are you?",
    "senderId": "user_id",
    "createdAt": "2024-11-22T10:00:00Z"
  }
}
```

---

### ایجاد چت جدید

```http
POST /chat/create
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "participantId": "user_id"
}
```

**Response (201):**
```json
{
  "chat": {
    "id": "chat_id",
    "participants": [/* users */],
    "createdAt": "2024-11-22T10:00:00Z"
  }
}
```

---

## 🔔 Notifications

### دریافت نوتیفیکیشن‌ها

```http
GET /notifications
```

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `read` (optional: true, false)

**Response (200):**
```json
{
  "notifications": [
    {
      "id": "notification_id",
      "type": "task_completed",
      "title": "Task Completed",
      "message": "John Doe completed the Instagram Post task",
      "data": {
        "taskId": "task_id",
        "projectId": "project_id"
      },
      "read": false,
      "createdAt": "2024-11-22T10:00:00Z"
    }
  ],
  "total": 15,
  "unreadCount": 5
}
```

---

### علامت‌گذاری به عنوان خوانده شده

```http
PUT /notifications/:notificationId/read
```

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Notification marked as read"
}
```

---

### علامت‌گذاری همه به عنوان خوانده شده

```http
PUT /notifications/read-all
```

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "All notifications marked as read"
}
```

---

## 📝 CMS & Content

### دریافت محتوای صفحه

```http
GET /cms/pages/:slug
```

**Query Parameters:**
- `language` (default: en)

**Response (200):**
```json
{
  "page": {
    "title": "About Us",
    "content": "HTML content...",
    "seo": {
      "metaTitle": "About Us - Company Name",
      "metaDescription": "Learn more about us"
    }
  }
}
```

---

### دریافت محتوای لندینگ پیج

```http
GET /cms/landing
```

**Query Parameters:**
- `language` (default: en)

**Response (200):**
```json
{
  "sections": [
    {
      "type": "hero",
      "title": "Welcome to Our Platform",
      "content": "...",
      "images": ["https://..."]
    }
  ]
}
```

---

### دریافت تنظیمات پلتفرم

```http
GET /cms/settings
```

**Response (200):**
```json
{
  "general": {
    "siteName": "Influencer Platform",
    "contactEmail": "support@platform.com",
    "socialLinks": {
      "instagram": "https://...",
      "twitter": "https://..."
    }
  },
  "features": {
    "enableCryptoPayments": true,
    "enableChat": true
  }
}
```

---

## 🔗 Social Media Integration

### اتصال Instagram

```http
POST /social/instagram/connect
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "code": "instagram_oauth_code"
}
```

**Response (200):**
```json
{
  "message": "Instagram connected",
  "profile": {
    "username": "john_doe",
    "followers": 50000,
    "following": 500,
    "posts": 250,
    "verified": false
  }
}
```

---

### اتصال YouTube

```http
POST /social/youtube/connect
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "code": "youtube_oauth_code"
}
```

**Response (200):**
```json
{
  "message": "YouTube connected",
  "channel": {
    "name": "John Doe",
    "subscribers": 25000,
    "videos": 50
  }
}
```

---

### اتصال Twitter

```http
POST /social/twitter/connect
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "oauth_token": "...",
  "oauth_verifier": "..."
}
```

**Response (200):**
```json
{
  "message": "Twitter connected",
  "profile": {
    "username": "johndoe",
    "followers": 15000,
    "verified": false
  }
}
```

---

### قطع اتصال شبکه اجتماعی

```http
DELETE /social/:platform/disconnect
```

**Headers:** `Authorization: Bearer <token>`

**Parameters:**
- `platform`: instagram, youtube, twitter

**Response (200):**
```json
{
  "message": "Platform disconnected"
}
```

---

## 📤 Upload & Media

### آپلود فایل

```http
POST /upload
```

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Request Body (FormData):**
```
file: [File]
type: image | video | document
```

**Response (200):**
```json
{
  "url": "https://cdn.platform.com/uploads/...",
  "filename": "file_name.jpg",
  "size": 102400,
  "mimetype": "image/jpeg"
}
```

---

### آپلود چند فایل

```http
POST /upload/multiple
```

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Request Body (FormData):**
```
files: [File, File, ...]
```

**Response (200):**
```json
{
  "files": [
    {
      "url": "https://...",
      "filename": "file1.jpg"
    },
    {
      "url": "https://...",
      "filename": "file2.jpg"
    }
  ]
}
```

---

### حذف فایل

```http
DELETE /upload/:filename
```

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "File deleted successfully"
}
```

---

## ⚠️ Error Responses

### فرمت خطاها

همه خطاها به فرمت زیر برگردانده می‌شوند:

```json
{
  "error": "Error message",
  "statusCode": 400,
  "details": {
    "field": "email",
    "message": "Invalid email format"
  }
}
```

### کدهای خطای رایج

- `400` - Bad Request (درخواست نامعتبر)
- `401` - Unauthorized (عدم احراز هویت)
- `403` - Forbidden (عدم دسترسی)
- `404` - Not Found (یافت نشد)
- `409` - Conflict (تداخل داده)
- `422` - Validation Error (خطای اعتبارسنجی)
- `429` - Too Many Requests (درخواست بیش از حد)
- `500` - Internal Server Error (خطای سرور)

---

## 🔒 Rate Limiting

تمام اندپوینت‌ها محدودیت نرخ دارند:

- عمومی: 100 درخواست در 15 دقیقه
- Authentication: 5 درخواست در 15 دقیقه
- Upload: 20 درخواست در 15 دقیقه

هنگام رسیدن به محدودیت، خطای 429 دریافت می‌کنید.

---

## 🌐 Socket.IO Events

### اتصال

```javascript
const socket = io('https://your-domain.com', {
  auth: {
    token: 'your_access_token'
  }
});
```

### رویدادها

**Client به Server:**
- `join_chat`: عضویت در چت
- `leave_chat`: خروج از چت
- `send_message`: ارسال پیام
- `typing_start`: شروع تایپ
- `typing_stop`: پایان تایپ

**Server به Client:**
- `new_message`: پیام جدید
- `message_sent`: تایید ارسال پیام
- `user_typing`: کاربر در حال تایپ
- `notification`: نوتیفیکیشن جدید

---

## 📊 Pagination

تمام لیست‌ها از pagination پشتیبانی می‌کنند:

**Query Parameters:**
```
page=1&limit=20
```

**Response:**
```json
{
  "items": [/* array of items */],
  "total": 150,
  "page": 1,
  "limit": 20,
  "totalPages": 8
}
```

---

## 🔍 Filtering & Sorting

**Filtering:**
```
GET /api/projects?status=active&category=Fashion
```

**Sorting:**
```
GET /api/projects?sortBy=createdAt&order=desc
```

---

این مستندات به طور منظم بروزرسانی می‌شود. برای اطلاعات بیشتر به repository GitHub مراجعه کنید.
