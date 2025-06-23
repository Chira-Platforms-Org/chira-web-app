require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// Session configuration for simulated authentication
app.use(session({
  secret: 'chira-secret-key-for-demo',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.session.isAuthenticated) {
    return res.redirect('/login-page');
  }
  next();
};

// Serve static files from the 'public' directory, except for index and request HTML
app.use(express.static(path.join(__dirname, 'public'), {
  index: false, // Don't serve index.html automatically
}));

// Basic routes
app.get('/', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/request.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'request.html'));
});

// Add route for file upload page
app.get('/file-upload.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'file-upload.html'));
});

// Login page route
app.get('/login-page', (req, res) => {
  if (req.session.isAuthenticated) {
    return res.redirect('/?alreadyLoggedIn=true');
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
    res.redirect('/welcome'); // Redirect to welcome animation instead of index
  } else {
    res.redirect('/login-page?error=invalid_credentials');
  }
});

// Welcome animation page route
app.get('/welcome', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'welcome.html'));
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login-page');
});

// User profile route
app.get('/user-profile', requireAuth, (req, res) => {
  res.json(req.session.user || {});
});

// API route example
app.get('/api/hello', requireAuth, (req, res) => {
  res.json({ message: 'Hello from Node.js!', user: req.session.user.name });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Running in ${process.env.NODE_ENV || 'development'} mode`);
});