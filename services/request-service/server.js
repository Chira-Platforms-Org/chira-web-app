const express = require('express');
const path = require('path');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.REQUEST_SERVICE_PORT || 3004;

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

// Request page endpoint
app.get('/', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'request.html'));
});

// Submit question/request endpoint
app.post('/submit', requireAuth, (req, res) => {
  const { subject, message, priority } = req.body;
  
  // Validate request data
  if (!subject || !message) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing required information' 
    });
  }
  
  // In a real implementation, this would save to a database
  // Simulate request submission
  setTimeout(() => {
    res.json({
      success: true,
      message: 'Your question has been submitted successfully',
      requestId: 'REQ-' + Date.now(),
      estimatedResponseTime: '24 hours'
    });
  }, 1000); // Simulate processing delay
});

// Get user's previous requests (simulation)
app.get('/history', requireAuth, (req, res) => {
  // Simulate fetching request history
  const requests = [
    {
      id: 'REQ-1623456789',
      subject: 'Project Timeline Question',
      status: 'answered',
      submittedDate: '2025-06-01T10:23:45Z',
      priority: 'medium'
    },
    {
      id: 'REQ-1623123456',
      subject: 'Billing Inquiry',
      status: 'pending',
      submittedDate: '2025-06-10T14:30:00Z',
      priority: 'high'
    }
  ];
  
  res.json({ requests });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Request Service is running on http://localhost:${PORT}`);
});
