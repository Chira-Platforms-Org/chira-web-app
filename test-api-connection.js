const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuration
const GATEWAY_URL = 'http://localhost:4000'; // Changed from 3000 to 4000
const SAMPLE_FILE_PATH = path.join(__dirname, 'test-sample.txt');

// Create a sample file for testing
fs.writeFileSync(SAMPLE_FILE_PATH, 'This is a test file content for API testing.');

async function testApiConnection() {
  console.log('🚀 Starting API connection test...');
  
  try {
    // Test 1: Health Check
    console.log('\n1️⃣ Testing Gateway Health Endpoint...');
    const healthResponse = await fetch(`${GATEWAY_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('Health Check Response:', healthData);
    console.log('✅ Health check completed');
    
    // Test 2: File Upload Service Test (through gateway)
    console.log('\n2️⃣ Testing File Upload Endpoint...');
    
    const form = new FormData();
    form.append('file', fs.createReadStream(SAMPLE_FILE_PATH));
    form.append('category', 'test');
    form.append('description', 'API test upload');
    
    const uploadResponse = await fetch(`${GATEWAY_URL}/file-upload/upload`, {
      method: 'POST',
      body: form,
    });
    
    const uploadData = await uploadResponse.json();
    console.log('File Upload Response:', uploadData);
    
    if (uploadData.success) {
      console.log('✅ File upload test successful!');
    } else {
      console.log('❌ File upload test failed!');
    }
    
    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Error during API testing:', error.message);
    console.log('\n🔍 Troubleshooting tips:');
    console.log('1. Make sure all services are running (gateway and file-upload-service)');
    console.log('2. Confirm gateway is running on port 3000');
    console.log('3. Confirm file-upload-service is running on port 9876');
    console.log('4. Check for any network or CORS issues');
  } finally {
    // Clean up the test file
    if (fs.existsSync(SAMPLE_FILE_PATH)) {
      fs.unlinkSync(SAMPLE_FILE_PATH);
      console.log('\n🧹 Cleaned up test file');
    }
  }
}

// Run the tests
testApiConnection();
