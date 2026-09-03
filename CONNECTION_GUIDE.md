# Frontend-Backend Connection Guide

This guide will help you connect your Blood Bank Management System frontend with the existing backend.

## 🚀 Quick Start Connection

### Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 2: Start the Backend Server

```bash
# In the backend directory
npm start
```

The backend will start on `http://localhost:5000` and initialize the SQLite database automatically.

### Step 3: Start the Frontend Development Server

```bash
# In the root directory (one level up from backend)
npm run dev
```

The frontend will start on `http://localhost:3000`

### Step 4: Login to the Application

Open your browser and go to `http://localhost:3000/login`

**Default Credentials:**
- **Admin:** admin@bloodbank.com / admin123
- **Hospital:** hospital@bloodbank.com / hospital123  
- **Staff:** staff@bloodbank.com / staff123

## 🔧 Backend Configuration

### Current Backend Setup

Your backend is already configured with:
- **Port:** 5000
- **Database:** SQLite (bloodbank.db)
- **Authentication:** JWT tokens
- **CORS:** Enabled for all origins
- **Default Users:** 3 users (admin, hospital, staff)

### Backend Features

The backend includes:
- ✅ User authentication with JWT
- ✅ Role-based access control
- ✅ Blood inventory management
- ✅ Donor management
- ✅ Blood request handling
- ✅ Hospital management
- ✅ Appointment scheduling
- ✅ Dashboard statistics
- ✅ Sample data initialization

## 🌐 Frontend Configuration

### Default API Configuration

The frontend is configured to connect to:
```
http://localhost:5000/api
```

This matches your backend setup perfectly!

### Environment Variables (Optional)

If you need to change the backend URL, create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 📊 API Endpoint Compatibility

### Authentication ✅

**Backend:** `POST /api/login`
**Frontend:** `POST /api/login`

**Request:**
```json
{
  "email": "admin@bloodbank.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "admin@bloodbank.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin",
    "hospitalId": null
  }
}
```

### Data Endpoints ✅

All endpoints are compatible:

| Frontend Call | Backend Endpoint | Status |
|--------------|------------------|--------|
| `usersApi.getAll()` | `GET /api/users` | ✅ Compatible |
| `inventoryApi.getAll()` | `GET /api/inventory` | ✅ Compatible |
| `donorsApi.getAll()` | `GET /api/donors` | ✅ Compatible |
| `requestsApi.getAll()` | `GET /api/requests` | ✅ Compatible |
| `hospitalsApi.getAll()` | `GET /api/hospitals` | ✅ Compatible |
| `appointmentsApi.getAll()` | `GET /api/appointments` | ✅ Compatible |
| `statsApi.get()` | `GET /api/stats` | ✅ Compatible |

## 🔍 Troubleshooting Connection Issues

### Backend Not Running

**Problem:** Frontend shows "API request failed" errors

**Solution:**
1. Check if backend is running: `http://localhost:5000`
2. Look for "Backend server running on http://localhost:5000" message
3. Restart backend: `cd backend && npm start`

### Port Already in Use

**Problem:** Backend fails to start with "EADDRINUSE" error

**Solution:**
1. Find process using port 5000:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   
   # Mac/Linux
   lsof -ti:5000 | xargs kill -9
   ```
2. Or change backend port in `backend/server.js`:
   ```javascript
   const PORT = 5001; // Change to available port
   ```

### CORS Issues

**Problem:** Browser shows CORS errors

**Solution:** Your backend already has CORS enabled. If you still have issues, check the backend CORS configuration in `server.js` line 12.

### Database Issues

**Problem:** Backend shows database connection errors

**Solution:**
1. Delete the existing database file: `backend/bloodbank.db`
2. Restart backend - it will recreate the database
3. Check write permissions in the backend directory

### Login Failures

**Problem:** Valid credentials not working

**Solution:**
1. Check the backend console for error messages
2. Verify the database was initialized properly
3. Try the default credentials:
   - admin@bloodbank.com / admin123
   - hospital@bloodbank.com / hospital123
   - staff@bloodbank.com / staff123

## 📱 Testing the Connection

### 1. Test Backend Directly

```bash
# Test backend root endpoint
curl http://localhost:5000

# Test login endpoint
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bloodbank.com","password":"admin123"}'
```

### 2. Test Frontend Connection

1. Open browser to `http://localhost:3000`
2. Navigate to login page
3. Enter credentials: admin@bloodbank.com / admin123
4. Click "Sign in"
5. Should redirect to dashboard

### 3. Check Network Requests

1. Open browser DevTools (F12)
2. Go to Network tab
3. Login to the application
4. Check for successful API calls to `http://localhost:5000/api/*`

## 🔄 Development Workflow

### For Backend Development

```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

### For Frontend Development

```bash
npm run dev  # Next.js dev server
```

### For Full Stack Development

Open two terminal windows:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

## 🗄️ Database Management

### View Database Contents

```bash
cd backend
sqlite3 bloodbank.db
.tables
SELECT * FROM users;
.quit
```

### Reset Database

```bash
cd backend
rm bloodbank.db
npm start  # Will recreate with sample data
```

### Backup Database

```bash
cd backend
cp bloodbank.db bloodbank-backup.db
```

## 🚀 Production Deployment

### Backend Deployment

1. **Environment Variables:**
   ```bash
   export JWT_SECRET=your-secure-secret-key
   export PORT=5000
   ```

2. **Database:** Consider switching to PostgreSQL or MySQL for production

3. **Process Manager:** Use PM2 to keep the backend running:
   ```bash
   npm install -g pm2
   pm2 start backend/server.js --name bloodbank-api
   ```

### Frontend Deployment

1. **Build the frontend:**
   ```bash
   npm run build
   ```

2. **Set environment variable:**
   ```bash
   export NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
   ```

3. **Start production server:**
   ```bash
   npm start
   ```

## 📝 Quick Reference

### Start Both Servers

```bash
# Terminal 1 - Backend
cd backend && npm start

# Terminal 2 - Frontend  
npm run dev
```

### Default Credentials

- **Admin:** admin@bloodbank.com / admin123
- **Hospital:** hospital@bloodbank.com / hospital123
- **Staff:** staff@bloodbank.com / staff123

### Important URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **Backend Root:** http://localhost:5000

### Key Files

- **Backend:** `backend/server.js`
- **Frontend API:** `src/lib/api.ts`
- **Frontend Auth:** `src/contexts/AuthContext.tsx`

## ✅ Connection Checklist

Before starting, ensure:

- [ ] Backend dependencies installed (`cd backend && npm install`)
- [ ] Backend starts successfully (`cd backend && npm start`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Frontend starts successfully (`npm run dev`)
- [ ] Can access backend at http://localhost:5000
- [ ] Can access frontend at http://localhost:3000
- [ ] Login works with default credentials
- [ ] Dashboard loads after login

## 🆘 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "API request failed" | Ensure backend is running on port 5000 |
| "Invalid credentials" | Use default credentials or check database |
| CORS errors | Check backend CORS configuration |
| Database locked | Ensure only one backend instance is running |
| Port already in use | Kill process using port 5000 or change port |

## 🎯 Next Steps

Once connected:

1. **Test all features** - Try creating donors, managing inventory, etc.
2. **Review sample data** - The backend creates sample blood inventory and hospitals
3. **Customize users** - Add your own users through the registration or directly in database
4. **Modify data** - Update sample data to match your requirements

Your Blood Bank Management System is now ready to use! 🎉