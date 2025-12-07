# MicroInfluencer Platform - Services Documentation

## Table of Contents
- [Overview](#overview)
- [Admin Service](#admin-service)
- [Auth Service](#auth-service)
- [Project Service](#project-service)
- [Task Service](#task-service)
- [Safira Service](#safira-service)
- [Payment Services](#payment-services)
- [Chat Service](#chat-service)
- [Social Services](#social-services)
- [Upload Service](#upload-service)

---

## Overview

Services contain the business logic of the application. They are called by routes/controllers and interact with models.

**Location:** `backend/src/services/`

---

## Admin Service

**File:** `backend/src/services/admin/admin.service.ts`

### Methods

| Method | Description |
|--------|-------------|
| `getDashboardStats()` | Get platform-wide statistics |
| `getUsers(filters)` | List users with filters and pagination |
| `getUserById(id)` | Get user details by ID |
| `banUser(id, reason, adminId)` | Ban a user |
| `unbanUser(id, adminId)` | Unban a user |
| `verifyUser(id, adminId)` | Mark user as verified |
| `getPendingApprovals()` | Get all pending items |
| `getPendingWithdrawalsCount()` | Get count of pending withdrawals |
| `approveWithdrawal(id, adminId)` | Approve withdrawal request |
| `rejectWithdrawal(id, adminId, reason)` | Reject withdrawal request |
| `getAnalytics(period)` | Get analytics for period |
| `getAuditLogs(filters)` | Get admin audit logs |

### Example Usage

```typescript
import adminService from '@/services/admin/admin.service';

// Get dashboard stats
const stats = await adminService.getDashboardStats();
// Returns: { totalUsers, totalInfluencers, totalBusinesses, activeProjects, revenue, ... }

// Get users with filters
const { users, total } = await adminService.getUsers({
  role: 'influencer',
  verified: true,
  banned: false,
  search: 'john',
  page: 1,
  limit: 20
});

// Ban user
await adminService.banUser(userId, 'Violation of terms', adminId);
```

---

## Auth Service

**File:** `backend/src/services/auth/auth.service.ts`

### Methods

| Method | Description |
|--------|-------------|
| `register(userData)` | Register new user |
| `registerInfluencer(userData)` | Register influencer with profile |
| `registerBusiness(userData)` | Register business with company info |
| `login(email, password)` | Authenticate user |
| `refreshToken(token)` | Refresh access token |
| `forgotPassword(email)` | Send password reset email |
| `resetPassword(token, password)` | Reset password |
| `setupTwoFactor(userId)` | Generate 2FA secret |
| `enableTwoFactor(userId, code)` | Enable 2FA |
| `disableTwoFactor(userId, code)` | Disable 2FA |
| `verifyTwoFactor(userId, code)` | Verify 2FA code |

### Token Generation

```typescript
// Access token: 1 day expiry
const accessToken = jwt.sign(
  { id: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '1d' }
);

// Refresh token: 7 days expiry
const refreshToken = jwt.sign(
  { id: user._id },
  process.env.JWT_REFRESH_SECRET,
  { expiresIn: '7d' }
);
```

---

## Project Service

**File:** `backend/src/services/project/project.service.ts`

### Methods

| Method | Description |
|--------|-------------|
| `createProject(businessId, data)` | Create new project |
| `getProjects(filters)` | List projects with filters |
| `getProjectById(id)` | Get project details |
| `updateProject(id, businessId, data)` | Update project |
| `deleteProject(id, businessId)` | Delete project |
| `applyToProject(projectId, influencerId)` | Apply to project |
| `withdrawApplication(projectId, influencerId)` | Withdraw application |
| `acceptInfluencer(projectId, businessId, influencerId)` | Accept influencer |
| `rejectInfluencer(projectId, businessId, influencerId)` | Reject influencer |
| `approveProject(id, adminId)` | Admin approve project |
| `rejectProject(id, adminId, reason)` | Admin reject project |

### Example Usage

```typescript
import projectService from '@/services/project/project.service';

// Create project
const project = await projectService.createProject(businessId, {
  title: 'Summer Campaign',
  description: 'Looking for fashion influencers...',
  category: 'Fashion',
  budget: 5000,
  deadline: new Date('2024-08-01'),
  requirements: {
    minFollowers: 10000,
    platforms: ['instagram', 'tiktok']
  }
});

// Get projects with filters
const { projects, total } = await projectService.getProjects({
  status: 'active',
  category: 'Fashion',
  page: 1,
  limit: 20
});
```

---

## Task Service

**File:** `backend/src/services/task/task.service.ts`

### Methods

| Method | Description |
|--------|-------------|
| `createTask(projectId, influencerId, data)` | Create task |
| `getTasks(filters)` | List tasks |
| `getTaskById(id)` | Get task details |
| `updateTask(id, data)` | Update task |
| `submitTask(id, influencerId, submission)` | Submit task work |
| `reviewTask(id, businessId, review)` | Review submitted task |
| `getTasksByDeadline(influencerId, days)` | Get upcoming tasks |

### Task Workflow

```
PENDING → IN_PROGRESS → SUBMITTED → APPROVED/REVISION_REQUESTED → COMPLETED
```

### Example Usage

```typescript
import taskService from '@/services/task/task.service';

// Submit task
const task = await taskService.submitTask(taskId, influencerId, {
  links: ['https://instagram.com/p/xxx'],
  screenshots: ['screenshot1.png'],
  notes: 'Completed all deliverables'
});

// Review task
const reviewed = await taskService.reviewTask(taskId, businessId, {
  approved: true,
  rating: 5,
  feedback: 'Great work!'
});
```

---

## Safira Service

**File:** `backend/src/services/safira/safira.service.ts`

### Methods

| Method | Description |
|--------|-------------|
| `assignSafiraProjectToInfluencer(influencerId)` | Assign Safira project and generate referral code |
| `getInfluencerDashboardStats(influencerId)` | Get influencer's Safira stats |
| `processTrackingEvent(eventData)` | Process webhook tracking event |
| `processConversion(conversionData)` | Process webhook conversion |
| `processDailyStats(statsData)` | Process daily stats webhook |
| `requestWithdrawal(influencerId, amount)` | Request earnings withdrawal |
| `getInfluencerStats(referralCode)` | Get stats by referral code |

### Slot System Logic

```typescript
// When conversion is received
async processConversion(data) {
  const stats = await SafiraInfluencerStats.findOne({
    referralCode: data.referral_code
  });

  // Fill next available slot
  const slot = await stats.fillSlot(data.conversion_id);

  if (slot) {
    // Slot was filled
    // stats.filledSlots increased
    // stats.totalEarnedAmount += 40
    // stats.availableBalance += 40
  }

  // Create conversion record
  await SafiraConversion.create({
    conversionId: data.conversion_id,
    influencerId: stats.influencerId,
    slotNumber: slot?.slotNumber,
    // ... other data
  });
}
```

### Referral Code Generation

```typescript
// Format: INF_XXXXXX (6 random alphanumeric)
function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'INF_';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
```

### Example Usage

```typescript
import safiraService from '@/services/safira/safira.service';

// Assign Safira project
const assignment = await safiraService.assignSafiraProjectToInfluencer(influencerId);
// Returns: { referralCode, referralUrl, projectId }

// Get dashboard stats
const stats = await safiraService.getInfluencerDashboardStats(influencerId);
// Returns: { slots, earnings, tracking stats, ... }

// Request withdrawal
const withdrawal = await safiraService.requestWithdrawal(influencerId, 400);
// Returns: { withdrawalId, amount, status }
```

---

## Payment Services

### Wallet Service

**File:** `backend/src/services/payment/wallet.service.ts`

| Method | Description |
|--------|-------------|
| `getBalance(userId)` | Get wallet balance |
| `deposit(userId, amount)` | Add funds to wallet |
| `withdraw(userId, amount, address, blockchain)` | Request withdrawal |
| `lockFunds(userId, amount)` | Lock funds for transaction |
| `releaseFunds(userId, amount)` | Release locked funds |
| `transferFunds(fromId, toId, amount)` | Transfer between users |

### Transaction Service

**File:** `backend/src/services/payment/transaction.service.ts`

| Method | Description |
|--------|-------------|
| `createTransaction(data)` | Create transaction record |
| `getTransactions(userId)` | Get user's transactions |
| `updateTransaction(id, data)` | Update transaction status |
| `getTransactionById(id)` | Get transaction details |

### Crypto Service

**File:** `backend/src/services/payment/crypto.service.ts`

| Method | Description |
|--------|-------------|
| `validateAddress(address, blockchain)` | Validate wallet address |
| `getExchangeRate(from, to)` | Get currency exchange rate |
| `processPayment(data)` | Process crypto payment |

---

## Chat Service

**File:** `backend/src/services/chat/chat.service.ts`

### Methods

| Method | Description |
|--------|-------------|
| `createChat(participants, projectId?)` | Create new chat |
| `getChats(userId)` | Get user's chats |
| `getChatById(id)` | Get chat details |
| `sendMessage(chatId, senderId, content, type)` | Send message |
| `getMessages(chatId, page, limit)` | Get chat messages |
| `markAsRead(chatId, userId)` | Mark messages as read |
| `deleteChat(id)` | Delete chat and messages |

### Example Usage

```typescript
import chatService from '@/services/chat/chat.service';

// Create chat between business and influencer
const chat = await chatService.createChat(
  [businessId, influencerId],
  projectId
);

// Send message
const message = await chatService.sendMessage(
  chat._id,
  businessId,
  'Hello! Interested in your profile.',
  'text'
);

// Get messages
const { messages, total } = await chatService.getMessages(
  chat._id,
  1,
  50
);
```

---

## Social Services

### Instagram Service

**File:** `backend/src/services/social/instagram.service.ts`

| Method | Description |
|--------|-------------|
| `verifyAccount(username, profileUrl)` | Verify Instagram account |
| `getProfileStats(username)` | Get follower count, posts, etc. |
| `validateProfileUrl(url)` | Validate URL format |

### TikTok Service

**File:** `backend/src/services/social/tiktok.service.ts`

| Method | Description |
|--------|-------------|
| `verifyAccount(username, profileUrl)` | Verify TikTok account |
| `getProfileStats(username)` | Get follower count, likes, etc. |

### YouTube Service

**File:** `backend/src/services/social/youtube.service.ts`

| Method | Description |
|--------|-------------|
| `verifyChannel(channelUrl)` | Verify YouTube channel |
| `getChannelStats(channelId)` | Get subscriber count, views, etc. |

### Twitter Service

**File:** `backend/src/services/social/twitter.service.ts`

| Method | Description |
|--------|-------------|
| `verifyAccount(username)` | Verify Twitter account |
| `getProfileStats(username)` | Get follower count, tweets, etc. |

### Facebook Service

**File:** `backend/src/services/social/facebook.service.ts`

| Method | Description |
|--------|-------------|
| `verifyPage(pageUrl)` | Verify Facebook page |
| `getPageStats(pageId)` | Get followers, engagement, etc. |

---

## Upload Service

**File:** `backend/src/services/upload/upload.service.ts`

### Methods

| Method | Description |
|--------|-------------|
| `uploadFile(file, folder)` | Upload file to storage |
| `uploadImage(file, folder)` | Upload and optimize image |
| `deleteFile(fileId)` | Delete uploaded file |
| `getFileUrl(fileId)` | Get file URL |

### Supported File Types

```typescript
const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const allowedFileTypes = [...allowedImageTypes, 'application/pdf', 'video/mp4'];
const maxFileSize = 10 * 1024 * 1024; // 10MB
```

### Example Usage

```typescript
import uploadService from '@/services/upload/upload.service';

// Upload image
const imageUrl = await uploadService.uploadImage(file, 'avatars');

// Upload file
const fileUrl = await uploadService.uploadFile(file, 'documents');

// Delete file
await uploadService.deleteFile(fileId);
```

---

## CMS Service

**File:** `backend/src/services/cms/cms.service.ts`

### Methods

| Method | Description |
|--------|-------------|
| `createPage(data)` | Create CMS page |
| `getPages(filters)` | List pages |
| `getPageBySlug(slug)` | Get page by URL slug |
| `updatePage(id, data)` | Update page |
| `deletePage(id)` | Delete page |
| `publishPage(id)` | Publish page |
| `unpublishPage(id)` | Unpublish page |

---

## Notification Service

**File:** `backend/src/services/notification/notification.service.ts`

### Methods

| Method | Description |
|--------|-------------|
| `create(userId, type, title, message, data?)` | Create notification |
| `getNotifications(userId, page, limit)` | Get user's notifications |
| `markAsRead(id)` | Mark notification as read |
| `markAllAsRead(userId)` | Mark all as read |
| `deleteNotification(id)` | Delete notification |
| `getUnreadCount(userId)` | Get unread count |

### Notification Types

```typescript
enum NotificationType {
  SYSTEM = 'system',
  PROJECT = 'project',
  TASK = 'task',
  PAYMENT = 'payment',
  MESSAGE = 'message',
  SAFIRA = 'safira'
}
```

---

## Analytics Service

**File:** `backend/src/services/analytics/analytics.service.ts`

### Methods

| Method | Description |
|--------|-------------|
| `getUserGrowth(period)` | Get user growth stats |
| `getProjectStats(period)` | Get project statistics |
| `getRevenueStats(period)` | Get revenue analytics |
| `getTopCategories(limit)` | Get top project categories |
| `getEngagementStats(period)` | Get platform engagement |

---

## Error Handling

All services throw custom errors with status codes:

```typescript
class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
  }
}

// Usage
throw new AppError('User not found', 404, 'USER_NOT_FOUND');
throw new AppError('Insufficient balance', 400, 'INSUFFICIENT_BALANCE');
throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
throw new AppError('Forbidden', 403, 'FORBIDDEN');
```

---

## Service Dependency Injection

Services can be imported and used anywhere in the application:

```typescript
// Direct import
import adminService from '@/services/admin/admin.service';
import projectService from '@/services/project/project.service';
import safiraService from '@/services/safira/safira.service';

// In routes
router.get('/stats', async (req, res) => {
  const stats = await adminService.getDashboardStats();
  res.json(stats);
});
```
