# DEPLOYMENT GUIDE

## 🚀 Deployment Options

### 1. Vercel (Frontend) + Railway (Backend)

#### Frontend Deployment (Vercel)
```bash
# 1. Connect repository to Vercel
# 2. Configure Build Settings
Build Command: npm run build
Output Directory: build
Root Directory: ./

# 3. Set Environment Variables
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-key

# 4. Deploy
# Vercel auto-deploys on git push
```

#### Backend Deployment (Railway)
```bash
# 1. Create Railway account
# 2. Connect Git repository
# 3. Create PostgreSQL database (use Supabase instead)
# 4. Set environment variables
SUPABASE_URL=your-url
SUPABASE_SERVICE_ROLE_KEY=your-key
REDIS_URL=redis://redis:6379
PORT=3000

# 5. Configure start command
start: npm run build && npm start

# 6. Deploy
```

### 2. Docker + Kubernetes

#### Build Docker Image
```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

#### Build and Push
```bash
docker build -t your-registry/tenantflow-backend:latest backend/
docker push your-registry/tenantflow-backend:latest
```

#### Deploy to Kubernetes
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: tenantflow-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: tenantflow-backend
  template:
    metadata:
      labels:
        app: tenantflow-backend
    spec:
      containers:
      - name: backend
        image: your-registry/tenantflow-backend:latest
        ports:
        - containerPort: 3000
        env:
        - name: SUPABASE_URL
          valueFrom:
            secretKeyRef:
              name: supabase
              key: url
        - name: SUPABASE_SERVICE_ROLE_KEY
          valueFrom:
            secretKeyRef:
              name: supabase
              key: service-role-key
---
apiVersion: v1
kind: Service
metadata:
  name: tenantflow-backend
spec:
  selector:
    app: tenantflow-backend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

### 3. Self-hosted (VPS/EC2)

#### Setup Server
```bash
# SSH into server
ssh user@your-server-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Redis
sudo apt-get install -y redis-server

# Install Nginx
sudo apt-get install -y nginx
```

#### Deploy Application
```bash
# Clone repository
cd /home/user
git clone https://github.com/your-repo.git
cd saas-sys

# Install dependencies
npm install
cd backend && npm install && cd ..

# Build
npm run build
cd backend && npm run build && cd ..

# Start with PM2
pm2 start backend/dist/index.js --name tenantflow-backend
pm2 start frontend/build --name tenantflow-frontend
pm2 startup
pm2 save

# Configure Nginx
sudo nano /etc/nginx/sites-available/default
# Configure reverse proxy for port 3000 (backend) and port 4028 (frontend)

sudo systemctl restart nginx
```

#### SSL Certificate (Let's Encrypt)
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot certonly --nginx -d your-domain.com
```

## 📊 Database Setup

### Supabase Project Setup
```bash
# 1. Create project at https://app.supabase.com
# 2. Copy Project URL and Anon Key
# 3. Run migrations

# In Supabase SQL Editor, paste:
supabase/migrations/20260122_complete_schema.sql

# 4. Enable RLS on all tables (already in migration)
# 5. Setup Storage bucket for attachments
```

### Manual Migration
```bash
# Connect to PostgreSQL
psql postgres://user:password@host:5432/database

# Paste migration SQL
\i supabase/migrations/20260122_complete_schema.sql
```

## 🔐 Security Checklist

- [ ] Update `SUPABASE_SERVICE_ROLE_KEY` (never commit)
- [ ] Configure CORS for your domain
- [ ] Enable HTTPS/SSL
- [ ] Setup firewall rules
- [ ] Configure database backups
- [ ] Enable rate limiting
- [ ] Setup monitoring & alerting
- [ ] Configure email service (SendGrid)
- [ ] Setup CDN (CloudFlare)
- [ ] Enable database audit logging

## 📈 Performance Optimization

### Frontend
```bash
# Build optimization
npm run build

# Check bundle size
npm run build -- --analyze
```

### Backend
- Enable query result caching
- Setup Redis for sessions
- Configure database connection pooling
- Add indexes on frequently queried columns

### Database
```sql
-- Add indexes
CREATE INDEX idx_records_tenant_created ON sub_module_records(tenant_id, created_at);
CREATE INDEX idx_records_status ON sub_module_records(status);

-- Analyze
ANALYZE;
```

## 🔍 Monitoring

### Application Health
```bash
# Frontend: Check /health endpoint
curl https://your-app.com/health

# Backend: Check health endpoint
curl https://api.your-app.com/health
```

### Logging
- Setup Sentry for error tracking
- Configure CloudWatch (AWS) or Stackdriver (GCP)
- Monitor Redis memory usage
- Check PostgreSQL slow queries

### Alerts
- 5xx server errors
- Database connection failures
- Email queue failures
- Disk space low
- Memory usage high

## 🚀 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build frontend
        run: npm run build
      
      - name: Build backend
        run: cd backend && npm run build
      
      - name: Run tests
        run: npm test
      
      - name: Deploy to Railway
        run: |
          npm install -g railway
          railway up --service tenantflow-backend
```

## 📝 Environment Variables

### Frontend (.env)
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=
```

### Backend (backend/.env)
```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
REDIS_URL=
PORT=3000
NODE_ENV=production
SENDGRID_API_KEY=
```

## 🆘 Troubleshooting

### Build Errors
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Verify Node version
node --version  # Should be >= 18
```

### Runtime Errors
```bash
# Check logs
pm2 logs tenantflow-backend

# Restart service
pm2 restart tenantflow-backend
```

### Database Issues
```bash
# Check connection
psql $DATABASE_URL -c "SELECT 1"

# Check table existence
\dt  # In psql
```

---

**Deployment Status**: Ready for production ✓  
**Last Updated**: January 2026
