const express = require('express');
const path = require('path');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PAYMENT_SERVICE_PORT || 3003;

// Parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Serve static payment page
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

// Payment page endpoint
app.get('/', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'payment.html'));
});

// Process payment endpoint (simulation)
app.post('/process-payment', requireAuth, (req, res) => {
  const { amount, clientName, dueDate } = req.body;
  
  // Validate payment data
  if (!amount || !clientName) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing required payment information' 
    });
  }
  
  // In a real implementation, this would connect to a payment gateway like Stripe
  // Simulate payment processing
  setTimeout(() => {
    const success = Math.random() > 0.1; // 90% success rate simulation
    
    if (success) {
      res.json({
        success: true,
        message: 'Payment processed successfully',
        transactionId: 'CHIRA-' + Date.now(),
        amount,
        clientName,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment processing failed. Please try again.',
        errorCode: 'PAYMENT_ERROR'
      });
    }
  }, 1500); // Simulate processing delay
});

// Get client invoices (simulation)
app.get('/invoices', requireAuth, (req, res) => {
  // Simulate fetching invoices from database
  const userEmail = req.user?.email || '';
  
  // Generate mock invoices
  const invoices = [
    {
      id: 'INV-20250612-001',
      amount: 1250.00,
      dueDate: '2025-06-30',
      status: 'unpaid',
      project: 'Website Development'
    },
    {
      id: 'INV-20250520-002',
      amount: 750.00,
      dueDate: '2025-05-31',
      status: 'paid',
      project: 'UI/UX Design'
    }
  ];
  
  res.json({ invoices });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Payment Service is running on http://localhost:${PORT}`);
});
