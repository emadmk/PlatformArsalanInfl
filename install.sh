#!/bin/bash

###############################################################################
# اسکریپت نصب خودکار پلتفرم مایکرو اینفلوئنسر
# برای Ubuntu 22.04 LTS
###############################################################################

set -e  # خروج در صورت بروز خطا

# رنگ‌ها برای output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# توابع کمکی
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_header() {
    echo ""
    echo -e "${BLUE}================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================================${NC}"
    echo ""
}

# بررسی اجرا با root
if [[ $EUID -ne 0 ]]; then
   print_error "این اسکریپت باید با دسترسی root اجرا شود (sudo ./install.sh)"
   exit 1
fi

print_header "🚀 نصب خودکار پلتفرم مایکرو اینفلوئنسر"

# دریافت اطلاعات از کاربر
print_info "لطفاً اطلاعات زیر را وارد کنید:"
echo ""

read -p "نام دامنه (مثال: example.com): " DOMAIN
read -p "ایمیل برای SSL (مثال: admin@example.com): " SSL_EMAIL
read -sp "رمز عبور PostgreSQL: " POSTGRES_PASSWORD
echo ""
read -sp "JWT Secret Key: " JWT_SECRET
echo ""
read -sp "JWT Refresh Secret Key: " JWT_REFRESH_SECRET
echo ""

print_header "مرحله 1/12: آپدیت سیستم"
apt update
apt upgrade -y
print_success "سیستم بروزرسانی شد"

print_header "مرحله 2/12: نصب ابزارهای پایه"
apt install -y curl wget git build-essential software-properties-common apt-transport-https ca-certificates gnupg
print_success "ابزارهای پایه نصب شد"

print_header "مرحله 3/12: نصب Node.js 18"
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
node_version=$(node --version)
print_success "Node.js $node_version نصب شد"

print_header "مرحله 4/12: نصب MongoDB"
curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-server-6.0.gpg
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt update
apt install -y mongodb-org
systemctl enable mongod
systemctl start mongod
print_success "MongoDB نصب و راه‌اندازی شد"

print_header "مرحله 5/12: نصب PostgreSQL"
apt install -y postgresql postgresql-contrib
systemctl enable postgresql
systemctl start postgresql

# ایجاد دیتابیس و کاربر
sudo -u postgres psql <<EOF
DROP DATABASE IF EXISTS influencer_platform;
DROP USER IF EXISTS platform_user;
CREATE DATABASE influencer_platform;
CREATE USER platform_user WITH PASSWORD '$POSTGRES_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE influencer_platform TO platform_user;
ALTER DATABASE influencer_platform OWNER TO platform_user;
EOF

print_success "PostgreSQL نصب و تنظیم شد"

print_header "مرحله 6/12: نصب Redis"
apt install -y redis-server
sed -i 's/supervised no/supervised systemd/' /etc/redis/redis.conf
systemctl restart redis-server || systemctl start redis-server
systemctl enable redis-server || true
print_success "Redis نصب و راه‌اندازی شد"

print_header "مرحله 7/12: نصب Elasticsearch"
apt install -y openjdk-11-jdk
wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | gpg --dearmor -o /usr/share/keyrings/elasticsearch-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/elasticsearch-keyring.gpg] https://artifacts.elastic.co/packages/8.x/apt stable main" | tee /etc/apt/sources.list.d/elastic-8.x.list
apt update
apt install -y elasticsearch
sed -i 's/xpack.security.enabled: true/xpack.security.enabled: false/' /etc/elasticsearch/elasticsearch.yml
systemctl enable elasticsearch
systemctl start elasticsearch
print_success "Elasticsearch نصب و راه‌اندازی شد"

print_header "مرحله 8/12: نصب Nginx"
apt install -y nginx
systemctl enable nginx
systemctl start nginx
print_success "Nginx نصب و راه‌اندازی شد"

print_header "مرحله 9/12: نصب PM2"
npm install -g pm2
pm2 startup systemd -u root --hp /root
print_success "PM2 نصب شد"

print_header "مرحله 10/12: کلون و نصب پروژه"
PROJECT_DIR="/var/www/PlatformArsalanInfl"

if [ -d "$PROJECT_DIR" ]; then
    print_warning "پوشه پروژه از قبل وجود دارد، در حال حذف..."
    rm -rf "$PROJECT_DIR"
fi

mkdir -p /var/www

# کلون از گیت یا کپی از مسیر فعلی
print_info "در حال کپی کردن پروژه..."
CURRENT_DIR=$(pwd)

# چک کردن که آیا در پوشه پروژه هستیم
if [ -f "$CURRENT_DIR/package.json" ] && [ -d "$CURRENT_DIR/backend" ] && [ -d "$CURRENT_DIR/frontend" ]; then
    print_info "کپی از مسیر فعلی: $CURRENT_DIR"
    cp -r "$CURRENT_DIR" "$PROJECT_DIR"
else
    # تلاش برای پیدا کردن در مسیرهای مختلف
    if [ -d "/root/arsalan/PlatformArsalanInfl" ]; then
        print_info "کپی از /root/arsalan/PlatformArsalanInfl"
        cp -r /root/arsalan/PlatformArsalanInfl "$PROJECT_DIR"
    elif [ -d "/home/user/PlatformArsalanInfl" ]; then
        print_info "کپی از /home/user/PlatformArsalanInfl"
        cp -r /home/user/PlatformArsalanInfl "$PROJECT_DIR"
    else
        # کلون از GitHub
        print_info "کلون از GitHub..."
        git clone https://github.com/emadmk/PlatformArsalanInfl.git "$PROJECT_DIR"
    fi
fi

cd "$PROJECT_DIR"
chown -R root:root "$PROJECT_DIR"

print_header "مرحله 11/12: تنظیم محیط و بیلد"

# ایجاد فایل .env
cat > backend/.env <<EOF
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://$DOMAIN

# MongoDB
MONGODB_URI=mongodb://localhost:27017/influencer_platform

# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=influencer_platform
POSTGRES_USER=platform_user
POSTGRES_PASSWORD=$POSTGRES_PASSWORD

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Elasticsearch
ELASTICSEARCH_NODE=http://localhost:9200

# JWT
JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF

print_success "فایل .env ایجاد شد"

# نصب dependencies
print_info "نصب dependencies (ممکن است چند دقیقه طول بکشد)..."
cd $PROJECT_DIR && npm install

# بیلد shared
print_info "بیلد shared package..."
cd $PROJECT_DIR/shared && npm run build

# بیلد backend
print_info "بیلد backend..."
cd $PROJECT_DIR/backend && npm run build

# بیلد frontend
print_info "بیلد frontend..."
cd $PROJECT_DIR/frontend && npm run build || print_warning "Frontend build با خطا مواجه شد"

print_success "پروژه بیلد شد"

# راه‌اندازی با PM2
print_info "راه‌اندازی با PM2..."
cd $PROJECT_DIR && pm2 start ecosystem.config.js
pm2 save

print_success "پروژه با PM2 راه‌اندازی شد"

print_header "مرحله 12/12: تنظیم Nginx و SSL"

# تنظیم Nginx
cat > /etc/nginx/sites-available/influencer-platform <<EOF
upstream backend {
    server 127.0.0.1:5000;
}

server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /socket.io {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    location /uploads {
        alias $PROJECT_DIR/backend/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

ln -sf /etc/nginx/sites-available/influencer-platform /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl restart nginx
print_success "Nginx تنظیم شد"

# نصب Certbot و SSL
print_info "نصب SSL Certificate..."
apt install -y certbot python3-certbot-nginx
certbot --nginx -d $DOMAIN -d www.$DOMAIN --email $SSL_EMAIL --agree-tos --non-interactive --redirect

print_success "SSL Certificate نصب شد"

print_header "تنظیم Firewall"
ufw allow OpenSSH
ufw allow 'Nginx Full'
echo "y" | ufw enable
print_success "Firewall تنظیم شد"

print_header "✅ نصب با موفقیت تکمیل شد!"
echo ""
print_success "پلتفرم شما آماده استفاده است!"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}اطلاعات دسترسی:${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "Frontend: ${BLUE}https://$DOMAIN${NC}"
echo -e "Backend API: ${BLUE}https://$DOMAIN/api${NC}"
echo -e "Admin Panel: ${BLUE}https://$DOMAIN/admin${NC}"
echo ""
echo -e "${YELLOW}اطلاعات ورود پیش‌فرض:${NC}"
echo -e "Email: ${BLUE}admin@platform.com${NC}"
echo -e "Password: ${BLUE}Admin@123456${NC}"
echo ""
echo -e "${RED}⚠️  هشدار امنیتی: حتماً رمز عبور را تغییر دهید!${NC}"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
print_info "دستورات مفید:"
echo "  - مشاهده وضعیت: pm2 status"
echo "  - مشاهده لاگ‌ها: pm2 logs"
echo "  - راه‌اندازی مجدد: pm2 restart all"
echo ""
print_success "موفق باشید! 🎉"
