const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const HOST = 'localhost';
const PORT = process.env.PORT || 9876;

// Enable CORS for all origins (for development purposes)
app.use(cors());

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    // Create the uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename to avoid conflicts
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB limit
});

// File upload endpoint - support both paths with and without trailing slash
app.post('/upload', upload.single('file'), handleFileUpload);
app.post('/upload/', upload.single('file'), handleFileUpload);

// Extract handler function for file upload logic
function handleFileUpload(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Return success response with file details
    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        category: req.body.category || 'uncategorized',
        description: req.body.description || ''
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ success: false, message: 'Server error during file upload' });
  }
}

// Simple health check endpoint
app.get('/', (req, res) => {
  res.send('File Upload Service is running');
});

// Start the server
app.listen(PORT, HOST, () => {
  console.log(`File Upload Service running on http://${HOST}:${PORT}`);
  console.log(`File upload endpoint: http://${HOST}:${PORT}/upload`);
});
