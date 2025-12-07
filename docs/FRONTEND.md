# MicroInfluencer Platform - Frontend Documentation

## Table of Contents
- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Pages](#pages)
- [Components](#components)
- [State Management](#state-management)
- [Styling](#styling)
- [API Integration](#api-integration)

---

## Overview

The frontend is a Next.js 14 application using the App Router with TypeScript. It provides interfaces for three user types: Influencers, Businesses, and Administrators.

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.x | React framework with App Router |
| React | 18.x | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.x | Styling |
| Lucide React | - | Icons |
| Axios | - | HTTP client |

---

## Project Structure

```
frontend/src/
├── app/                          # Next.js App Router pages
│   ├── (auth)/                   # Authentication group
│   │   ├── login/
│   │   └── register/
│   │       ├── business/
│   │       └── influencer/
│   ├── admin/                    # Admin panel
│   │   ├── dashboard/
│   │   ├── users/
│   │   ├── projects/
│   │   ├── payments/
│   │   ├── chats/
│   │   ├── safira/
│   │   └── analytics/
│   ├── business/                 # Business dashboard
│   │   ├── dashboard/
│   │   ├── projects/
│   │   ├── influencers/
│   │   ├── messages/
│   │   └── analytics/
│   ├── dashboard/                # Influencer dashboard
│   │   ├── page.tsx
│   │   ├── safira/
│   │   ├── projects/
│   │   ├── wallet/
│   │   └── messages/
│   ├── forgot-password/
│   ├── layout.tsx
│   └── page.tsx                  # Landing page
├── components/
│   └── shared/                   # Reusable components
│       ├── AdminNavbar.tsx
│       ├── BusinessNavbar.tsx
│       ├── DashboardNavbar.tsx
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       └── Table.tsx
├── lib/
│   ├── api.ts                    # Axios instance
│   └── utils.ts                  # Utility functions
├── hooks/                        # Custom React hooks
├── types/                        # TypeScript types
└── styles/
    └── globals.css               # Global styles
```

---

## Pages

### Public Pages

#### Landing Page (`/`)
- **File:** `app/page.tsx`
- **Description:** Main landing page with platform overview
- **Features:**
  - Hero section
  - Features showcase
  - CTA buttons for registration

#### Login (`/login`)
- **File:** `app/(auth)/login/page.tsx`
- **Description:** User authentication
- **Features:**
  - Email/password login
  - 2FA verification
  - Forgot password link
  - Register link

#### Register - Influencer (`/register/influencer`)
- **File:** `app/(auth)/register/influencer/page.tsx`
- **Description:** Multi-step influencer registration
- **Features:**
  - Personal information
  - Social media accounts
  - Profile details
  - Category selection

#### Register - Business (`/register/business`)
- **File:** `app/(auth)/register/business/page.tsx`
- **Description:** Business account registration
- **Features:**
  - Company information
  - Industry selection
  - Contact details

#### Forgot Password (`/forgot-password`)
- **File:** `app/forgot-password/page.tsx`
- **Description:** Password recovery flow

---

### Admin Panel

All admin pages use `AdminNavbar` component and require `admin` role.

#### Dashboard (`/admin/dashboard`)
- **File:** `app/admin/dashboard/page.tsx`
- **Theme:** Dark (slate-950 background)
- **Features:**
  - Stats cards (users, projects, revenue, pending)
  - Recent activity feed
  - Pending approvals list
  - Quick action buttons

**Stats Displayed:**
| Stat | Description |
|------|-------------|
| Total Users | All registered users |
| Total Influencers | Users with influencer role |
| Total Businesses | Users with business role |
| Active Projects | In-progress campaigns |
| Pending Approvals | Items awaiting review |
| Total Revenue | Platform earnings |

#### Users Management (`/admin/users`)
- **File:** `app/admin/users/page.tsx`
- **Features:**
  - User list with filters (role, status, search)
  - View user details modal
  - Edit user modal
  - Ban/Unban actions
  - Verify user
  - Delete user (super_admin only)
  - Pagination

#### Projects Management (`/admin/projects`)
- **File:** `app/admin/projects/page.tsx`
- **Features:**
  - Project list with status filters
  - View project details
  - Edit project
  - Approve/Reject pending projects
  - Delete project
  - Stats cards

#### Payments (`/admin/payments`)
- **File:** `app/admin/payments/page.tsx`
- **Tabs:**
  - Transactions - All platform transactions
  - Withdrawals - Withdrawal requests
  - Settlements - Business settlements
- **Features:**
  - Approve/Reject withdrawals
  - Mark as completed with TX hash
  - Transaction details modal
  - Stats cards

#### Chats Management (`/admin/chats`)
- **File:** `app/admin/chats/page.tsx`
- **Features:**
  - List all platform chats
  - View chat messages
  - Send messages as admin
  - Suspend/Unsuspend chats
  - Delete chats
  - Chat stats

#### Safira Management (`/admin/safira`)
- **File:** `app/admin/safira/page.tsx`
- **Features:**
  - Safira integration overview
  - Total conversions
  - Revenue tracking
  - Commission stats

#### Safira Influencers (`/admin/safira/influencers`)
- **File:** `app/admin/safira/influencers/page.tsx`
- **Features:**
  - List Safira-enrolled influencers
  - Performance metrics
  - Conversion stats

#### Analytics (`/admin/analytics`)
- **File:** `app/admin/analytics/page.tsx`
- **Features:**
  - User growth charts
  - Project statistics
  - Revenue analytics
  - Top categories
  - Engagement metrics

---

### Business Dashboard

All business pages use `BusinessNavbar` component and require `business` role.

#### Dashboard (`/business/dashboard`)
- **File:** `app/business/dashboard/page.tsx`
- **Features:**
  - Active campaigns count
  - Total influencers
  - Completed projects
  - Total spent
  - Recent activity

#### Projects (`/business/projects`)
- **File:** `app/business/projects/page.tsx`
- **Features:**
  - List all campaigns
  - Create new project
  - Edit existing projects
  - View applications
  - Project status management

#### New Project (`/business/projects/new`)
- **File:** `app/business/projects/new/page.tsx`
- **Features:**
  - Multi-step project creation
  - Requirements specification
  - Deliverables setup
  - Budget allocation

#### Project Details (`/business/projects/[id]`)
- **File:** `app/business/projects/[id]/page.tsx`
- **Features:**
  - Project overview
  - Applied influencers
  - Accepted influencers
  - Task progress
  - Accept/Reject influencers

#### Influencers (`/business/influencers`)
- **File:** `app/business/influencers/page.tsx`
- **Features:**
  - Search influencers
  - Filter by category, followers
  - View influencer profiles

#### Influencer Profile (`/business/influencers/[id]`)
- **File:** `app/business/influencers/[id]/page.tsx`
- **Features:**
  - Full influencer profile
  - Social media stats
  - Portfolio
  - Work history

#### Messages (`/business/messages`)
- **File:** `app/business/messages/page.tsx`
- **Features:**
  - Chat list
  - Real-time messaging
  - File attachments

#### Analytics (`/business/analytics`)
- **File:** `app/business/analytics/page.tsx`
- **Features:**
  - Campaign performance
  - ROI metrics
  - Influencer engagement

---

### Influencer Dashboard

All influencer pages use `DashboardNavbar` component and require `influencer` role.

#### Dashboard (`/dashboard`)
- **File:** `app/dashboard/page.tsx`
- **Features:**
  - Active projects count
  - Completed tasks
  - Total earnings
  - Pending payments
  - Available balance
  - Upcoming tasks

#### Safira Dashboard (`/dashboard/safira`)
- **File:** `app/dashboard/safira/page.tsx`
- **Features:**
  - Referral link management
  - Slot progress visualization
  - Conversion tracking
  - Analytics charts
  - Withdrawal request

**Key Components:**
- Referral link with copy button
- Social media share buttons
- Slot progress bar
- Recent conversions table
- Weekly stats chart

#### Projects (`/dashboard/projects`)
- **File:** `app/dashboard/projects/page.tsx`
- **Features:**
  - Browse available projects
  - Applied projects
  - Active projects
  - Apply to projects

#### Wallet (`/dashboard/wallet`)
- **File:** `app/dashboard/wallet/page.tsx`
- **Features:**
  - Balance display
  - Transaction history
  - Withdrawal request
  - Wallet address management

#### Messages (`/dashboard/messages`)
- **File:** `app/dashboard/messages/page.tsx`
- **Features:**
  - Chat list
  - Real-time messaging
  - Business communication

---

## Components

### Shared Components

#### AdminNavbar (`components/shared/AdminNavbar.tsx`)
Professional dark-themed sidebar navigation for admin panel.

```tsx
import { AdminNavbar } from '@/components/shared/AdminNavbar';

// Usage
<AdminNavbar />
```

**Features:**
- Dark theme (slate-900)
- Collapsible sidebar
- Mobile responsive
- Active state highlighting
- Logout functionality

**Navigation Links:**
| Link | Path | Icon |
|------|------|------|
| Dashboard | /admin/dashboard | LayoutDashboard |
| Users | /admin/users | Users |
| Projects | /admin/projects | FolderKanban |
| Payments | /admin/payments | CreditCard |
| Chats | /admin/chats | MessageSquare |
| Safira | /admin/safira | BarChart3 |
| Analytics | /admin/analytics | LineChart |

#### BusinessNavbar (`components/shared/BusinessNavbar.tsx`)
Sidebar navigation for business dashboard.

#### DashboardNavbar (`components/shared/DashboardNavbar.tsx`)
Sidebar navigation for influencer dashboard.

#### Button (`components/shared/Button.tsx`)
Reusable button component with variants.

```tsx
import { Button } from '@/components/shared/Button';

<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="danger">Danger</Button>
<Button variant="ghost">Ghost</Button>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | string | 'primary' | Button style variant |
| size | string | 'md' | Size (sm, md, lg) |
| disabled | boolean | false | Disabled state |
| loading | boolean | false | Loading state |
| className | string | '' | Additional classes |

#### Badge (`components/shared/Badge.tsx`)
Status badge component.

```tsx
import { Badge } from '@/components/shared/Badge';

<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="danger">Rejected</Badge>
<Badge variant="info">In Progress</Badge>
<Badge variant="gray">Draft</Badge>
```

#### Card (`components/shared/Card.tsx`)
Card container components.

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shared/Card';

<Card className="bg-slate-900 border-slate-800">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

#### Input (`components/shared/Input.tsx`)
Form input component.

```tsx
import { Input } from '@/components/shared/Input';

<Input
  label="Email"
  type="email"
  placeholder="Enter email"
  error="Invalid email"
/>
```

#### Modal (`components/shared/Modal.tsx`)
Modal dialog component.

```tsx
import { Modal } from '@/components/shared/Modal';

<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Modal Title"
>
  Modal content
</Modal>
```

#### Table (`components/shared/Table.tsx`)
Table component for data display.

---

## State Management

The application uses React hooks for state management:

### Local State
- `useState` for component-level state
- `useEffect` for side effects and data fetching

### API State
- Custom hooks for API calls
- Error handling
- Loading states

### Example Pattern
```tsx
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/endpoint');
      setData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
```

---

## Styling

### Theme - Admin Panel
Dark theme using Tailwind CSS slate color palette:

```css
/* Background colors */
bg-slate-950    /* Main background */
bg-slate-900    /* Cards, sidebar */
bg-slate-800    /* Inputs, secondary elements */
bg-slate-700    /* Borders, dividers */

/* Text colors */
text-white      /* Primary text */
text-slate-400  /* Secondary text */
text-slate-500  /* Muted text */

/* Accent colors */
text-blue-500   /* Primary accent */
text-emerald-400 /* Success, money */
text-yellow-400  /* Warning */
text-red-400     /* Danger */
text-purple-400  /* Special */
```

### Common Classes
```css
/* Cards */
.card {
  @apply bg-slate-900 border border-slate-800 rounded-xl;
}

/* Buttons */
.btn-primary {
  @apply bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg;
}

/* Inputs */
.input {
  @apply bg-slate-800 border border-slate-700 rounded-lg text-white
         placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500;
}
```

---

## API Integration

### API Client (`lib/api.ts`)
Axios instance with interceptors for authentication.

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh or logout
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Usage Pattern
```typescript
import api from '@/lib/api';

// GET request
const { data } = await api.get('/admin/users', {
  params: { page: 1, limit: 20 }
});

// POST request
const { data } = await api.post('/admin/users/:id/ban', {
  reason: 'Violation of terms'
});

// PUT request
await api.put('/admin/projects/:id', projectData);

// DELETE request
await api.delete('/admin/users/:id');
```

---

## Environment Variables

```env
# Frontend .env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_UPLOAD_URL=http://localhost:5000/uploads
```

---

## Build & Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run start
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```
