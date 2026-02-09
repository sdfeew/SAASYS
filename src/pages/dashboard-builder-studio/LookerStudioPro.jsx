import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Eye, EyeOff, Save, X, Database, ChevronRight, Settings, Grid3x3, BarChart3, TrendingUp, Zap, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BarChart, Bar, LineChart as RechartLineChart, Line, PieChart as RechartPieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useSearchParams } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import { databaseSchemaService } from '../../services/databaseSchemaService';
import { advancedDashboardService } from '../../services/advancedDashboardService';
import AdminSidebar from '../../components/ui/AdminSidebar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { generateUUID, isValidUUID } from '../../utils/uuidHelper';

const CHART_TYPES = {
  bar: { label: 'Bar Chart', icon: '📊', desc: 'Compare values' },
  line: { label: 'Line Chart', icon: '📈', desc: 'Show trends' },
  area: { label: 'Area Chart', icon: '📉', desc: 'Fill under line' },
  pie: { label: 'Pie Chart', icon: '🥧', desc: 'Show distribution' },
  scorecard: { label: 'Scorecard', icon: '🎯', desc: 'Single metric' },
  table: { label: 'Table', icon: '📋', desc: 'Show details' },
  kpi: { label: 'KPI Panel', icon: '⚡', desc: 'Key metrics' },
};

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#8b5cf6'];

// Modern Gradient backgrounds
const GRADIENTS = [
  'from-blue-500 to-cyan-500',
  'from-purple-500 to-pink-500',
  'from-green-500 to-emerald-500',
  'from-orange-500 to-red-500',
  'from-indigo-500 to-blue-500',
];

const generateSampleData = (rows = 12) => {
  const data = [];
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  for (let i = 0; i < Math.min(rows, 12); i++) {
    data.push({
      name: labels[i],
      value1: Math.floor(Math.random() * 5000) + 1000,
      value2: Math.floor(Math.random() * 4000) + 1000,
      value3: Math.floor(Math.random() * 3000) + 1000,
      value4: Math.floor(Math.random() * 2000) + 500,
    });
  }
  return data;
};

const KPICard = ({ icon, label, value, trend, color = 'blue' }) => (
  <div className={`bg-gradient-to-br from-${color}-50 to-${color}-100 p-6 rounded-xl border border-${color}-200 shadow-sm hover:shadow-md transition-shadow`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 font-medium">{label}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value.toLocaleString()}</p>
        {trend !== undefined && (
          <div className={`flex items-center mt-2 text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className={`text-${color}-500 opacity-20`}>{icon}</div>
    </div>
  </div>
);

const ChartComponent = ({ widget }) => {
  const chartData = generateSampleData();
  const metric = widget.config?.metric || 'value1';
  const dimension = widget.config?.dimension || 'name';

  switch (widget.type) {
    case 'bar':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey={dimension} tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
            <Legend />
            <Bar dataKey={metric} fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    case 'line':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <RechartLineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey={dimension} tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
            <Legend />
            <Line type="monotone" dataKey={metric} stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
          </RechartLineChart>
        </ResponsiveContainer>
      );
    case 'area':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey={dimension} tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
            <Legend />
            <Area type="monotone" dataKey={metric} fill="#3b82f6" stroke="#3b82f6" fillOpacity={0.1} />
          </AreaChart>
        </ResponsiveContainer>
      );
    case 'pie':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <RechartPieChart>
            <Pie data={chartData} dataKey={metric} nameKey={dimension} cx="50%" cy="50%" outerRadius={70} label={false}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
          </RechartPieChart>
        </ResponsiveContainer>
      );
    case 'kpi':
      return (
        <div className="flex items-center justify-center h-full p-6">
          <div className="text-center">
            <div className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {Math.floor(Math.random() * 100000)}
            </div>
            <div className="text-sm text-gray-600 mt-4">{widget.config?.title || 'Key Metric'}</div>
            <div className="flex items-center justify-center gap-2 mt-4 text-green-600 font-semibold">
              <TrendingUp size={18} /> +12.5%
            </div>
          </div>
        </div>
      );
    case 'scorecard':
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-5xl font-bold text-blue-600">{Math.floor(Math.random() * 10000)}</div>
            <div className="text-sm text-slate-600 mt-2">{widget.config?.title || 'Metric'}</div>
          </div>
        </div>
      );
    case 'table':
      return (
        <div className="overflow-auto h-full">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">{dimension}</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">{metric}</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((row, idx) => (
                <tr key={idx} className={`border-t border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-blue-50 transition`}>
                  <td className="px-4 py-3 text-slate-900 font-medium">{row[dimension]}</td>
                  <td className="px-4 py-3 text-slate-700">{row[metric]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    default:
      return <div className="flex items-center justify-center h-full text-slate-500">Unknown chart type</div>;
  }
};

export default function LookerStudioPro() {
  const { user } = useAuth();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const dashboardIdParam = searchParams.get('id');

  const [dashboards, setDashboards] = useState([]);
  const [currentDashboard, setCurrentDashboard] = useState(null);
  const [widgets, setWidgets] = useState([]);
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [isPreview, setIsPreview] = useState(false);
  const [tables, setTables] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dashboardName, setDashboardName] = useState('New Dashboard');
  const [dashboardDescription, setDashboardDescription] = useState('');
  
  const [addingWidget, setAddingWidget] = useState(false);
  const [addStep, setAddStep] = useState(1);
  const [newWidget, setNewWidget] = useState({
    id: generateUUID(),
    title: 'New Chart',
    type: 'bar',
    config: { metric: 'value1', dimension: 'name', table: '', aggregation: 'sum' },
  });

  useEffect(() => {
    loadDashboards();
    loadTables();
  }, [user?.id]);

  useEffect(() => {
    if (dashboardIdParam && dashboards.length > 0) {
      const dashboard = dashboards.find(d => d.id === dashboardIdParam);
      if (dashboard) {
        selectDashboard(dashboard);
      }
    }
  }, [dashboardIdParam, dashboards]);

  const loadDashboards = async () => {
    setLoading(true);
    try {
      const tenantId = user?.user_metadata?.tenant_id;
      const data = await dashboardService.getAll(tenantId);
      setDashboards(data);
      if (data.length > 0 && !dashboardIdParam) {
        selectDashboard(data[0]);
      }
    } catch (err) {
      console.error('Error loading dashboards:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTables = async () => {
    try {
      const tableList = await databaseSchemaService.getTables();
      setTables(tableList);
    } catch (err) {
      console.error('Error loading tables:', err);
    }
  };

  const loadColumns = async (tableName) => {
    try {
      const cols = await databaseSchemaService.getTableColumns(tableName);
      setColumns(cols);
    } catch (err) {
      console.error('Error loading columns:', err);
    }
  };

  const selectDashboard = async (dashboard) => {
    setCurrentDashboard(dashboard);
    setDashboardName(dashboard.name);
    setDashboardDescription(dashboard.description || '');
    try {
      const layoutConfig = dashboard.layout_config || {};
      let dashboardWidgets = layoutConfig.widgets || [];
      dashboardWidgets = dashboardWidgets.filter(w => !w.id || isValidUUID(w.id));
      setWidgets(dashboardWidgets);
      setSelectedWidget(null);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    }
  };

  const startAddingWidget = () => {
    setAddingWidget(true);
    setAddStep(1);
    setNewWidget({
      id: generateUUID(),
      title: 'New Chart',
      type: 'bar',
      config: { metric: 'value1', dimension: 'name', table: '', aggregation: 'sum' },
    });
  };

  const continueToStep = (step) => {
    if (step === 2 && !newWidget.type) {
      alert('Please select a chart type');
      return;
    }
    if (step === 3 && !newWidget.config.table) {
      alert('Please select a data source');
      return;
    }
    setAddStep(step);
  };

  const finishAddingWidget = () => {
    if (!newWidget.config.table || !newWidget.title) {
      alert('Please complete all fields');
      return;
    }
    setWidgets([...widgets, newWidget]);
    setAddingWidget(false);
    setSelectedWidget(newWidget);
    setAddStep(1);
  };

  const updateWidget = (widgetId, updates) => {
    setWidgets(widgets.map(w => w.id === widgetId ? { ...w, ...updates } : w));
  };

  const deleteWidget = (widgetId) => {
    if (confirm('Delete this widget?')) {
      setWidgets(widgets.filter(w => w.id !== widgetId));
      setSelectedWidget(null);
    }
  };

  const saveDashboard = async () => {
    if (!currentDashboard) {
      alert('Please select or create a dashboard first');
      return;
    }

    setSaving(true);
    try {
      const layoutConfig = {
        widgets: widgets.map(w => ({
          id: w.id,
          title: w.title,
          type: w.type,
          config: w.config,
        })),
      };

      await dashboardService.update(currentDashboard.id, {
        name: dashboardName,
        description: dashboardDescription,
        layoutConfig: layoutConfig,
      });

      alert('✅ Dashboard saved successfully!');
    } catch (err) {
      console.error('Error saving dashboard:', err);
      alert('Failed to save dashboard');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading Dashboard Builder..." />;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="flex-shrink-0 w-60 lg:w-60 overflow-hidden">
        <AdminSidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Premium Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-8 py-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur">
                  <BarChart3 size={24} />
                </div>
                <input
                  type="text"
                  value={dashboardName}
                  onChange={(e) => setDashboardName(e.target.value)}
                  className="text-3xl font-bold bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-blue-400 px-2 py-1 rounded text-white placeholder-gray-400"
                  placeholder="Dashboard Name"
                />
              </div>
              <textarea
                value={dashboardDescription}
                onChange={(e) => setDashboardDescription(e.target.value)}
                placeholder="Add a description..."
                rows="1"
                className="w-full bg-white/5 text-gray-300 border border-white/10 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm resize-none"
              />
            </div>

            <div className="flex items-center gap-3 ml-6">
              <select 
                value={currentDashboard?.id || ''}
                onChange={(e) => {
                  const dashboard = dashboards.find(d => d.id === e.target.value);
                  if (dashboard) selectDashboard(dashboard);
                }}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm font-medium backdrop-blur"
              >
                <option value="" className="bg-slate-900">Select Dashboard</option>
                {dashboards.map(db => (
                  <option key={db.id} value={db.id} className="bg-slate-900">{db.name}</option>
                ))}
              </select>

              <button
                onClick={() => setIsPreview(!isPreview)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-medium ${
                  isPreview
                    ? 'bg-blue-500/20 text-blue-200 border border-blue-400/30'
                    : 'bg-white/10 text-gray-200 hover:bg-white/20'
                }`}
              >
                {isPreview ? <Eye size={18} /> : <EyeOff size={18} />}
                {isPreview ? 'Editing' : 'Preview'}
              </button>

              <button
                onClick={saveDashboard}
                disabled={saving}
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 rounded-lg hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 transition font-medium shadow-lg"
              >
                <Save size={18} />
                Save
              </button>
            </div>
          </div>
        </div>

        {/* Main Canvas */}
        <div className="flex flex-1 overflow-hidden gap-4 p-6">
          {/* Canvas Area */}
          <div className="flex-1 overflow-auto">
            {widgets.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="mb-6 animate-bounce">
                    <Grid3x3 size={64} className="text-slate-300 mx-auto" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-700 mb-3">Start Building Your Dashboard</h3>
                  <p className="text-slate-500 mb-8 max-w-md">Create beautiful, data-driven visualizations by adding widgets. Click below to get started.</p>
                  {!isPreview && (
                    <button
                      onClick={startAddingWidget}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition font-medium shadow-lg flex items-center gap-2 mx-auto"
                    >
                      <Plus size={20} />
                      Add Your First Widget
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {widgets.map(widget => (
                  <div
                    key={widget.id}
                    onClick={() => !isPreview && setSelectedWidget(widget)}
                    className={`group bg-white rounded-2xl overflow-hidden transition-all transform hover:-translate-y-1 cursor-pointer ${
                      selectedWidget?.id === widget.id
                        ? 'border-2 border-blue-500 shadow-2xl'
                        : 'border border-slate-200 shadow-md hover:shadow-xl'
                    }`}
                    style={{ minHeight: '320px' }}
                  >
                    {/* Widget Header */}
                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-sm">{widget.title}</h4>
                      {!isPreview && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteWidget(widget.id);
                          }}
                          className="p-1 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>

                    {/* Chart Area */}
                    <div className="p-5" style={{ height: 'calc(100% - 55px)' }}>
                      <ChartComponent widget={widget} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Panel */}
          {!isPreview && (
            <div className="w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
              {!addingWidget ? (
                <>
                  {!selectedWidget ? (
                    <div className="flex flex-col items-center justify-center h-full p-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center mb-6">
                        <Plus size={32} className="text-blue-600" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2">Add a Widget</h3>
                      <p className="text-slate-600 text-center text-sm mb-8">Click on a widget to edit or create a new one to get started</p>
                      <button
                        onClick={startAddingWidget}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition font-medium shadow-lg"
                      >
                        Create Widget
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100">
                        <div className="flex items-center gap-2">
                          <Settings size={18} className="text-blue-600" />
                          <h3 className="font-bold text-slate-900">Configuration</h3>
                        </div>
                        <button
                          onClick={() => setSelectedWidget(null)}
                          className="p-1 hover:bg-slate-200 rounded-lg transition"
                        >
                          <X size={18} />
                        </button>
                      </div>

                      <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Widget Title</label>
                          <input
                            type="text"
                            value={selectedWidget.title}
                            onChange={(e) => updateWidget(selectedWidget.id, { title: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Chart Type</label>
                          <select
                            value={selectedWidget.type}
                            onChange={(e) => updateWidget(selectedWidget.id, { type: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {Object.entries(CHART_TYPES).map(([key, value]) => (
                              <option key={key} value={key}>{value.label}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Data Source</label>
                          <select
                            value={selectedWidget.config?.table || ''}
                            onChange={(e) => {
                              loadColumns(e.target.value);
                              updateWidget(selectedWidget.id, {
                                config: { ...selectedWidget.config, table: e.target.value },
                              });
                            }}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Table</option>
                            {tables.map(table => (
                              <option key={table.table_name} value={table.table_name}>{table.table_name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Dimension</label>
                            <select
                              value={selectedWidget.config?.dimension || ''}
                              onChange={(e) =>
                                updateWidget(selectedWidget.id, {
                                  config: { ...selectedWidget.config, dimension: e.target.value },
                                })
                              }
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                              <option value="">Field</option>
                              {columns.map(col => (
                                <option key={col.name} value={col.name}>{col.name}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Metric</label>
                            <select
                              value={selectedWidget.config?.metric || ''}
                              onChange={(e) =>
                                updateWidget(selectedWidget.id, {
                                  config: { ...selectedWidget.config, metric: e.target.value },
                                })
                              }
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                              <option value="">Field</option>
                              {columns.map(col => (
                                <option key={col.name} value={col.name}>{col.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Aggregation</label>
                          <select
                            value={selectedWidget.config?.aggregation || 'sum'}
                            onChange={(e) =>
                              updateWidget(selectedWidget.id, {
                                config: { ...selectedWidget.config, aggregation: e.target.value },
                              })
                            }
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="sum">Sum</option>
                            <option value="count">Count</option>
                            <option value="avg">Average</option>
                            <option value="min">Minimum</option>
                            <option value="max">Maximum</option>
                          </select>
                        </div>
                      </div>

                      <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
                        <button
                          onClick={() => deleteWidget(selectedWidget.id)}
                          className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition font-medium border border-red-200"
                        >
                          <Trash2 size={18} />
                          Delete Widget
                        </button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  {/* Step 1: Chart Type */}
                  {addStep === 1 && (
                    <div className="flex flex-col h-full">
                      <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-blue-100">
                        <h3 className="font-bold text-slate-900">📊 Step 1: Choose Chart Type</h3>
                        <p className="text-xs text-slate-600 mt-1">Select the visualization that best fits your data</p>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {Object.entries(CHART_TYPES).map(([key, value]) => (
                          <button
                            key={key}
                            onClick={() => {
                              setNewWidget({ ...newWidget, type: key });
                              continueToStep(2);
                            }}
                            className={`w-full p-4 rounded-lg border-2 text-left font-medium transition ${
                              newWidget.type === key
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <span>{value.icon} {value.label}</span>
                                <p className="text-xs text-slate-600 font-normal mt-1">{value.desc}</p>
                              </div>
                              <ChevronRight size={18} className="text-slate-400" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 2: Data Source */}
                  {addStep === 2 && (
                    <div className="flex flex-col h-full">
                      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-green-50 to-green-100">
                        <div>
                          <h3 className="font-bold text-slate-900">📈 Step 2: Select Data</h3>
                          <p className="text-xs text-slate-600 mt-1">Choose which table to visualize</p>
                        </div>
                        <button
                          onClick={() => setAddStep(1)}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          ← Back
                        </button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {tables.map(table => (
                          <button
                            key={table.table_name}
                            onClick={() => {
                              loadColumns(table.table_name);
                              setNewWidget({
                                ...newWidget,
                                config: { ...newWidget.config, table: table.table_name },
                              });
                              continueToStep(3);
                            }}
                            className={`w-full p-4 rounded-lg border-2 text-left font-medium transition ${
                              newWidget.config.table === table.table_name
                                ? 'border-green-500 bg-green-50'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>📊 {table.table_name}</span>
                              <ChevronRight size={18} className="text-slate-400" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 3: Configuration */}
                  {addStep === 3 && (
                    <div className="flex flex-col h-full">
                      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-purple-50 to-purple-100">
                        <div>
                          <h3 className="font-bold text-slate-900">⚙️ Step 3: Configure</h3>
                          <p className="text-xs text-slate-600 mt-1">Set up your widget details</p>
                        </div>
                        <button
                          onClick={() => setAddStep(2)}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          ← Back
                        </button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
                          <input
                            type="text"
                            value={newWidget.title}
                            onChange={(e) => setNewWidget({ ...newWidget, title: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Monthly Sales"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Dimension (X-axis)</label>
                          <select
                            value={newWidget.config.dimension}
                            onChange={(e) =>
                              setNewWidget({
                                ...newWidget,
                                config: { ...newWidget.config, dimension: e.target.value },
                              })
                            }
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Field</option>
                            {columns.map(col => (
                              <option key={col.name} value={col.name}>{col.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Metric (Value)</label>
                          <select
                            value={newWidget.config.metric}
                            onChange={(e) =>
                              setNewWidget({
                                ...newWidget,
                                config: { ...newWidget.config, metric: e.target.value },
                              })
                            }
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Field</option>
                            {columns.map(col => (
                              <option key={col.name} value={col.name}>{col.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="px-6 py-4 border-t border-slate-200 space-y-2 bg-slate-50">
                        <button
                          onClick={finishAddingWidget}
                          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition font-medium shadow-lg"
                        >
                          Create Widget
                        </button>
                        <button
                          onClick={() => setAddingWidget(false)}
                          className="w-full border border-slate-300 text-slate-700 py-2 rounded-lg hover:bg-slate-100 transition font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
