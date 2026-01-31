import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import { getLangText } from '../../../utils/languageUtils';

const DataTable = ({ 
  columns, 
  data, 
  selectedRows, 
  onSelectRow, 
  onSelectAll, 
  onSort,
  sortConfig,
  onEdit,
  moduleId
}) => {
  const navigate = useNavigate();
  const [expandedRows, setExpandedRows] = useState(new Set());

  const handleSort = (columnKey) => {
    const direction = sortConfig?.key === columnKey && sortConfig?.direction === 'asc' ? 'desc' : 'asc';
    onSort({ key: columnKey, direction });
  };

  const handleRowClick = (recordId) => {
    navigate(`/record-detail-management?id=${recordId}&moduleId=${moduleId}`);
  };

  const handleEdit = (e, recordId) => {
    e?.stopPropagation();
    onEdit?.(recordId);
  };

  const handleDelete = (e, recordId) => {
    e?.stopPropagation();
    console.log('Delete record:', recordId);
  };

  const toggleRowExpansion = (recordId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded?.has(recordId)) {
      newExpanded?.delete(recordId);
    } else {
      newExpanded?.add(recordId);
    }
    setExpandedRows(newExpanded);
  };

  const renderCellValue = (value, type) => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground italic">—</span>;
    }

    // Handle JSONB multilingual fields
    if (typeof value === 'object' && !Array.isArray(value) && (value?.ar || value?.en)) {
      value = getLangText(value, 'en');
    }

    switch (type) {
      case 'boolean':
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
            value ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
          }`}>
            <Icon name={value ? 'Check' : 'X'} size={12} />
            {value ? 'Yes' : 'No'}
          </span>
        );
      case 'date':
        return new Date(value)?.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
      case 'currency':
        return new Intl.NumberFormat('en-US', { 
          style: 'currency', 
          currency: 'USD' 
        })?.format(value);
      case 'number':
        return new Intl.NumberFormat('en-US')?.format(value);
      default:
        return String(value) || '—';
    }
  };

  return (
    <div className="overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto scrollbar-custom">
        <table className="w-full">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="w-12 px-4 py-3">
                <Checkbox
                  checked={selectedRows?.length === data?.length && data?.length > 0}
                  onChange={(e) => onSelectAll(e?.target?.checked)}
                />
              </th>
              {columns?.map((column) => (
                <th
                  key={column?.key}
                  className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:bg-muted-foreground/5 transition-smooth"
                  onClick={() => column?.sortable && handleSort(column?.key)}
                >
                  <div className="flex items-center gap-2">
                    <span>{getLangText(column?.label, 'en') || column?.key}</span>
                    {column?.sortable && (
                      <Icon
                        name={
                          sortConfig?.key === column?.key
                            ? sortConfig?.direction === 'asc' ?'ChevronUp' :'ChevronDown' :'ChevronsUpDown'
                        }
                        size={16}
                        className="text-muted-foreground"
                      />
                    )}
                  </div>
                </th>
              ))}
              <th className="w-32 px-4 py-3 text-right text-sm font-medium text-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data?.map((row) => (
              <tr
                key={row?.id}
                className="hover:bg-muted/50 transition-smooth cursor-pointer"
                onClick={() => handleRowClick(row?.id)}
              >
                <td className="px-4 py-3" onClick={(e) => e?.stopPropagation()}>
                  <Checkbox
                    checked={selectedRows?.includes(row?.id)}
                    onChange={(e) => onSelectRow(row?.id, e?.target?.checked)}
                  />
                </td>
                {columns?.map((column) => (
                  <td key={column?.key} className="px-4 py-3 text-sm text-foreground">
                    {renderCellValue(row?.[column?.key], column?.type)}
                  </td>
                ))}
                <td className="px-4 py-3" onClick={(e) => e?.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      iconName="Eye"
                      onClick={() => handleRowClick(row?.id)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      iconName="Edit"
                      onClick={(e) => handleEdit(e, row?.id)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      iconName="Trash2"
                      onClick={(e) => handleDelete(e, row?.id)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3 p-4">
        {data?.map((row) => {
          const isExpanded = expandedRows?.has(row?.id);
          return (
            <div
              key={row?.id}
              className="bg-card border border-border rounded-lg overflow-hidden shadow-elevation-1"
            >
              <div className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <Checkbox
                    checked={selectedRows?.includes(row?.id)}
                    onChange={(e) => onSelectRow(row?.id, e?.target?.checked)}
                  />
                  <div className="flex-1 min-w-0">
                    {columns?.slice(0, 2)?.map((column) => (
                      <div key={column?.key} className="mb-2">
                        <span className="caption text-muted-foreground block mb-1">
                          {getLangText(column?.label, 'en') || column?.key}
                        </span>
                        <span className="text-sm md:text-base text-foreground font-medium">
                          {renderCellValue(row?.[column?.key], column?.type)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {isExpanded && (
                  <div className="space-y-2 mb-3 pt-3 border-t border-border">
                    {columns?.slice(2)?.map((column) => (
                      <div key={column?.key} className="flex justify-between items-center">
                        <span className="caption text-muted-foreground">
                          {getLangText(column?.label, 'en') || column?.key}
                        </span>
                        <span className="text-sm text-foreground">
                          {renderCellValue(row?.[column?.key], column?.type)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    iconName={isExpanded ? 'ChevronUp' : 'ChevronDown'}
                    iconPosition="right"
                    onClick={() => toggleRowExpansion(row?.id)}
                  >
                    {isExpanded ? 'Show Less' : 'Show More'}
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      iconName="Eye"
                      onClick={() => handleRowClick(row?.id)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      iconName="Edit"
                      onClick={(e) => handleEdit(e, row?.id)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      iconName="Trash2"
                      onClick={(e) => handleDelete(e, row?.id)}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DataTable;