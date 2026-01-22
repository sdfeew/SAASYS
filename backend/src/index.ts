import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'express-async-errors';
import dotenv from 'dotenv';
import { createLogger } from './utils/logger';
import { setupSupabase } from './config/supabase';
import { setupRedis } from './config/redis';
import dashboardRoutes from './routes/dashboards';
import supplierRoutes from './routes/suppliers';
import emailQueueRoutes from './routes/emailQueue';
import healthRoutes from './routes/health';

dotenv.config();

const logger = createLogger('Server');
const app = express();
const PORT = process.env.PORT || 3000;
const API_VERSION = process.env.API_VERSION || 'v1';

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:4028',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// ============================================================================
// INITIALIZATION
// ============================================================================

async function initialize() {
  try {
    // Setup Supabase client
    await setupSupabase();
    logger.info('✓ Supabase initialized');

    // Setup Redis connection
    await setupRedis();
    logger.info('✓ Redis initialized');
  } catch (error) {
    logger.error('Initialization error:', error);
    process.exit(1);
  }
}

// ============================================================================
// ROUTES
// ============================================================================

// Health check (no auth required)
app.use('/health', healthRoutes);

// API routes
app.use(`/api/${API_VERSION}/dashboards`, dashboardRoutes);
app.use(`/api/${API_VERSION}/suppliers`, supplierRoutes);
app.use(`/api/${API_VERSION}/email-queue`, emailQueueRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'TenantFlow Backend API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    method: req.method
  });
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', error);

  const status = error.status || 500;
  const message = error.message || 'Internal Server Error';

  res.status(status).json({
    error: message,
    status,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// ============================================================================
// START SERVER
// ============================================================================

async function start() {
  try {
    await initialize();

    app.listen(PORT, () => {
      logger.info(`✓ Server running on http://localhost:${PORT}`);
      logger.info(`✓ API version: ${API_VERSION}`);
      logger.info(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
start();

export default app;
