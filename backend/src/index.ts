import { serve } from '@hono/node-server'
import { type Context, Hono } from 'hono';
import { logger } from 'hono/logger'
import { prometheus } from '@hono/prometheus';
// import { limiter } from './middelware/rateLimiter.js';
import initDatabaseConnection  from "../src/db/config.js"
import authRoutes from './Auth/auth.routes.js';
import userRoutes from './users/users.routes.js';
import bookingRoutes from './bookings/bookings.routes.js'
import paymentRoutes from './payments/payments.routes.js';
import servicesRoutes  from './services/services.routes.js';  
import ticketRoutes from './ticket/ticket.routes.js'
import reviewRoutes from './reviews/reviews.routes.js';
import notificationRoutes from './notifications/notifications.routes.js';
import availabilityRoutes from './Availability/availability.routes.js';
import { authMiddleware, requireRole } from './middelware/bearAuth.js';
import auth from  './Auth/google.js'
import { cors } from 'hono/cors';


const app = new Hono();

await initDatabaseConnection();

// Prometheus middleware
const { printMetrics, registerMetrics } = prometheus()

// 
// app.use('*', registerMetrics); // prometheus to monitor metrics
// app.get('/metrics', printMetrics); // endpoint to expose metrics

//Enable CORS
// Enable CORS — MOVE THIS HIGHER, right after logger
// app.use('*', logger());

// Enable CORS for ALL routes
app.use('*', cors({
  origin: (origin) => {
    if (!origin) return origin;
    const allowed = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174'
    ];
    return allowed.includes(origin) ? origin : null;
  },
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Disposition', 'Content-Type'],
  credentials: true,
  maxAge: 600,
}));
// Apply logger middleware
app.use('*', logger()); // logs request and response to the console


// Apply rate limiter middleware
// app.use(limiter);

// Root endpoint
app.use('/', cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  allowMethods: ['GET', 'OPTIONS'],
}));


// Protected routes (authentication required)
app.use('/api/bookings/*', authMiddleware);
app.use('/api/payments/*', authMiddleware);
app.use('/api/reviews/*', authMiddleware);
app.use('/api/notifications/*', authMiddleware);
app.use('/api/tickets/*', authMiddleware);
app.use('/api/availability/*', authMiddleware);

// Admin/Manager only routes
app.use('/api/users/*', authMiddleware, requireRole('Admin', 'Manager'));
// Mount API routes
app.route("/api", authRoutes);
app.route("/api", userRoutes);
app.route('/api', reviewRoutes);
app.route("/api", availabilityRoutes);
app.route("/api", servicesRoutes);
app.route("/api", bookingRoutes);
app.route("/api/payments", paymentRoutes);
app.route("/api", ticketRoutes);
app.route("/api", servicesRoutes);
app.route("/api", notificationRoutes);
// app.route("/api/payments/paystack", paystackRoutes);

// 404 handler
app.notFound((c: Context) => {
  return c.json({
    success: false,
    message: 'Route not found',
    path: c.req.path
  }, 404);
});

const port = Number(process.env.PORT) || 3000;

serve({
  fetch: app.fetch,
  port: port
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
});