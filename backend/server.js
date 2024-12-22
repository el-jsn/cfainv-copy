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
import cookieParser from 'cookie-parser';


dotenv.config();

const PORT = process.env.PORT || 5000;

const __dirname = path.resolve();

const app = express();


app.use(
  cors({
    origin: "http://localhost:5173", 
    credentials: true, // Allow cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['set-cookie']
  })
);

app.use(cookieParser());


// Security Middleware

// Set security HTTP headers
app.use(helmet());

// Prevent XSS attacks
app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "https://upload.wikimedia.org"], // Allow images from Wikimedia
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
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
  max: 1000, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Enable CORS with specific options to restrict origins and methods
const corsOptions = {
  origin: ["https://cfa-nb-inv-mngr.onrender.com", "http://localhost:5173"], // Allow your React app's origins
  methods: "GET, POST, PUT, DELETE", // Allow specific HTTP methods
  credentials: true, // If your requests include credentials like cookies
};
app.use(cors(corsOptions));

// Body parser to parse JSON payloads
app.use(express.json({ limit: '10kb' })); // Limit request body size

// Routes
app.use("/api/upt", authenticateToken,salesRoutes);
app.use("/api/sales", authenticateToken,ProjectedSalesRoutes);
app.use("/api/auth", userRoutes);
app.use('/api/msg', authenticateToken,DayDataRoutes);
app.use('/api/buffer',authenticateToken, ProductBufferRoutes);
app.use('/api/closure',authenticateToken, closureRoutes);

// Serve frontend in production mode
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '/frontend/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'));
  });
}

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
