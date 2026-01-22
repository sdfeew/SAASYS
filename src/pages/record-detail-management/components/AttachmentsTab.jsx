import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const AttachmentsTab = ({ attachments, onUpload, onDelete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleDragOver = (e) => {
    e?.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    setIsDragging(false);
    const files = Array.from(e?.dataTransfer?.files);
    if (files?.length > 0) {
      onUpload(files);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e?.target?.files);
    if (files?.length > 0) {
      onUpload(files);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024)?.toFixed(1) + ' KB';
    return (bytes / (1024 * 1024))?.toFixed(1) + ' MB';
  };

  const getFileIcon = (type) => {
    if (type?.startsWith('image/')) return 'Image';
    if (type?.includes('pdf')) return 'FileText';
    if (type?.includes('word') || type?.includes('document')) return 'FileText';
    if (type?.includes('sheet') || type?.includes('excel')) return 'Table';
    if (type?.includes('zip') || type?.includes('rar')) return 'Archive';
    return 'File';
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div
        className={`border-2 border-dashed rounded-lg p-6 md:p-8 lg:p-12 text-center transition-smooth ${
          isDragging ? 'border-primary bg-primary/5' : 'border-border bg-muted/30'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Icon name="Upload" size={48} className="mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          Drag and drop files here
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          or click to browse from your computer
        </p>
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <Button variant="outline" iconName="FolderOpen" iconPosition="left" asChild>
            <span>Browse Files</span>
          </Button>
        </label>
        <p className="caption text-muted-foreground mt-4">
          Maximum file size: 10MB. Supported formats: PDF, DOC, XLS, JPG, PNG
        </p>
      </div>
      {attachments?.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-base md:text-lg font-medium text-foreground">
            Uploaded Files ({attachments?.length})
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {attachments?.map((file) => (
              <div
                key={file?.id}
                className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-card border border-border rounded-lg hover:shadow-elevation-1 transition-smooth"
              >
                {file?.type?.startsWith('image/') ? (
                  <div className="w-12 h-12 md:w-16 md:h-16 flex-shrink-0 rounded overflow-hidden bg-muted">
                    <Image
                      src={file?.url}
                      alt={file?.alt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 md:w-16 md:h-16 flex-shrink-0 rounded bg-primary/10 flex items-center justify-center">
                    <Icon name={getFileIcon(file?.type)} size={24} className="text-primary" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm md:text-base font-medium text-foreground truncate">
                    {file?.name}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm text-muted-foreground mt-1">
                    <span className="data-text">{formatFileSize(file?.size)}</span>
                    <span>•</span>
                    <span>Uploaded by {file?.uploadedBy}</span>
                    <span>•</span>
                    <span>{new Date(file.uploadedAt)?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    iconName="Download"
                    onClick={() => window.open(file?.url, '_blank')}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    iconName="Eye"
                    onClick={() => setSelectedFile(file)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    iconName="Trash2"
                    onClick={() => onDelete(file?.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {selectedFile && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedFile(null)}
        >
          <div
            className="bg-card rounded-lg shadow-elevation-4 max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e?.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-medium text-foreground">{selectedFile?.name}</h3>
              <Button
                variant="ghost"
                size="icon"
                iconName="X"
                onClick={() => setSelectedFile(null)}
              />
            </div>
            <div className="p-4">
              {selectedFile?.type?.startsWith('image/') ? (
                <Image
                  src={selectedFile?.url}
                  alt={selectedFile?.alt}
                  className="w-full h-auto rounded"
                />
              ) : (
                <div className="text-center py-12">
                  <Icon name={getFileIcon(selectedFile?.type)} size={64} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">Preview not available for this file type</p>
                  <Button variant="outline" iconName="Download" iconPosition="left">
                    Download File
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttachmentsTab;