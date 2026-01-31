import React, { useState, useEffect } from 'react';
import { Users, Send, Heart, Reply, Trash2, Edit } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorAlert from '../../components/ui/ErrorAlert';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/userService';
import { activityService } from '../../services/activityService';

const TeamCollaborationPage = () => {
  const { user, tenantId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load empty data structure for now
        setTeamMembers([]);
        setActivity([]);
        setDiscussions([]);
      } catch (err) {
        setError(err.message || 'Failed to load collaboration data');
        console.error('Error loading collaboration data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (tenantId) {
      loadData();
    }
  }, [tenantId]);

  const sendMessage = () => {
    if (newMessage.trim()) {
      // Handle message sending
      setNewMessage('');
    }
  };

  const formatTime = (date) => {
    const diff = Date.now() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return 'now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'idle':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center">
            <Users className="mr-3" size={32} />
            Team Collaboration
          </h1>
          <p className="text-gray-600 mt-2">Connect with your team members and collaborate effectively</p>
        </div>

        {error && (
          <ErrorAlert
            message={error}
            severity="error"
            className="mb-6"
          />
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Team Members */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-blue-500 text-white p-4">
                <h2 className="text-lg font-bold">Team Members</h2>
              </div>

              <div className="divide-y">
                {teamMembers.map(member => (
                  <div key={member.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <div className="text-3xl">{member.avatar}</div>
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(member.status)}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{member.name}</h3>
                        <p className="text-xs text-gray-500">{member.role}</p>
                        <p className="text-xs text-gray-400 mt-1">{member.email}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          Joined {new Date(member.joinedDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full px-4 py-3 bg-blue-500 text-white hover:bg-blue-600 transition-colors font-medium">
                Invite Team Member
              </button>
            </div>
          </div>

          {/* Activity Feed & Discussions */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-green-500 text-white p-4">
                <h2 className="text-lg font-bold">Recent Activity</h2>
              </div>

              <div className="divide-y">
                {activity.map(item => (
                  <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{item.icon}</div>
                      <div className="flex-1">
                        <p className="text-gray-900">
                          <span className="font-semibold">{item.user}</span>
                          {' '}
                          <span className="text-gray-600">{item.action}</span>
                          {' '}
                          <span className="font-semibold text-blue-600">{item.item}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{formatTime(item.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Discussions */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-purple-500 text-white p-4">
                <h2 className="text-lg font-bold">Team Discussions</h2>
              </div>

              <div className="divide-y">
                {discussions.map(discussion => (
                  <div
                    key={discussion.id}
                    onClick={() => setSelectedDiscussion(discussion.id)}
                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      {discussion.pinned && (
                        <div className="text-red-500 mt-1">📌</div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 hover:text-blue-600">
                          {discussion.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          by <span className="font-medium">{discussion.author}</span>
                          {' '}
                          <span className="text-gray-400">• {discussion.authorRole}</span>
                        </p>
                        <div className="flex gap-4 mt-2 text-xs text-gray-500">
                          <span>💬 {discussion.replies} replies</span>
                          <span>👁️ {discussion.views} views</span>
                          <span>{formatTime(discussion.lastReply)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full px-4 py-3 bg-purple-500 text-white hover:bg-purple-600 transition-colors font-medium">
                Start New Discussion
              </button>
            </div>
          </div>
        </div>

        {/* Collaboration Tips */}
        <div className="mt-8 bg-blue-50 rounded-lg border border-blue-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Collaboration Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <h4 className="font-semibold text-gray-900">Use @mentions</h4>
                <p className="text-sm text-gray-600">Tag team members to get their attention in comments</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">📎</span>
              <div>
                <h4 className="font-semibold text-gray-900">Share files</h4>
                <p className="text-sm text-gray-600">Attach documents and images to discussions</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">⏰</span>
              <div>
                <h4 className="font-semibold text-gray-900">Keep it real-time</h4>
                <p className="text-sm text-gray-600">See updates instantly as your team works</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <h4 className="font-semibold text-gray-900">Share dashboards</h4>
                <p className="text-sm text-gray-600">Collaborate on data insights and reports</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamCollaborationPage;
