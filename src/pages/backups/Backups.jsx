import React, { useState } from 'react';
import { HardDrive, Plus, Download, Trash2, Clock, RotateCcw, Settings, Lock, AlertCircle, CheckCircle2, Zap } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { PageContainer, PageCard, PageSection, PageGrid } from '../../components/layout/PageComponents';
import AdminSidebar from '../../components/ui/AdminSidebar';
import Icon from '../../components/AppIcon';

const BackupsPage = () => {
  const toast = useToast();
  const [backups, setBackups] = useState([
    { 
      id: 1, 
      date: new Date(Date.now() - 3600000), 
      size: '2.4 MB', 
      status: 'completed',
      type: 'automatic',
      encryption: true,
      records: 1523,
      restored: false
    },
    { 
      id: 2, 
      date: new Date(Date.now() - 86400000), 
      size: '2.3 MB', 
      status: 'completed',
      type: 'manual',
      encryption: true,
      records: 1512,
      restored: false
    },
    { 
      id: 3, 
      date: new Date(Date.now() - 172800000), 
      size: '2.2 MB', 
      status: 'completed',
      type: 'automatic',
      encryption: true,
      records: 1501,
      restored: true
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(null);
  const [schedule, setSchedule] = useState({ frequency: 'daily', time: '02:00' });

  const handleCreateBackup = async () => {
    setLoading(true);
    try {
      const newBackup = {
        id: backups.length + 1,
        date: new Date(),
        size: '2.5 MB',
        status: 'in-progress',
        type: 'manual',
        encryption: true,
        records: 1534,
        restored: false
      };
      setBackups([newBackup, ...backups]);
      toast.info('Creating backup...');

      setTimeout(() => {
        setBackups(backups =>
          backups.map(b =>
            b.id === newBackup.id ? { ...b, status: 'completed' } : b
          )
        );
        toast.success('Backup created successfully');
      }, 3000);
    } catch (error) {
      toast.error('Failed to create backup');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (id) => {
    const backup = backups.find(b => b.id === id);
    toast.success(`Downloading backup from ${backup.date.toLocaleDateString()}`);
  };

  const handleRestore = (id) => {
    setShowRestoreModal(id);
  };

  const handleConfirmRestore = () => {
    toast.success('Restore started. This may take a few minutes...');
    setBackups(backups.map(b => 
      b.id === showRestoreModal ? { ...b, restored: true } : b
    ));
    setShowRestoreModal(null);
  };

  const handleDelete = (id) => {
    setBackups(backups.filter(b => b.id !== id));
    toast.success('Backup deleted');
  };

  const handleScheduleSave = () => {
    toast.success(`Automatic backups scheduled for ${schedule.frequency} at ${schedule.time}`);
    setShowScheduleForm(false);
  };

  const totalSize = backups.reduce((sum, b) => {
    const numSize = parseFloat(b.size);
    return sum + numSize;
  }, 0).toFixed(1);

  const totalRecords = backups.reduce((sum, b) => sum + b.records, 0);

  const stats = [
    { label: 'Total Backups', value: backups.length, icon: 'HardDrive', color: 'blue' },
    { label: 'Total Size', value: `${totalSize} MB`, icon: 'Database', color: 'green' },
    { label: 'Total Records', value: totalRecords.toLocaleString(), icon: 'FileText', color: 'purple' },
    { label: 'Last Backup', value: backups.length > 0 ? backups[0].date.toLocaleDateString() : 'Never', icon: 'Clock', color: 'orange' }
  ];

  const formatDate = (date) => {
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card border-b border-border shadow-elevation-1">
          <div className="px-4 md:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <HardDrive className="text-primary" size={20} />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-heading font-semibold text-foreground">Backups & Recovery</h1>
                  <p className="text-sm text-muted-foreground">Manage database backups and recovery</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowScheduleForm(true)}
                  className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-smooth text-foreground font-medium whitespace-nowrap"
                >
                  <Settings size={16} />
                  Schedule
                </button>
                <button
                  onClick={handleCreateBackup}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-smooth font-medium whitespace-nowrap"
                >
                  <Plus size={16} />
                  {loading ? 'Creating...' : 'Create Backup'}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <PageContainer>
            {/* Stats */}
            <PageSection>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {stats.map((stat, idx) => (
                  <PageCard key={idx}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                        <p className="text-2xl md:text-3xl font-heading font-bold text-foreground">{stat.value}</p>
                      </div>
                      <div className={`w-12 h-12 rounded-lg bg-${stat.color}-50 flex items-center justify-center`}>
                        <Icon name={stat.icon} size={24} />
                      </div>
                    </div>
                  </PageCard>
                ))}
              </div>
            </PageSection>

            {/* Schedule Form */}
            {showScheduleForm && (
              <PageSection>
                <PageCard className="border-2 border-primary">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-foreground">Schedule Automatic Backups</h3>
                      <button
                        onClick={() => setShowScheduleForm(false)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Frequency</label>
                        <select
                          value={schedule.frequency}
                          onChange={(e) => setSchedule({ ...schedule, frequency: e.target.value })}
                          className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                          <option value="hourly">Hourly</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Time (UTC)</label>
                        <input
                          type="time"
                          value={schedule.time}
                          onChange={(e) => setSchedule({ ...schedule, time: e.target.value })}
                          className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2 border-t border-border">
                      <button
                        onClick={() => setShowScheduleForm(false)}
                        className="px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-smooth"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleScheduleSave}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-smooth flex items-center gap-2"
                      >
                        <CheckCircle2 size={16} />
                        Save Schedule
                      </button>
                    </div>
                  </div>
                </PageCard>
              </PageSection>
            )}

            {/* Restore Modal */}
            {showRestoreModal && (
              <PageSection>
                <PageCard className="border-2 border-warning">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="text-warning mt-0.5 flex-shrink-0" size={20} />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-2">Restore from Backup</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          This will restore your database to the state it was in on {backups.find(b => b.id === showRestoreModal)?.date.toLocaleDateString()}. 
                          This action cannot be undone.
                        </p>
                        <div className="space-y-2 text-sm mb-4">
                          <p><strong>Backup Date:</strong> {formatDate(backups.find(b => b.id === showRestoreModal)?.date)}</p>
                          <p><strong>Records:</strong> {backups.find(b => b.id === showRestoreModal)?.records}</p>
                          <p className="flex items-center gap-2"><Lock size={14} /> <strong>Encrypted:</strong> Yes</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2 border-t border-border">
                      <button
                        onClick={() => setShowRestoreModal(null)}
                        className="px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-smooth"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleConfirmRestore}
                        className="px-4 py-2 bg-warning text-warning-foreground rounded-lg hover:bg-warning/90 transition-smooth flex items-center gap-2"
                      >
                        <RotateCcw size={16} />
                        Restore Now
                      </button>
                    </div>
                  </div>
                </PageCard>
              </PageSection>
            )}

            {/* Backup History */}
            <PageSection title={`Backup History (${backups.length})`}>
              {backups.length === 0 ? (
                <PageCard>
                  <div className="text-center py-12">
                    <HardDrive size={40} className="mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">No backups yet</p>
                  </div>
                </PageCard>
              ) : (
                <div className="space-y-3">
                  {backups.map((backup) => (
                    <PageCard key={backup.id} className="hover:shadow-elevation-2 transition-shadow">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <HardDrive className="text-primary" size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-foreground truncate">
                                {formatDate(backup.date)}
                              </p>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${
                                backup.status === 'completed'
                                  ? 'bg-success/10 text-success'
                                  : 'bg-warning/10 text-warning'
                              }`}>
                                {backup.status === 'completed' ? '✓ Complete' : '⟳ In Progress'}
                              </span>
                              {backup.restored && (
                                <span className="px-2 py-0.5 rounded text-xs font-medium bg-info/10 text-info whitespace-nowrap">
                                  Restored
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>{backup.size}</span>
                              <span>•</span>
                              <span>{backup.records.toLocaleString()} records</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Lock size={12} />
                                Encrypted
                              </span>
                              <span>•</span>
                              <span className="capitalize">{backup.type}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {backup.status === 'completed' && (
                            <>
                              <button
                                onClick={() => handleDownload(backup.id)}
                                className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-smooth"
                                title="Download backup"
                              >
                                <Download size={16} />
                              </button>
                              {!backup.restored && (
                                <button
                                  onClick={() => handleRestore(backup.id)}
                                  className="p-2 text-muted-foreground hover:text-warning hover:bg-warning/10 rounded-lg transition-smooth"
                                  title="Restore from backup"
                                >
                                  <RotateCcw size={16} />
                                </button>
                              )}
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(backup.id)}
                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-smooth"
                            title="Delete backup"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </PageCard>
                  ))}
                </div>
              )}
            </PageSection>
          </PageContainer>
        </main>
      </div>
    </div>
  );
};

export default BackupsPage;
