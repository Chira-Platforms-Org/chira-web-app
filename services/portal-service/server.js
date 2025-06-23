const express = require('express');
const path = require('path');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORTAL_SERVICE_PORT || 3002;

// Parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Auth middleware to verify user is authenticated
const requireAuth = async (req, res, next) => {
  try {
    // Check auth status with auth-service
    const response = await axios.get('http://localhost:3001/auth-status', { 
      withCredentials: true,
      headers: {
        Cookie: req.headers.cookie // Forward cookies
      }
    });
    
    if (response.data.isAuthenticated) {
      req.user = response.data.user;
      next();
    } else {
      res.status(401).json({ error: 'Not authenticated', redirectTo: '/login' });
    }
  } catch (error) {
    console.error('Auth service error:', error.message);
    res.status(500).json({ error: 'Authentication service unavailable' });
  }
};

// Main dashboard page
app.get('/', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Welcome animation page
app.get('/welcome', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'welcome.html'));
});

// Client project portal page
app.get('/client-portal', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'client-portal.html'));
});

// User profile endpoint - proxies to auth service
app.get('/user-profile', requireAuth, async (req, res) => {
  try {
    const response = await axios.get('http://localhost:3001/user-profile', {
      withCredentials: true,
      headers: {
        Cookie: req.headers.cookie
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching user profile:', error.message);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Portal Service is running on http://localhost:${PORT}`);
});
