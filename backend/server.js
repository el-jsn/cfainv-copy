import express from 'express';
import cors from 'cors';
import helmet from 'helmet'; // For setting various HTTP headers to secure the app
import rateLimit from 'express-rate-limit'; // To prevent brute force attacks
import xssClean from 'xss-clean'; // To prevent cross-site scripting (XSS) attacks
import mongoSanitize from 'express-mongo-sanitize'; // To prevent NoSQL injection attacks
import hpp from 'hpp'; // To prevent HTTP parameter pollution
import { connectDB } from './config/db.js';
import dotenv from 'dotenv';
import salesRoutes from './routes/salesData.route.js';
import ProjectedSalesRoutes from './routes/projectedSales.route.js';
import userRoutes from './routes/user.route.js';
import path from 'path';
import DayDataRoutes from './routes/daydata.route.js';
import ProductBufferRoutes from './routes/productBuffer.route.js';
import { cleanupExpiredRecords } from './controllers/dayData.controller.js';
import closureRoutes from './routes/closure.route.js';
import cron from 'node-cron';
import {authenticateToken} from './middlewares/userAuth.js';
import messageRoutes from './routes/message.route.js';
import cookieParser from 'cookie-parser';
import salesProjectionConfigRoutes from './routes/salesProjectionConfig.route.js';
import futureProjectionRoutes from "./routes/futureProjection.route.js";
import { applyFutureProjections } from './controllers/futureProjection.controller.js';
import truckItemRoutes from './routes/truckItem.route.js';
import dailyBufferRoutes from './routes/dailyBuffer.route.js';
import salesMixRoutes from './routes/salesMix.routes.js';


dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

// Create a DB connection variable
let cachedDb = null;

// Modified connectDB function that caches the connection
async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }
  
  // If no connection is cached, create a new one
  cachedDb = await connectDB();
  return cachedDb;
}

app.use(cookieParser());


// Security Middleware

// Set security HTTP headers
app.use(helmet());

// Prevent XSS attacks
app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        imgSrc: ["'self'", "https://upload.wikimedia.org"], // Allow images from Wikimedia
      },
    },
  }));

// Prevent NoSQL injection attacks by sanitizing inputs
app.use(mongoSanitize());

// Prevent HTTP parameter pollution
app.use(hpp());


// Rate limiting to prevent brute force and DDoS attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Enable CORS with specific options to restrict origins and methods
app.use(
  cors({
    origin: ["https://cfanbinv.vercel.app", "https://cfanbinv.onrender.com", "http://localhost:3000", "http://localhost:5173"],
    credentials: true, // Allow cookies to be sent
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['set-cookie', 'cache-control']
  })
);
// Body parser to parse JSON payloads
app.use(express.json({ limit: '10kb' })); // Limit request body size

// Add a lightweight health check route that doesn't need database access
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/upt", authenticateToken, salesRoutes);
app.use("/api/sales", authenticateToken, ProjectedSalesRoutes);
app.use("/api/auth", userRoutes);
app.use('/api/adjustment', authenticateToken, DayDataRoutes);
app.use('/api/buffer', ProductBufferRoutes);
app.use('/api/closure', authenticateToken, closureRoutes);
app.use('/api/messages', authenticateToken, messageRoutes);
app.use('/api', salesProjectionConfigRoutes);
app.use("/api", futureProjectionRoutes);
app.use("/api/truck-items", authenticateToken, truckItemRoutes);
app.use('/api/daily-buffer', dailyBufferRoutes);
app.use('/api/salesmix', authenticateToken, salesMixRoutes);


// Serve frontend in production mode
if (process.env.NODE_ENV === 'production') {
  const __dirname = path.resolve();
  app.use(express.static(path.join(__dirname, 'frontend/dist')));

  app.get('*', (req, res) => {
    // Skip API routes
    if (req.path.startsWith('/api')) {
      return;
    }
    res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'));
  });

  // Connect to database right after creating the app to reduce cold start delay
  connectToDatabase().catch(console.error);
}

app.use(express.static('frontend/dist', {
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  },
}));

// Schedule cleanup task using cron jobs
cron.schedule('0 * * * *', () => {
  cleanupExpiredRecords();
});

// Handle unknown routes (404)
app.all('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

// Start the server and connect to the database
app.listen(PORT, () => {
  connectDB();
});
