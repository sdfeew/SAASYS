import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DeploymentConfirmationModal = ({ isOpen, onClose, onConfirm, module, fieldCount }) => {
  if (!isOpen) return null;

  // Helper function to safely extract name from JSONB or string
  const extractName = (name) => {
    if (!name) return 'Unnamed';
    if (typeof name === 'string') return name;
    if (typeof name === 'object' && name?.en) return name.en;
    if (typeof name === 'object' && name?.ar) return name.ar;
    return 'Unnamed';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-card border border-border rounded-lg shadow-elevation-4 overflow-hidden">
        <div className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
              <Icon name="AlertTriangle" size={24} className="text-warning" />
            </div>
            <div>
              <h2 className="text-lg font-heading font-semibold text-foreground mb-2">
                Deploy Module Configuration?
              </h2>
              <p className="text-sm text-muted-foreground">
                This action will make the module and its fields available to all users. Deployed configurations cannot be easily reverted.
              </p>
            </div>
          </div>

          <div className="bg-muted rounded-lg p-4 mb-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Module Name:</span>
              <span className="text-sm font-medium text-foreground">{extractName(module?.name)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Fields:</span>
              <span className="text-sm font-medium text-foreground">{fieldCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status:</span>
              <span className="caption px-2 py-0.5 bg-success/10 text-success rounded-full">
                Ready to Deploy
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg mb-6">
            <Icon name="Info" size={16} className="text-primary mt-0.5 flex-shrink-0" />
            <p className="caption text-foreground">
              After deployment, the module will be immediately available in the Dynamic Modules section. Users with appropriate permissions can start creating records.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="default"
              fullWidth
              iconName="Rocket"
              iconPosition="left"
              onClick={onConfirm}
            >
              Deploy Now
            </Button>
            <Button variant="outline" fullWidth onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeploymentConfirmationModal;