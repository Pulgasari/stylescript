// middleware.js: vercel runs the one at the root of the project (demo2)
export { middleware as default } from './packages/web/middleware.js';
export const config = { matcher: '/:path*.ss' };
