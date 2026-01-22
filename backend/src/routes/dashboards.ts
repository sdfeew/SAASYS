import { Router, Request, Response } from 'express';
import { createLogger } from '../utils/logger.js';
import { getSupabase } from '../config/supabase.js';

const router = Router();
const logger = createLogger('Dashboards');

// POST /api/v1/dashboards/:dashboardId/query
// Execute dashboard query with joins, filters, aggregations
router.post('/:dashboardId/query', async (req: Request, res: Response) => {
  try {
    const { dashboardId } = req.params;
    const { filters, limit = 100, offset = 0 } = req.body;

    const supabase = getSupabase();

    // Get dashboard with widgets and data sources
    const { data: dashboard, error: dashboardError } = await supabase
      ?.from('dashboards')
      ?.select(`
        *,
        widgets:dashboard_widgets(
          *,
          data_source:data_sources(*)
        )
      `)
      ?.eq('id', dashboardId)
      ?.single();

    if (dashboardError) throw dashboardError;
    if (!dashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }

    // Execute queries for each widget (simplified - would be enhanced with actual joins)
    const widgetData = await Promise.all(
      dashboard.widgets?.map(async (widget: any) => {
        if (!widget.data_source) return null;

        // For now, simple query - enhance with join logic later
        const { data, error } = await supabase
          ?.from('sub_module_records')
          ?.select('*')
          ?.limit(limit)
          ?.offset(offset);

        if (error) {
          logger.error('Widget query error:', error);
          return null;
        }

        return {
          widgetId: widget.id,
          title: widget.title,
          type: widget.type,
          data: data || []
        };
      }) || []
    );

    res.json({
      dashboardId,
      widgets: widgetData.filter(Boolean)
    });
  } catch (error: any) {
    logger.error('Dashboard query error:', error);
    res.status(500).json({
      error: 'Failed to execute dashboard query',
      message: error.message
    });
  }
});

export default router;
