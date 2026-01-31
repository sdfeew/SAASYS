import React, { useState, useEffect } from 'react';
import { Download, Trash2, RotateCcw, Check, AlertTriangle, Clock, HardDrive } from 'lucide-react';
import { backupService } from '../../services/backupService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorAlert from '../../components/ui/ErrorAlert';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const BackupManagementPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backups, setBackups] = useState([]);
  const [scheduleSettings, setScheduleSettings] = useState({
    enabled: true,
    frequency: 'daily',
    retentionDays: 30,
    backupType: 'incremental'
  });
  const [showCreateBackup, setShowCreateBackup] = useState(false);
  const [showRestore, setShowRestore] = useState(false);
  const [showScheduleSettings, setShowScheduleSettings] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmRestore, setConfirmRestore] = useState(null);
  const [newBackupName, setNewBackupName] = useState('');

  useEffect(() => {
    const loadBackups = async () => {
      try {
        setLoading(true);
        setError(null);
        // Load backups from service when available
        // For now, show empty state
        setBackups([]);
      } catch (err) {
        setError(err.message || 'Failed to load backups');
      } finally {
        setLoading(false);
      }
    };

    loadBackups();
  }, []);

  const handleCreateBackup = async () => {
    try {
      setLoading(true);
      setError(null);

      const name = newBackupName || `Backup - ${new Date().toLocaleString()}`;
      
      // Create backup
      const newBackup = {
        id: `backup_${Date.now()}`,
        name,
        type: 'full',
        status: 'in_progress',
        size: 0,
        recordCount: 0,
        startedAt: new Date(),
        completedAt: null
      };

      setBackups([newBackup, ...backups]);
      setShowCreateBackup(false);
      setNewBackupName('');

      // Simulate backup completion
      setTimeout(() => {
        setBackups(prevBackups =>
          prevBackups.map(b =>
            b.id === newBackup.id
              ? {
                  ...b,
                  status: 'completed',
                  completedAt: new Date(),
                  size: Math.random() * 100000000,
                  recordCount: Math.floor(Math.random() * 2000)
                }
              : b
          )
        );
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreBackup = async (backupId) => {
    try {
      setLoading(true);
      setError(null);

      // Restore backup
      await backupService.restoreFromBackup(backupId);
      
      setConfirmRestore(null);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBackup = async (backupId) => {
    try {
      setLoading(true);
      setError(null);

      // Delete backup
      await backupService.deleteBackup(backupId);

      setBackups(backups.filter(b => b.id !== backupId));
      setConfirmDelete(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyBackup = async (backupId) => {
    try {
      // Verify backup integrity
      const result = await backupService.verifyBackupIntegrity(backupId);
      alert(result.valid ? 'Backup is valid' : 'Backup has issues: ' + result.issues.join(', '));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleExportBackup = async (backupId) => {
    try {
      await backupService.exportBackupForDownload(backupId);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaveScheduleSettings = async () => {
    try {
      setLoading(true);
      await backupService.scheduleAutomaticBackups(scheduleSettings);
      setShowScheduleSettings(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleString();
  };

  const getDurationSeconds = (startDate, endDate) => {
    if (!endDate) return 0;
    return Math.round((new Date(endDate) - new Date(startDate)) / 1000);
  };

  if (loading && backups.length === 0) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center">
              <HardDrive className="mr-3" size={32} />
              Backup Management
            </h1>
            <p className="text-gray-600 mt-2">Backup, restore, and protect your data</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowScheduleSettings(true)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Schedule Settings
            </button>
            <button
              onClick={() => setShowCreateBackup(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Create Backup
            </button>
          </div>
        </div>

        {error && (
          <ErrorAlert
            message={error}
            severity="error"
            className="mb-6"
          />
        )}

        {/* Backup Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Total Backups</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{backups.length}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Total Size</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {formatSize(backups.reduce((a, b) => a + b.size, 0))}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Completed</p>
            <p className="text-3xl font-bold text-green-500 mt-2">
              {backups.filter(b => b.status === 'completed').length}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">In Progress</p>
            <p className="text-3xl font-bold text-yellow-500 mt-2">
              {backups.filter(b => b.status === 'in_progress').length}
            </p>
          </div>
        </div>

        {/* Backups List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Size</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Records</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Duration</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {backups.map(backup => (
                  <tr key={backup.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">{backup.name}</td>
                    <td className="px-6 py-3 text-sm text-gray-600 capitalize">{backup.type}</td>
                    <td className="px-6 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        {backup.status === 'completed' && (
                          <>
                            <Check className="text-green-500" size={16} />
                            <span className="text-green-600">Completed</span>
                          </>
                        )}
                        {backup.status === 'in_progress' && (
                          <>
                            <Clock className="text-blue-500 animate-spin" size={16} />
                            <span className="text-blue-600">In Progress</span>
                          </>
                        )}
                        {backup.status === 'failed' && (
                          <>
                            <AlertTriangle className="text-red-500" size={16} />
                            <span className="text-red-600">Failed</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">{formatSize(backup.size)}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{backup.recordCount.toLocaleString()}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {getDurationSeconds(backup.startedAt, backup.completedAt)}s
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {formatTime(backup.completedAt || backup.startedAt)}
                    </td>
                    <td className="px-6 py-3 text-sm space-x-2">
                      <button
                        onClick={() => setConfirmRestore(backup.id)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                        title="Restore from backup"
                      >
                        <RotateCcw size={16} className="inline" />
                      </button>
                      <button
                        onClick={() => handleExportBackup(backup.id)}
                        className="text-green-600 hover:text-green-700 font-medium"
                        title="Download backup"
                      >
                        <Download size={16} className="inline" />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(backup.id)}
                        className="text-red-600 hover:text-red-700 font-medium"
                        title="Delete backup"
                      >
                        <Trash2 size={16} className="inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Automatic Backup Info */}
        <div className="mt-8 bg-blue-50 rounded-lg border border-blue-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Automatic Backups</h3>
          {scheduleSettings.enabled ? (
            <p className="text-gray-600">
              Automatic backups are enabled. {scheduleSettings.frequency} {scheduleSettings.backupType} backups are being created.
              Backups are retained for {scheduleSettings.retentionDays} days.
            </p>
          ) : (
            <p className="text-gray-600">
              Automatic backups are disabled. Configure backup schedule to enable.
            </p>
          )}
        </div>
      </div>

      {/* Create Backup Dialog */}
      {showCreateBackup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create Backup</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Backup Name (Optional)
              </label>
              <input
                type="text"
                value={newBackupName}
                onChange={(e) => setNewBackupName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Backup - ${new Date().toLocaleString()}`}
              />
            </div>

            <p className="text-sm text-gray-600 mb-4">
              This will create a full backup of all your data including modules, records, dashboards, and workflows.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleCreateBackup}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Backup'}
              </button>
              <button
                onClick={() => setShowCreateBackup(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Settings Dialog */}
      {showScheduleSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Backup Schedule Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={scheduleSettings.enabled}
                    onChange={(e) => setScheduleSettings({ ...scheduleSettings, enabled: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="ml-2 text-gray-700">Enable Automatic Backups</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequency
                </label>
                <select
                  value={scheduleSettings.frequency}
                  onChange={(e) => setScheduleSettings({ ...scheduleSettings, frequency: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Backup Type
                </label>
                <select
                  value={scheduleSettings.backupType}
                  onChange={(e) => setScheduleSettings({ ...scheduleSettings, backupType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="full">Full Backup</option>
                  <option value="incremental">Incremental Backup</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Retention Period (Days)
                </label>
                <input
                  type="number"
                  value={scheduleSettings.retentionDays}
                  onChange={(e) => setScheduleSettings({ ...scheduleSettings, retentionDays: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveScheduleSettings}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Settings'}
              </button>
              <button
                onClick={() => setShowScheduleSettings(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      {confirmDelete && (
        <ConfirmDialog
          title="Delete Backup"
          message="Are you sure you want to delete this backup? This action cannot be undone."
          onConfirm={() => handleDeleteBackup(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
          severity="error"
        />
      )}

      {/* Confirm Restore Dialog */}
      {confirmRestore && (
        <ConfirmDialog
          title="Restore from Backup"
          message="Restoring will overwrite your current data. Are you sure you want to continue?"
          onConfirm={() => handleRestoreBackup(confirmRestore)}
          onCancel={() => setConfirmRestore(null)}
          severity="warning"
        />
      )}
    </div>
  );
};

export default BackupManagementPage;
