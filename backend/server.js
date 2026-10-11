const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'bloodbank-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Blood Bank Management System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/login',
      inventory: '/api/inventory',
      donors: '/api/donors',
      requests: '/api/requests',
      hospitals: '/api/hospitals',
      appointments: '/api/appointments',
      stats: '/api/stats'
    }
  });
});

// Health check endpoint for deployment platforms
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Database initialization
const dbPath = process.env.DATABASE_PATH || './bloodbank.db';
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
  }
});

// Initialize database tables with proper sequencing
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const tables = [
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        firstName TEXT,
        lastName TEXT,
        role TEXT NOT NULL DEFAULT 'admin',
        phone TEXT,
        hospitalId INTEGER,
        status TEXT DEFAULT 'Active',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (hospitalId) REFERENCES hospitals(id)
      )`,
      `CREATE TABLE IF NOT EXISTS hospitals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        address TEXT,
        phone TEXT,
        email TEXT,
        contactPerson TEXT,
        status TEXT DEFAULT 'Active',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS blood_inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bloodGroup TEXT NOT NULL,
        units INTEGER NOT NULL,
        status TEXT DEFAULT 'Available',
        expiryDate DATE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS donors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        bloodGroup TEXT NOT NULL,
        age INTEGER,
        gender TEXT,
        phone TEXT,
        email TEXT,
        lastDonationDate DATE,
        totalDonations INTEGER DEFAULT 0,
        status TEXT DEFAULT 'Active',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS blood_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hospitalId INTEGER,
        bloodGroup TEXT NOT NULL,
        units INTEGER NOT NULL,
        urgency TEXT DEFAULT 'Normal',
        status TEXT DEFAULT 'Pending',
        requestDate DATE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (hospitalId) REFERENCES hospitals(id)
      )`,
      `CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        donorId INTEGER,
        date DATE NOT NULL,
        time TEXT NOT NULL,
        status TEXT DEFAULT 'Scheduled',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (donorId) REFERENCES donors(id)
      )`
    ];

    let index = 0;
    const createNextTable = () => {
      if (index < tables.length) {
        db.run(tables[index], (err) => {
          if (err) {
            reject(err);
          } else {
            index++;
            createNextTable();
          }
        });
      } else {
        // Insert default admin user
        const adminPassword = bcrypt.hashSync('admin123', 10);
        db.run(`INSERT OR IGNORE INTO users (email, password, firstName, lastName, role) 
          VALUES (?, ?, 'Admin', 'User', 'admin')`, ['admin@bloodbank.com', adminPassword], (err) => {
          if (err) reject(err);
          else {
            // Insert default hospital user
            const hospitalPassword = bcrypt.hashSync('hospital123', 10);
            db.run(`INSERT OR IGNORE INTO users (email, password, firstName, lastName, role) 
              VALUES (?, ?, 'Hospital', 'Staff', 'hospital')`, ['hospital@bloodbank.com', hospitalPassword], (err) => {
              if (err) reject(err);
              else {
                // Insert default staff user
                const staffPassword = bcrypt.hashSync('staff123', 10);
                db.run(`INSERT OR IGNORE INTO users (email, password, firstName, lastName, role) 
                  VALUES (?, ?, 'Staff', 'Member', 'staff')`, ['staff@bloodbank.com', staffPassword], (err) => {
                  if (err) reject(err);
                  else insertSampleData().then(resolve).catch(reject);
                });
              }
            });
          }
        });
      }
    };

    createNextTable();
  });
}

function insertSampleData() {
  return new Promise((resolve, reject) => {
    // Insert sample blood inventory if empty
    db.get("SELECT COUNT(*) as count FROM blood_inventory", (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      if (row.count === 0) {
        const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        bloodGroups.forEach(group => {
          // Set expiry date to 30 days from now in YYYY-MM-DD format
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 30);
          const formattedDate = expiryDate.toISOString().split('T')[0];
          
          db.run(`INSERT INTO blood_inventory (bloodGroup, units, status, expiryDate) 
            VALUES (?, ?, 'Available', ?)`, 
            [group, Math.floor(Math.random() * 50) + 20, formattedDate]);
        });
      }
    });

    // Insert sample hospitals if empty
    db.get("SELECT COUNT(*) as count FROM hospitals", (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      if (row.count === 0) {
        const hospitals = [
          ['City Hospital', '123 Main St', '555-0101', 'city@hospital.com', 'Dr. Smith'],
          ['General Hospital', '456 Oak Ave', '555-0102', 'general@hospital.com', 'Dr. Johnson'],
          ['Memorial Hospital', '789 Pine Rd', '555-0103', 'memorial@hospital.com', 'Dr. Williams']
        ];
        hospitals.forEach(h => {
          db.run(`INSERT INTO hospitals (name, address, phone, email, contactPerson) VALUES (?, ?, ?, ?, ?)`, h);
        });
      }
    });

    setTimeout(resolve, 500);
  });
}

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

// Auth routes
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.status !== 'Active') {
      return res.status(403).json({ error: 'Account is inactive' });
    }

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        firstName: user.firstName, 
        lastName: user.lastName, 
        role: user.role,
        hospitalId: user.hospitalId
      }
    });
  });
});

// Register new user
app.post('/api/register', (req, res) => {
  const { email, password, firstName, lastName, role, phone, hospitalId } = req.body;

  // Validate required fields
  if (!email || !password || !firstName || !lastName || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Validate role
  const validRoles = ['admin', 'hospital', 'staff'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  // Hash password
  const hashedPassword = bcrypt.hashSync(password, 10);

  db.run(
    `INSERT INTO users (email, password, firstName, lastName, role, phone, hospitalId) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [email, hashedPassword, firstName, lastName, role, phone || null, hospitalId || null],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint')) {
          return res.status(400).json({ error: 'Email already exists' });
        }
        return res.status(500).json({ error: err.message });
      }
      
      // Get the created user
      db.get("SELECT * FROM users WHERE id = ?", [this.lastID], (err, user) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ 
          message: 'User created successfully',
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            hospitalId: user.hospitalId
          }
        });
      });
    }
  );
});

// Get all users (admin only)
app.get('/api/users', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  db.all("SELECT id, email, firstName, lastName, role, phone, hospitalId, status, createdAt FROM users ORDER BY createdAt DESC", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Update user status (admin only)
app.put('/api/users/:id/status', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { status } = req.body;
  const { id } = req.params;

  db.run("UPDATE users SET status = ? WHERE id = ?", [status, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'User status updated successfully' });
    }
  });
});

// Delete user (admin only)
app.delete('/api/users/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { id } = req.params;

  db.run("DELETE FROM users WHERE id = ?", [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'User deleted successfully' });
    }
  });
});

// Blood Inventory routes
app.get('/api/inventory', (req, res) => {
  db.all("SELECT * FROM blood_inventory ORDER BY bloodGroup", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

app.post('/api/inventory', authenticateToken, (req, res) => {
  const { bloodGroup, units, expiryDate } = req.body;
  const status = units < 10 ? 'Critical' : units < 20 ? 'Low' : 'Available';

  db.run(`INSERT INTO blood_inventory (bloodGroup, units, status, expiryDate) VALUES (?, ?, ?, ?)`,
    [bloodGroup, units, status, expiryDate],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id: this.lastID, bloodGroup, units, status, expiryDate });
      }
    }
  );
});

app.put('/api/inventory/:id', authenticateToken, (req, res) => {
  const { bloodGroup, units, expiryDate } = req.body;
  const status = units < 10 ? 'Critical' : units < 20 ? 'Low' : 'Available';

  db.run(`UPDATE blood_inventory SET bloodGroup = ?, units = ?, status = ?, expiryDate = ? WHERE id = ?`,
    [bloodGroup, units, status, expiryDate, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id: req.params.id, bloodGroup, units, status, expiryDate });
      }
    }
  );
});

app.delete('/api/inventory/:id', authenticateToken, (req, res) => {
  db.run("DELETE FROM blood_inventory WHERE id = ?", [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Deleted successfully' });
    }
  });
});

// Donors routes
app.get('/api/donors', (req, res) => {
  db.all("SELECT * FROM donors ORDER BY name", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

app.post('/api/donors', authenticateToken, (req, res) => {
  const { name, bloodGroup, age, gender, phone, email } = req.body;

  db.run(`INSERT INTO donors (name, bloodGroup, age, gender, phone, email) VALUES (?, ?, ?, ?, ?, ?)`,
    [name, bloodGroup, age, gender, phone, email],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id: this.lastID, name, bloodGroup, age, gender, phone, email });
      }
    }
  );
});

app.put('/api/donors/:id', authenticateToken, (req, res) => {
  const { name, bloodGroup, age, gender, phone, email } = req.body;

  db.run(`UPDATE donors SET name = ?, bloodGroup = ?, age = ?, gender = ?, phone = ?, email = ? WHERE id = ?`,
    [name, bloodGroup, age, gender, phone, email, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id: req.params.id, name, bloodGroup, age, gender, phone, email });
      }
    }
  );
});

app.delete('/api/donors/:id', authenticateToken, (req, res) => {
  db.run("DELETE FROM donors WHERE id = ?", [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Deleted successfully' });
    }
  });
});

// Blood Requests routes
app.get('/api/requests', (req, res) => {
  db.all(`SELECT br.*, h.name as hospitalName FROM blood_requests br 
    LEFT JOIN hospitals h ON br.hospitalId = h.id ORDER BY br.createdAt DESC`, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

app.post('/api/requests', authenticateToken, (req, res) => {
  const { hospitalId, bloodGroup, units, urgency, requestDate } = req.body;

  db.run(`INSERT INTO blood_requests (hospitalId, bloodGroup, units, urgency, requestDate) VALUES (?, ?, ?, ?, ?)`,
    [hospitalId, bloodGroup, units, urgency, requestDate],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id: this.lastID, hospitalId, bloodGroup, units, urgency, requestDate });
      }
    }
  );
});

app.put('/api/requests/:id', authenticateToken, (req, res) => {
  const { status } = req.body;

  db.run("UPDATE blood_requests SET status = ? WHERE id = ?", [status, req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ id: req.params.id, status });
    }
  });
});

// Hospitals routes
app.get('/api/hospitals', (req, res) => {
  db.all("SELECT * FROM hospitals ORDER BY name", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

app.post('/api/hospitals', authenticateToken, (req, res) => {
  const { name, address, phone, email, contactPerson } = req.body;

  db.run(`INSERT INTO hospitals (name, address, phone, email, contactPerson) VALUES (?, ?, ?, ?, ?)`,
    [name, address, phone, email, contactPerson],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id: this.lastID, name, address, phone, email, contactPerson });
      }
    }
  );
});

app.put('/api/hospitals/:id', authenticateToken, (req, res) => {
  const { name, address, phone, email, contactPerson } = req.body;

  db.run(`UPDATE hospitals SET name = ?, address = ?, phone = ?, email = ?, contactPerson = ? WHERE id = ?`,
    [name, address, phone, email, contactPerson, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id: req.params.id, name, address, phone, email, contactPerson });
      }
    }
  );
});

app.delete('/api/hospitals/:id', authenticateToken, (req, res) => {
  db.run("DELETE FROM hospitals WHERE id = ?", [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Deleted successfully' });
    }
  });
});

// Appointments routes
app.get('/api/appointments', (req, res) => {
  db.all(`SELECT a.*, d.name as donorName FROM appointments a 
    LEFT JOIN donors d ON a.donorId = d.id ORDER BY a.date DESC`, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

app.post('/api/appointments', authenticateToken, (req, res) => {
  const { donorId, date, time } = req.body;

  db.run(`INSERT INTO appointments (donorId, date, time) VALUES (?, ?, ?)`,
    [donorId, date, time],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id: this.lastID, donorId, date, time });
      }
    }
  );
});

app.put('/api/appointments/:id', authenticateToken, (req, res) => {
  const { donorId, date, time, status } = req.body;

  db.run(`UPDATE appointments SET donorId = ?, date = ?, time = ?, status = ? WHERE id = ?`,
    [donorId, date, time, status, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id: req.params.id, donorId, date, time, status });
      }
    }
  );
});

app.delete('/api/appointments/:id', authenticateToken, (req, res) => {
  db.run("DELETE FROM appointments WHERE id = ?", [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Deleted successfully' });
    }
  });
});

// Dashboard stats
app.get('/api/stats', (req, res) => {
  const stats = {};

  db.get("SELECT COUNT(*) as count FROM blood_inventory", (err, row) => {
    if (!err) stats.totalBloodUnits = row.count;
  });

  db.get("SELECT COUNT(*) as count FROM donors", (err, row) => {
    if (!err) stats.totalDonors = row.count;
  });

  db.get("SELECT COUNT(*) as count FROM blood_requests WHERE status = 'Pending'", (err, row) => {
    if (!err) stats.pendingRequests = row.count;
  });

  db.get("SELECT COUNT(*) as count FROM appointments WHERE status = 'Scheduled'", (err, row) => {
    if (!err) stats.scheduledAppointments = row.count;
  });

  setTimeout(() => {
    res.json(stats);
  }, 100);
});

// Start server after database initialization
initializeDatabase().then(() => {
  console.log('Database initialized successfully');
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
