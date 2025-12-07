# MicroInfluencer Platform - Database Models Documentation

## Table of Contents
- [Overview](#overview)
- [User Model](#user-model)
- [Project Model](#project-model)
- [Task Model](#task-model)
- [Chat & Message Models](#chat--message-models)
- [Safira Models](#safira-models)
- [CMS Model](#cms-model)
- [Notification Model](#notification-model)

---

## Overview

The platform uses MongoDB with Mongoose ODM. All models include timestamps (`createdAt`, `updatedAt`) and appropriate indexes for query optimization.

**Database:** MongoDB
**ODM:** Mongoose

---

## User Model

**Collection:** `users`
**File:** `backend/src/models/User.model.ts`

### Schema

```typescript
interface IUser {
  email: string;              // Unique, lowercase
  password: string;           // Hashed with bcrypt
  role: UserRole;             // 'admin' | 'business' | 'influencer'
  adminRole?: AdminRole;      // 'super_admin' | 'admin' | 'financial'
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  profile?: InfluencerProfile | BusinessProfile;
  wallet?: {
    balance: number;
    lockedBalance: number;
    address?: string;
  };
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  emailVerified: boolean;
  emailVerificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  isActive: boolean;
  isBanned: boolean;
  banReason?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Influencer Profile Sub-Schema

```typescript
interface InfluencerProfile {
  bio: string;                    // Max 500 chars
  category: string;
  skills: string[];
  languages: string[];
  regions: string[];
  contentTypes: string[];
  capabilities: string[];
  socialAccounts: SocialAccount[];
  portfolio: string[];            // URLs
  rates: Rate[];
  verified: boolean;
  rating: number;                 // 0-5
  totalProjects: number;
  successRate: number;
  safiraReferralCode?: string;    // Unique, sparse index
}

interface SocialAccount {
  platform: 'instagram' | 'facebook' | 'twitter' | 'youtube' | 'tiktok';
  username: string;
  profileUrl: string;
  followersCount: number;
  postsCount: number;
  engagementRate: number;
  verified: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  lastSynced?: Date;
  metadata?: any;
}

interface Rate {
  title: string;
  description: string;
  price: number;
  deliverables: string[];
  duration: string;
}
```

### Business Profile Sub-Schema

```typescript
interface BusinessProfile {
  companyName: string;
  industry: string;
  description: string;           // Max 1000 chars
  website: string;
  productType: 'product' | 'service' | 'both';
  categories: string[];
  regions: string[];
  hasShipping: boolean;
  socialAccounts: { platform: string; url: string; }[];
  logo: string;
  productImages: string[];
  goals: string[];
  targetAudience: {
    ageRange: string;
    gender: string;
    interests: string[];
    locations: string[];
  };
  verified: boolean;
  rating: number;
  totalProjects: number;
}
```

### Indexes

| Field | Type | Purpose |
|-------|------|---------|
| `email` | Unique | Login lookup |
| `role` | Regular | Role filtering |
| `profile.verified` | Regular | Verified users |
| `profile.safiraReferralCode` | Unique, Sparse | Safira lookup |
| `createdAt` | Descending | Recent users |

### Methods

```typescript
// Compare password for login
comparePassword(candidatePassword: string): Promise<boolean>
```

### Hooks

- **Pre-save:** Hash password with bcrypt if modified
- **toJSON:** Remove sensitive fields (password, 2FA secret, tokens)

---

## Project Model

**Collection:** `projects`
**File:** `backend/src/models/Project.model.ts`

### Schema

```typescript
interface IProject {
  businessId: ObjectId;           // Ref: User
  title: string;                  // 5-200 chars
  description: string;            // 20-5000 chars
  category: string;
  tags: string[];
  budget: number;
  currency: string;               // Default: 'USDT'
  status: ProjectStatus;
  requirements: {
    minFollowers?: number;
    platforms: string[];
    regions?: string[];
    languages?: string[];
    contentTypes: string[];
  };
  deliverables: Deliverable[];
  attachments?: Attachment[];
  deadline: Date;
  maxInfluencers?: number;
  appliedInfluencers: ObjectId[];    // Ref: User[]
  acceptedInfluencers: ObjectId[];   // Ref: User[]
  rejectionReason?: string;
  adminNotes?: string;
  isPublic: boolean;
  invitedInfluencers: ObjectId[];    // Ref: User[]
  metadata?: {
    slug?: string;
    isSafiraProject?: boolean;
    safiraConfig?: {
      amountPerSlot: number;
      totalSlots: number;
      totalLockedAmount: number;
    };
  };
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

interface Deliverable {
  title: string;
  description: string;
  quantity: number;
  deadline?: Date;
}

interface Attachment {
  name: string;
  url: string;
  type: string;
  size: number;
}
```

### Project Status Values

```typescript
enum ProjectStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  ACTIVE = 'active',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected'
}
```

### Indexes

| Field | Type | Purpose |
|-------|------|---------|
| `businessId` | Regular | Owner lookup |
| `status` | Regular | Status filtering |
| `category` | Regular | Category filtering |
| `createdAt` | Descending | Recent projects |
| `deadline` | Regular | Upcoming deadlines |
| `requirements.platforms` | Regular | Platform search |
| `metadata.slug` | Unique, Sparse | URL slugs |
| `metadata.isSafiraProject` | Regular | Safira projects |

---

## Task Model

**Collection:** `tasks`
**File:** `backend/src/models/Task.model.ts`

### Schema

```typescript
interface ITask {
  projectId: ObjectId;           // Ref: Project
  influencerId: ObjectId;        // Ref: User
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  amount: number;
  deadline: Date;
  deliverables: TaskDeliverable[];
  submittedWork?: {
    links: string[];
    screenshots: string[];
    notes?: string;
    submittedAt: Date;
  };
  review?: {
    approved: boolean;
    rating?: number;             // 1-5
    feedback?: string;
    reviewedBy: ObjectId;        // Ref: User
    reviewedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

interface TaskDeliverable {
  title: string;
  description: string;
  status: TaskStatus;
  submittedUrl?: string;
  submittedAt?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  screenshot?: string;
}
```

### Task Status Values

```typescript
enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  SUBMITTED = 'submitted',
  REVISION_REQUESTED = 'revision_requested',
  APPROVED = 'approved',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}
```

### Indexes

| Field | Type |
|-------|------|
| `projectId` | Regular |
| `influencerId` | Regular |
| `status` | Regular |
| `deadline` | Regular |
| `createdAt` | Descending |

---

## Chat & Message Models

**Collection:** `chats`, `messages`
**File:** `backend/src/models/Chat.model.ts`

### Chat Schema

```typescript
interface IChat {
  type: ChatType;                    // 'direct' | 'group' | 'project'
  participants: ObjectId[];          // Ref: User[]
  projectId?: ObjectId;              // Ref: Project
  name?: string;                     // For groups
  avatar?: string;
  lastMessage?: ObjectId;            // Ref: Message
  lastMessageAt?: Date;
  unreadCount: Map<string, number>;  // userId -> count
  isActive: boolean;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}
```

### Message Schema

```typescript
interface IMessage {
  chatId: ObjectId;                  // Ref: Chat
  senderId: ObjectId;                // Ref: User
  type: MessageType;                 // 'text' | 'image' | 'file' | 'system'
  content: string;
  attachments?: MessageAttachment[];
  metadata?: any;
  isRead: boolean;
  readBy: ObjectId[];               // Ref: User[]
  readAt?: Date;
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface MessageAttachment {
  name: string;
  url: string;
  type: string;
  size: number;
}
```

### Chat Indexes

| Field | Type |
|-------|------|
| `participants` | Regular |
| `projectId` | Regular |
| `lastMessageAt` | Descending |
| `type` | Regular |

### Message Indexes

| Field | Type |
|-------|------|
| `chatId, createdAt` | Compound, Descending |
| `senderId` | Regular |
| `isRead` | Regular |

---

## Safira Models

### SafiraInfluencerStats

**Collection:** `safirainfluencerstats`
**File:** `backend/src/models/SafiraInfluencerStats.model.ts`

```typescript
interface ISafiraInfluencerStats {
  influencerId: ObjectId;            // Ref: User (Unique)
  referralCode: string;              // Unique index
  projectId: ObjectId;               // Ref: Project
  referralUrl: string;

  // Slot System (20 slots × $40 = $800)
  slots: ISafiraSlot[];
  totalSlots: number;                // Default: 20
  filledSlots: number;               // Default: 0
  amountPerSlot: number;             // Default: 40

  // Earnings
  totalLockedAmount: number;         // Default: 800
  totalEarnedAmount: number;
  totalWithdrawnAmount: number;
  availableBalance: number;

  // Stats
  totalClicks: number;
  totalPageViews: number;
  totalSignups: number;
  totalConversions: number;
  conversionRate: number;

  // Tracking
  lastActivityAt?: Date;
  lastConversionAt?: Date;

  // Cycle tracking
  currentCycle: number;              // Resets after full withdrawal
  cycleStartedAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

interface ISafiraSlot {
  slotNumber: number;                // 1-20
  filled: boolean;
  conversionId?: string;
  filledAt?: Date;
  amount: number;                    // Default: 40
}
```

### Methods

```typescript
// Fill next available slot
fillSlot(conversionId: string): Promise<ISafiraSlot | null>

// Reset slots after withdrawal
resetSlots(withdrawnAmount: number): Promise<void>
```

### Virtual Properties

```typescript
progressPercentage: number  // (filledSlots / totalSlots) * 100
```

### Indexes

| Field | Type |
|-------|------|
| `influencerId` | Unique |
| `referralCode` | Unique |
| `filledSlots` | Descending |
| `totalEarnedAmount` | Descending |

---

### SafiraConversion

**Collection:** `safiraconversions`
**File:** `backend/src/models/SafiraConversion.model.ts`

```typescript
interface ISafiraConversion {
  conversionId: string;              // Unique from Safira
  influencerId: ObjectId;            // Ref: User
  referralCode: string;
  conversionType: 'PURCHASE' | 'INVESTMENT' | 'SIGNUP';
  status: 'pending' | 'confirmed' | 'rejected';
  slotNumber?: number;

  transaction: {
    amount: number;
    commission: number;
    productValue: number;
    currency: string;
  };

  product: {
    id: string;
    name: string;
    category?: string;
  };

  customer: {
    isNew: boolean;
    country?: string;
    source?: string;
  };

  timestamp: Date;
  processedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}
```

---

### SafiraTrackingEvent

**Collection:** `safiratrackingevents`
**File:** `backend/src/models/SafiraTracking.model.ts`

```typescript
interface ISafiraTrackingEvent {
  eventId: string;                   // Unique from Safira
  eventType: 'CLICK' | 'PAGE_VIEW' | 'SIGNUP' | 'ADD_TO_CART';
  influencerId: ObjectId;            // Ref: User
  referralCode: string;

  // Device info
  deviceType?: string;
  browser?: string;
  os?: string;

  // Location
  country?: string;
  city?: string;
  ip?: string;

  // Context
  pageUrl?: string;
  referrerUrl?: string;
  utmParams?: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
  };

  timestamp: Date;
  createdAt: Date;
}
```

---

### SafiraDailyStats

**Collection:** `safiradailystats`
**File:** `backend/src/models/SafiraDailyStats.model.ts`

```typescript
interface ISafiraDailyStats {
  date: Date;
  influencerId: ObjectId;            // Ref: User
  referralCode: string;

  clicks: number;
  pageViews: number;
  signups: number;
  conversions: number;

  revenue: number;
  commission: number;

  topProducts: Array<{
    id: string;
    name: string;
    count: number;
  }>;

  deviceBreakdown: {
    mobile: number;
    desktop: number;
    tablet: number;
  };

  countryBreakdown: Map<string, number>;

  createdAt: Date;
  updatedAt: Date;
}
```

---

## CMS Model

**Collection:** `cmspages`
**File:** `backend/src/models/CMS.model.ts`

```typescript
interface ICMSPage {
  title: string;
  slug: string;                      // Unique
  content: string;                   // HTML/Markdown
  metaTitle?: string;
  metaDescription?: string;
  isPublished: boolean;
  publishedAt?: Date;
  author: ObjectId;                  // Ref: User
  category?: string;
  tags: string[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Notification Model

**Collection:** `notifications`
**File:** `backend/src/models/Notification.model.ts`

```typescript
interface INotification {
  userId: ObjectId;                  // Ref: User
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  readAt?: Date;
  link?: string;
  createdAt: Date;
}

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

## Database Indexes Summary

### Performance Indexes

| Collection | Index | Purpose |
|------------|-------|---------|
| users | email | Login |
| users | role | Role filtering |
| projects | businessId + status | Owner's projects |
| tasks | influencerId + status | User's tasks |
| messages | chatId + createdAt | Chat history |
| safirainfluencerstats | referralCode | Webhook lookup |

### Unique Indexes

| Collection | Field |
|------------|-------|
| users | email |
| projects | metadata.slug |
| safirainfluencerstats | influencerId |
| safirainfluencerstats | referralCode |
| cmspages | slug |

---

## Data Relationships

```
User (Influencer)
├── Projects (applied/accepted)
├── Tasks
├── Chats
├── SafiraInfluencerStats
└── Notifications

User (Business)
├── Projects (owned)
├── Chats
└── Notifications

User (Admin)
├── AuditLogs
└── Notifications

Project
├── Business (owner)
├── Influencers (applied/accepted)
├── Tasks
└── Chats

SafiraInfluencerStats
├── User (influencer)
├── Project (Safira project)
├── SafiraConversions
└── SafiraTrackingEvents
```
