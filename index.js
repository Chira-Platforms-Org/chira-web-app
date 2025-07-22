export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      // Handle API requests here
      return new Response('API response', { status: 200 });
    }
    // For all other requests, let Cloudflare Pages handle them
    return fetch(request);
  }
}
