import React from 'react';
import Icon from '../../../components/AppIcon';
import { getLangText } from '../../../utils/languageUtils';

const DashboardTable = ({ dashboards, onView, onEdit, onDuplicate, onDelete, onPublish, onUnpublish, onShare, deleting }) => {
  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusBadge = (isPublished) => {
    if (isPublished) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-success/10 text-success text-xs font-medium">
          <Icon name="Check" size={14} />
          Published
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-warning/10 text-warning text-xs font-medium">
        <Icon name="Clock" size={14} />
        Draft
      </span>
    );
  };

  return (
    <div className="p-4 md:p-6">
      <div className="overflow-hidden rounded-lg border border-border">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">Description</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">Widgets</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">Created</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {dashboards.map((dashboard) => (
                <tr key={dashboard.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-foreground font-medium">
                    <div className="flex items-center gap-3">
                      <Icon name="LayoutGrid" size={18} className="text-primary" />
                      <span className="truncate">{getLangText(dashboard.name, 'en')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    <span className="line-clamp-1">
                      {getLangText(dashboard.description, 'en') || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {getStatusBadge(dashboard.is_published)}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {dashboard.layout_config?.widgets?.length || dashboard.widgets?.length || 0}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {formatDate(dashboard.created_at)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onView(dashboard)}
                        className="p-2 rounded hover:bg-muted transition-colors"
                        title="View dashboard"
                      >
                        <Icon name="Eye" size={16} className="text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => onEdit(dashboard)}
                        className="p-2 rounded hover:bg-muted transition-colors"
                        title="Edit dashboard"
                      >
                        <Icon name="Edit2" size={16} className="text-muted-foreground" />
                      </button>
                      {dashboard.is_published ? (
                        <button
                          onClick={() => onUnpublish(dashboard)}
                          className="p-2 rounded hover:bg-muted transition-colors"
                          title="Unpublish"
                        >
                          <Icon name="EyeOff" size={16} className="text-muted-foreground" />
                        </button>
                      ) : (
                        <button
                          onClick={() => onPublish(dashboard)}
                          className="p-2 rounded hover:bg-muted transition-colors"
                          title="Publish"
                        >
                          <Icon name="Upload" size={16} className="text-muted-foreground" />
                        </button>
                      )}
                      <button
                        onClick={() => onDuplicate(dashboard)}
                        className="p-2 rounded hover:bg-muted transition-colors"
                        title="Duplicate"
                      >
                        <Icon name="Copy" size={16} className="text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => onShare(dashboard)}
                        className="p-2 rounded hover:bg-muted transition-colors"
                        title="Share"
                      >
                        <Icon name="Share2" size={16} className="text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => onDelete(dashboard)}
                        disabled={deleting}
                        className="p-2 rounded hover:bg-destructive/10 transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        <Icon name="Trash2" size={16} className="text-destructive" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-3">
          {dashboards.map((dashboard) => (
            <div key={dashboard.id} className="bg-card border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <Icon name="LayoutGrid" size={16} className="text-primary" />
                    {getLangText(dashboard.name, 'en')}
                  </h4>
                  {dashboard.description && (
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                      {getLangText(dashboard.description, 'en')}
                    </p>
                  )}
                </div>
                {getStatusBadge(dashboard.is_published)}
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Icon name="Layers" size={14} />
                  {dashboard.layout_config?.widgets?.length || dashboard.widgets?.length || 0} widgets
                </span>
                <span>{formatDate(dashboard.created_at)}</span>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <button
                  onClick={() => onView(dashboard)}
                  className="flex-1 px-3 py-2 rounded bg-muted hover:bg-muted/80 transition-colors text-sm text-foreground flex items-center justify-center gap-2"
                >
                  <Icon name="Eye" size={14} />
                  View
                </button>
                <button
                  onClick={() => onEdit(dashboard)}
                  className="flex-1 px-3 py-2 rounded bg-muted hover:bg-muted/80 transition-colors text-sm text-foreground flex items-center justify-center gap-2"
                >
                  <Icon name="Edit2" size={14} />
                  Edit
                </button>
                <button
                  onClick={() => onShare(dashboard)}
                  className="flex-1 px-3 py-2 rounded bg-muted hover:bg-muted/80 transition-colors text-sm text-foreground flex items-center justify-center gap-2"
                >
                  <Icon name="Share2" size={14} />
                  Share
                </button>
                <button
                  onClick={() => onDelete(dashboard)}
                  disabled={deleting}
                  className="flex-1 px-3 py-2 rounded bg-destructive/10 hover:bg-destructive/20 transition-colors text-sm text-destructive flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Icon name="Trash2" size={14} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 p-4 rounded-lg bg-muted/30 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Showing <span className="font-medium text-foreground">{dashboards.length}</span> dashboard{dashboards.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
};

export default DashboardTable;
