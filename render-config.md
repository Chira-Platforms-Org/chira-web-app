# Render Configuration Guide for CHIRA Web App

## Basic Settings
- **Name**: chira-client-portal (or your preferred name)
- **Region**: Choose the one closest to your users
- **Instance Type**: Free (for testing) or Individual (starting at $7/month for production)

## Build and Deploy Settings
- **Runtime Environment**: Node
- **Build Command**: `npm install`
- **Start Command**: `node server.js`
- **Auto-Deploy**: Yes (if using GitHub)

## Environment Variables
Add the following environment variables for production:

```
NODE_ENV=production
SESSION_SECRET=your_secure_random_string_here
```

## Advanced Settings
- **Health Check Path**: `/login-page` 
- **HTTP Port**: 3000 (matches the port in your server.js)

## Custom Domain Setup
After your service is deployed:

1. Go to your service dashboard
2. Click on the "Settings" tab
3. Scroll down to "Custom Domains"
4. Click "Add Custom Domain"
5. Enter your Google Workspace domain (e.g., yourdomain.com)
6. Render will provide specific DNS records to add to your Google Workspace admin console

## Google Workspace DNS Configuration
In your Google Workspace Admin console:

1. Go to Domains > Manage Domains > yourdomainname.com > DNS
2. Add the CNAME record provided by Render:
   - Name/Host: www (or subdomain of your choice)
   - Value/Target: [your-render-service].onrender.com
   - TTL: 3600 (or default)

3. For root domain (optional):
   - Type: A records (usually 2-4 of them)
   - Name/Host: @ (or empty)
   - Values: IP addresses provided by Render
   - TTL: 3600 (or default)
