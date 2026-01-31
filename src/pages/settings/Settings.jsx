import React, { useState, useEffect } from 'react';
import { Settings, Bell, Lock, Palette, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorAlert from '../../components/ui/ErrorAlert';
import Tabs from '../../components/ui/Tabs';

const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  
  const [profileData, setProfileData] = useState({
    fullName: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    phone: user?.user_metadata?.phone || '',
  });

  const [notificationPrefs, setNotificationPrefs] = useState({
    emailNotifications: true,
    inAppNotifications: true,
    recordUpdates: true,
    commentNotifications: true
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    sessionTimeout: 30
  });

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      // In production, update user profile
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      // In production, save notification preferences
      setSuccess('Notification preferences updated');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: Palette }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>

        {error && <ErrorAlert message={error} severity="error" className="mb-6" />}
        {success && <ErrorAlert message={success} severity="success" className="mb-6" />}

        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>
            <form onSubmit={handleProfileSave} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={profileData.fullName}
                  onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Save size={20} />
                Save Changes
              </button>
            </form>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Notification Preferences</h2>
            <form onSubmit={handleNotificationSave} className="space-y-4">
              {Object.entries(notificationPrefs).map(([key, value]) => (
                <label key={key} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setNotificationPrefs({ ...notificationPrefs, [key]: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-gray-700 font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </label>
              ))}
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 mt-6"
              >
                <Save size={20} />
                Save Preferences
              </button>
            </form>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Security Settings</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={securitySettings.twoFactorEnabled}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, twoFactorEnabled: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <span className="text-gray-700 font-medium">Enable Two-Factor Authentication</span>
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                <input
                  type="number"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={signOut}
                className="mt-6 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Appearance Tab */}
        {activeTab === 'appearance' && (
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Appearance Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                <div className="flex gap-4">
                  {['light', 'dark', 'auto'].map((t) => (
                    <label key={t} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="theme"
                        value={t}
                        checked={theme === t}
                        onChange={(e) => handleThemeChange(e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-gray-700 capitalize">{t}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
