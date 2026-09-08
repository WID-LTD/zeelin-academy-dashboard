// Minimal Cloudflare Worker entry for static assets + auth (Pages alternative)
// This file is used if deployed as Workers Sites. For Pages, functions/ takes precedence.
import { createToken, verifyToken, shouldRenew } from './lib/token.js';
export default {
  async fetch(request, env, ctx){
    // delegate to Pages functions if available? Fallback simple.
    return new Response('Use Pages deployment - see wrangler.toml', {status: 200});
  }
}
