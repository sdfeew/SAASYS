import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { recordService } from '../../services/recordService';
import { Plus, Edit2, Trash2, Eye, Filter, Download, Upload } from 'lucide-react';
import Button from '../../components/ui/Button';

export default function RecordDetailManagement() {
  const { userTenant } = useAuth();
  const { recordId, moduleId } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchRecordDetails();
  }, [recordId]);

  const fetchRecordDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch record details
      const { data: recordData, error: recordError } = await recordService.getById(recordId);
      if (recordError) throw recordError;
      
      setRecord(recordData);
      setFormData(recordData.data || {});
      
      // TODO: Fetch comments, attachments, and activities
      setComments([]);
      setAttachments([]);
      setActivities([]);
    } catch (err) {
      console.error('Error fetching record:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setError(null);
      const { error: err } = await recordService.update(recordId, {
        ...record,
        data: formData
      });
      if (err) throw err;
      await fetchRecordDetails();
      setEditMode(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this record?')) return;
    try {
      setError(null);
      const { error: err } = await recordService.delete(recordId);
      if (err) throw err;
      navigate(`/record-detail-management/${moduleId}`);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Record Details</h1>
          <div className="flex gap-3">
            {!editMode && (
              <>
                <Button onClick={() => setEditMode(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Edit2 size={18} /> Edit
                </Button>
                <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                  <Trash2 size={18} /> Delete
                </Button>
              </>
            )}
            {editMode && (
              <>
                <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                  Save
                </Button>
                <Button onClick={() => setEditMode(false)} className="bg-gray-400 hover:bg-gray-500">
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">{error}</div>}

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          {['details', 'comments', 'attachments', 'activity'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'details' && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              {editMode ? (
                <div className="space-y-4">
                  {Object.entries(formData).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{key}</label>
                      <input
                        type="text"
                        value={String(value)}
                        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  {Object.entries(formData).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-sm text-gray-600 mb-1">{key}</p>
                      <p className="text-lg font-semibold text-gray-900">{String(value)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <p className="text-gray-600">Comments will appear here</p>
            </div>
          )}

          {activeTab === 'attachments' && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <p className="text-gray-600">Attachments will appear here</p>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <p className="text-gray-600">Activity log will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
