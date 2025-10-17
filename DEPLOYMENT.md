# Deployment Guide

## Docker Deployment to Render

### Prerequisites
- Docker installed locally (for testing)
- Render account
- GitHub repository connected to Render

### Local Docker Testing

1. **Build the Docker image:**
   ```bash
   docker build -t neyamot-server .
   ```

2. **Run the container locally:**
   ```bash
   docker run -p 3000:3000 --env-file .env neyamot-server
   ```

3. **Test the application:**
   ```bash
   curl http://localhost:3000/api/v1/health
   ```

### Deploy to Render

#### Option 1: Using render.yaml (Recommended)

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Add Docker configuration for Render"
   git push origin main
   ```

2. **Connect to Render:**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml`

3. **Configure Environment Variables:**
   Set these in the Render dashboard:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `FRONTEND_URL` - Your frontend URL
   - `JWT_SECRET` - Auto-generated or set manually
   - Any other environment variables from your `.env` file

4. **Deploy:**
   - Render will automatically build and deploy using Docker
   - Monitor the build logs in the dashboard

#### Option 2: Manual Setup

1. **Create a new Web Service:**
   - Go to Render Dashboard
   - Click "New +" → "Web Service"
   - Connect your repository

2. **Configure the service:**
   - **Name:** neyamot-server
   - **Runtime:** Docker
   - **Branch:** main
   - **Dockerfile Path:** ./Dockerfile
   - **Instance Type:** Free (or higher for production)

3. **Set Environment Variables:**
   Add all required environment variables in the dashboard

4. **Deploy:**
   Click "Create Web Service"

### Environment Variables Required

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Application
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-frontend.com

# Authentication
JWT_SECRET=your-secret-key

# Email (if using)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

# Payment (if using)
BKASH_APP_KEY=
BKASH_APP_SECRET=

# Add other environment variables as needed
```

### Health Check

The application exposes a health check endpoint at:
```
GET /api/v1/health
```

Render will automatically use this to monitor your application.

### Troubleshooting

**Build fails:**
- Check Docker build logs in Render dashboard
- Ensure all dependencies are in `package.json`
- Verify Prisma schema is correct

**Application crashes:**
- Check application logs in Render dashboard
- Verify all environment variables are set
- Check database connection string

**Database connection issues:**
- Ensure `DATABASE_URL` is correct
- Check if database allows connections from Render's IP
- Verify Prisma migrations are applied

### Prisma Migrations

To run migrations on Render:

1. **Add a build command in render.yaml:**
   ```yaml
   buildCommand: pnpm exec prisma migrate deploy
   ```

2. **Or run manually via Render Shell:**
   - Go to your service in Render dashboard
   - Click "Shell"
   - Run: `npx prisma migrate deploy`

### Scaling

To scale your application:
1. Go to your service in Render dashboard
2. Click "Settings"
3. Change "Instance Type" to a higher tier
4. Adjust "Number of Instances" for horizontal scaling

### Monitoring

- **Logs:** Available in Render dashboard under "Logs" tab
- **Metrics:** View CPU, Memory, and Request metrics in dashboard
- **Alerts:** Set up alerts for downtime or errors

### Cost Optimization

**Free Tier:**
- Service spins down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds

**Paid Tiers:**
- Always-on instances
- Better performance
- More resources
- Custom domains with SSL

### Support

For issues:
- Check [Render Documentation](https://render.com/docs)
- Review application logs
- Check Render status page
