export default {
  async fetch(request) {
    return new Response(`<!DOCTYPE html>
      <html>
        <head>
          <title>Chira WebApp</title>
        </head>
        <body>
          <h1>Welcome to Chira Platforms</h1>
          <p>Your dynamic website is now live on Cloudflare Workers!</p>
        </body>
      </html>`, {
      headers: { "Content-Type": "text/html" }
    });
  },
};
