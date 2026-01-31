import React, { useState, useEffect } from 'react';
import { Bug, Play, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorAlert from '../../components/ui/ErrorAlert';

const TestingPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testSuites, setTestSuites] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const loadTests = async () => {
      try {
        setLoading(true);
        setError(null);
        // Load test results from service or CI/CD provider
        // For now, we'll display a message that tests can be run manually
        setTestSuites([]);
      } catch (err) {
        setError(err.message || 'Failed to load tests');
      } finally {
        setLoading(false);
      }
    };

    loadTests();
  }, []);

  const handleRunTest = async (testId) => {
    // Implement actual test running
  };

  const formatTime = (date) => {
    const diff = Date.now() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'failed':
        return <AlertCircle className="text-red-500" size={20} />;
      case 'running':
        return <Clock className="text-blue-500 animate-spin" size={20} />;
      default:
        return <AlertCircle className="text-gray-500" size={20} />;
    }
  };

  const passRate = Math.round((testSuites.reduce((a, t) => a + t.passed, 0) / testSuites.reduce((a, t) => a + t.tests, 0)) * 100);
  const totalTests = testSuites.reduce((a, t) => a + t.tests, 0);
  const totalPassed = testSuites.reduce((a, t) => a + t.passed, 0);
  const totalFailed = testSuites.reduce((a, t) => a + t.failed, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center">
            <Bug className="mr-3" size={32} />
            Testing & QA
          </h1>
          <p className="text-gray-600 mt-2">Monitor test suites and ensure code quality</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Total Tests</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{totalTests}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Pass Rate</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{passRate}%</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Passed</p>
            <p className="text-3xl font-bold text-green-500 mt-2">{totalPassed}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Failed</p>
            <p className="text-3xl font-bold text-red-500 mt-2">{totalFailed}</p>
          </div>
        </div>

        {/* Test Suites */}
        <div className="space-y-4 mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Test Suites</h2>
          
          {testSuites.map(suite => (
            <div key={suite.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(suite.status)}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{suite.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Last run: {formatTime(suite.lastRun)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRunTest(suite.id)}
                    disabled={suite.status === 'running'}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    <Play size={16} />
                    {suite.status === 'running' ? 'Running...' : 'Run Tests'}
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-gray-900">{suite.tests}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Passed</p>
                    <p className="text-2xl font-bold text-green-500">{suite.passed}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Failed</p>
                    <p className="text-2xl font-bold text-red-500">{suite.failed}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Duration</p>
                    <p className="text-2xl font-bold text-blue-500">{suite.duration}s</p>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${(suite.passed / suite.tests) * 100}%` }}
                  />
                </div>

                <button
                  onClick={() => {
                    setSelectedTest(suite.id);
                    setShowDetails(true);
                  }}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* CI/CD Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">CI/CD Pipeline</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-semibold text-gray-900">GitHub Actions</h4>
                <p className="text-sm text-gray-600">Automated testing on push</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-500" size={20} />
                <span className="font-medium text-gray-900">Enabled</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-semibold text-gray-900">Code Coverage</h4>
                <p className="text-sm text-gray-600">85% of codebase covered</p>
              </div>
              <div className="text-2xl font-bold text-green-500">85%</div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-semibold text-gray-900">Deployment</h4>
                <p className="text-sm text-gray-600">Auto-deploy on main branch</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-500" size={20} />
                <span className="font-medium text-gray-900">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Test Details Modal */}
      {showDetails && selectedTest && (
        <Modal
          title={testSuites.find(t => t.id === selectedTest)?.name}
          onClose={() => setShowDetails(false)}
        >
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {testDetails[selectedTest]?.map((test, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                {test.status === 'passed' ? (
                  <CheckCircle className="text-green-500 flex-shrink-0 mt-1" size={18} />
                ) : (
                  <AlertCircle className="text-red-500 flex-shrink-0 mt-1" size={18} />
                )}
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{test.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-semibold ${
                      test.status === 'passed' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {test.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">{test.duration}s</span>
                  </div>
                  {test.error && (
                    <p className="text-xs text-red-600 mt-2">{test.error}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default TestingPage;
