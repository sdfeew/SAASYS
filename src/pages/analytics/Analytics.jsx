import React, { useState, useEffect } from 'react';
import { BarChart, LineChart, PieChart, TrendingUp, Users, Database, Activity } from 'lucide-react';
import { recordService } from '../../services/recordService';
import { moduleService } from '../../services/moduleService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorAlert from '../../components/ui/ErrorAlert';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const AnalyticsPage = () => {
  const { tenantId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalRecords: 0,
    totalModules: 0,
    activeUsers: 0,
    recentActivity: []
  });

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get total records
        const { count: recordCount } = await supabase
          .from('records')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenantId);

        // Get total modules
        const { count: moduleCount } = await supabase
          .from('modules')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenantId);

        // Get users count
        const { count: userCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenantId);

        // Get recent activity
        const { data: activityData } = await supabase
          .from('activities')
          .select('*')
          .eq('tenant_id', tenantId)
          .order('created_at', { ascending: false })
          .limit(10);

        setStats({
          totalRecords: recordCount || 0,
          totalModules: moduleCount || 0,
          activeUsers: userCount || 0,
          recentActivity: activityData || []
        });
      } catch (err) {
        console.error('Analytics error:', err);
        setError(err.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    if (tenantId) {
      loadAnalytics();
    }
  }, [tenantId]);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Real-time insights and performance metrics</p>
        </div>

        {error && (
          <ErrorAlert message={error} severity="error" className="mb-8" />
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Records</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalRecords}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Database className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Modules</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalModules}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Database className="text-purple-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeUsers}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Users className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Avg Records/Module</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalModules > 0 ? Math.round(stats.totalRecords / stats.totalModules) : 0}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <TrendingUp className="text-orange-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-gray-900 font-medium">{activity.description || activity.activity_type}</p>
                      <p className="text-gray-600 text-sm">
                        {new Date(activity.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {activity.activity_type}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-600 text-center py-8">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
