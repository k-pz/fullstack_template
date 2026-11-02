import { serve } from "bun";
import index from "./index.html";

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    // Forward API calls to Django (the tutorial's CRA "proxy" setting).
    "/api/*": (req) => {
      const { pathname, search } = new URL(req.url);
      return fetch(`http://localhost:8000${pathname}${search}`, {
        method: req.method,
        headers: req.headers,
        body: req.body,
      });
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
