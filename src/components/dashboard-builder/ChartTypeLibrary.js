import React from 'react';
import {
  BarChart3, TrendingUp, TrendingDown, PieChart, Activity,
  Table2, Square, Columns, Layers, Grid3x3, Gauge, 
  LineChart as LineChartIcon, AreaChart as AreaChartIcon,
  Target, GitCompare, Zap, Award, Percent, ArrowUpRight,
  BarChart4, Map, Globe, Bell
} from 'lucide-react';

/**
 * Advanced Chart Types with configurations
 * Each chart type includes:
 * - Icon for UI
 * - Description
 * - Required fields
 * - Configurable options
 */

export const ADVANCED_CHART_TYPES = {
  // Basic Charts
  bar: {
    label: 'Bar Chart',
    icon: BarChart3,
    category: 'Basic',
    description: 'Compare values across categories',
    requiredFields: ['x', 'y'],
    options: {
      stacked: false,
      horizontal: false,
      colorScheme: 'default'
    }
  },

  line: {
    label: 'Line Chart',
    icon: TrendingUp,
    category: 'Basic',
    description: 'Show trends over time',
    requiredFields: ['x', 'y'],
    options: {
      smooth: true,
      showPoints: true,
      fill: false
    }
  },

  area: {
    label: 'Area Chart',
    icon: AreaChartIcon,
    category: 'Basic',
    description: 'Fill area under line',
    requiredFields: ['x', 'y'],
    options: {
      smooth: true,
      stacked: false
    }
  },

  pie: {
    label: 'Pie Chart',
    icon: PieChart,
    category: 'Basic',
    description: 'Show distribution & proportions',
    requiredFields: ['name', 'value'],
    options: {
      donut: false,
      innerRadius: 0,
      showLabels: true
    }
  },

  // Analytical Charts
  scatter: {
    label: 'Scatter Plot',
    icon: Grid3x3,
    category: 'Analytical',
    description: 'Visualize correlations',
    requiredFields: ['x', 'y'],
    options: {
      size: 'small',
      showTrendline: false
    }
  },

  bubble: {
    label: 'Bubble Chart',
    icon: Gauge,
    category: 'Analytical',
    description: 'Show 3 dimensions with bubbles',
    requiredFields: ['x', 'y', 'size'],
    options: {
      colorField: null
    }
  },

  heatmap: {
    label: 'Heat Map',
    icon: Globe,
    category: 'Analytical',
    description: 'Show intensity with colors',
    requiredFields: ['category', 'series', 'value'],
    options: {
      colorScale: 'viridis'
    }
  },

  // KPI & Metrics
  kpi: {
    label: 'KPI Panel',
    icon: Award,
    category: 'Metrics',
    description: 'Single metric display',
    requiredFields: ['value'],
    options: {
      format: 'number',
      showTrend: false,
      icon: null
    }
  },

  metricComparison: {
    label: 'Metric Comparison',
    icon: GitCompare,
    category: 'Metrics',
    description: 'Compare 2-4 metrics side by side',
    requiredFields: ['value'],
    options: {
      layout: 'horizontal',
      showChange: true
    }
  },

  gauge: {
    label: 'Gauge Chart',
    icon: Gauge,
    category: 'Metrics',
    description: 'Show progress toward goal',
    requiredFields: ['value', 'max'],
    options: {
      thresholds: { good: 70, warning: 50 }
    }
  },

  sparkline: {
    label: 'Sparkline',
    icon: TrendingUp,
    category: 'Metrics',
    description: 'Tiny trend chart',
    requiredFields: ['values'],
    options: {
      height: 20,
      color: '#3b82f6'
    }
  },

  // Geographic
  map: {
    label: 'Map Visualization',
    icon: Map,
    category: 'Geographic',
    description: 'Plot data on map',
    requiredFields: ['latitude', 'longitude'],
    options: {
      mapType: 'street',
      zoom: 10
    }
  },

  // Table & List
  table: {
    label: 'Data Table',
    icon: Table2,
    category: 'Data',
    description: 'Display detailed data',
    requiredFields: [],
    options: {
      sortable: true,
      searchable: true,
      pagination: true,
      pageSize: 10
    }
  },

  detailList: {
    label: 'Detail List',
    icon: Columns,
    category: 'Data',
    description: 'Formatted list view',
    requiredFields: [],
    options: {
      columns: 1,
      cardLayout: false
    }
  },

  // Time Series
  candlestick: {
    label: 'Candlestick Chart',
    icon: Activity,
    category: 'Time Series',
    description: 'OHLC data visualization',
    requiredFields: ['date', 'open', 'high', 'low', 'close'],
    options: {}
  },

  waterfall: {
    label: 'Waterfall Chart',
    icon: BarChart4,
    category: 'Time Series',
    description: 'Show incremental changes',
    requiredFields: ['category', 'value'],
    options: {
      showTotal: true
    }
  },

  // Distribution
  histogram: {
    label: 'Histogram',
    icon: Layers,
    category: 'Distribution',
    description: 'Show frequency distribution',
    requiredFields: ['value'],
    options: {
      bins: 20
    }
  },

  boxplot: {
    label: 'Box Plot',
    icon: Square,
    category: 'Distribution',
    description: 'Show quartiles & outliers',
    requiredFields: ['value', 'group'],
    options: {}
  },

  // Text & Alerts
  richText: {
    label: 'Rich Text',
    icon: Bell,
    category: 'Display',
    description: 'Custom HTML/Markdown',
    requiredFields: [],
    options: {
      markdown: false
    }
  },

  alert: {
    label: 'Alert Box',
    icon: Bell,
    category: 'Display',
    description: 'Show alerts & notifications',
    requiredFields: [],
    options: {
      type: 'info', // info, warning, error, success
      dismissible: true
    }
  }
};

// Group charts by category for UI
export const CHART_CATEGORIES = {
  Basic: ['bar', 'line', 'area', 'pie'],
  Analytical: ['scatter', 'bubble', 'heatmap'],
  Metrics: ['kpi', 'metricComparison', 'gauge', 'sparkline'],
  'Time Series': ['candlestick', 'waterfall'],
  Distribution: ['histogram', 'boxplot'],
  Geographic: ['map'],
  Data: ['table', 'detailList'],
  Display: ['richText', 'alert']
};

/**
 * Get chart configuration
 */
export const getChartConfig = (chartType) => {
  return ADVANCED_CHART_TYPES[chartType] || null;
};

/**
 * Get charts by category
 */
export const getChartsByCategory = (category) => {
  const types = CHART_CATEGORIES[category] || [];
  return types.map(type => ({
    type,
    ...ADVANCED_CHART_TYPES[type]
  }));
};

/**
 * Get all available chart types
 */
export const getAvailableCharts = () => {
  return Object.entries(ADVANCED_CHART_TYPES).map(([type, config]) => ({
    type,
    ...config
  }));
};

/**
 * Validate if chart has required configuration
 */
export const validateChartConfig = (chartType, config) => {
  const chartConfig = ADVANCED_CHART_TYPES[chartType];
  if (!chartConfig) return false;

  const { requiredFields = [] } = chartConfig;
  const dataConfig = config?.dataConfig || {};

  // Map of field config keys to required field names
  const fieldMapping = {
    xField: 'x',
    yField: 'y',
    valueField: 'value',
    categoryField: 'name',
    sizeField: 'size',
    nameField: 'name',
    latitudeField: 'latitude',
    longitudeField: 'longitude'
  };

  const providedFields = Object.entries(fieldMapping)
    .filter(([key, _]) => dataConfig[key])
    .map(([_, field]) => field);

  return requiredFields.every(field =>
    requiredFields.length === 0 || providedFields.includes(field)
  );
};
