# Blood Bank Management System - Deployment Guide

This guide covers deploying the Blood Bank Management System to production hosting platforms.

## Architecture Overview

The system consists of two parts:
- **Frontend**: Next.js application (can be deployed to Vercel, Netlify, etc.)
- **Backend**: Node.js/Express server with SQLite database (needs server hosting)

## Deployment Options

### Option 1: Vercel (Frontend) + Railway/Render (Backend)

#### Frontend Deployment (Vercel)

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/bloodbank-management-system.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure environment variables:
     - `NEXT_PUBLIC_API_URL`: Your backend API URL (e.g., `https://your-backend.railway.app`)
   - Click "Deploy"

3. **Environment Variables in Vercel**
   - Go to Project Settings → Environment Variables
   - Add: `NEXT_PUBLIC_API_URL` = `https://your-backend-domain.com`

#### Backend Deployment (Railway)

1. **Create a `Dockerfile` for the backend**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install --production
   COPY . .
   EXPOSE 5000
   CMD ["node", "server.js"]
   ```

2. **Deploy to Railway**
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Configure the backend service
   - Railway will automatically detect the Node.js app
   - Set environment variables if needed

3. **Get your backend URL**
   - Railway will provide a URL like `https://your-backend.railway.app`
   - Use this URL in your Vercel frontend configuration

### Option 2: Netlify (Frontend) + Heroku (Backend)

#### Frontend Deployment (Netlify)

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop the `.next` folder or connect GitHub
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `.next`
   - Add environment variable: `NEXT_PUBLIC_API_URL`

#### Backend Deployment (Heroku)

1. **Create a `Procfile` in the backend folder**
   ```
   web: node server.js
   ```

2. **Deploy to Heroku**
   ```bash
   cd backend
   heroku create your-bloodbank-backend
   git push heroku main
   heroku config:set JWT_SECRET=your-production-secret
   ```

### Option 3: Single Server Deployment (VPS)

For complete control, deploy both frontend and backend on a VPS like DigitalOcean, AWS, or Linode.

1. **Server Setup**
   ```bash
   # Install Node.js and PM2
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo npm install -g pm2

   # Clone your repository
   git clone https://github.com/yourusername/bloodbank-management-system.git
   cd bloodbank-management-system
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   pm2 start server.js --name bloodbank-backend
   pm2 save
   pm2 startup
   ```

3. **Frontend Setup**
   ```bash
   cd ..
   npm install
   npm run build
   pm2 start npm --name bloodbank-frontend -- start
   pm2 save
   ```

4. **Nginx Configuration**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Host $host;
       }
   }
   ```

## Environment Variables

### Frontend (.env)
```
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

### Backend (.env for production)
```
PORT=5000
JWT_SECRET=your-secure-random-secret-key
NODE_ENV=production
```

## Security Considerations

1. **JWT Secret**: Use a strong, random JWT secret in production
2. **HTTPS**: Always use HTTPS in production
3. **Database**: Consider migrating from SQLite to PostgreSQL for production
4. **CORS**: Restrict CORS origins to your frontend domain
5. **Rate Limiting**: Implement rate limiting on API endpoints
6. **Input Validation**: Ensure all inputs are validated and sanitized

## Database Migration (Optional)

For production, consider migrating from SQLite to PostgreSQL:

1. **Update backend dependencies**
   ```bash
   npm install pg
   ```

2. **Update database connection in server.js**
   ```javascript
   const { Pool } = require('pg');
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
   });
   ```

3. **Use Railway/Heroku PostgreSQL** for managed database hosting

## Post-Deployment Checklist

- [ ] Update environment variables with production values
- [ ] Test all API endpoints
- [ ] Verify authentication flow
- [ ] Test CRUD operations
- [ ] Check responsive design on mobile devices
- [ ] Set up monitoring and error tracking
- [ ] Configure backup strategy for database
- [ ] Set up SSL certificates
- [ ] Test payment flows (if applicable)
- [ ] Configure email services (if needed)

## Troubleshooting

### Frontend Issues
- **API Connection Errors**: Check `NEXT_PUBLIC_API_URL` is correct
- **Build Failures**: Check Node.js version compatibility
- **Static Assets**: Ensure all assets are properly built

### Backend Issues
- **Database Connection**: Check database file permissions
- **Port Conflicts**: Ensure ports 3000 and 5000 are available
- **CORS Errors**: Verify CORS configuration
- **Memory Issues**: Monitor server resources

## Monitoring and Maintenance

1. **Set up logging**: Use Winston or similar for backend logging
2. **Error tracking**: Consider Sentry for error monitoring
3. **Performance monitoring**: Use Vercel Analytics or similar
4. **Regular backups**: Backup database regularly
5. **Update dependencies**: Keep packages updated for security

## Support

For deployment issues:
- Vercel: [vercel.com/docs](https://vercel.com/docs)
- Railway: [docs.railway.app](https://docs.railway.app)
- Netlify: [docs.netlify.com](https://docs.netlify.com)
- Heroku: [devcenter.heroku.com](https://devcenter.heroku.com)
