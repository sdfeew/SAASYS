import { Router, Request, Response } from 'express';
import { createLogger } from '../utils/logger.js';

const router = Router();
const logger = createLogger('Health');

// Health check endpoint
router.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Ready check endpoint
router.get('/ready', (req: Request, res: Response) => {
  res.json({
    status: 'ready',
    timestamp: new Date().toISOString()
  });
});

// Liveness check endpoint (Kubernetes)
router.get('/live', (req: Request, res: Response) => {
  res.json({
    status: 'live',
    timestamp: new Date().toISOString()
  });
});

export default router;
