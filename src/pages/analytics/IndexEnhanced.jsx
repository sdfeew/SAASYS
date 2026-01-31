import React, { useState, useEffect } from 'react';
import { BarChart, LineChart, PieChart, TrendingUp, Users, Database, Activity } from 'lucide-react';
import { reportingService } from '../../services/reportingService';
import { userService } from '../../services/userService';
import { moduleService } from '../../services/moduleService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorAlert from '../../components/ui/ErrorAlert';
import { useAuth } from '../../contexts/AuthContext';

const AnalyticsPage = () => {
  const { user, tenantId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    recordStats: null,
    userActivity: null,
    workflowPerformance: null,
    moduleUsage: null,
    dataQuality: null
  });
  const [timeRange, setTimeRange] = useState('7days'); // 7days, 30days, 90days, all
  const [moduleFilter, setModuleFilter] = useState('all');
  const [modules, setModules] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // For now, just load empty stats structure
        // In production, this would connect to real analytics
        setStats({
          recordStats: { total: 0, byStatus: {}, byDate: {} },
          userActivity: [],
          workflowPerformance: null,
          moduleUsage: [],
          dataQuality: null
        });
        setModules([]);
      } catch (err) {
        setError(err.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [timeRange, moduleFilter]);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // Reload data
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Real-time insights and performance metrics</p>
        </div>

        {error && (
          <ErrorAlert
            message={error}
            onRetry={handleRetry}
            severity="error"
            className="mb-8"
          />
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Range
            </label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Module Filter
            </label>
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Modules</option>
              {modules.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Records */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Records</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.recordStats?.totalRecords || 0}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Database className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          {/* Active Users */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.userActivity?.activeUsers || 0}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Users className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          {/* Avg Records Per Module */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Avg Records/Module</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {Math.round(stats.recordStats?.avgRecordsPerModule || 0)}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <TrendingUp className="text-purple-600" size={24} />
              </div>
            </div>
          </div>

          {/* Data Quality Score */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Data Quality Score</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {Math.round(stats.dataQuality?.overallQualityScore || 0)}%
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Activity className="text-orange-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Records by Module */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <BarChart size={20} className="mr-2" />
              Records by Module
            </h3>
            <div className="space-y-3">
              {stats.recordStats?.byModule?.slice(0, 5).map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{item.moduleName}</span>
                    <span className="font-semibold text-gray-900">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${(item.count / Math.max(...stats.recordStats.byModule.map(m => m.count))) * 100}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <LineChart size={20} className="mr-2" />
              User Activity
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Create Records', value: stats.userActivity?.actionsCount?.create || 0 },
                { label: 'Update Records', value: stats.userActivity?.actionsCount?.update || 0 },
                { label: 'Delete Records', value: stats.userActivity?.actionsCount?.delete || 0 },
                { label: 'View Records', value: stats.userActivity?.actionsCount?.view || 0 }
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-gray-700">{item.label}</span>
                  <span className="font-semibold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Workflow Performance */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <TrendingUp size={20} className="mr-2" />
              Workflow Performance
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Total Executions', value: stats.workflowPerformance?.totalExecutions || 0 },
                { label: 'Success Rate', value: `${Math.round(stats.workflowPerformance?.successRate || 0)}%` },
                { label: 'Avg Duration', value: `${Math.round(stats.workflowPerformance?.avgDuration || 0)}ms` },
                { label: 'Failed Executions', value: stats.workflowPerformance?.failedCount || 0 }
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-gray-700">{item.label}</span>
                  <span className="font-semibold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Data Quality Issues */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <PieChart size={20} className="mr-2" />
              Data Quality Issues
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Missing Values', value: stats.dataQuality?.missingValuesCount || 0 },
                { label: 'Duplicates', value: stats.dataQuality?.duplicatesCount || 0 },
                { label: 'Invalid Formats', value: stats.dataQuality?.invalidFormatsCount || 0 },
                { label: 'Outliers', value: stats.dataQuality?.outliersCount || 0 }
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-gray-700">{item.label}</span>
                  <span className="font-semibold text-red-600">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Export Analytics</h3>
          <div className="flex gap-3">
            <button
              onClick={() => reportingService.exportToCSV(stats)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Export as CSV
            </button>
            <button
              onClick={() => {
                const dataStr = JSON.stringify(stats, null, 2);
                const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
                const exportFileDefaultName = `analytics-${new Date().toISOString().split('T')[0]}.json`;
                const linkElement = document.createElement('a');
                linkElement.setAttribute('href', dataUri);
                linkElement.setAttribute('download', exportFileDefaultName);
                linkElement.click();
              }}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Export as JSON
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
