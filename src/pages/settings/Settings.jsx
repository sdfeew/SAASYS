import React, { useState, useEffect } from 'react';
import { Settings, Bell, Lock, Palette, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { PageContainer, PageCard, PageSection } from '../../components/layout/PageComponents';
import AdminSidebar from '../../components/ui/AdminSidebar';
import Tabs from '../../components/ui/Tabs';

const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
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
      // In production, update user profile
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err?.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // In production, save notification preferences
      toast.success('Notification preferences updated');
    } catch (err) {
      toast.error(err?.message || 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    toast.info(`Theme changed to ${newTheme}`);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: Palette }
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-sm text-slate-600 mt-1">Manage your account and preferences</p>
        </header>

        {/* Content */}
        <PageContainer>
          <PageCard>
            {/* Tabs */}
            <div className="border-b border-slate-200 -mx-6 -mt-4 mb-6">
              <div className="px-6 flex gap-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <PageSection title="Profile Information">
                  <form onSubmit={handleProfileSave} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={profileData.fullName}
                        onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={profileData.email}
                        disabled
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      <Save size={20} />
                      Save Changes
                    </button>
                  </form>
                </PageSection>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <PageSection title="Notification Preferences">
                  <form onSubmit={handleNotificationSave} className="space-y-4">
                    {Object.entries(notificationPrefs).map(([key, value]) => (
                      <label key={key} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setNotificationPrefs({ ...notificationPrefs, [key]: e.target.checked })}
                          className="w-4 h-4 rounded"
                        />
                        <span className="text-slate-700 font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </label>
                    ))}
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 mt-6 transition-colors"
                    >
                      <Save size={20} />
                      Save Preferences
                    </button>
                  </form>
                </PageSection>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <PageSection title="Security Settings">
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={securitySettings.twoFactorEnabled}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, twoFactorEnabled: e.target.checked })}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-slate-700 font-medium">Enable Two-Factor Authentication</span>
                    </label>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Session Timeout (minutes)</label>
                      <input
                        type="number"
                        value={securitySettings.sessionTimeout}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <button
                      onClick={signOut}
                      className="mt-6 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </PageSection>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <PageSection title="Appearance Settings">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-3">Theme</label>
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
                            <span className="text-slate-700 capitalize font-medium">{t}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </PageSection>
              </div>
            )}
          </PageCard>
        </PageContainer>
      </div>
    </div>
  );
};

export default SettingsPage;
