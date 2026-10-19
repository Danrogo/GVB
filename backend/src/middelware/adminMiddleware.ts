// // middleware/adminMiddleware.ts
// import { type Context, type Next } from 'hono';
// import { authMiddleware } from './bearAuth.js'; // reuse your existing auth

// export const adminMiddleware = async (c: Context, next: Next) => {
//   // First, run normal auth
//   await authMiddleware(c, async () => {});

//   const user = c.get('user');

//   // If auth failed, user won't be set
//   if (!user) {
//     return c.json({ success: false, message: 'Authentication required' }, 401);
//   }

//   // Now check role
//   if (user.role !== 'admin') {
//     return c.json({ success: false, message: 'Admin access required' }, 403);
//   }

//   // All good — proceed
//   return await next();
// };