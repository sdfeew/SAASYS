import React, { useState } from 'react';
import { Bug, Play, CheckCircle2, AlertCircle, Loader, BarChart3, Filter, Download, Zap, Clock } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { PageContainer, PageCard, PageSection } from '../../components/layout/PageComponents';
import AdminSidebar from '../../components/ui/AdminSidebar';

const TestingPage = () => {
  const toast = useToast();
  const [tests, setTests] = useState([
    { id: 1, suite: 'Dashboard', name: 'Dashboard Loading', status: 'passed', duration: '250ms', timestamp: Date.now() - 86400000 },
    { id: 2, suite: 'Dashboard', name: 'Widget Creation', status: 'passed', duration: '180ms', timestamp: Date.now() - 86400000 },
    { id: 3, suite: 'Dashboard', name: 'Data Sync', status: 'failed', duration: '850ms', timestamp: Date.now() - 86400000 },
    { id: 4, suite: 'User Management', name: 'User Creation', status: 'passed', duration: '320ms', timestamp: Date.now() - 172800000 },
    { id: 5, suite: 'User Management', name: 'Permission Update', status: 'passed', duration: '210ms', timestamp: Date.now() - 172800000 },
    { id: 6, suite: 'Data', name: 'Import CSV', status: 'failed', duration: '1200ms', timestamp: Date.now() - 259200000 },
    { id: 7, suite: 'Data', name: 'Export Records', status: 'passed', duration: '450ms', timestamp: Date.now() - 259200000 },
    { id: 8, suite: 'API', name: 'Authentication', status: 'passed', duration: '180ms', timestamp: Date.now() - 345600000 },
    { id: 9, suite: 'API', name: 'Rate Limiting', status: 'passed', duration: '220ms', timestamp: Date.now() - 345600000 },
    { id: 10, suite: 'API', name: 'Error Handling', status: 'failed', duration: '580ms', timestamp: Date.now() - 432000000 },
  ]);
  const [running, setRunning] = useState(false);
  const [selectedSuite, setSelectedSuite] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const suites = ['all', ...new Set(tests.map(t => t.suite))];

  const handleRunTests = async () => {
    setRunning(true);
    toast.info('Running test suite...');
    
    setTimeout(() => {
      const newTests = tests.map(test => ({
        ...test,
        status: Math.random() > 0.15 ? 'passed' : 'failed',
        duration: `${Math.floor(Math.random() * 1000) + 100}ms`,
        timestamp: Date.now()
      }));
      setTests(newTests);
      setRunning(false);
      const passed = newTests.filter(t => t.status === 'passed').length;
      toast.success(`Tests completed: ${passed}/${newTests.length} passed`);
    }, 3000);
  };

  const handleExportResults = () => {
    const csv = 'Test Name,Suite,Status,Duration\n' + 
      tests.map(t => `${t.name},${t.suite},${t.status},${t.duration}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'test-results.csv';
    a.click();
    toast.success('Results exported successfully');
  };

  const filteredTests = tests.filter(test => {
    const matchesSuite = selectedSuite === 'all' || test.suite === selectedSuite;
    const matchesStatus = selectedStatus === 'all' || test.status === selectedStatus;
    return matchesSuite && matchesStatus;
  });

  const passCount = filteredTests.filter(t => t.status === 'passed').length;
  const failCount = filteredTests.filter(t => t.status === 'failed').length;
  const passRate = Math.round((passCount / filteredTests.length) * 100) || 0;

  const totalTests = tests.length;
  const totalPassed = tests.filter(t => t.status === 'passed').length;
  const totalFailed = tests.filter(t => t.status === 'failed').length;

  const getStatusColor = (status) => {
    switch (status) {
      case 'passed': return 'text-success bg-success/10';
      case 'failed': return 'text-destructive bg-destructive/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card border-b border-border shadow-elevation-1">
          <div className="px-4 md:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bug className="text-primary" size={20} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-heading font-semibold text-foreground">Testing & QA</h1>
                <p className="text-sm text-muted-foreground">Run automated tests and quality checks</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <PageContainer>
            {/* Summary Stats */}
            <PageSection>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
                <PageCard>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Tests</p>
                    <p className="text-3xl font-heading font-bold text-foreground">{totalTests}</p>
                  </div>
                </PageCard>
                <PageCard>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Passed</p>
                    <p className="text-3xl font-heading font-bold text-success">{totalPassed}</p>
                  </div>
                </PageCard>
                <PageCard>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Failed</p>
                    <p className="text-3xl font-heading font-bold text-destructive">{totalFailed}</p>
                  </div>
                </PageCard>
                <PageCard>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Pass Rate</p>
                    <div className="flex items-end gap-2">
                      <p className="text-3xl font-heading font-bold text-foreground">{totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0}%</p>
                    </div>
                  </div>
                </PageCard>
                <PageCard>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Test Suites</p>
                    <p className="text-3xl font-heading font-bold text-foreground">{suites.length - 1}</p>
                  </div>
                </PageCard>
              </div>
            </PageSection>

            {/* Controls */}
            <PageSection>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <button
                  onClick={handleRunTests}
                  disabled={running}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-smooth font-medium whitespace-nowrap"
                >
                  {running ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Zap size={16} />
                      Run Tests
                    </>
                  )}
                </button>

                <button
                  onClick={handleExportResults}
                  className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-smooth text-foreground font-medium"
                >
                  <Download size={16} />
                  Export
                </button>

                <div className="flex-1 md:flex-none flex gap-2">
                  <div>
                    <select
                      value={selectedSuite}
                      onChange={(e) => setSelectedSuite(e.target.value)}
                      className="px-3 py-2 bg-muted border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="all">All Suites</option>
                      {suites.filter(s => s !== 'all').map(suite => (
                        <option key={suite} value={suite}>{suite}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="px-3 py-2 bg-muted border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="all">All Status</option>
                      <option value="passed">Passed</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                </div>
              </div>
            </PageSection>

            {/* Test Results Summary */}
            <PageSection title={`Results: ${passCount} passed, ${failCount} failed (${passRate}%)`}>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-success transition-all"
                      style={{ width: `${passRate}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground">{passRate}%</span>
                </div>
              </div>

              <div className="space-y-3">
                {filteredTests.length === 0 ? (
                  <PageCard>
                    <div className="text-center py-12">
                      <AlertCircle size={40} className="mx-auto mb-3 text-muted-foreground" />
                      <p className="text-muted-foreground">No tests found matching the filters</p>
                    </div>
                  </PageCard>
                ) : (
                  filteredTests.map((test) => (
                    <PageCard key={test.id} className="hover:shadow-elevation-2 transition-shadow">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getStatusColor(test.status)}`}>
                            {test.status === 'passed' ? (
                              <CheckCircle2 size={16} />
                            ) : test.status === 'failed' ? (
                              <AlertCircle size={16} />
                            ) : (
                              <Loader size={16} className="animate-spin" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">{test.name}</p>
                            <p className="text-xs text-muted-foreground">{test.suite}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(test.status)}`}>
                            {test.status === 'passed' ? '✓ Passed' : '✕ Failed'}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock size={12} />
                            {test.duration}
                          </span>
                        </div>
                      </div>
                    </PageCard>
                  ))
                )}
              </div>
            </PageSection>
          </PageContainer>
        </main>
      </div>
    </div>
  );
};

export default TestingPage;
