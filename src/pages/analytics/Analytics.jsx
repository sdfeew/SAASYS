import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Database, Activity, BarChart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';
import { PageContainer, PageCard, PageGrid, PageSection, LoadingCard } from '../../components/layout/PageComponents';
import AdminSidebar from '../../components/ui/AdminSidebar';

const AnalyticsPage = () => {
  const { tenantId } = useAuth();
  const toast = useToast();
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
        const errorMsg = err?.message || 'Failed to load analytics';
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    if (tenantId) {
      loadAnalytics();
    }
  }, [tenantId, toast]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
              <p className="text-sm text-slate-600 mt-1">Real-time insights and performance metrics</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <PageContainer>
          {loading ? (
            <LoadingCard message="Loading analytics..." />
          ) : error ? (
            <PageCard>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </PageCard>
          ) : (
            <>
              {/* KPI Cards */}
              <PageSection title="Key Metrics">
                <PageGrid cols={4} className="mb-6">
                  {/* Total Records */}
                  <PageCard>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-600 text-sm font-medium">Total Records</p>
                        <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalRecords}</p>
                      </div>
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <Database className="text-blue-600" size={24} />
                      </div>
                    </div>
                  </PageCard>

                  {/* Total Modules */}
                  <PageCard>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-600 text-sm font-medium">Total Modules</p>
                        <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalModules}</p>
                      </div>
                      <div className="bg-green-100 p-3 rounded-lg">
                        <BarChart className="text-green-600" size={24} />
                      </div>
                    </div>
                  </PageCard>

                  {/* Active Users */}
                  <PageCard>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-600 text-sm font-medium">Active Users</p>
                        <p className="text-3xl font-bold text-slate-900 mt-2">{stats.activeUsers}</p>
                      </div>
                      <div className="bg-purple-100 p-3 rounded-lg">
                        <Users className="text-purple-600" size={24} />
                      </div>
                    </div>
                  </PageCard>

                  {/* Activity */}
                  <PageCard>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-600 text-sm font-medium">Recent Activity</p>
                        <p className="text-3xl font-bold text-slate-900 mt-2">{stats.recentActivity.length}</p>
                      </div>
                      <div className="bg-orange-100 p-3 rounded-lg">
                        <Activity className="text-orange-600" size={24} />
                      </div>
                    </div>
                  </PageCard>
                </PageGrid>
              </PageSection>

              {/* Recent Activity */}
              <PageSection title="Recent Activity">
                <PageCard>
                  {stats.recentActivity.length === 0 ? (
                    <div className="text-center py-8">
                      <Activity className="mx-auto text-slate-400 mb-3" size={32} />
                      <p className="text-slate-600">No recent activity</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {stats.recentActivity.map((activity, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-slate-100"
                        >
                          <div className="flex-1">
                            <p className="text-slate-900 font-medium text-sm">{activity.action || 'Activity'}</p>
                            <p className="text-xs text-slate-500 mt-1">
                              {new Date(activity.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </PageCard>
              </PageSection>
            </>
          )}
        </PageContainer>
      </div>
    </div>
  );
};

export default AnalyticsPage;
