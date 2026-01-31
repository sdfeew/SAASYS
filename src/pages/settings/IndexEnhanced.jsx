import React, { useState, useEffect } from 'react';
import { Settings, Bell, Lock, Palette, Users, Database, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/userService';
import { advancedNotificationService } from '../../services/advancedNotificationService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorAlert from '../../components/ui/ErrorAlert';
import Tabs from '../../components/ui/Tabs';

const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    avatar: '',
    bio: ''
  });
  const [notificationPrefs, setNotificationPrefs] = useState({
    emailNotifications: true,
    inAppNotifications: true,
    recordUpdates: true,
    commentNotifications: true,
    workflowNotifications: true,
    dailyDigest: false,
    weeklyReport: true,
    quietHours: false,
    quietStart: '22:00',
    quietEnd: '08:00'
  });
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    sessionTimeout: 30,
    loginAlerts: true,
    apiTokens: []
  });
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load user profile from form state
        if (user) {
          setFormData({
            fullName: user.user_metadata?.full_name || '',
            email: user.email || '',
            phone: user.user_metadata?.phone || '',
            avatar: user.user_metadata?.avatar_url || '',
            bio: user.user_metadata?.bio || ''
          });
        }

        // Load theme preference from localStorage
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
      } catch (err) {
        setError(err.message || 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      await userService.updateUserProfile(user.id, {
        full_name: formData.fullName,
        phone: formData.phone,
        avatar_url: formData.avatar,
        bio: formData.bio
      });

      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      await advancedNotificationService.updateNotificationPreferences(user.id, notificationPrefs);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await signOut();
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'data', label: 'Data Management', icon: Database }
  ];

  if (loading && activeTab === 'profile') {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center">
            <Settings className="mr-3" size={32} />
            Settings
          </h1>
          <p className="text-gray-600 mt-2">Manage your account and preferences</p>
        </div>

        {error && (
          <ErrorAlert
            message={error}
            severity="error"
            className="mb-6"
          />
        )}

        {/* Tabs */}
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        >
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Tell us about yourself"
                />
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Notification Channels</h3>
                
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notificationPrefs.emailNotifications}
                      onChange={(e) => setNotificationPrefs({
                        ...notificationPrefs,
                        emailNotifications: e.target.checked
                      })}
                      className="rounded border-gray-300 text-blue-500"
                    />
                    <span className="ml-3 text-gray-700">Email Notifications</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notificationPrefs.inAppNotifications}
                      onChange={(e) => setNotificationPrefs({
                        ...notificationPrefs,
                        inAppNotifications: e.target.checked
                      })}
                      className="rounded border-gray-300 text-blue-500"
                    />
                    <span className="ml-3 text-gray-700">In-App Notifications</span>
                  </label>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Notification Types</h3>
                
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notificationPrefs.recordUpdates}
                      onChange={(e) => setNotificationPrefs({
                        ...notificationPrefs,
                        recordUpdates: e.target.checked
                      })}
                      className="rounded border-gray-300 text-blue-500"
                    />
                    <span className="ml-3 text-gray-700">Record Updates</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notificationPrefs.commentNotifications}
                      onChange={(e) => setNotificationPrefs({
                        ...notificationPrefs,
                        commentNotifications: e.target.checked
                      })}
                      className="rounded border-gray-300 text-blue-500"
                    />
                    <span className="ml-3 text-gray-700">Comment Notifications</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notificationPrefs.workflowNotifications}
                      onChange={(e) => setNotificationPrefs({
                        ...notificationPrefs,
                        workflowNotifications: e.target.checked
                      })}
                      className="rounded border-gray-300 text-blue-500"
                    />
                    <span className="ml-3 text-gray-700">Workflow Notifications</span>
                  </label>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Digest & Reports</h3>
                
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notificationPrefs.dailyDigest}
                      onChange={(e) => setNotificationPrefs({
                        ...notificationPrefs,
                        dailyDigest: e.target.checked
                      })}
                      className="rounded border-gray-300 text-blue-500"
                    />
                    <span className="ml-3 text-gray-700">Daily Digest</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notificationPrefs.weeklyReport}
                      onChange={(e) => setNotificationPrefs({
                        ...notificationPrefs,
                        weeklyReport: e.target.checked
                      })}
                      className="rounded border-gray-300 text-blue-500"
                    />
                    <span className="ml-3 text-gray-700">Weekly Report</span>
                  </label>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quiet Hours</h3>
                
                <label className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    checked={notificationPrefs.quietHours}
                    onChange={(e) => setNotificationPrefs({
                      ...notificationPrefs,
                      quietHours: e.target.checked
                    })}
                    className="rounded border-gray-300 text-blue-500"
                  />
                  <span className="ml-3 text-gray-700">Enable Quiet Hours</span>
                </label>

                {notificationPrefs.quietHours && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                      <input
                        type="time"
                        value={notificationPrefs.quietStart}
                        onChange={(e) => setNotificationPrefs({
                          ...notificationPrefs,
                          quietStart: e.target.value
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                      <input
                        type="time"
                        value={notificationPrefs.quietEnd}
                        onChange={(e) => setNotificationPrefs({
                          ...notificationPrefs,
                          quietEnd: e.target.value
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleSaveNotifications}
                disabled={loading}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Two-Factor Authentication</h3>
                <p className="text-gray-600 mb-4">
                  {securitySettings.twoFactorEnabled
                    ? 'Two-factor authentication is currently enabled'
                    : 'Add an extra layer of security to your account'}
                </p>
                <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                  {securitySettings.twoFactorEnabled ? 'Manage 2FA' : 'Enable 2FA'}
                </button>
              </div>

              <hr />

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Session Timeout</h3>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Auto-logout after (minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="480"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => setSecuritySettings({
                    ...securitySettings,
                    sessionTimeout: parseInt(e.target.value)
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <hr />

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Login Alerts</h3>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={securitySettings.loginAlerts}
                    onChange={(e) => setSecuritySettings({
                      ...securitySettings,
                      loginAlerts: e.target.checked
                    })}
                    className="rounded border-gray-300 text-blue-500"
                  />
                  <span className="ml-3 text-gray-700">Notify me of new login attempts</span>
                </label>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Theme</h3>
                <div className="grid grid-cols-3 gap-4">
                  {['light', 'dark', 'auto'].map(t => (
                    <button
                      key={t}
                      onClick={() => handleThemeChange(t)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        theme === t
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="capitalize font-medium text-gray-900">
                        {t === 'auto' ? 'System' : t.charAt(0).toUpperCase() + t.slice(1)}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {t === 'light' && 'Always light theme'}
                        {t === 'dark' && 'Always dark theme'}
                        {t === 'auto' && 'Follow system settings'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Data Management Tab */}
          {activeTab === 'data' && (
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Danger Zone</h3>
                <p className="text-gray-600 mb-4">Irreversible actions</p>
              </div>

              <div className="border-l-4 border-red-500 pl-4 py-4 bg-red-50 rounded">
                <h4 className="font-semibold text-red-900 mb-2">Delete Account</h4>
                <p className="text-sm text-red-800 mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                  Delete Account
                </button>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsPage;
