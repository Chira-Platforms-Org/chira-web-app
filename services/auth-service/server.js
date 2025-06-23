const express = require('express');
const path = require('path');
const session = require('express-session');
const cors = require('cors');

const app = express();
const PORT = process.env.AUTH_SERVICE_PORT || 3001;

// Session configuration
app.use(session({
  secret: 'chira-secret-key-for-demo',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004'],
  credentials: true
}));

// Serve static login page
app.use(express.static(path.join(__dirname, 'public')));

// Login page route
app.get('/', (req, res) => {
  if (req.session.isAuthenticated) {
    return res.json({ redirectTo: '/welcome', message: 'Already authenticated' });
  }
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Simulated login process
app.post('/login', express.urlencoded({ extended: false }), (req, res) => {
  const { email, password } = req.body;
  
  // Simple validation (any non-empty email and password is accepted)
  if (email && password) {
    req.session.isAuthenticated = true;
    req.session.user = {
      name: email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' '),
      email: email,
      sub: 'simulated-user-id'
    };
    res.json({ success: true, redirectTo: '/welcome', message: 'Login successful' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true, redirectTo: '/login', message: 'Logged out successfully' });
});

// User profile route
app.get('/user-profile', (req, res) => {
  if (!req.session.isAuthenticated) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json(req.session.user || {});
});

// Auth status check endpoint
app.get('/auth-status', (req, res) => {
  res.json({ 
    isAuthenticated: req.session.isAuthenticated || false,
    user: req.session.user || null
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Auth Service is running on http://localhost:${PORT}`);
});
