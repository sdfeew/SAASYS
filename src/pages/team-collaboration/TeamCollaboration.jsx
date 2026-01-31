import React, { useState, useEffect } from 'react';
import { Users, Activity, MessageCircle } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorAlert from '../../components/ui/ErrorAlert';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const TeamCollaborationPage = () => {
  const { tenantId, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load team members
        const { data: members } = await supabase
          .from('users')
          .select('id, email, user_metadata')
          .eq('tenant_id', tenantId);

        setTeamMembers(members || []);

        // Load recent activity
        const { data: activities } = await supabase
          .from('activities')
          .select('*')
          .eq('tenant_id', tenantId)
          .order('created_at', { ascending: false })
          .limit(20);

        setRecentActivity(activities || []);
      } catch (err) {
        console.error('Collaboration error:', err);
        setError(err.message || 'Failed to load collaboration data');
      } finally {
        setLoading(false);
      }
    };

    if (tenantId) {
      loadData();
    }
  }, [tenantId]);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Team Collaboration</h1>
          <p className="text-gray-600">Manage team members and view activity</p>
        </div>

        {error && <ErrorAlert message={error} severity="error" className="mb-8" />}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Team Members */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Users size={24} />
                  Team Members ({teamMembers.length})
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                {teamMembers.length > 0 ? (
                  teamMembers.map((member) => (
                    <div key={member.id} className="p-4 hover:bg-gray-50">
                      <p className="font-medium text-gray-900">{member.user_metadata?.full_name || 'User'}</p>
                      <p className="text-sm text-gray-600">{member.email}</p>
                      <div className="mt-2">
                        <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Online
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-600">No team members yet</div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Activity size={24} />
                  Recent Activity
                </h2>
              </div>
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 font-medium truncate">
                            {activity.description || activity.activity_type}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(activity.created_at).toLocaleString()}
                          </p>
                        </div>
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded whitespace-nowrap">
                          {activity.activity_type}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-600">No recent activity</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Total Members</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{teamMembers.length}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Recent Activities</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{recentActivity.length}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Active Today</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {recentActivity.filter(a => {
                const date = new Date(a.created_at);
                const today = new Date();
                return date.toDateString() === today.toDateString();
              }).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamCollaborationPage;
