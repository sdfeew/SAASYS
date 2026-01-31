import React, { useState, useEffect } from 'react';
import { HardDrive, Download, Trash2, RotateCcw, Plus } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorAlert from '../../components/ui/ErrorAlert';
import { useAuth } from '../../contexts/AuthContext';

const BackupManagementPage = () => {
  const { tenantId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backups, setBackups] = useState([
    {
      id: 1,
      name: 'Auto Backup - Today',
      type: 'full',
      status: 'completed',
      size: '52.4 MB',
      recordCount: 1248,
      date: new Date()
    },
    {
      id: 2,
      name: 'Auto Backup - Yesterday',
      type: 'incremental',
      status: 'completed',
      size: '5.2 MB',
      recordCount: 48,
      date: new Date(Date.now() - 86400000)
    }
  ]);

  useEffect(() => {
    const loadBackups = async () => {
      try {
        setLoading(true);
        setError(null);
        // In production, load from backupService
        // For now, show demo backups
        setBackups(backups);
      } catch (err) {
        setError(err.message || 'Failed to load backups');
      } finally {
        setLoading(false);
      }
    };

    loadBackups();
  }, []);

  const handleCreateBackup = () => {
    try {
      const newBackup = {
        id: Date.now(),
        name: `Manual Backup - ${new Date().toLocaleString()}`,
        type: 'full',
        status: 'completed',
        size: '48.2 MB',
        recordCount: 1200,
        date: new Date()
      };
      setBackups([newBackup, ...backups]);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to create backup');
    }
  };

  const handleDeleteBackup = (id) => {
    setBackups(backups.filter(b => b.id !== id));
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Backup Management</h1>
            <p className="text-gray-600">Manage and restore your data backups</p>
          </div>
          <button
            onClick={handleCreateBackup}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Create Backup Now
          </button>
        </div>

        {error && <ErrorAlert message={error} severity="error" className="mb-8" />}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Total Backups</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{backups.length}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Total Size</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {(backups.reduce((sum, b) => sum + parseFloat(b.size), 0)).toFixed(1)} MB
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Last Backup</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {backups.length > 0 ? new Date(backups[0].date).toLocaleDateString() : 'Never'}
            </p>
          </div>
        </div>

        {/* Backups List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <HardDrive size={24} />
              Available Backups
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {backups.length > 0 ? (
              backups.map((backup) => (
                <div key={backup.id} className="p-6 hover:bg-gray-50 flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{backup.name}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span className="bg-gray-100 px-2 py-1 rounded capitalize">{backup.type}</span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded capitalize">
                        {backup.status}
                      </span>
                      <span>{backup.size}</span>
                      <span>{backup.recordCount} records</span>
                      <span>{new Date(backup.date).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      title="Download"
                      className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg"
                    >
                      <Download size={20} />
                    </button>
                    <button
                      title="Restore"
                      className="p-2 hover:bg-green-100 text-green-600 rounded-lg"
                    >
                      <RotateCcw size={20} />
                    </button>
                    <button
                      onClick={() => handleDeleteBackup(backup.id)}
                      title="Delete"
                      className="p-2 hover:bg-red-100 text-red-600 rounded-lg"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-600">
                <p>No backups available</p>
                <p className="text-sm mt-2">Create a backup to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Backup Schedule */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Automatic Backup Schedule</h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
              <span className="text-gray-700">Enable automatic daily backups</span>
            </label>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Retention Period</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>7 days</option>
                <option selected>30 days</option>
                <option>90 days</option>
                <option>180 days</option>
                <option>1 year</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupManagementPage;
