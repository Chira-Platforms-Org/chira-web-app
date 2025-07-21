require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3002; // Changed from 3001 to 3002

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
    return res.redirect('/login');
  }
  next();
};

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public'), {
  index: false, // Don't serve index.html automatically
}));

// Configure email transporter (using env variables)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// PUBLIC ROUTES (No authentication required)
// Welcome splash page - shows before main site
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'welcome-splash.html'));
});

// Main home page - now accessible via /home
app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// Consultation page route
app.get('/consultation', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'consultation.html'));
});

// Client portal entry page
app.get('/client', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'client.html'));
});

// Login page route
app.get('/login', (req, res) => {
  if (req.session.isAuthenticated) {
    return res.redirect('/client-welcome');
  }
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Contact form page
app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

// AUTHENTICATED ROUTES (Client portal pages - require authentication)
// Post-login welcome screen
app.get('/client-welcome', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'welcome.html'));
});

// Client dashboard (previously index.html)
app.get('/dashboard', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// File upload page
app.get('/file-upload', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'file-upload.html'));
});

// Client portal management
app.get('/client-portal', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'client-portal.html'));
});

// Payment portal
app.get('/payment', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'payment.html'));
});

// Request management
app.get('/request', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'request.html'));
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
    res.redirect('/client-welcome'); // Redirect to welcome animation
  } else {
    res.redirect('/login?error=invalid_credentials');
  }
});

// Handle contact form submission
app.post('/contact', express.urlencoded({ extended: false }), async (req, res) => {
  const { name, email, message } = req.body;
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: 'lukaspaydo@chira-platforms.com',
      subject: `Contact Inquiry from ${name}`,
      text: message,
      html: `<h3>New Contact Inquiry</h3>
             <p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Message:</strong><br/>${message}</p>`,
    });
    // serve thank you page
    res.sendFile(path.join(__dirname, 'public', 'contact-thank-you.html'));
  } catch (error) {
    console.error('Error sending contact email:', error);
    res.status(500).send('An error occurred while sending your message. Please try again later.');
  }
});

// Handle consultation form submissions
app.post('/consultation', async (req, res) => {
  try {
    const { firstName, lastName, companyName, email, phone, interests, message, consent } = req.body;
    
    // Prepare email content
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: 'lukaspaydo@chira-platforms.com', // Company email to receive consultation requests
      subject: 'New Consultation Request from CHIRA Website',
      html: `
        <h2>New Consultation Request</h2>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Company:</strong> ${companyName || 'Not provided'}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Areas of Interest:</strong> ${Array.isArray(interests) ? interests.join(', ') : (interests || 'None selected')}</p>
        <p><strong>Message:</strong></p>
        <p>${message || 'No specific details provided'}</p>
        <p><strong>Consent Given:</strong> ${consent ? 'Yes' : 'No'}</p>
        <p><em>This request was submitted on ${new Date().toLocaleString()}</em></p>
      `
    };
    
    // Send email
    await transporter.sendMail(mailOptions);
    
    // Redirect to thank you page
    res.redirect('/contact-thank-you');
  } catch (error) {
    console.error('Error sending consultation request email:', error);
    res.status(500).send('There was an error processing your consultation request. Please try again later.');
  }
});

// Handle client portal request submissions
app.post('/submit-request', requireAuth, async (req, res) => {
  try {
    const { requestText, requestType } = req.body;
    const user = req.session.user;
    
    // Prepare email content
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: 'lukaspaydo@chira-platforms.com',
      subject: `New Client Portal Request - ${requestType === 'team' ? 'Team Member' : 'AI'} Request`,
      html: `
        <h2>New Client Portal Request</h2>
        <p><strong>User:</strong> ${user.name} (${user.email})</p>
        <p><strong>Request Type:</strong> ${requestType === 'team' ? 'Ask a CHIRA Team Member' : 'Ask CHIRA AI'}</p>
        <p><strong>Request:</strong></p>
        <p>${requestText}</p>
        <p><strong>Expected Response Time:</strong> ${requestType === 'team' ? '2 business days' : 'Shortly'}</p>
        <p><em>This request was submitted on ${new Date().toLocaleString()}</em></p>
      `
    };
    
    // Send email
    await transporter.sendMail(mailOptions);
    
    // Send success response
    res.json({ success: true, message: 'Request submitted successfully' });
  } catch (error) {
    console.error('Error sending client request email:', error);
    res.status(500).json({ success: false, message: 'Error processing request' });
  }
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
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
