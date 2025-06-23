const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000; // Changed from 3000 to 4000

// CORS setup
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'API Gateway healthy', timestamp: new Date().toISOString() });
});

// Auth Service Proxy
app.use('/auth', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: {
    '^/auth': ''
  }
}));

// Portal Service Proxy
app.use('/portal', createProxyMiddleware({
  target: 'http://localhost:3002',
  changeOrigin: true,
  pathRewrite: {
    '^/portal': ''
  }
}));

// Payment Service Proxy
app.use('/payment', createProxyMiddleware({
  target: 'http://localhost:3003',
  changeOrigin: true,
  pathRewrite: {
    '^/payment': ''
  }
}));

// Request Service Proxy
app.use('/request', createProxyMiddleware({
  target: 'http://localhost:3004',
  changeOrigin: true,
  pathRewrite: {
    '^/request': ''
  }
}));

// File Upload Service Proxy
app.use('/file-upload', createProxyMiddleware({
  target: 'http://localhost:9876',
  changeOrigin: true,
  pathRewrite: {
    '^/file-upload': ''
  }
}));

// Main route redirects to portal
app.use('/', (req, res) => {
  res.redirect('/portal');
});

// Login route redirects to auth service
app.get('/login', (req, res) => {
  res.redirect('/auth');
});

// Welcome page redirects to portal service welcome page
app.get('/welcome', (req, res) => {
  res.redirect('/portal/welcome');
});

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`API Gateway is running on http://localhost:${PORT}`);
});
