# Blood Bank Management System - Backend Setup Guide

This guide explains how to set up a backend server to work with the Blood Bank Management System frontend.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB or SQL database (your choice)
- Backend framework (Express.js recommended)

## API Configuration

The frontend expects the backend to be available at `http://localhost:5000/api` by default. You can change this by setting the `NEXT_PUBLIC_API_URL` environment variable.

### Environment Setup

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Required API Endpoints

### Authentication Endpoints

#### POST `/api/login`
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "admin",
    "phone": "555-1234"
  }
}
```

#### POST `/api/register`
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "staff",
  "phone": "555-1234"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "staff",
    "phone": "555-1234"
  }
}
```

### User Management Endpoints

#### GET `/api/users`
Returns all users. Requires authentication.
**Response:**
```json
[
  {
    "id": 1,
    "email": "admin@bloodbank.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin",
    "phone": "555-0000",
    "status": "Active"
  }
]
```

#### PUT `/api/users/:id/status`
Update user status.
**Request:**
```json
{
  "status": "Inactive"
}
```

#### DELETE `/api/users/:id`
Delete a user.

### Blood Inventory Endpoints

#### GET `/api/inventory`
Returns all blood inventory items.
**Response:**
```json
[
  {
    "id": 1,
    "bloodGroup": "A+",
    "units": 15,
    "expiryDate": "2024-12-31",
    "status": "Available"
  }
]
```

#### POST `/api/inventory`
Add new blood inventory.
**Request:**
```json
{
  "bloodGroup": "A+",
  "units": 10,
  "expiryDate": "2024-12-31"
}
```

#### PUT `/api/inventory/:id`
Update blood inventory.
**Request:**
```json
{
  "bloodGroup": "A+",
  "units": 20,
  "expiryDate": "2024-12-31"
}
```

#### DELETE `/api/inventory/:id`
Delete blood inventory item.

### Donor Management Endpoints

#### GET `/api/donors`
Returns all donors.
**Response:**
```json
[
  {
    "id": 1,
    "name": "John Smith",
    "bloodGroup": "A+",
    "phone": "555-0101",
    "email": "john@example.com",
    "lastDonationDate": "2024-08-15"
  }
]
```

#### POST `/api/donors`
Add new donor.
**Request:**
```json
{
  "name": "John Smith",
  "bloodGroup": "A+",
  "phone": "555-0101",
  "email": "john@example.com"
}
```

#### PUT `/api/donors/:id`
Update donor information.

#### DELETE `/api/donors/:id`
Delete donor.

### Blood Requests Endpoints

#### GET `/api/requests`
Returns all blood requests.
**Response:**
```json
[
  {
    "id": 1,
    "hospitalName": "City Hospital",
    "bloodGroup": "A+",
    "units": 2,
    "urgency": "High",
    "status": "Pending",
    "requestDate": "2024-08-28"
  }
]
```

#### POST `/api/requests`
Create new blood request.
**Request:**
```json
{
  "hospitalName": "City Hospital",
  "bloodGroup": "A+",
  "units": 2,
  "urgency": "High"
}
```

#### PUT `/api/requests/:id`
Update request status.
**Request:**
```json
{
  "status": "Approved"
}
```

### Hospital Management Endpoints

#### GET `/api/hospitals`
Returns all hospitals.
**Response:**
```json
[
  {
    "id": 1,
    "name": "City Hospital",
    "phone": "555-1001",
    "address": "123 Main St"
  }
]
```

#### POST `/api/hospitals`
Add new hospital.
**Request:**
```json
{
  "name": "City Hospital",
  "phone": "555-1001",
  "address": "123 Main St"
}
```

#### PUT `/api/hospitals/:id`
Update hospital information.

#### DELETE `/api/hospitals/:id`
Delete hospital.

### Appointment Management Endpoints

#### GET `/api/appointments`
Returns all appointments.
**Response:**
```json
[
  {
    "id": 1,
    "donorName": "John Smith",
    "appointmentDate": "2024-09-05",
    "appointmentTime": "10:00",
    "status": "Scheduled"
  }
]
```

#### POST `/api/appointments`
Create new appointment.
**Request:**
```json
{
  "donorName": "John Smith",
  "appointmentDate": "2024-09-05",
  "appointmentTime": "10:00"
}
```

#### PUT `/api/appointments/:id`
Update appointment.

#### DELETE `/api/appointments/:id`
Delete appointment.

### Statistics Endpoints

#### GET `/api/stats`
Returns system statistics.
**Response:**
```json
{
  "totalBloodUnits": 74,
  "totalDonors": 15,
  "pendingRequests": 3,
  "scheduledAppointments": 5
}
```

## Database Schema Requirements

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  role ENUM('admin', 'hospital', 'staff') NOT NULL,
  phone VARCHAR(20),
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Blood Inventory Table
```sql
CREATE TABLE blood_inventory (
  id INT PRIMARY KEY AUTO_INCREMENT,
  bloodGroup ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
  units INT NOT NULL,
  expiryDate DATE NOT NULL,
  status ENUM('Available', 'Low', 'Critical') DEFAULT 'Available',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Donors Table
```sql
CREATE TABLE donors (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  bloodGroup ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  lastDonationDate DATE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Blood Requests Table
```sql
CREATE TABLE blood_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  hospitalName VARCHAR(255) NOT NULL,
  bloodGroup ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
  units INT NOT NULL,
  urgency ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
  status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
  requestDate DATE NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Hospitals Table
```sql
CREATE TABLE hospitals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Appointments Table
```sql
CREATE TABLE appointments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  donorName VARCHAR(255) NOT NULL,
  appointmentDate DATE NOT NULL,
  appointmentTime TIME NOT NULL,
  status ENUM('Scheduled', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Authentication

The frontend uses JWT (JSON Web Tokens) for authentication. Your backend should:

1. Generate a JWT token upon successful login
2. Include the token in the response
3. Validate the token on protected routes
4. Return the token in the `Authorization` header as `Bearer <token>`

## Error Handling

All API endpoints should return errors in the following format:

```json
{
  "error": "Error message here"
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Sample Express.js Backend Structure

```javascript
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(express.json());

// Database connection setup here
// const db = require('./database');

// Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes
app.post('/api/login', async (req, res) => {
  // Implement login logic
});

app.post('/api/register', async (req, res) => {
  // Implement registration logic
});

// Protected routes
app.get('/api/users', authenticateToken, async (req, res) => {
  // Get all users
});

// Add other routes following the API specifications above

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Testing Your Backend

Once your backend is running, test the endpoints using tools like:
- Postman
- curl
- Browser DevTools

Example curl command to test login:
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bloodbank.com","password":"admin123"}'
```

## Security Considerations

1. Always use HTTPS in production
2. Implement proper password hashing (bcrypt recommended)
3. Use environment variables for sensitive data
4. Implement rate limiting to prevent abuse
5. Validate and sanitize all input data
6. Use parameterized queries to prevent SQL injection
7. Implement proper CORS configuration

## Deployment

For production deployment:

1. Set up a production database
2. Configure environment variables
3. Enable HTTPS
4. Set up proper logging and monitoring
5. Implement backup strategies
6. Configure proper CORS settings for your domain

## Troubleshooting

### Connection Issues
- Ensure backend is running on the correct port
- Check firewall settings
- Verify CORS configuration
- Check network connectivity

### Authentication Issues
- Verify JWT secret is consistent
- Check token expiration
- Ensure proper token validation
- Verify user role permissions

### Database Issues
- Check database connection
- Verify database schema matches requirements
- Check for proper indexing
- Ensure proper data types

## Support

For issues with the frontend, refer to the main project documentation. For backend-specific issues, consult your backend framework's documentation.