import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ModuleTreePanel = ({ modules, selectedModule, onSelectModule, onAddModule }) => {
  const [expandedModules, setExpandedModules] = useState(new Set(['hr', 'crm']));
  const [searchQuery, setSearchQuery] = useState('');

  // Helper function to safely extract name from JSONB or string
  const extractName = (name) => {
    if (!name) return 'Unnamed';
    if (typeof name === 'string') return name;
    if (typeof name === 'object' && name?.en) return name.en;
    if (typeof name === 'object' && name?.ar) return name.ar;
    return 'Unnamed';
  };

  const toggleExpand = (moduleId) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded?.has(moduleId)) {
      newExpanded?.delete(moduleId);
    } else {
      newExpanded?.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const filteredModules = modules?.filter(module => {
    if (!module?.name) return false;
    const moduleName = extractName(module?.name)?.toLowerCase();
    const subModuleMatch = module?.subModules?.some(sub => 
      sub?.name ? extractName(sub?.name)?.toLowerCase()?.includes(searchQuery?.toLowerCase()) : false
    );
    return moduleName?.includes(searchQuery?.toLowerCase()) || subModuleMatch;
  });

  return (
    <div className="h-full flex flex-col bg-card border-r border-border">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-heading font-semibold text-foreground">Modules</h2>
          <Button
            variant="ghost"
            size="icon"
            iconName="Plus"
            onClick={onAddModule}
            aria-label="Add new module"
          />
        </div>
        <div className="relative">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search modules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e?.target?.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-custom p-2">
        {filteredModules?.map((module) => (
          <div key={module.id} className="mb-1">
            <button
              onClick={() => toggleExpand(module.id)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-smooth"
            >
              <Icon
                name={expandedModules?.has(module.id) ? 'ChevronDown' : 'ChevronRight'}
                size={16}
                className="text-muted-foreground"
              />
              <Icon name={module.icon} size={16} className="text-primary" />
              <span className="flex-1 text-left font-medium">{extractName(module.name)}</span>
              <span className="caption text-muted-foreground">{module.subModules?.length || 0}</span>
            </button>

            {expandedModules?.has(module.id) && module.subModules && (
              <div className="ml-6 mt-1 space-y-1">
                {module.subModules?.map((subModule) => (
                  <button
                    key={subModule?.id}
                    onClick={() => onSelectModule(subModule)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-smooth ${
                      selectedModule?.id === subModule?.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon name={subModule?.icon} size={14} />
                    <span className="flex-1 text-left">{extractName(subModule?.name)}</span>
                    <span className="caption">{subModule?.fieldCount}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-border">
        <Button
          variant="outline"
          fullWidth
          iconName="FolderPlus"
          iconPosition="left"
          onClick={onAddModule}
        >
          Create Module
        </Button>
      </div>
    </div>
  );
};

export default ModuleTreePanel;