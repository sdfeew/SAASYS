import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Copy, Download, Eye, EyeOff, Save, Settings, Type, BarChart3, LineChart, PieChart, Table as TableIcon, Filter, Palette, AlignLeft } from 'lucide-react';
import { BarChart, Bar, LineChart as RechartLineChart, Line, PieChart as RechartPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardService } from '../../services/dashboardService';
import { widgetService } from '../../services/widgetService';
import AdminSidebar from '../../components/ui/AdminSidebar';
import UserProfileDropdown from '../../components/ui/UserProfileDropdown';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Icon from '../../components/AppIcon';
import { generateUUID, isValidUUID } from '../../utils/uuidHelper';

// Sample data for preview
const SAMPLE_DATA = [
  { month: 'Jan', sales: 4000, users: 2400, engagement: 2400 },
  { month: 'Feb', sales: 3000, users: 1398, engagement: 2210 },
  { month: 'Mar', sales: 2000, users: 9800, engagement: 2290 },
  { month: 'Apr', sales: 2780, users: 3908, engagement: 2000 },
  { month: 'May', sales: 1890, users: 4800, engagement: 2181 },
  { month: 'Jun', sales: 2390, users: 3800, engagement: 2500 },
];

const CHART_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const ChartWidget = ({ widget, data = SAMPLE_DATA }) => {
  const config = widget.config || {};

  switch (widget.type) {
    case 'line':
      return (
        <div className="w-full h-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RechartLineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              {config.metrics?.map((metric, idx) => (
                <Line
                  key={metric}
                  type="monotone"
                  dataKey={metric}
                  stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                  strokeWidth={2}
                />
              )) || <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} />}
            </RechartLineChart>
          </ResponsiveContainer>
        </div>
      );

    case 'bar':
      return (
        <div className="w-full h-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              {config.metrics?.map((metric, idx) => (
                <Bar
                  key={metric}
                  dataKey={metric}
                  fill={CHART_COLORS[idx % CHART_COLORS.length]}
                />
              )) || <Bar dataKey="sales" fill="#3b82f6" />}
            </BarChart>
          </ResponsiveContainer>
        </div>
      );

    case 'pie':
      return (
        <div className="w-full h-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RechartPieChart>
              <Pie
                data={data}
                dataKey={config.metrics?.[0] || 'sales'}
                nameKey="month"
                cx="50%"
                cy="50%"
                outerRadius={50}
                label={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RechartPieChart>
          </ResponsiveContainer>
        </div>
      );

    case 'table':
      return (
        <div className="overflow-auto h-full w-full">
          <table className="w-full text-xs">
            <thead className="bg-slate-100 sticky top-0">
              <tr>
                <th className="px-2 py-1 text-left font-semibold">Month</th>
                {config.metrics?.map(metric => (
                  <th key={metric} className="px-2 py-1 text-left font-semibold">{metric}</th>
                )) || <>
                  <th className="px-2 py-1 text-left font-semibold">Sales</th>
                  <th className="px-2 py-1 text-left font-semibold">Users</th>
                </>}
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={idx} className="border-b hover:bg-slate-50">
                  <td className="px-2 py-1">{row.month}</td>
                  {config.metrics?.map(metric => (
                    <td key={metric} className="px-2 py-1">{row[metric]}</td>
                  )) || <>
                    <td className="px-2 py-1">{row.sales}</td>
                    <td className="px-2 py-1">{row.users}</td>
                  </>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'scorecard':
      return (
        <div className="flex flex-col items-center justify-center h-full w-full">
          <div className="text-4xl font-bold text-blue-600">
            {config.metrics?.[0] ? data[0]?.[config.metrics[0]] : '1,234'}
          </div>
          <p className="text-sm text-gray-600 mt-2">{config.title || 'Total'}</p>
        </div>
      );

    default:
      return (
        <div className="flex items-center justify-center h-full w-full bg-slate-50">
          <div className="text-center">
            <BarChart3 className="mx-auto text-gray-400 mb-2" size={40} />
            <p className="text-gray-600 text-sm">Chart preview</p>
          </div>
        </div>
      );
  }
};

const LookerStudioBuilder = () => {
  const { tenantId, user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [dashboards, setDashboards] = useState([]);
  const [widgets, setWidgets] = useState([]);
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dashboardName, setDashboardName] = useState('');
  const [currentDashboardId, setCurrentDashboardId] = useState(null);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [newWidget, setNewWidget] = useState({
    title: 'New Chart',
    type: 'bar',
    width: 4,
    height: 3,
    config: { metrics: ['sales'] }
  });

  const widgetTypes = [
    { id: 'bar', label: 'Bar Chart', icon: BarChart3 },
    { id: 'line', label: 'Line Chart', icon: LineChart },
    { id: 'pie', label: 'Pie Chart', icon: PieChart },
    { id: 'table', label: 'Table', icon: TableIcon },
    { id: 'scorecard', label: 'Scorecard', icon: Type },
  ];

  useEffect(() => {
    if (tenantId) {
      loadDashboards();
    }
  }, [tenantId]);

  const loadDashboards = async () => {
    try {
      setLoading(true);
      const allDashboards = await dashboardService.getAll(tenantId);
      setDashboards(allDashboards || []);

      const dashboardId = new URLSearchParams(window.location.search).get('id');
      if (dashboardId) {
        loadDashboard(dashboardId);
      } else if (allDashboards && allDashboards.length > 0) {
        loadDashboard(allDashboards[0].id);
      }
    } catch (err) {
      console.error('Error loading dashboards:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboard = async (dashboardId) => {
    try {
      const data = await dashboardService.getById(dashboardId);
      setDashboard(data);
      setCurrentDashboardId(data.id);
      setDashboardName(data.name);
      
      // Filter out widgets with invalid UUIDs (old timestamp IDs)
      const validWidgets = (data.layout_config?.widgets || []).filter(w => isValidUUID(w.id));
      setWidgets(validWidgets);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    }
  };

  const handleAddWidget = () => {
    if (!dashboard) return;

    const widget = {
      id: generateUUID(),
      ...newWidget,
      position: { x: 0, y: widgets.length * 4 }
    };

    const updatedWidgets = [...widgets, widget];
    setWidgets(updatedWidgets);
    setShowAddWidget(false);
    setNewWidget({ title: 'New Chart', type: 'bar', width: 4, height: 3, config: { metrics: ['sales'] } });
  };

  const handleDeleteWidget = (widgetId) => {
    setWidgets(widgets.filter(w => w.id !== widgetId));
    if (selectedWidget?.id === widgetId) {
      setSelectedWidget(null);
    }
  };

  const handleUpdateWidget = (widgetId, updates) => {
    setWidgets(widgets.map(w =>
      w.id === widgetId ? { ...w, ...updates } : w
    ));
  };

  const handleSaveDashboard = async () => {
    if (!dashboard) return;

    setSaving(true);
    try {
      await dashboardService.update(dashboard.id, {
        name: dashboardName,
        layoutConfig: { widgets }
      });
      setDashboard({ ...dashboard, name: dashboardName });
    } catch (err) {
      console.error('Error saving dashboard:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading Dashboard Builder..." />;
  }

  return (
    <div className="flex h-screen bg-white">
      <AdminSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="lg:hidden p-2 hover:bg-slate-100 rounded">
              <Icon name="Menu" size={24} />
            </button>

            <input
              type="text"
              value={dashboardName}
              onChange={(e) => setDashboardName(e.target.value)}
              placeholder="Dashboard name"
              className="text-2xl font-bold bg-transparent border-0 focus:outline-none focus:bg-slate-50 px-2 py-1 rounded"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`p-2 rounded transition ${previewMode ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-100'}`}
              title="Preview mode"
            >
              {previewMode ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
            <button
              onClick={handleSaveDashboard}
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              <Save size={18} />
              Save
            </button>
            <UserProfileDropdown user={user} />
          </div>
        </div>

        {/* Dashboard Selector */}
        {dashboards.length > 0 && (
          <div className="px-6 py-2 bg-slate-50 border-b border-slate-200">
            <select
              value={currentDashboardId || ''}
              onChange={(e) => loadDashboard(e.target.value)}
              className="px-3 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Dashboard...</option>
              {dashboards.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        )}

        {!dashboard ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            No dashboard selected. Create one in Dashboard Management first.
          </div>
        ) : previewMode ? (
          // Preview Mode
          <div className="flex-1 overflow-auto bg-slate-50 p-6">
            <div className="grid grid-cols-12 gap-4 max-w-7xl mx-auto">
              {widgets.map(widget => (
                <div
                  key={widget.id}
                  className="bg-white rounded-lg shadow p-4 border border-slate-200 overflow-hidden flex flex-col"
                  style={{
                    gridColumn: `span ${Math.min(widget.width, 12)}`,
                    height: `${widget.height * 100 + 40}px`
                  }}
                >
                  <h3 className="font-semibold text-slate-900 mb-4 flex-shrink-0">{widget.title}</h3>
                  <div className="flex-1 overflow-hidden min-h-0">
                    <ChartWidget widget={widget} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Edit Mode
          <div className="flex flex-1 overflow-hidden">
            {/* Canvas */}
            <div className="flex-1 overflow-auto bg-slate-50 p-6">
              <div className="grid grid-cols-12 gap-4 max-w-7xl mx-auto">
                {widgets.length === 0 ? (
                  <div className="col-span-12 h-96 flex items-center justify-center bg-white rounded-lg border-2 border-dashed border-slate-300">
                    <div className="text-center">
                      <BarChart3 className="mx-auto text-gray-400 mb-4" size={48} />
                      <p className="text-gray-600 font-medium">Start by adding a chart</p>
                      <button
                        onClick={() => setShowAddWidget(true)}
                        className="mt-4 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mx-auto"
                      >
                        <Plus size={18} />
                        Add Widget
                      </button>
                    </div>
                  </div>
                ) : (
                  widgets.map(widget => (
                    <div
                      key={widget.id}
                      onClick={() => setSelectedWidget(widget)}
                      className={`bg-white rounded-lg shadow p-4 border-2 cursor-pointer transition overflow-hidden flex flex-col ${
                        selectedWidget?.id === widget.id
                          ? 'border-blue-500 ring-2 ring-blue-200'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                      style={{
                        gridColumn: `span ${Math.min(widget.width, 12)}`,
                        height: `${widget.height * 100 + 40}px`
                      }}
                    >
                      <div className="flex items-start justify-between mb-3 flex-shrink-0">
                        <h3 className="font-semibold text-slate-900 flex-1 truncate">{widget.title}</h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteWidget(widget.id);
                          }}
                          className="p-1 hover:bg-red-100 text-red-600 rounded flex-shrink-0"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="flex-1 overflow-hidden min-h-0">
                        <ChartWidget widget={widget} />
                      </div>
                    </div>
                  ))
                )}
              </div>

              {widgets.length > 0 && (
                <div className="max-w-7xl mx-auto mt-6">
                  <button
                    onClick={() => setShowAddWidget(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    <Plus size={18} />
                    Add Widget
                  </button>
                </div>
              )}
            </div>

            {/* Right Panel - Widget Configuration */}
            {selectedWidget && (
              <div className="w-80 bg-white border-l border-slate-200 overflow-y-auto p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold">Widget Settings</h2>
                  <button
                    onClick={() => setSelectedWidget(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={selectedWidget.title}
                      onChange={(e) => handleUpdateWidget(selectedWidget.id, { title: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Chart Type */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Chart Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {widgetTypes.map(wt => (
                        <button
                          key={wt.id}
                          onClick={() => handleUpdateWidget(selectedWidget.id, { type: wt.id })}
                          className={`p-3 rounded-lg border-2 text-center transition ${
                            selectedWidget.type === wt.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <wt.icon size={20} className="mx-auto mb-1" />
                          <div className="text-xs font-medium">{wt.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dimensions */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Size</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-600">Width</label>
                        <input
                          type="number"
                          min="1"
                          max="12"
                          value={selectedWidget.width}
                          onChange={(e) => handleUpdateWidget(selectedWidget.id, { width: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Height</label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={selectedWidget.height}
                          onChange={(e) => handleUpdateWidget(selectedWidget.id, { height: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Metrics</label>
                    <div className="space-y-2">
                      {['sales', 'users', 'engagement'].map(metric => (
                        <label key={metric} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedWidget.config?.metrics?.includes(metric) || false}
                            onChange={(e) => {
                              const metrics = selectedWidget.config?.metrics || [];
                              const updated = e.target.checked
                                ? [...metrics, metric]
                                : metrics.filter(m => m !== metric);
                              handleUpdateWidget(selectedWidget.id, {
                                config: { ...selectedWidget.config, metrics: updated }
                              });
                            }}
                            className="rounded"
                          />
                          <span className="text-sm capitalize">{metric}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Colors */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <Palette size={16} />
                      Colors
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {CHART_COLORS.map((color, idx) => (
                        <button
                          key={idx}
                          className="w-8 h-8 rounded border-2 border-slate-300 hover:border-slate-400 transition"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Widget Modal */}
      {showAddWidget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Add Widget</h2>

            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Widget Title</label>
                <input
                  type="text"
                  value={newWidget.title}
                  onChange={(e) => setNewWidget({ ...newWidget, title: e.target.value })}
                  placeholder="e.g., Sales Trends"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Chart Type Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-4">Chart Type</label>
                <div className="grid grid-cols-3 gap-4">
                  {widgetTypes.map(wt => {
                    const WtIcon = wt.icon;
                    return (
                      <button
                        key={wt.id}
                        onClick={() => setNewWidget({ ...newWidget, type: wt.id })}
                        className={`p-6 rounded-lg border-2 text-center transition ${
                          newWidget.type === wt.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <WtIcon size={32} className="mx-auto mb-2" />
                        <div className="font-medium text-sm">{wt.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Size */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Width (1-12)</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={newWidget.width}
                    onChange={(e) => setNewWidget({ ...newWidget, width: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Height (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newWidget.height}
                    onChange={(e) => setNewWidget({ ...newWidget, height: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-6 border-t border-slate-200">
                <button
                  onClick={handleAddWidget}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Add Widget
                </button>
                <button
                  onClick={() => setShowAddWidget(false)}
                  className="flex-1 bg-slate-200 text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-300 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LookerStudioBuilder;
