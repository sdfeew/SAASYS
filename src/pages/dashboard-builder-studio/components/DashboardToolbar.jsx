import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const DashboardToolbar = ({ dashboardName, onNameChange, onSave, onPublish, onPreview, isPreviewMode }) => {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);

  const handleSave = () => {
    onSave();
    setShowSaveDialog(false);
  };

  const handlePublish = () => {
    onPublish();
  };

  return (
    <>
      <div className="bg-card border-b border-border px-4 py-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
          <div className="flex-1 min-w-0">
            <Input
              type="text"
              value={dashboardName}
              onChange={(e) => onNameChange(e?.target?.value)}
              placeholder="Untitled Dashboard"
              className="text-base md:text-lg font-heading font-semibold"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="ghost"
              size="sm"
              iconName="Eye"
              iconPosition="left"
              onClick={onPreview}
            >
              {isPreviewMode ? 'Edit' : 'Preview'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              iconName="Save"
              iconPosition="left"
              onClick={() => setShowSaveDialog(true)}
            >
              Save
            </Button>

            <Button
              variant="outline"
              size="sm"
              iconName="Share2"
              iconPosition="left"
              onClick={() => setShowShareDialog(true)}
            >
              Share
            </Button>

            <Button
              variant="default"
              size="sm"
              iconName="Rocket"
              iconPosition="left"
              onClick={handlePublish}
            >
              Publish
            </Button>
          </div>
        </div>
      </div>
      {showSaveDialog && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg shadow-elevation-4 w-full max-w-md">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-heading font-semibold text-foreground">
                Save Dashboard
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-foreground">
                Your dashboard "{dashboardName}" will be saved with all current widgets and configurations.
              </p>
              <div className="bg-muted/50 rounded-md p-3">
                <div className="flex items-start gap-2">
                  <Icon name="Info" size={16} className="text-primary mt-0.5" />
                  <p className="caption text-muted-foreground">
                    Last saved: {new Date()?.toLocaleString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-border flex gap-3">
              <Button variant="outline" onClick={() => setShowSaveDialog(false)} fullWidth>
                Cancel
              </Button>
              <Button onClick={handleSave} fullWidth>
                Save Dashboard
              </Button>
            </div>
          </div>
        </div>
      )}
      {showShareDialog && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg shadow-elevation-4 w-full max-w-md">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-heading font-semibold text-foreground">
                Share Dashboard
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Share Link
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value="https://tenantflow.app/dashboards/abc123"
                    readOnly
                    className="flex-1"
                  />
                  <Button variant="outline" iconName="Copy">
                    Copy
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground block">
                  Access Permissions
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 p-3 bg-muted/50 rounded-md cursor-pointer hover:bg-muted transition-smooth">
                    <input type="radio" name="access" defaultChecked className="text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">View Only</p>
                      <p className="caption text-muted-foreground">Users can view but not edit</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-2 p-3 bg-muted/50 rounded-md cursor-pointer hover:bg-muted transition-smooth">
                    <input type="radio" name="access" className="text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Can Edit</p>
                      <p className="caption text-muted-foreground">Users can modify dashboard</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-border flex gap-3">
              <Button variant="outline" onClick={() => setShowShareDialog(false)} fullWidth>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardToolbar;