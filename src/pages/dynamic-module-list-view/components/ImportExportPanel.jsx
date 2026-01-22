import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const ImportExportPanel = ({ onImport, onExport }) => {
  const [showImport, setShowImport] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [importFormat, setImportFormat] = useState('csv');
  const [exportFormat, setExportFormat] = useState('csv');

  const formatOptions = [
    { value: 'csv', label: 'CSV Format' },
    { value: 'excel', label: 'Excel (XLSX)' },
    { value: 'json', label: 'JSON Format' }
  ];

  const handleFileSelect = (e) => {
    const file = e?.target?.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImport = () => {
    if (selectedFile) {
      onImport(selectedFile, importFormat);
      setSelectedFile(null);
      setShowImport(false);
    }
  };

  const handleExport = () => {
    onExport(exportFormat);
    setShowExport(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="default"
        iconName="Upload"
        iconPosition="left"
        onClick={() => setShowImport(!showImport)}
      >
        <span className="hidden sm:inline">Import</span>
      </Button>
      <Button
        variant="outline"
        size="default"
        iconName="Download"
        iconPosition="left"
        onClick={() => setShowExport(!showExport)}
      >
        <span className="hidden sm:inline">Export</span>
      </Button>
      {/* Import Modal */}
      {showImport && (
        <>
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={() => setShowImport(false)}
            aria-hidden="true"
          />
          
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-lg shadow-elevation-4 w-full max-w-md">
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground">
                    Import Records
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    iconName="X"
                    onClick={() => setShowImport(false)}
                  />
                </div>
              </div>

              <div className="p-6 space-y-4">
                <Select
                  label="Import Format"
                  options={formatOptions}
                  value={importFormat}
                  onChange={setImportFormat}
                />

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Select File
                  </label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-smooth cursor-pointer">
                    <input
                      type="file"
                      accept=".csv,.xlsx,.json"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Icon name="Upload" size={32} className="mx-auto mb-2 text-muted-foreground" />
                      {selectedFile ? (
                        <p className="text-sm text-foreground font-medium">{selectedFile?.name}</p>
                      ) : (
                        <>
                          <p className="text-sm text-foreground font-medium mb-1">
                            Click to upload or drag and drop
                          </p>
                          <p className="caption text-muted-foreground">
                            CSV, XLSX, or JSON (max 10MB)
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Icon name="Info" size={16} className="text-primary mt-0.5 flex-shrink-0" />
                    <p className="caption text-muted-foreground">
                      Ensure your file matches the module schema. Invalid records will be skipped.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-border flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowImport(false)}
                  fullWidth
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  onClick={handleImport}
                  disabled={!selectedFile}
                  fullWidth
                >
                  Import
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
      {/* Export Modal */}
      {showExport && (
        <>
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={() => setShowExport(false)}
            aria-hidden="true"
          />
          
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-lg shadow-elevation-4 w-full max-w-md">
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground">
                    Export Records
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    iconName="X"
                    onClick={() => setShowExport(false)}
                  />
                </div>
              </div>

              <div className="p-6 space-y-4">
                <Select
                  label="Export Format"
                  options={formatOptions}
                  value={exportFormat}
                  onChange={setExportFormat}
                />

                <div className="bg-muted rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Total Records</span>
                    <span className="text-sm font-medium text-foreground">1,247</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Visible Columns</span>
                    <span className="text-sm font-medium text-foreground">8</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Estimated Size</span>
                    <span className="text-sm font-medium text-foreground">2.4 MB</span>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-border flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowExport(false)}
                  fullWidth
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  iconName="Download"
                  iconPosition="left"
                  onClick={handleExport}
                  fullWidth
                >
                  Export
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ImportExportPanel;