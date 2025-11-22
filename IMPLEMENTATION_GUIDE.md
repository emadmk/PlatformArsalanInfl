# Complete Implementation Guide

## ✅ What's Already Done

### Backend Services (100% Complete)
All core business logic is implemented:

- ✅ Authentication (JWT + 2FA)
- ✅ Social Media APIs (Instagram, Facebook, Twitter, YouTube, TikTok)
- ✅ Project Management
- ✅ Task Management
- ✅ Chat System
- ✅ Payment & Wallet (Web3 + USDT)
- ✅ Admin Panel Services
- ✅ CMS System
- ✅ Analytics & Tracking
- ✅ Notifications (Push + Email)
- ✅ File Upload

### Database (100% Complete)
- ✅ MongoDB Models
- ✅ PostgreSQL Schema
- ✅ All Indexes
- ✅ Docker Setup

## 🔧 What Needs to Be Done

### 1. Backend Routes & Controllers (Pattern Provided)

I've created the auth routes/controller as a template. Follow this exact pattern for:

**Influencer Routes** (`backend/src/routes/influencer.routes.ts`):
```typescript
import { Router } from 'router';
import influencerService from '@/services/influencer/influencer.service';
import { authenticateToken, requireRole } from '@/middleware/auth.middleware';

const router = Router();

// GET /api/v1/influencer/profile
router.get('/profile', authenticateToken, requireRole('influencer'), async (req, res) => {
  const user = await User.findById(req.user!.id);
  res.json({ user });
});

// PUT /api/v1/influencer/profile
router.put('/profile', authenticateToken, requireRole('influencer'), async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user!.id, req.body, { new: true });
  res.json({ user });
});

// GET /api/v1/influencer/projects - Browse projects
// POST /api/v1/influencer/projects/:id/apply - Apply to project
// GET /api/v1/influencer/tasks - My tasks
// POST /api/v1/influencer/tasks/:id/submit - Submit task
// ... etc

export default router;
```

**Business Routes** (`backend/src/routes/business.routes.ts`):
```typescript
// Similar pattern:
// POST /api/v1/business/projects - Create project
// GET /api/v1/business/projects - My projects
// PUT /api/v1/business/projects/:id - Update project
// GET /api/v1/business/influencers/search - Search influencers
// POST /api/v1/business/projects/:projectId/influencers/:influencerId/accept
// ... etc
```

**Project Routes** (`backend/src/routes/project.routes.ts`):
```typescript
import projectService from '@/services/project/project.service';

// GET /api/v1/projects - List all approved projects
// GET /api/v1/projects/:id - Get project details
// POST /api/v1/projects/:id/apply - Apply (influencer)
// ... etc
```

**Similar pattern for**:
- `task.routes.ts`
- `chat.routes.ts`
- `payment.routes.ts`
- `admin.routes.ts`
- `cms.routes.ts`
- `upload.routes.ts`

**Then add to** `backend/src/index.ts`:
```typescript
app.use(`${config.apiPrefix}/influencer`, require('./routes/influencer.routes').default);
app.use(`${config.apiPrefix}/business`, require('./routes/business.routes').default);
app.use(`${config.apiPrefix}/projects`, require('./routes/project.routes').default);
// ... etc
```

### 2. Socket.io Implementation

Create `backend/src/socket/handlers.ts`:

```typescript
import { Server, Socket } from 'socket.io';
import chatService from '@/services/chat/chat.service';
import jwt from 'jsonwebtoken';
import config from '@/config';

export const setupSocketHandlers = (io: Server) => {
  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as any;
      socket.data.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId;

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Join chat room
    socket.on('chat:join', (chatId: string) => {
      socket.join(`chat:${chatId}`);
    });

    // Send message
    socket.on('chat:message', async (data) => {
      const message = await chatService.sendMessage(data);
      io.to(`chat:${data.chatId}`).emit('chat:message', message);
    });

    // Typing indicator
    socket.on('chat:typing', (chatId: string) => {
      socket.to(`chat:${chatId}`).emit('chat:typing', { userId, chatId });
    });

    // Mark as read
    socket.on('chat:read', async (chatId: string) => {
      await chatService.markAsRead(chatId, userId);
      socket.to(`chat:${chatId}`).emit('chat:read', { chatId, userId });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`);
    });
  });
};
```

Then in `backend/src/index.ts`:
```typescript
import { setupSocketHandlers } from './socket/handlers';

// After io setup:
setupSocketHandlers(io);
```

### 3. Frontend Structure

Create Next.js 14 app with this structure:

```
frontend/src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       ├── page.tsx
│   │       ├── influencer/
│   │       │   └── page.tsx
│   │       └── business/
│   │           └── page.tsx
│   ├── (influencer)/
│   │   ├── dashboard/
│   │   ├── projects/
│   │   ├── tasks/
│   │   ├── earnings/
│   │   ├── chat/
│   │   └── profile/
│   ├── (business)/
│   │   ├── dashboard/
│   │   ├── projects/
│   │   ├── influencers/
│   │   ├── tasks/
│   │   ├── chat/
│   │   └── financials/
│   ├── (admin)/
│   │   ├── dashboard/
│   │   ├── users/
│   │   ├── projects/
│   │   ├── transactions/
│   │   ├── cms/
│   │   └── settings/
│   ├── layout.tsx
│   └── page.tsx (Landing)
├── components/
│   ├── shared/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Table.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── landing/
│   ├── influencer/
│   ├── business/
│   └── admin/
├── lib/
│   ├── api.ts (Axios client)
│   ├── socket.ts (Socket.io client)
│   ├── auth.ts
│   └── utils.ts
└── hooks/
    ├── useAuth.ts
    ├── useSocket.ts
    ├── useProjects.ts
    └── useTasks.ts
```

### 4. Key Frontend Files

**API Client** (`frontend/src/lib/api.ts`):
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + '/api/v1',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Refresh token logic
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        const { data } = await axios.post('/api/v1/auth/refresh', { refreshToken });
        localStorage.setItem('accessToken', data.accessToken);
        return api.request(error.config);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

**Socket Client** (`frontend/src/lib/socket.ts`):
```typescript
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initSocket = (token: string) => {
  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
    auth: { token },
  });

  return socket;
};

export const getSocket = () => socket;
```

**Auth Hook** (`frontend/src/hooks/useAuth.ts`):
```typescript
import { create } from 'zustand';
import api from '@/lib/api';

interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: any) => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    set({ user: data.user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, isAuthenticated: false });
  },

  register: async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    set({ user: data.user });
  },
}));
```

### 5. Translation Files

Create `public/locales/{lang}/common.json` for each language:

**English** (`public/locales/en/common.json`):
```json
{
  "nav": {
    "home": "Home",
    "about": "About",
    "features": "Features",
    "login": "Login",
    "register": "Register"
  },
  "hero": {
    "title": "Connect with Micro Influencers",
    "subtitle": "Grow your brand with authentic voices",
    "cta": "Get Started"
  },
  "dashboard": {
    "welcome": "Welcome back",
    "projects": "Projects",
    "tasks": "Tasks",
    "earnings": "Earnings"
  }
}
```

**Persian** (`public/locales/fa/common.json`):
```json
{
  "nav": {
    "home": "خانه",
    "about": "درباره ما",
    "features": "امکانات",
    "login": "ورود",
    "register": "ثبت نام"
  },
  "hero": {
    "title": "ارتباط با میکرو اینفلوئنسرها",
    "subtitle": "برندتان را با صداهای معتبر رشد دهید",
    "cta": "شروع کنید"
  }
}
```

**Repeat for**: `fr`, `es`, `ar`, `de`, `pt`, `zh`, `ko`, `ja`

### 6. Component Examples

**Button** (`frontend/src/components/shared/Button.tsx`):
```typescript
import { ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary-600 text-white hover:bg-primary-700',
        outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50',
        ghost: 'hover:bg-gray-100',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-6 text-base',
        lg: 'h-14 px-8 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export const Button = ({ className, variant, size, ...props }: ButtonProps) => {
  return (
    <button className={cn(buttonVariants({ variant, size, className }))} {...props} />
  );
};
```

**Card** (`frontend/src/components/shared/Card.tsx`):
```typescript
export const Card = ({ children, className = '' }: any) => (
  <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
    {children}
  </div>
);

export const CardHeader = ({ children }: any) => (
  <div className="mb-4 pb-4 border-b">{children}</div>
);

export const CardTitle = ({ children }: any) => (
  <h3 className="text-lg font-semibold">{children}</h3>
);

export const CardContent = ({ children }: any) => (
  <div>{children}</div>
);
```

## 📝 Step-by-Step Implementation Order

1. **Backend Routes** (1-2 days)
   - Follow the pattern in `auth.routes.ts`
   - Create one route file at a time
   - Test with Postman/curl

2. **Socket.io** (1 day)
   - Implement handlers.ts
   - Test with socket.io client

3. **Frontend Shared Components** (2 days)
   - Button, Input, Card, Modal
   - Layout components (Sidebar, Header)

4. **Frontend Auth Pages** (1 day)
   - Login page
   - Register pages (influencer/business)

5. **Frontend Dashboards** (3-4 days)
   - Influencer dashboard
   - Business dashboard
   - Admin dashboard

6. **Frontend Feature Pages** (3-4 days)
   - Projects listing and details
   - Task management
   - Chat interface
   - Profile pages

7. **Landing Page** (2 days)
   - Hero section
   - Features
   - Testimonials
   - Footer

8. **Translations** (1 day)
   - Create JSON files for all 10 languages
   - Use Google Translate for quick first pass

9. **Testing & Polish** (2-3 days)
   - Test all flows
   - Fix bugs
   - Responsive design check
   - Performance optimization

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your API keys

# Start with Docker
npm run docker:up

# Or start services individually:
# Terminal 1: MongoDB, PostgreSQL, Redis, Elasticsearch
# Terminal 2:
npm run dev:backend

# Terminal 3:
npm run dev:frontend

# Visit:
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

## 📚 Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Socket.io**: https://socket.io/docs/v4/
- **Web3.js**: https://web3js.readthedocs.io/
- **TypeORM**: https://typeorm.io/

## ⚠️ Important Notes

1. **Never commit** `.env` file
2. **Change JWT secrets** in production
3. **Get real API keys** for social media platforms
4. **Test crypto** on testnets first
5. **Setup SSL/TLS** for production
6. **Enable CORS** properly for your domain
7. **Setup backup** for databases
8. **Monitor logs** in production

## 💡 Tips

- Use **React Query** for data fetching
- Use **Zustand** for global state
- Use **React Hook Form** for forms
- Use **Zod** for validation
- Use **Tailwind CSS** utilities
- Follow **mobile-first** design
- Test on **real devices**
- Use **lighthouse** for performance

---

**Everything is ready to go! Just follow this guide and you'll have a complete platform.**
