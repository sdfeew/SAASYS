import { Router, Request, Response } from 'express';
import { createLogger } from '../utils/logger.js';
import { getSupabase } from '../config/supabase.js';

const router = Router();
const logger = createLogger('Suppliers');

// GET /api/v1/suppliers/:supplierId/analytics
// Aggregated supplier analytics: ratings, order stats, performance
router.get('/:supplierId/analytics', async (req: Request, res: Response) => {
  try {
    const { supplierId } = req.params;
    const supabase = getSupabase();

    // Get supplier
    const { data: supplier, error: supplierError } = await supabase
      ?.from('suppliers')
      ?.select('*')
      ?.eq('id', supplierId)
      ?.single();

    if (supplierError || !supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    // Get supplier ratings
    const { data: ratings, error: ratingsError } = await supabase
      ?.from('supplier_ratings')
      ?.select('*')
      ?.eq('supplier_id', supplierId)
      ?.order('period_end_date', { ascending: false });

    if (ratingsError) throw ratingsError;

    // Calculate aggregates
    const totalRatings = ratings?.length || 0;
    const avgQuality = ratings?.length > 0
      ? (ratings.reduce((sum: number, r: any) => sum + (r?.quality_rating || 0), 0) / ratings.length).toFixed(2)
      : 0;
    const avgDelivery = ratings?.length > 0
      ? (ratings.reduce((sum: number, r: any) => sum + (r?.delivery_rating || 0), 0) / ratings.length).toFixed(2)
      : 0;
    const avgPrice = ratings?.length > 0
      ? (ratings.reduce((sum: number, r: any) => sum + (r?.price_rating || 0), 0) / ratings.length).toFixed(2)
      : 0;
    const avgCommunication = ratings?.length > 0
      ? (ratings.reduce((sum: number, r: any) => sum + (r?.communication_rating || 0), 0) / ratings.length).toFixed(2)
      : 0;

    res.json({
      supplier,
      analytics: {
        totalRatings,
        averageQuality: parseFloat(String(avgQuality)),
        averageDelivery: parseFloat(String(avgDelivery)),
        averagePrice: parseFloat(String(avgPrice)),
        averageCommunication: parseFloat(String(avgCommunication)),
        overallRating: supplier.overall_rating,
        recentRatings: ratings?.slice(0, 12) || []
      }
    });
  } catch (error: any) {
    logger.error('Supplier analytics error:', error);
    res.status(500).json({
      error: 'Failed to fetch supplier analytics',
      message: error.message
    });
  }
});

export default router;
