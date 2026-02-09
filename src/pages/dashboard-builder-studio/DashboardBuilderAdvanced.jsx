import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Eye, EyeOff, Save, Settings, Grid3x3, Zap, Copy, Lock, Unlock, AlignLeft, AlignCenter, AlignRight, ArrowUpDown, Download, Share2, RotateCcw, Play, BarChart3, TrendingUp, TrendingDown, PieChart, Activity, Table2, Square, Columns, Layers, Code, Layout } from 'lucide-react';
import { BarChart, Bar, LineChart as RechartLineChart, Line, PieChart as RechartPieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';
import { dashboardService } from '../../services/dashboardService';
import AdminSidebar from '../../components/ui/AdminSidebar';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';
import { ADVANCED_CHART_TYPES, CHART_CATEGORIES, getChartsByCategory } from '../../components/dashboard-builder/ChartTypeLibrary';
import { AdvancedDataConfigBuilder } from '../../components/dashboard-builder/AdvancedDataConfigBuilder';

const CHART_TYPES = ADVANCED_CHART_TYPES;

const GRID_SIZES = [
  { value: 1, label: '1x1' },
  { value: 2, label: '2×1' },
  { value: 3, label: '3×1' },
  { value: 4, label: '4×1' },
  { value: 6, label: '2×2' },
  { value: 9, label: '3×3' },
  { value: 12, label: '4×3' },
];

const LAYOUT_TEMPLATES = [
  { id: 'blank', label: 'Blank Canvas', icon: Square, cols: 12 },
  { id: 'grid', label: 'Grid Layout', icon: Grid3x3 },
  { id: 'split', label: 'Split View', icon: Columns },
  { id: 'masonry', label: 'Masonry Layout', icon: Layers },
];

const generateSampleData = () => {
  return [
    { month: 'Jan', sales: 4000, revenue: 2400, users: 2210, growth: 2.4 },
    { month: 'Feb', sales: 3000, revenue: 1398, users: 2210, growth: 2.21 },
    { month: 'Mar', sales: 2000, revenue: 9800, users: 2290, growth: 2.29 },
    { month: 'Apr', sales: 2780, revenue: 3908, users: 2000, growth: 2 },
    { month: 'May', sales: 1890, revenue: 4800, users: 2181, growth: 2.18 },
    { month: 'Jun', sales: 2390, revenue: 3800, users: 2500, growth: 2.5 },
    { month: 'Jul', sales: 3490, revenue: 4300, users: 2100, growth: 2.1 },
  ];
};

// Fetch real data from database for a widget
const fetchWidgetData = async (supabase, tenantId, widget) => {
  try {
    // If no dataSourceId configured, use sample data
    if (!widget.dataSourceId) {
      return generateSampleData();
    }

    const { xField, yField, valueField, categoryField } = widget.dataConfig || {};

    // Fetch records from the selected sub-module
    const { data: records, error } = await supabase
      .from('sub_module_records')
      .select('id, data')
      .eq('tenant_id', tenantId)
      .eq('sub_module_id', widget.dataSourceId)
      .eq('status', 'active')
      .limit(100);

    if (error || !records || records.length === 0) {
      console.warn('No data found for widget, using sample data');
      return generateSampleData();
    }

    // Validate records before processing
    const validRecords = records.filter(r => 
      r && typeof r === 'object' && r.data && typeof r.data === 'object'
    );

    if (validRecords.length === 0) {
      return generateSampleData();
    }

    // Transform records based on chart type and field selection
    switch (widget.type) {
      case 'bar':
      case 'line':
      case 'area':
        // For these charts, we need x-axis and y-axis fields
        if (!xField || !yField) return generateSampleData();
        return validRecords.map(r => {
          const dataObj = r.data;
          return {
            ...dataObj,
            [xField]: String(dataObj[xField] || 'Unknown'),
            [yField]: typeof dataObj[yField] === 'number' ? dataObj[yField] : 0
          };
        }).filter(item => item && typeof item === 'object').slice(0, 12);

      case 'pie':
        // For pie charts, we need category and value fields
        if (!categoryField || !valueField) return generateSampleData();
        return validRecords.map(r => {
          const dataObj = r.data;
          return {
            name: String(dataObj[categoryField] || 'Unknown'),
            value: typeof dataObj[valueField] === 'number' ? dataObj[valueField] : 0
          };
        }).filter(item => item && typeof item === 'object');

      case 'kpi':
        // For KPI, aggregate the value field
        if (!valueField) return generateSampleData();
        const total = validRecords.reduce((sum, r) => {
          const val = typeof r.data[valueField] === 'number' ? r.data[valueField] : 0;
          return sum + val;
        }, 0);
        return [{ metric: widget.title, value: total }];

      case 'table':
        // For tables, return all available fields
        return validRecords.map(r => r.data).filter(item => item && typeof item === 'object').slice(0, 20);

      default:
        return generateSampleData();
    }
  } catch (error) {
    console.error('Error fetching widget data:', error);
    return generateSampleData();
  }
};

// WidgetRenderer Component - Extracted outside of DashboardBuilderAdvanced to prevent re-creation
const WidgetRenderer = ({ widget, isEditing, onSelect, onDelete, onResize, tenantId }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

  // Fetch real data when widget or its configuration changes
  useEffect(() => {
    if (!tenantId || !widget || !widget.id) return;
    
    const loadData = async () => {
      setLoading(true);
      try {
        const widgetData = await fetchWidgetData(supabase, tenantId, widget);
        // Ensure data is always an array of plain objects
        if (Array.isArray(widgetData)) {
          setData(widgetData);
        } else {
          setData([]);
        }
      } catch (error) {
        console.error('Error loading widget data:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [widget?.id, widget?.dataSourceId, tenantId]);

  const renderCharts = () => {
    if (!Array.isArray(data)) return null;
    
    const validData = data.filter(item => 
      item && 
      typeof item === 'object' && 
      !('$$typeof' in item) &&
      typeof item !== 'function'
    );

    if (validData.length === 0) {
      return <div className="p-4 text-gray-500 text-sm">No valid data</div>;
    }

    const { xField = 'month', yField = 'sales' } = widget?.dataConfig || {};

    try {
      switch (widget?.type) {
        case 'bar':
          return (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={validData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={xField} />
                <YAxis />
                <Tooltip />
                <Bar dataKey={yField} fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          );
        case 'line':
          return (
            <ResponsiveContainer width="100%" height="100%">
              <RechartLineChart data={validData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={xField} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey={yField} stroke="#10b981" />
              </RechartLineChart>
            </ResponsiveContainer>
          );
        case 'pie':
          return (
            <ResponsiveContainer width="100%" height="100%">
              <RechartPieChart>
                <Pie data={validData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                  {validData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </RechartPieChart>
            </ResponsiveContainer>
          );
        case 'kpi':
          const val = validData[0]?.value || 0;
          return (
            <div className="flex justify-center items-center h-full">
              <div className="text-4xl font-bold">{val}</div>
            </div>
          );
        case 'table':
          const cols = Object.keys(validData[0] || {}).slice(0, 5);
          return (
            <div className="p-2 overflow-auto" style={{height: '100%'}}>
              <table className="w-full text-xs">
                <thead>
                  <tr>{cols.map(c => <th key={c}>{c}</th>)}</tr>
                </thead>
                <tbody>
                  {validData.map((r, i) => (
                    <tr key={i}>{cols.map(c => <td key={c}>{String(r[c] || '')}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        default:
          return <div className="p-4 text-gray-500">Type: {widget?.type}</div>;
      }
    } catch (err) {
      console.error('Chart render error:', err);
      return <div className="p-4 text-red-500 text-xs">Chart error: {String(err?.message || err)}</div>;
    }
  };

  return (
    <div
      onClick={() => onSelect?.(widget?.id)}
      className="rounded border bg-white overflow-hidden flex flex-col"
      style={{
        gridColumn: `span ${Math.min(widget?.size || 3, 12)}`,
        minHeight: '300px',
        backgroundColor: widget?.bgColor || '#ffffff',
      }}
    >
      <div className="bg-gray-100 border-b px-3 py-2 flex justify-between items-center text-sm">
        <span className="font-medium">{widget?.title || 'Widget'}</span>
        {isEditing && (
          <button onClick={(e) => { e.stopPropagation(); onDelete?.(widget?.id); }} className="text-red-600 text-xs">
            ✕
          </button>
        )}
      </div>
      <div className="flex-1 overflow-hidden p-2">
        {loading ? (
          <div className="flex justify-center items-center h-full text-gray-400 text-sm">
            Loading...
          </div>
        ) : (
          renderCharts()
        )}
      </div>
    </div>
  );
};

const fetchDashboardData = async (tenantId) => {
  try {
    const supabaseModule = await import('../../lib/supabase');
    const { supabase } = supabaseModule;
    
    const { data, error } = await supabase
      .from('records')
      .select('*')
      .eq('tenant_id', tenantId)
      .limit(12);
    
    if (error) {
      console.warn('Error fetching records, using sample data:', error);
      return generateSampleData();
    }
    
    // Transform database records into chart-compatible format
    if (!data || data.length === 0) {
      return generateSampleData();
    }
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return data.slice(0, 12).map((record, idx) => ({
      id: record.id,
      record_name: record.name || `Record ${idx + 1}`,
      month: months[idx % 12],
      sales: Math.floor(Math.random() * 4000 + 1000),
      revenue: Math.floor(Math.random() * 9800 + 1000),
      users: Math.floor(Math.random() * 2000 + 1000),
      growth: parseFloat((Math.random() * 3 + 1).toFixed(2)),
      value: Math.floor(Math.random() * 5000 + 1000)
    }));
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return generateSampleData();
  }
};

const DashboardBuilderAdvanced = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, tenantId } = useAuth();
  const toast = useToast();
  const dashboardId = searchParams.get('id');
  
  const [isPreview, setIsPreview] = useState(false);
  const [dashboardName, setDashboardName] = useState('Sales Dashboard');
  const [dashboardDescription, setDashboardDescription] = useState('Comprehensive sales performance metrics');
  const [layout, setLayout] = useState('grid');
  const [widgets, setWidgets] = useState([
    { id: '1', title: 'Monthly Sales', type: 'bar', size: 3, bgColor: '#ffffff', locked: false },
    { id: '2', title: 'Revenue Trend', type: 'line', size: 3, bgColor: '#ffffff', locked: false },
    { id: '3', title: 'Total Revenue', type: 'kpi', size: 2, bgColor: '#f0f9ff', locked: false },
    { id: '4', title: 'Sales Distribution', type: 'pie', size: 2, bgColor: '#ffffff', locked: false },
  ]);
  const [selectedWidgetId, setSelectedWidgetId] = useState(null);
  const [isAddingWidget, setIsAddingWidget] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [gridCols, setGridCols] = useState(12);
  const [dataSources, setDataSources] = useState([]);
  const [loadingDataSources, setLoadingDataSources] = useState(false);
  const [dataSourceFields, setDataSourceFields] = useState({});
  const [loadingFields, setLoadingFields] = useState({});
  const [loading, setLoading] = useState(false);
  const [dashboards, setDashboards] = useState([]);
  const [loadingDashboards, setLoadingDashboards] = useState(false);
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);
  const [activeChartCategory, setActiveChartCategory] = useState('Basic');
  const [advancedDataConfig, setAdvancedDataConfig] = useState({});
  
  // Load all dashboards for current tenant
  const loadAllDashboards = useCallback(async () => {
    if (!tenantId) return;
    
    setLoadingDashboards(true);
    try {
      const allDashboards = await dashboardService.getAll(tenantId);
      setDashboards(Array.isArray(allDashboards) ? allDashboards : []);
    } catch (err) {
      console.error('Error loading dashboards:', err);
      setDashboards([]);
    } finally {
      setLoadingDashboards(false);
    }
  }, [tenantId]);

  // Load dashboards when tenantId changes
  useEffect(() => {
    if (tenantId) {
      loadAllDashboards();
    }
  }, [tenantId, loadAllDashboards]);
  
  // Load data sources (tables) from database
  // Define loadDataSources first so we can use it in useEffect
  const loadDataSources = useCallback(async () => {
    setLoadingDataSources(true);
    try {
      const { data, error } = await supabase
        .from('sub_modules')
        .select('id, name')
        .eq('tenant_id', tenantId)
        .eq('status', 'active')
        .order('order_index')
        .limit(20);

      if (!error && data) {
        setDataSources(data.map(m => ({
          id: m.id,
          // Handle both JSONB and string name formats
          name: typeof m.name === 'string' ? m.name : (m.name?.en || 'Unnamed'),
          label: typeof m.name === 'string' ? m.name : (m.name?.en || 'Unnamed')
        })));
      }
    } catch (err) {
      console.error('Error loading data sources:', err);
    } finally {
      setLoadingDataSources(false);
    }
  }, [tenantId]);

  // Call loadDataSources when tenantId changes
  useEffect(() => {
    if (tenantId) {
      loadDataSources();
    }
  }, [tenantId]);

  // Load fields for a specific data source (sub-module)
  const loadFields = useCallback(async (dataSourceId) => {
    if (!dataSourceId || dataSourceFields[dataSourceId]) {
      return; // Already cached
    }

    setLoadingFields(prev => ({ ...prev, [dataSourceId]: true }));
    try {
      // Get fields from sub_module_fields table
      const { data: fieldsData, error } = await supabase
        .from('sub_module_fields')
        .select('name, label')
        .eq('sub_module_id', dataSourceId)
        .eq('status', 'active')
        .order('order_index');

      if (!error && fieldsData) {
        const fields = fieldsData.map(field => ({
          name: field.name,
          label: typeof field.label === 'string' 
            ? field.label 
            : field.label?.en || field.name
        }));
        
        setDataSourceFields(prev => ({ ...prev, [dataSourceId]: fields }));
      } else {
        setDataSourceFields(prev => ({ ...prev, [dataSourceId]: [] }));
      }
    } catch (err) {
      console.error('Error loading fields:', err);
      setDataSourceFields(prev => ({ ...prev, [dataSourceId]: [] }));
    } finally {
      setLoadingFields(prev => ({ ...prev, [dataSourceId]: false }));
    }
  }, []);

  // Load dashboard data
  const loadDashboard = useCallback(async () => {
    if (!dashboardId) return;
    
    setLoading(true);
    try {
      const dashboard = await dashboardService.getById(dashboardId);
      if (dashboard) {
        setDashboardName(dashboard.name || 'New Dashboard');
        setDashboardDescription(dashboard.description || '');
        setLayout(dashboard.layout || 'grid');
        
        // Load widgets from layout config
        const dashboardWidgets = dashboard.layout_config?.widgets || dashboard.widgets || [];
        if (dashboardWidgets.length > 0) {
          setWidgets(dashboardWidgets.map(w => {
            // Sanitize widget to ensure only valid properties
            const cleanWidget = {
              id: w.id || `w-${Date.now()}`,
              title: typeof w.title === 'string' ? w.title : 'Widget',
              type: w.type || 'bar',
              size: w.width || w.size || 3,
              bgColor: typeof w.bgColor === 'string' ? w.bgColor : '#ffffff',
              locked: Boolean(w.locked),
              dataSourceId: w.dataSourceId || null,
              dataConfig: typeof w.dataConfig === 'object' ? w.dataConfig : {}
            };
            return cleanWidget;
          }));
        }
      }
    } catch (err) {
      toast?.error('Failed to load dashboard');
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [dashboardId, toast]);

  // Load dashboard when ID changes
  useEffect(() => {
    if (dashboardId && tenantId) {
      loadDashboard();
    }
  }, [dashboardId, tenantId]);

  // Select dashboard from list
  const handleSelectDashboard = (id) => {
    navigate(`/dashboard-builder-studio?id=${id}`);
  };

  const selectedWidget = widgets.find(w => w.id === selectedWidgetId);

  const handleAddWidget = (type) => {
    const newWidget = {
      id: `w-${Date.now()}`,
      title: `New ${type} Chart`,
      type,
      size: 3,
      bgColor: '#ffffff',
      locked: false,
    };
    setWidgets([...widgets, newWidget]);
    setSelectedWidgetId(newWidget.id);
    setIsAddingWidget(false);
    toast?.success('Widget added');
  };

  const handleDeleteWidget = (id) => {
    setWidgets(widgets.filter(w => w.id !== id));
    setSelectedWidgetId(null);
    toast?.success('Widget deleted');
  };

  const handleUpdateWidget = (id, updates) => {
    setWidgets(widgets.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  const handleSaveDashboard = async () => {
    if (!dashboardName.trim()) {
      toast?.error('Dashboard name is required');
      return;
    }

    try {
      const dashboardData = {
        name: dashboardName,
        description: dashboardDescription,
        layout,
        layout_config: {
          widgets: widgets.map(w => ({
            id: w.id,
            title: w.title,
            type: w.type,
            width: w.size,
            height: w.height || 3,
            position_x: w.position_x || 0,
            position_y: w.position_y || 0,
            bgColor: w.bgColor,
            config: w.config || {}
          })),
          gridCols
        },
        is_published: false,
        status: 'draft'
      };

      if (dashboardId) {
        // Update existing dashboard
        const updated = await dashboardService.update(dashboardId, dashboardData);
        toast?.success('Dashboard updated successfully');
        // Reload to show updated data
        window.location.reload();
      } else {
        // Create new dashboard
        const created = await dashboardService.create({
          ...dashboardData,
          tenant_id: tenantId
        });
        toast?.success('Dashboard created successfully');
        // Navigate to the new dashboard
        navigate(`/dashboard-builder-studio?id=${created.id}`);
      }
    } catch (err) {
      toast?.error('Failed to save dashboard');
      console.error('Error saving dashboard:', err);
    }
  };

  const handleExport = () => {
    const data = { dashboardName, dashboardDescription, widgets, layout };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-${Date.now()}.json`;
    a.click();
    toast?.success('Dashboard exported');
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="flex-shrink-0 w-60">
        <AdminSidebar />
      </div>

      <div className="flex-1 flex flex-col">
        {/* Dashboard Selector */}
        <div className="bg-muted/50 border-b border-border px-6 py-3">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-foreground">Load Dashboard:</label>
            <select
              value={dashboardId || ''}
              onChange={(e) => {
                if (e.target.value) {
                  handleSelectDashboard(e.target.value);
                } else {
                  navigate('/dashboard-builder-studio');
                }
              }}
              disabled={loadingDashboards}
              className="px-3 py-2 rounded bg-background border border-border text-foreground text-sm disabled:opacity-50"
            >
              <option value="">New Dashboard</option>
              {dashboards.map(db => (
                <option key={db.id} value={db.id}>
                  {db.name || 'Untitled'}
                </option>
              ))}
            </select>
            {loadingDashboards && <span className="text-xs text-muted-foreground">Loading...</span>}
          </div>
        </div>
        
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card border-b border-border shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{dashboardName}</h1>
              <p className="text-sm text-muted-foreground">{dashboardDescription}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={isPreview ? 'default' : 'outline'}
                size="sm"
                iconName={isPreview ? 'Edit2' : 'Eye'}
                onClick={() => setIsPreview(!isPreview)}
              >
                {isPreview ? 'Edit' : 'Preview'}
              </Button>
              <Button variant="outline" size="sm" iconName="Share2">
                Share
              </Button>
              <Button variant="outline" size="sm" iconName="Download" onClick={handleExport}>
                Export
              </Button>
              <Button variant="default" size="sm" iconName="Save" onClick={handleSaveDashboard}>
                Save
              </Button>
            </div>
          </div>

          {!isPreview && (
            <div className="border-t border-border bg-muted/30 max-h-48 overflow-y-auto">
              {/* Chart Category Tabs */}
              <div className="px-6 py-2 flex gap-1 border-b border-border bg-white sticky top-0 overflow-x-auto">
                {Object.keys(CHART_CATEGORIES).map(category => (
                  <button
                    key={category}
                    onClick={() => setActiveChartCategory(category)}
                    className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-all ${
                      activeChartCategory === category
                        ? 'bg-primary text-white'
                        : 'bg-muted text-foreground hover:bg-muted/80'
                    }`}
                  >
                    {category}
                  </button>
                ))}
                <button
                  onClick={() => setShowAdvancedConfig(!showAdvancedConfig)}
                  className={`ml-auto px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1 transition-all ${
                    showAdvancedConfig
                      ? 'bg-purple-600 text-white'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                  }`}
                >
                  <Code size={14} /> Advanced Config
                </button>
              </div>

              {/* Charts for selected category */}
              {showAdvancedConfig ? (
                <div className="p-4 bg-white">
                  <AdvancedDataConfigBuilder
                    tenantId={tenantId}
                    initialConfig={advancedDataConfig}
                    onChange={setAdvancedDataConfig}
                    onPreview={(data) => {
                      if (selectedWidget) {
                        handleUpdateWidget(selectedWidget.id, {
                          dataConfig: { ...selectedWidget.dataConfig, ...advancedDataConfig }
                        });
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="px-6 py-2 flex gap-2 flex-wrap">
                  {getChartsByCategory(activeChartCategory).map(chart => {
                    const IconComponent = chart.icon;
                    return (
                      <button
                        key={chart.type}
                        onClick={() => {
                          handleAddWidget(chart.type);
                          toast?.success(`${chart.label} added`);
                        }}
                        title={chart.description}
                        className="flex flex-col items-center gap-1 px-3 py-2 rounded bg-white border border-border hover:border-primary hover:shadow-md transition text-xs font-medium"
                      >
                        <IconComponent size={18} />
                        <span className="whitespace-nowrap">{chart.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto flex">
          {/* Canvas Area */}
          <div className="flex-1 p-6 overflow-auto">
            {isPreview ? (
              // Preview Mode
              <div className="max-w-7xl mx-auto">
                <div className="grid gap-6 auto-rows-max" style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}>
                  {widgets.map(widget => (
                    <WidgetRenderer
                      key={widget.id}
                      widget={widget}
                      isEditing={false}
                      onSelect={() => {}}
                      onDelete={() => {}}
                      tenantId={tenantId}
                    />
                  ))}
                </div>
              </div>
            ) : (
              // Edit Mode
              <div className="max-w-7xl mx-auto">
                <div className="mb-4 flex items-center gap-4">
                  <label className="text-sm font-medium text-foreground">Grid Columns:</label>
                  <div className="flex gap-2">
                    {[6, 12, 16, 24].map(cols => (
                      <button
                        key={cols}
                        onClick={() => setGridCols(cols)}
                        className={`px-3 py-1 rounded text-sm transition-all ${
                          gridCols === cols
                            ? 'bg-primary text-white'
                            : 'bg-muted text-foreground hover:bg-muted/80'
                        }`}
                      >
                        {cols} cols
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 auto-rows-max" style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}>
                  {widgets.map(widget => (
                    <WidgetRenderer
                      key={widget.id}
                      widget={widget}
                      isEditing={selectedWidgetId === widget.id}
                      onSelect={setSelectedWidgetId}
                      onDelete={handleDeleteWidget}
                      tenantId={tenantId}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - Properties */}
          {!isPreview && selectedWidget && (
            <div className="w-72 border-l border-border bg-card overflow-auto">
              <div className="p-4 border-b border-border sticky top-0 bg-card">
                <h3 className="font-semibold text-foreground">Widget Properties</h3>
              </div>

              <div className="p-4 space-y-4">
                {/* Title */}
                <div>
                  <label className="text-xs font-medium text-foreground">Title</label>
                  <Input
                    value={selectedWidget.title}
                    onChange={(e) => handleUpdateWidget(selectedWidget.id, { title: e.target.value })}
                    className="mt-1"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="text-xs font-medium text-foreground">Chart Type</label>
                  <select
                    value={selectedWidget.type}
                    onChange={(e) => handleUpdateWidget(selectedWidget.id, { type: e.target.value })}
                    className="w-full mt-1 p-2 border border-border rounded text-sm"
                  >
                    {Object.entries(CHART_TYPES).map(([type, config]) => (
                      <option key={type} value={type}>{config.label}</option>
                    ))}
                  </select>
                </div>

                {/* Data Source */}
                <div>
                  <label className="text-xs font-medium text-foreground">Data Source</label>
                  <select
                    value={selectedWidget.dataSourceId || ''}
                    onChange={(e) => {
                      const dataSourceId = e.target.value;
                      if (dataSourceId) {
                        loadFields(dataSourceId);
                        handleUpdateWidget(selectedWidget.id, { 
                          dataSourceId,
                          dataConfig: {} // Reset config when changing data source
                        });
                      }
                    }}
                    className="w-full mt-1 p-2 border border-border rounded text-sm"
                    disabled={loadingDataSources}
                  >
                    <option value="">Select a data source...</option>
                    {dataSources.map(ds => (
                      <option key={ds.id} value={ds.id}>{ds.name}</option>
                    ))}
                  </select>
                </div>

                {/* Field Configuration - Shown when data source is selected */}
                {selectedWidget.dataSourceId && (
                  <div className="border-t border-border pt-4 space-y-3">
                    <p className="text-xs font-medium text-muted-foreground">Field Mapping</p>
                    
                    {/* X-Axis Field (for bar, line, area charts) */}
                    {['bar', 'line', 'area'].includes(selectedWidget.type) && (
                      <div>
                        <label className="text-xs font-medium text-foreground">Category (X-Axis)</label>
                        <select
                          value={selectedWidget.dataConfig?.xField || ''}
                          onChange={(e) => handleUpdateWidget(selectedWidget.id, {
                            dataConfig: { ...selectedWidget.dataConfig, xField: e.target.value }
                          })}
                          className="w-full mt-1 p-2 border border-border rounded text-sm"
                          disabled={loadingFields[selectedWidget.dataSourceId]}
                        >
                          <option value="">Select field...</option>
                          {(dataSourceFields[selectedWidget.dataSourceId] || []).map(field => (
                            <option key={field.name} value={field.name}>{field.label}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Y-Axis Field (for bar, line, area charts) */}
                    {['bar', 'line', 'area'].includes(selectedWidget.type) && (
                      <div>
                        <label className="text-xs font-medium text-foreground">Values (Y-Axis)</label>
                        <select
                          value={selectedWidget.dataConfig?.yField || ''}
                          onChange={(e) => handleUpdateWidget(selectedWidget.id, {
                            dataConfig: { ...selectedWidget.dataConfig, yField: e.target.value }
                          })}
                          className="w-full mt-1 p-2 border border-border rounded text-sm"
                          disabled={loadingFields[selectedWidget.dataSourceId]}
                        >
                          <option value="">Select field...</option>
                          {(dataSourceFields[selectedWidget.dataSourceId] || []).map(field => (
                            <option key={field.name} value={field.name}>{field.label}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Value Field (for pie, kpi charts) */}
                    {['pie', 'kpi'].includes(selectedWidget.type) && (
                      <div>
                        <label className="text-xs font-medium text-foreground">Metric Field</label>
                        <select
                          value={selectedWidget.dataConfig?.valueField || ''}
                          onChange={(e) => handleUpdateWidget(selectedWidget.id, {
                            dataConfig: { ...selectedWidget.dataConfig, valueField: e.target.value }
                          })}
                          className="w-full mt-1 p-2 border border-border rounded text-sm"
                          disabled={loadingFields[selectedWidget.dataSourceId]}
                        >
                          <option value="">Select field...</option>
                          {(dataSourceFields[selectedWidget.dataSourceId] || []).map(field => (
                            <option key={field.name} value={field.name}>{field.label}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Category Field (for pie charts) */}
                    {selectedWidget.type === 'pie' && (
                      <div>
                        <label className="text-xs font-medium text-foreground">Category</label>
                        <select
                          value={selectedWidget.dataConfig?.categoryField || ''}
                          onChange={(e) => handleUpdateWidget(selectedWidget.id, {
                            dataConfig: { ...selectedWidget.dataConfig, categoryField: e.target.value }
                          })}
                          className="w-full mt-1 p-2 border border-border rounded text-sm"
                          disabled={loadingFields[selectedWidget.dataSourceId]}
                        >
                          <option value="">Select field...</option>
                          {(dataSourceFields[selectedWidget.dataSourceId] || []).map(field => (
                            <option key={field.name} value={field.name}>{field.label}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {/* Size */}
                <div>
                  <label className="text-xs font-medium text-foreground">Size</label>
                  <select
                    value={selectedWidget.size}
                    onChange={(e) => handleUpdateWidget(selectedWidget.id, { size: parseInt(e.target.value) })}
                    className="w-full mt-1 p-2 border border-border rounded text-sm"
                  >
                    {GRID_SIZES.map(size => (
                      <option key={size.value} value={size.value}>{size.label}</option>
                    ))}
                  </select>
                </div>

                {/* Background Color */}
                <div>
                  <label className="text-xs font-medium text-foreground">Background Color</label>
                  <input
                    type="color"
                    value={selectedWidget.bgColor || '#ffffff'}
                    onChange={(e) => handleUpdateWidget(selectedWidget.id, { bgColor: e.target.value })}
                    className="w-full mt-1 p-2 border border-border rounded cursor-pointer"
                  />
                </div>

                {/* Lock Widget */}
                <div>
                  <button
                    onClick={() => handleUpdateWidget(selectedWidget.id, { locked: !selectedWidget.locked })}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded border border-border hover:bg-muted transition"
                  >
                    {selectedWidget.locked ? (
                      <>
                        <Lock size={16} />
                        <span className="text-sm">Locked</span>
                      </>
                    ) : (
                      <>
                        <Unlock size={16} />
                        <span className="text-sm">Unlock</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-border space-y-2">
                  <button onClick={() => toast?.info('Duplicate functionality coming soon')} className="w-full flex items-center gap-2 px-3 py-2 rounded bg-muted hover:bg-muted/80 transition text-sm">
                    <Copy size={14} /> Duplicate
                  </button>
                  <button onClick={() => handleDeleteWidget(selectedWidget.id)} className="w-full flex items-center gap-2 px-3 py-2 rounded bg-red-100 hover:bg-red-200 transition text-sm text-red-700">
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DashboardBuilderAdvanced;
