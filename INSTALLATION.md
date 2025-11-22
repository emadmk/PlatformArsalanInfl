# 🚀 راهنمای نصب کامل - پلتفرم مایکرو اینفلوئنسر

این راهنمای گام به گام برای نصب پلتفرم روی سرور Ubuntu 22.04 LTS است.

## 📋 پیش‌نیازها

### سرور
- Ubuntu 22.04 LTS
- حداقل 4GB RAM
- حداقل 50GB فضای دیسک
- دسترسی root یا sudo

### نرم‌افزارهای مورد نیاز
- Node.js 18 یا بالاتر
- MongoDB 6.0 یا بالاتر
- PostgreSQL 14 یا بالاتر
- Redis 7.0 یا بالاتر
- Elasticsearch 8.x
- Nginx
- PM2 (برای process management)

---

## 🎯 نصب اتوماتیک (یک کلیکی)

برای نصب سریع، اسکریپت نصب خودکار را اجرا کنید:

```bash
# دانلود اسکریپت نصب
wget https://raw.githubusercontent.com/your-repo/install.sh

# اجرای اسکریپت
chmod +x install.sh
sudo ./install.sh
```

**توجه:** اسکریپت نصب خودکار تمام وابستگی‌ها را نصب کرده و پلتفرم را راه‌اندازی می‌کند.

---

## 📦 نصب دستی (گام به گام)

### مرحله 1: آپدیت سیستم

```bash
sudo apt update
sudo apt upgrade -y
```

### مرحله 2: نصب Node.js 18

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # باید 18.x نشان دهد
npm --version
```

### مرحله 3: نصب MongoDB

```bash
# اضافه کردن کلید MongoDB
curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-6.0.gpg

# اضافه کردن repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# نصب MongoDB
sudo apt update
sudo apt install -y mongodb-org

# فعال‌سازی و شروع MongoDB
sudo systemctl enable mongod
sudo systemctl start mongod
sudo systemctl status mongod
```

### مرحله 4: نصب PostgreSQL

```bash
# نصب PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# فعال‌سازی و شروع PostgreSQL
sudo systemctl enable postgresql
sudo systemctl start postgresql

# ایجاد دیتابیس و کاربر
sudo -u postgres psql <<EOF
CREATE DATABASE influencer_platform;
CREATE USER platform_user WITH PASSWORD 'your_strong_password';
GRANT ALL PRIVILEGES ON DATABASE influencer_platform TO platform_user;
\q
EOF
```

### مرحله 5: نصب Redis

```bash
# نصب Redis
sudo apt install -y redis-server

# تنظیم Redis برای systemd
sudo sed -i 's/supervised no/supervised systemd/' /etc/redis/redis.conf

# راه‌اندازی مجدد Redis
sudo systemctl restart redis
sudo systemctl enable redis
sudo systemctl status redis
```

### مرحله 6: نصب Elasticsearch

```bash
# نصب Java (پیش‌نیاز Elasticsearch)
sudo apt install -y openjdk-11-jdk

# اضافه کردن کلید Elasticsearch
wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo gpg --dearmor -o /usr/share/keyrings/elasticsearch-keyring.gpg

# اضافه کردن repository
echo "deb [signed-by=/usr/share/keyrings/elasticsearch-keyring.gpg] https://artifacts.elastic.co/packages/8.x/apt stable main" | sudo tee /etc/apt/sources.list.d/elastic-8.x.list

# نصب Elasticsearch
sudo apt update
sudo apt install -y elasticsearch

# تنظیمات امنیتی (غیرفعال کردن security برای development)
sudo sed -i 's/xpack.security.enabled: true/xpack.security.enabled: false/' /etc/elasticsearch/elasticsearch.yml

# فعال‌سازی و شروع
sudo systemctl enable elasticsearch
sudo systemctl start elasticsearch

# بررسی وضعیت
curl http://localhost:9200
```

### مرحله 7: نصب Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### مرحله 8: نصب PM2

```bash
sudo npm install -g pm2
pm2 startup systemd
```

### مرحله 9: کلون کردن پروژه

```bash
# ایجاد دایرکتوری برای پروژه
sudo mkdir -p /var/www
cd /var/www

# کلون کردن از گیت
sudo git clone https://github.com/your-username/PlatformArsalanInfl.git
cd PlatformArsalanInfl

# تنظیم مالکیت
sudo chown -R $USER:$USER /var/www/PlatformArsalanInfl
```

### مرحله 10: تنظیم متغیرهای محیطی

```bash
# کپی کردن فایل نمونه
cp backend/.env.example backend/.env

# ویرایش فایل .env
nano backend/.env
```

**محتوای backend/.env:**

```env
# Server
NODE_ENV=production
PORT=5000
FRONTEND_URL=http://your-domain.com

# Database - MongoDB
MONGODB_URI=mongodb://localhost:27017/influencer_platform

# Database - PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=influencer_platform
POSTGRES_USER=platform_user
POSTGRES_PASSWORD=your_strong_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Elasticsearch
ELASTICSEARCH_NODE=http://localhost:9200

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Crypto Wallets
USDT_CONTRACT_ADDRESS=0xdAC17F958D2ee523a2206206994597C13D831ec7
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
POLYGON_RPC_URL=https://polygon-rpc.com
BSC_RPC_URL=https://bsc-dataseed.binance.org

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Social Media API Keys
INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret
YOUTUBE_API_KEY=your_youtube_api_key
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# OneSignal (Push Notifications)
ONESIGNAL_APP_ID=your_onesignal_app_id
ONESIGNAL_API_KEY=your_onesignal_api_key
```

### مرحله 11: نصب Dependencies

```bash
# نصب dependencies
npm install

# بیلد shared package
cd shared
npm run build
cd ..

# بیلد backend
cd backend
npm run build
cd ..

# بیلد frontend
cd frontend
npm run build
cd ..
```

### مرحله 12: راه‌اندازی با PM2

```bash
# راه‌اندازی backend
pm2 start ecosystem.config.js

# ذخیره تنظیمات PM2
pm2 save

# مشاهده لاگ‌ها
pm2 logs

# مشاهده وضعیت
pm2 status
```

### مرحله 13: تنظیم Nginx

```bash
sudo nano /etc/nginx/sites-available/influencer-platform
```

**محتوای فایل nginx:**

```nginx
# Backend API
upstream backend {
    server 127.0.0.1:5000;
}

# Frontend
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend (Next.js)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Socket.IO
    location /socket.io {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Static files
    location /_next/static {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 60m;
    }

    # Uploads
    location /uploads {
        alias /var/www/PlatformArsalanInfl/backend/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# فعال‌سازی سایت
sudo ln -s /etc/nginx/sites-available/influencer-platform /etc/nginx/sites-enabled/

# حذف سایت پیش‌فرض
sudo rm /etc/nginx/sites-enabled/default

# تست تنظیمات
sudo nginx -t

# راه‌اندازی مجدد Nginx
sudo systemctl restart nginx
```

### مرحله 14: نصب SSL با Let's Encrypt

```bash
# نصب Certbot
sudo apt install -y certbot python3-certbot-nginx

# دریافت گواهی SSL
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# تست تمدید خودکار
sudo certbot renew --dry-run
```

### مرحله 15: تنظیم Firewall

```bash
# فعال‌سازی UFW
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable

# بررسی وضعیت
sudo ufw status
```

---

## 🔧 مدیریت سرویس‌ها

### مدیریت PM2

```bash
# مشاهده وضعیت
pm2 status

# راه‌اندازی مجدد
pm2 restart all

# توقف
pm2 stop all

# حذف از PM2
pm2 delete all

# مشاهده لاگ‌ها
pm2 logs

# مانیتورینگ
pm2 monit
```

### مدیریت MongoDB

```bash
# بررسی وضعیت
sudo systemctl status mongod

# راه‌اندازی مجدد
sudo systemctl restart mongod

# مشاهده لاگ‌ها
sudo journalctl -u mongod -f

# اتصال به MongoDB Shell
mongosh
```

### مدیریت PostgreSQL

```bash
# بررسی وضعیت
sudo systemctl status postgresql

# راه‌اندازی مجدد
sudo systemctl restart postgresql

# اتصال به PostgreSQL
sudo -u postgres psql influencer_platform
```

### مدیریت Redis

```bash
# بررسی وضعیت
sudo systemctl status redis

# راه‌اندازی مجدد
sudo systemctl restart redis

# اتصال به Redis CLI
redis-cli
```

---

## 📊 بکاپ‌گیری

### بکاپ MongoDB

```bash
# بکاپ کامل
mongodump --out=/backup/mongodb/$(date +%Y%m%d)

# ریستور
mongorestore /backup/mongodb/20231122
```

### بکاپ PostgreSQL

```bash
# بکاپ
sudo -u postgres pg_dump influencer_platform > /backup/postgres/db_$(date +%Y%m%d).sql

# ریستور
sudo -u postgres psql influencer_platform < /backup/postgres/db_20231122.sql
```

### بکاپ خودکار (Cron)

```bash
# ویرایش crontab
crontab -e

# اضافه کردن بکاپ روزانه در ساعت 2 بامداد
0 2 * * * mongodump --out=/backup/mongodb/$(date +\%Y\%m\%d)
0 2 * * * sudo -u postgres pg_dump influencer_platform > /backup/postgres/db_$(date +\%Y\%m\%d).sql
```

---

## 🐛 عیب‌یابی

### مشکلات رایج

**1. Backend شروع نمی‌شود:**
```bash
# بررسی لاگ‌ها
pm2 logs backend
# بررسی اتصال به دیتابیس
mongosh
psql -U platform_user -d influencer_platform
```

**2. Frontend build نمی‌شود:**
```bash
# حذف node_modules و نصب مجدد
cd frontend
rm -rf node_modules .next
npm install
npm run build
```

**3. Nginx خطا می‌دهد:**
```bash
# تست تنظیمات
sudo nginx -t
# مشاهده لاگ خطاها
sudo tail -f /var/log/nginx/error.log
```

---

## 🔒 امنیت

### چک‌لیست امنیتی

- [ ] تغییر تمام رمزهای پیش‌فرض
- [ ] فعال‌سازی Firewall
- [ ] نصب SSL Certificate
- [ ] تنظیم Rate Limiting
- [ ] غیرفعال کردن root login در SSH
- [ ] فعال‌سازی 2FA برای admin
- [ ] بکاپ‌گیری منظم
- [ ] آپدیت منظم سیستم
- [ ] مانیتورینگ لاگ‌ها

---

## 📈 مانیتورینگ

### نصب Monitoring Tools (اختیاری)

```bash
# نصب htop
sudo apt install -y htop

# نصب netdata برای مانیتورینگ real-time
bash <(curl -Ss https://my-netdata.io/kickstart.sh)
```

---

## ✅ بررسی نصب موفق

پس از تکمیل نصب، موارد زیر را بررسی کنید:

```bash
# 1. بررسی وضعیت سرویس‌ها
sudo systemctl status mongod
sudo systemctl status postgresql
sudo systemctl status redis
sudo systemctl status elasticsearch
sudo systemctl status nginx

# 2. بررسی PM2
pm2 status

# 3. تست Backend API
curl http://localhost:5000/api/health

# 4. تست Frontend
curl http://localhost:3000

# 5. تست از مرورگر
# باز کردن http://your-domain.com در مرورگر
```

---

## 🎉 تبریک!

پلتفرم شما با موفقیت نصب شد!

**دسترسی:**
- Frontend: https://your-domain.com
- Backend API: https://your-domain.com/api
- Admin Panel: https://your-domain.com/admin

**اطلاعات ورود پیش‌فرض:**
- Email: admin@platform.com
- Password: Admin@123456

⚠️ **هشدار امنیتی:** حتماً رمز عبور پیش‌فرض را تغییر دهید!

---

## 📞 پشتیبانی

در صورت بروز مشکل:
1. لاگ‌ها را بررسی کنید
2. مستندات را مطالعه کنید
3. Issue در GitHub ایجاد کنید
