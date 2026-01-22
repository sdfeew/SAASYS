import { Router, Request, Response } from 'express';
import { createLogger } from '../utils/logger.js';
import { getSupabase } from '../config/supabase.js';

const router = Router();
const logger = createLogger('EmailQueue');

// GET /api/v1/email-queue/status
// Get email queue status
router.get('/status', async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();

    const { data: pending } = await supabase
      ?.from('email_queue')
      ?.select('*', { count: 'exact' })
      ?.eq('status', 'pending')
      ?.limit(1);

    const { data: sent } = await supabase
      ?.from('email_queue')
      ?.select('*', { count: 'exact' })
      ?.eq('status', 'sent')
      ?.limit(1);

    const { data: failed } = await supabase
      ?.from('email_queue')
      ?.select('*', { count: 'exact' })
      ?.eq('status', 'failed')
      ?.limit(1);

    res.json({
      status: 'operational',
      queue: {
        pending: pending?.length || 0,
        sent: sent?.length || 0,
        failed: failed?.length || 0
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    logger.error('Email queue status error:', error);
    res.status(500).json({
      error: 'Failed to fetch email queue status',
      message: error.message
    });
  }
});

// POST /api/v1/email-queue/process
// Process pending emails (called by job scheduler)
router.post('/process', async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();

    // Get pending emails (limit to 10 per batch)
    const { data: emails, error } = await supabase
      ?.from('email_queue')
      ?.select('*')
      ?.eq('status', 'pending')
      ?.lt('attempt_count', 3)
      ?.limit(10);

    if (error) throw error;

    if (!emails || emails.length === 0) {
      return res.json({
        processed: 0,
        message: 'No pending emails'
      });
    }

    // Process emails (simplified - would integrate with SendGrid)
    const processed = emails.map((email: any) => ({
      id: email.id,
      to: email.to_email,
      template: email.template_code,
      status: 'processing'
    }));

    // In production, here you would:
    // 1. Call SendGrid API or other email service
    // 2. Update email_queue status to 'sent'
    // 3. Log failures and retry logic

    res.json({
      processed: processed.length,
      emails: processed
    });
  } catch (error: any) {
    logger.error('Email queue processing error:', error);
    res.status(500).json({
      error: 'Failed to process email queue',
      message: error.message
    });
  }
});

export default router;
