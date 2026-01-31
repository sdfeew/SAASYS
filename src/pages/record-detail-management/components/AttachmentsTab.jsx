import React, { useState, useCallback } from 'react';
import Icon from '../../../components/AppIcon';
import { attachmentService } from '../../../services/attachmentService';

const AttachmentsTab = ({ recordId, moduleId, tenantId, userId, onAttachmentsUpdate, attachments = [] }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [filterType, setFilterType] = useState('all');
  const [selectedFile, setSelectedFile] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = [...e.dataTransfer.files];
    handleFiles(files);
  };

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setUploadError(null);

    try {
      for (const file of files) {
        await attachmentService.upload(recordId, moduleId, file, tenantId, userId);
      }
      onAttachmentsUpdate?.();
    } catch (error) {
      setUploadError(error.message);
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    handleFiles([...e.target.files]);
  };

  const handleDelete = async (attachmentId, storagePath) => {
    try {
      await attachmentService.delete(attachmentId, storagePath);
      onAttachmentsUpdate?.();
    } catch (error) {
      setUploadError(`Failed to delete file: ${error.message}`);
    }
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) return 'FileText';
    if (['doc', 'docx', 'txt'].includes(ext)) return 'FileText';
    if (['xls', 'xlsx', 'csv'].includes(ext)) return 'Table';
    if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext)) return 'Image';
    if (['mp4', 'avi', 'mov'].includes(ext)) return 'Video';
    if (['mp3', 'wav', 'flac'].includes(ext)) return 'Music';
    if (['zip', 'rar', '7z'].includes(ext)) return 'Archive';
    return 'File';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredAttachments = attachments
    .filter(att => filterType === 'all' || att.file_type.includes(filterType))
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'name') return a.file_name.localeCompare(b.file_name);
      if (sortBy === 'size') return b.file_size - a.file_size;
      return 0;
    });

  const totalSize = attachments.reduce((sum, att) => sum + (att.file_size || 0), 0);

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">Total Files</p>
          <p className="text-2xl font-bold">{attachments.length}</p>
        </div>
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">Total Size</p>
          <p className="text-2xl font-bold">{formatFileSize(totalSize)}</p>
        </div>
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">Last Upload</p>
          <p className="text-lg font-semibold">
            {attachments.length > 0 ? formatDate(attachments[0]?.created_at) : 'Never'}
          </p>
        </div>
      </div>

      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
          dragActive ? 'border-primary bg-primary/5' : 'border-border'
        }`}>
        <Icon name="Upload" size={48} className="mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Drag files here or click to upload</h3>
        <p className="text-sm text-muted-foreground mb-4">Maximum file size: 100MB</p>
        <label className="inline-block">
          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            disabled={isUploading}
            className="hidden"
          />
          <span className="px-4 py-2 bg-primary text-primary-foreground rounded-lg cursor-pointer hover:bg-primary/90 inline-block">
            {isUploading ? 'Uploading...' : 'Select Files'}
          </span>
        </label>
      </div>

      {uploadError && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg flex items-start gap-3">
          <Icon name="AlertCircle" size={20} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Error</p>
            <p className="text-sm">{uploadError}</p>
          </div>
        </div>
      )}

      {/* Filters and Sort */}
      {attachments.length > 0 && (
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm">
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="size">Sort by Size</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm">
              <option value="all">All Types</option>
              <option value="image">Images</option>
              <option value="pdf">PDFs</option>
              <option value="text">Documents</option>
              <option value="application">Archives</option>
            </select>
          </div>
        </div>
      )}

      {/* Files List */}
      {filteredAttachments.length === 0 ? (
        <div className="text-center py-12">
          <Icon name="File" size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No attachments yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredAttachments.map((attachment) => (
            <div key={attachment.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Icon name={getFileIcon(attachment.file_name)} size={24} className="text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{attachment.file_name}</p>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span>{formatFileSize(attachment.file_size)}</span>
                    <span>•</span>
                    <span>{formatDate(attachment.created_at)}</span>
                    {attachment.uploaded_by_user && (
                      <>
                        <span>•</span>
                        <span>{attachment.uploaded_by_user?.full_name || 'Unknown'}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 ml-4 flex-shrink-0">
                <a
                  href={attachment.downloadUrl}
                  download={attachment.file_name}
                  className="p-2 rounded-lg hover:bg-muted transition"
                  title="Download">
                  <Icon name="Download" size={18} />
                </a>
                <button
                  onClick={() => handleDelete(attachment.id, attachment.storage_path)}
                  className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition"
                  title="Delete">
                  <Icon name="Trash2" size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AttachmentsTab;