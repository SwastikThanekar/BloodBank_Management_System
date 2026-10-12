# Blood Bank Management System

A comprehensive web application for managing blood bank operations, built with Next.js, TypeScript, Tailwind CSS, Express.js, and SQLite.

## Features

### Pages
- **Login** - Secure authentication with JWT
- **Dashboard** - Overview with statistics, charts, and recent activity
- **Blood Inventory** - Manage blood stock with CRUD operations
- **Donor Management** - Track and manage registered donors
- **Blood Requests** - Handle blood requests with approve/reject functionality
- **Hospital Management** - Manage partner hospitals
- **Appointments** - Schedule and manage donation appointments
- **Reports** - Analytics with charts and statistics
- **Settings** - Profile management and notification preferences

### Key Features
- Responsive sidebar navigation
- Real-time data management with SQLite database
- RESTful API with Express.js
- JWT authentication
- Interactive charts using Recharts
- Modal dialogs for CRUD operations
- Search and filter functionality
- Status badges for visual indicators
- Confirmation dialogs for destructive actions

## Tech Stack

### Frontend
- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide Icons
- **Charts**: Recharts
- **Utilities**: clsx, tailwind-merge, class-variance-authority

### Backend
- **Framework**: Express.js
- **Database**: SQLite
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **CORS**: cors

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Docker and Docker Compose (for Docker deployment)

### Installation

1. Install frontend dependencies:
```bash
npm install
```

2. Install backend dependencies:
```bash
cd backend
npm install
cd ..
```

### Running the Application

#### Option 1: Docker Compose (Recommended)

```bash
# Copy environment file
cp .env.docker .env

# Build and start both services
docker-compose up -d

# Access at http://localhost:3000
```

#### Option 2: Local Development (localhost only)

1. Start the backend server (in a new terminal):
```bash
cd backend
npm run dev
```
The backend will run on http://localhost:5000

2. Start the frontend development server (in another terminal):
```bash
npm run dev
```
The frontend will run on http://localhost:3000

3. Open [http://localhost:3000](http://localhost:3000) in your browser

#### Option 3: Local Development (network accessible)

To access the application from other devices on your local network (192.168.x.x):

1. Start the backend server (in a new terminal):
```bash
cd backend
npm run dev
```
The backend will run on http://0.0.0.0:5000

2. Start the frontend development server (in another terminal):
```bash
npm run dev:network
```
The frontend will run on http://0.0.0.0:3000

3. Find your computer's IP address:
```bash
# Windows
ipconfig

# Linux/Mac
ifconfig
```

4. Update `.env` file in the root directory:
```
NEXT_PUBLIC_API_URL=http://YOUR_IP:5000/api
```
Replace `YOUR_IP` with your actual IP (e.g., `192.168.1.100`)

5. Access from other devices on your network:
```
http://YOUR_IP:3000
```

**Note:** Both frontend and backend must be started before accessing from network devices.

### Default Credentials
- **Admin**: admin@bloodbank.com / admin123
- **Hospital**: hospital@bloodbank.com / hospital123
- **Staff**: staff@bloodbank.com / staff123

### Build for Production

**Frontend:**
```bash
npm run build
npm start
```

**Backend:**
```bash
cd backend
npm start
```

## Project Structure

```
src/
├── app/
│   ├── dashboard/          # Dashboard page
│   ├── inventory/          # Blood inventory page
│   ├── donors/             # Donor management page
│   ├── requests/           # Blood requests page
│   ├── hospitals/          # Hospital management page
│   ├── appointments/       # Appointments page
│   ├── reports/            # Reports page
│   ├── settings/           # Settings page
│   ├── login/              # Login page
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page (redirects to login)
│   └── globals.css         # Global styles
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx      # Sidebar navigation
│   │   ├── navbar.tsx       # Top navigation bar
│   │   └── main-layout.tsx  # Main layout wrapper
│   ├── ui/                 # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   ├── table.tsx
│   │   ├── dialog.tsx
│   │   └── label.tsx
│   └── common/
│       ├── search-bar.tsx   # Search input component
│       └── confirmation-dialog.tsx  # Confirmation dialog
└── lib/
    └── utils.ts            # Utility functions
```

## Design System

### Colors
- **Primary**: #D32F2F (Blood Red)
- **Secondary**: #1976D2 (Blue)
- **Background**: #F8F9FA
- **Card**: White with subtle shadow
- **Border Radius**: 10px

### Typography
- **Font**: Inter
- **Sizes**: Responsive scaling

## Deployment

This project includes Docker support for easy deployment. See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions including:

- **Docker Compose**: Deploy both frontend and backend together
- **Vercel + Railway**: Deploy frontend to Vercel and backend to Railway
- **Netlify + Heroku**: Alternative cloud deployment
- **VPS**: Deploy to your own server with Nginx

Quick Docker deployment:
```bash
cp .env.docker .env
docker-compose up -d
```

## Future Enhancements

This project is designed to be modular and easily extensible. Future additions may include:

- Backend API integration
- Real database connectivity
- User authentication and authorization
- Advanced reporting features
- Email/SMS notifications
- Mobile app version

## License

This project is for educational purposes as a college major project.
