# 🚀 چیت شیت جامع پلتفرم مایکرو اینفلوئنسر

## 📋 فهرست سریع

- [دستورات سریع](#دستورات-سریع)
- [ساختار پروژه](#ساختار-پروژه)
- [متغیرهای محیطی](#متغیرهای-محیطی)
- [API Endpoints خلاصه](#api-endpoints-خلاصه)
- [دیتابیس Schema](#دیتابیس-schema)
- [دستورات PM2](#دستورات-pm2)
- [دستورات Git](#دستورات-git)
- [مشکلات رایج](#مشکلات-رایج)

---

## ⚡ دستورات سریع

### نصب و راه‌اندازی

```bash
# کلون پروژه
git clone https://github.com/your-repo/PlatformArsalanInfl.git
cd PlatformArsalanInfl

# نصب dependencies
npm install

# کپی .env
cp backend/.env.example backend/.env

# بیلد shared
cd shared && npm run build && cd ..

# بیلد backend
cd backend && npm run build && cd ..

# بیلد frontend
cd frontend && npm run build && cd ..

# اجرا در development
npm run dev

# اجرا در production
npm run build
pm2 start ecosystem.config.js
```

### دستورات Development

```bash
# اجرای backend
npm run dev:backend

# اجرای frontend
npm run dev:frontend

# اجرای همزمان
npm run dev

# TypeScript check
cd backend && npm run typecheck
cd frontend && npm run typecheck

# Linting
npm run lint
```

### دستورات Build

```bash
# بیلد همه
npm run build

# بیلد فقط backend
npm run build:backend

# بیلد فقط frontend
npm run build:frontend
```

---

## 📁 ساختار پروژه

```
PlatformArsalanInfl/
│
├── backend/                    # Backend API
│   ├── src/
│   │   ├── config/            # تنظیمات
│   │   ├── controllers/       # Controllers
│   │   ├── middleware/        # Middlewares
│   │   ├── models/            # Database Models
│   │   │   ├── User.model.ts
│   │   │   ├── Project.model.ts
│   │   │   ├── Task.model.ts
│   │   │   ├── Chat.model.ts
│   │   │   └── ...
│   │   ├── routes/            # API Routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── influencer.routes.ts
│   │   │   ├── business.routes.ts
│   │   │   ├── admin.routes.ts
│   │   │   └── ...
│   │   ├── services/          # Business Logic
│   │   │   ├── auth/
│   │   │   ├── project/
│   │   │   ├── task/
│   │   │   ├── payment/
│   │   │   ├── social/
│   │   │   └── ...
│   │   ├── socket/            # Socket.IO Handlers
│   │   ├── utils/             # کمکی‌ها
│   │   └── index.ts           # Entry Point
│   ├── uploads/               # فایل‌های آپلود شده
│   └── package.json
│
├── frontend/                   # Frontend (Next.js)
│   ├── src/
│   │   ├── app/               # App Router (Next.js 14)
│   │   │   ├── page.tsx       # صفحه اصلی
│   │   │   ├── auth/          # صفحات احراز هویت
│   │   │   ├── dashboard/     # داشبورد اینفلوئنسر
│   │   │   ├── business/      # داشبورد بیزینس
│   │   │   └── admin/         # پنل ادمین
│   │   ├── components/        # کامپوننت‌ها
│   │   │   ├── shared/        # کامپوننت‌های مشترک
│   │   │   ├── layout/        # Layout کامپوننت‌ها
│   │   │   └── ...
│   │   ├── lib/               # کتابخانه‌ها و utilities
│   │   ├── hooks/             # Custom Hooks
│   │   ├── store/             # State Management (Zustand)
│   │   └── styles/            # Styles
│   ├── public/                # فایل‌های استاتیک
│   │   └── locales/           # ترجمه‌ها (10 زبان)
│   └── package.json
│
├── shared/                     # کدهای مشترک
│   └── src/
│       ├── types/             # TypeScript Types
│       │   ├── user.types.ts
│       │   ├── project.types.ts
│       │   ├── task.types.ts
│       │   └── ...
│       └── utils/             # Validators
│
├── ecosystem.config.js         # PM2 Config
├── docker-compose.yml          # Docker Setup
├── INSTALLATION.md             # راهنمای نصب
├── API_DOCUMENTATION.md        # مستندات API
├── CHEATSHEET.md              # این فایل
└── README.md                  # خلاصه پروژه
```

---

## 🔧 متغیرهای محیطی

### Backend (.env)

```env
# Server
NODE_ENV=production|development
PORT=5000
FRONTEND_URL=http://localhost:3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/influencer_platform

# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=influencer_platform
POSTGRES_USER=platform_user
POSTGRES_PASSWORD=your_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Elasticsearch
ELASTICSEARCH_NODE=http://localhost:9200

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Crypto
USDT_CONTRACT_ADDRESS=0x...
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
POLYGON_RPC_URL=https://polygon-rpc.com
BSC_RPC_URL=https://bsc-dataseed.binance.org

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Social APIs
INSTAGRAM_CLIENT_ID=your_client_id
INSTAGRAM_CLIENT_SECRET=your_client_secret
YOUTUBE_API_KEY=your_api_key
TWITTER_API_KEY=your_api_key
TWITTER_API_SECRET=your_api_secret

# Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 🔗 API Endpoints خلاصه

### Authentication
```
POST   /api/auth/register          - ثبت‌نام
POST   /api/auth/login             - ورود
POST   /api/auth/refresh           - تمدید توکن
POST   /api/auth/logout            - خروج
POST   /api/auth/2fa/enable        - فعال‌سازی 2FA
POST   /api/auth/2fa/verify        - تایید 2FA
POST   /api/auth/forgot-password   - فراموشی رمز
POST   /api/auth/reset-password    - ریست رمز
```

### User
```
GET    /api/user/profile           - پروفایل من
PUT    /api/user/profile           - بروزرسانی پروفایل
POST   /api/user/avatar            - آپلود آواتار
```

### Influencer
```
GET    /api/influencer/dashboard/stats            - آمار داشبورد
GET    /api/influencer/projects                   - پروژه‌های من
GET    /api/influencer/projects/browse            - مرور پروژه‌ها
POST   /api/influencer/projects/:id/apply         - درخواست همکاری
DELETE /api/influencer/projects/:id/withdraw      - لغو درخواست
GET    /api/influencer/tasks                      - تسک‌های من
POST   /api/influencer/tasks/:id/submit           - ثبت تسک
GET    /api/influencer/wallet                     - کیف پول
POST   /api/influencer/wallet/withdraw            - برداشت
POST   /api/influencer/social/:platform/connect   - اتصال شبکه اجتماعی
```

### Business
```
GET    /api/business/dashboard/stats                       - آمار داشبورد
POST   /api/business/projects                              - ایجاد پروژه
GET    /api/business/projects                              - پروژه‌های من
PUT    /api/business/projects/:id                          - ویرایش پروژه
DELETE /api/business/projects/:id                          - حذف پروژه
POST   /api/business/projects/:id/influencers/:uid/accept  - قبول اینفلوئنسر
POST   /api/business/projects/:id/influencers/:uid/reject  - رد اینفلوئنسر
GET    /api/business/influencers                           - اینفلوئنسرهای من
POST   /api/business/influencers/search                    - جستجوی اینفلوئنسر
GET    /api/business/tasks                                 - تسک‌ها
POST   /api/business/tasks/:id/review                      - بررسی تسک
```

### Admin
```
GET    /api/admin/dashboard/stats           - آمار داشبورد
GET    /api/admin/users                     - لیست کاربران
GET    /api/admin/users/:id                 - جزئیات کاربر
POST   /api/admin/users/:id/ban             - بن کاربر
POST   /api/admin/users/:id/unban           - رفع بن
POST   /api/admin/users/:id/verify          - تایید کاربر
GET    /api/admin/projects/pending          - پروژه‌های در انتظار
POST   /api/admin/projects/:id/approve      - تایید پروژه
POST   /api/admin/projects/:id/reject       - رد پروژه
GET    /api/admin/withdrawals/pending       - برداشت‌های در انتظار
POST   /api/admin/withdrawals/:id/approve   - تایید برداشت
POST   /api/admin/withdrawals/:id/reject    - رد برداشت
GET    /api/admin/analytics                 - آنالیتیکس
GET    /api/admin/audit-logs                - لاگ‌های ممیزی
GET    /api/admin/approvals/pending         - تاییدیه‌های در انتظار
GET    /api/admin/activity                  - فعالیت‌های اخیر
```

### Projects
```
GET    /api/projects           - مرور پروژه‌ها
GET    /api/projects/:id       - جزئیات پروژه
```

### Tasks
```
GET    /api/tasks/:id          - جزئیات تسک
```

### Payment
```
GET    /api/payment/transactions          - تاریخچه تراکنش‌ها
POST   /api/payment/crypto/pay            - پرداخت کریپتو
POST   /api/payment/crypto/verify/:id     - تایید پرداخت
```

### Chat
```
GET    /api/chat/conversations            - لیست چت‌ها
GET    /api/chat/:id/messages             - پیام‌های چت
POST   /api/chat/:id/messages             - ارسال پیام
POST   /api/chat/create                   - ایجاد چت
```

### Notifications
```
GET    /api/notifications                 - لیست نوتیفیکیشن‌ها
PUT    /api/notifications/:id/read        - علامت به عنوان خوانده شده
PUT    /api/notifications/read-all        - خواندن همه
```

### CMS
```
GET    /api/cms/pages/:slug               - دریافت صفحه
GET    /api/cms/landing                   - محتوای لندینگ
GET    /api/cms/settings                  - تنظیمات پلتفرم
```

### Upload
```
POST   /api/upload                        - آپلود فایل
POST   /api/upload/multiple               - آپلود چند فایل
DELETE /api/upload/:filename              - حذف فایل
```

---

## 💾 دیتابیس Schema

### User Collection (MongoDB)

```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  firstName: String,
  lastName: String,
  avatar: String,
  role: 'influencer' | 'business' | 'admin',
  adminRole: 'super_admin' | 'admin' | 'moderator' | 'support' | 'financial',
  emailVerified: Boolean,
  emailVerificationToken: String,
  twoFactorEnabled: Boolean,
  twoFactorSecret: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  profile: {
    bio: String,
    location: String,
    phone: String,
    dateOfBirth: Date,
    gender: 'male' | 'female' | 'other',
    categories: [String],
    verified: Boolean,
    banned: Boolean,
    banReason: String,
    companyName: String,
    companySize: String,
    website: String,
    taxId: String,
    socialMedia: {
      instagram: { username, followers, engagement },
      youtube: { username, subscribers },
      twitter: { username, followers },
      totalFollowers: Number,
      averageEngagement: Number
    }
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Project Collection (MongoDB)

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  businessId: ObjectId (ref: User),
  budget: Number,
  status: 'draft' | 'pending_approval' | 'rejected' | 'approved' | 'active' | 'in_progress' | 'completed' | 'cancelled',
  deadline: Date,
  requirements: {
    categories: [String],
    minFollowers: Number,
    maxFollowers: Number,
    platforms: [String],
    ageRange: { min, max },
    gender: String,
    location: [String]
  },
  maxInfluencers: Number,
  appliedInfluencers: [ObjectId],
  acceptedInfluencers: [ObjectId],
  rejectedInfluencers: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

### Task Collection (MongoDB)

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  projectId: ObjectId (ref: Project),
  influencerId: ObjectId (ref: User),
  reward: Number,
  status: 'pending' | 'in_progress' | 'submitted' | 'completed' | 'rejected',
  deadline: Date,
  submission: {
    url: String,
    notes: String,
    attachments: [String],
    submittedAt: Date
  },
  review: {
    status: 'pending' | 'approved' | 'rejected',
    feedback: String,
    rating: Number,
    reviewedAt: Date,
    reviewedBy: ObjectId
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Chat Collection (MongoDB)

```javascript
{
  _id: ObjectId,
  participants: [ObjectId],
  lastMessage: {
    content: String,
    senderId: ObjectId,
    createdAt: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Message Collection (MongoDB)

```javascript
{
  _id: ObjectId,
  chatId: ObjectId (ref: Chat),
  senderId: ObjectId (ref: User),
  content: String,
  attachments: [String],
  read: Boolean,
  createdAt: Date
}
```

### Transactions Table (PostgreSQL)

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  type VARCHAR(20) NOT NULL, -- credit, debit, withdrawal
  amount DECIMAL(12,2) NOT NULL,
  status VARCHAR(20) NOT NULL, -- pending, completed, failed, cancelled
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Wallets Table (PostgreSQL)

```sql
CREATE TABLE wallets (
  id UUID PRIMARY KEY,
  user_id VARCHAR(50) UNIQUE NOT NULL,
  balance DECIMAL(12,2) DEFAULT 0,
  pending_balance DECIMAL(12,2) DEFAULT 0,
  total_earnings DECIMAL(12,2) DEFAULT 0,
  total_withdrawals DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔧 دستورات PM2

```bash
# شروع
pm2 start ecosystem.config.js

# وضعیت
pm2 status

# لاگ‌ها
pm2 logs
pm2 logs backend
pm2 logs frontend

# راه‌اندازی مجدد
pm2 restart all
pm2 restart backend
pm2 restart frontend

# توقف
pm2 stop all
pm2 stop backend

# حذف
pm2 delete all

# مانیتور
pm2 monit

# ذخیره تنظیمات
pm2 save

# راه‌اندازی خودکار هنگام بوت
pm2 startup
```

---

## 📝 دستورات Git

```bash
# شاخه‌ها
git checkout claude/micro-influencer-platform-01RKqXpzWHiyDSm9zarCkTL1

# وضعیت
git status

# کامیت
git add .
git commit -m "Your message"

# پوش
git push -u origin claude/micro-influencer-platform-01RKqXpzWHiyDSm9zarCkTL1

# پول
git pull origin claude/micro-influencer-platform-01RKqXpzWHiyDSm9zarCkTL1

# مشاهده تاریخچه
git log --oneline --graph

# برگشت به کامیت قبلی
git revert HEAD

# لیست شاخه‌ها
git branch -a
```

---

## 🐛 مشکلات رایج

### MongoDB اتصال برقرار نمی‌شود

```bash
# بررسی وضعیت
sudo systemctl status mongod

# راه‌اندازی مجدد
sudo systemctl restart mongod

# مشاهده لاگ‌ها
sudo journalctl -u mongod -f

# اتصال دستی
mongosh
```

### PostgreSQL خطا می‌دهد

```bash
# بررسی وضعیت
sudo systemctl status postgresql

# راه‌اندازی مجدد
sudo systemctl restart postgresql

# اتصال
sudo -u postgres psql influencer_platform

# بررسی کانکشن‌ها
SELECT * FROM pg_stat_activity;
```

### Redis مشکل دارد

```bash
# بررسی وضعیت
sudo systemctl status redis

# راه‌اندازی مجدد
sudo systemctl restart redis

# تست
redis-cli ping
```

### Frontend بیلد نمی‌شود

```bash
# حذف و نصب مجدد
cd frontend
rm -rf node_modules .next
npm install
npm run build

# بررسی خطاها
npm run typecheck
```

### Backend بیلد نمی‌شود

```bash
# حذف و نصب مجدد
cd backend
rm -rf node_modules dist
npm install
npm run build

# بررسی TypeScript
npm run typecheck
```

### Port در حال استفاده است

```bash
# پیدا کردن process
sudo lsof -i :5000
sudo lsof -i :3000

# Kill کردن process
kill -9 <PID>
```

### ENOSPC: System limit for number of file watchers reached

```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

---

## 📊 دستورات مفید دیتابیس

### MongoDB

```javascript
// اتصال
mongosh

// انتخاب دیتابیس
use influencer_platform

// نمایش collections
show collections

// تعداد کاربران
db.users.countDocuments()

// پیدا کردن کاربر
db.users.findOne({ email: "admin@platform.com" })

// بروزرسانی کاربر
db.users.updateOne(
  { email: "admin@platform.com" },
  { $set: { "profile.verified": true } }
)

// حذف کاربر
db.users.deleteOne({ email: "test@example.com" })

// ایجاد index
db.users.createIndex({ email: 1 })

// پاک کردن collection
db.users.deleteMany({})

// بکاپ
mongodump --db=influencer_platform --out=/backup/

// ریستور
mongorestore /backup/influencer_platform
```

### PostgreSQL

```sql
-- اتصال
\c influencer_platform

-- لیست جداول
\dt

-- توضیحات جدول
\d transactions

-- تعداد تراکنش‌ها
SELECT COUNT(*) FROM transactions;

-- مجموع تراکنش‌ها
SELECT SUM(amount) FROM transactions WHERE status = 'completed';

-- تراکنش‌های اخیر
SELECT * FROM transactions ORDER BY created_at DESC LIMIT 10;

-- پاک کردن جدول
TRUNCATE TABLE transactions;

-- بکاپ
pg_dump influencer_platform > backup.sql

-- ریستور
psql influencer_platform < backup.sql
```

---

## 🔍 لاگ‌ها و دیباگ

```bash
# PM2 لاگ‌ها
pm2 logs
pm2 logs backend --lines 100

# Nginx لاگ‌ها
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# System لاگ‌ها
journalctl -f
journalctl -u mongod -f
journalctl -u postgresql -f

# لاگ‌های Backend (اگر در حالت development)
cd backend && npm run dev
```

---

## 🎨 Frontend Components

### مهمترین کامپوننت‌های shared

```typescript
// Button
<Button variant="primary|secondary|outline|ghost|danger|success|gray" size="sm|md|lg">
  Click me
</Button>

// Badge
<Badge variant="primary|success|warning|danger|info|gray">
  Status
</Badge>

// Card
<Card>
  <CardHeader>Title</CardHeader>
  <CardContent>Content</CardContent>
</Card>

// Input
<Input
  type="text"
  placeholder="Enter text"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>

// Modal
<Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
  <ModalHeader>Title</ModalHeader>
  <ModalBody>Content</ModalBody>
  <ModalFooter>Actions</ModalFooter>
</Modal>
```

---

## 🌍 زبان‌های پشتیبانی شده

1. English (en)
2. فارسی (fa)
3. عربی (ar)
4. ترکی (tr)
5. اردو (ur)
6. اسپانیایی (es)
7. فرانسوی (fr)
8. آلمانی (de)
9. ایتالیایی (it)
10. ژاپنی (ja)

### تغییر زبان

```typescript
import { useTranslation } from 'react-i18next';

const { t, i18n } = useTranslation();

// تغییر زبان
i18n.changeLanguage('fa');

// ترجمه
t('common.submit'); // "ارسال" در فارسی
```

---

## 🔐 نقش‌های کاربری

### UserRole
- `influencer` - اینفلوئنسر
- `business` - کسب‌وکار
- `admin` - ادمین

### AdminRole
- `super_admin` - مدیر کل (دسترسی کامل)
- `admin` - ادمین (مدیریت کاربران و محتوا)
- `moderator` - ناظر (بررسی محتوا)
- `support` - پشتیبانی (پاسخگویی به کاربران)
- `financial` - مالی (مدیریت تراکنش‌ها)

### ProjectStatus
- `draft` - پیش‌نویس
- `pending_approval` - در انتظار تایید
- `rejected` - رد شده
- `approved` - تایید شده
- `active` - فعال
- `in_progress` - در حال اجرا
- `completed` - تکمیل شده
- `cancelled` - لغو شده

### TaskStatus
- `pending` - در انتظار
- `in_progress` - در حال انجام
- `submitted` - ارسال شده
- `completed` - تکمیل شده
- `rejected` - رد شده

---

## 📦 Package های مهم

### Backend
```json
{
  "express": "REST API framework",
  "mongoose": "MongoDB ODM",
  "typeorm": "PostgreSQL ORM",
  "socket.io": "Real-time communication",
  "jsonwebtoken": "JWT authentication",
  "bcryptjs": "Password hashing",
  "joi": "Validation",
  "winston": "Logging",
  "redis": "Caching",
  "elasticsearch": "Search",
  "web3": "Blockchain",
  "multer": "File upload",
  "nodemailer": "Email"
}
```

### Frontend
```json
{
  "next": "React framework",
  "react": "UI library",
  "tailwindcss": "CSS framework",
  "zustand": "State management",
  "react-query": "Data fetching",
  "socket.io-client": "Real-time",
  "axios": "HTTP client",
  "framer-motion": "Animations",
  "recharts": "Charts",
  "react-hook-form": "Forms",
  "zod": "Validation"
}
```

---

## 💡 نکات مهم

1. **همیشه environment variables را چک کنید**
2. **قبل از commit، TypeScript check کنید**
3. **لاگ‌ها را مانیتور کنید**
4. **بکاپ منظم بگیرید**
5. **Rate limiting را رعایت کنید**
6. **SSL Certificate را بروز نگه دارید**
7. **Dependencies را آپدیت کنید**
8. **Security best practices را رعایت کنید**

---

## 📞 پشتیبانی

- مستندات: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- نصب: [INSTALLATION.md](./INSTALLATION.md)
- Issues: GitHub Issues
- Email: support@platform.com

---

این چیت شیت به طور مداوم بروزرسانی می‌شود. برای آخرین تغییرات به repository مراجعه کنید.
