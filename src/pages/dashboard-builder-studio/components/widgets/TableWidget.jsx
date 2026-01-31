import React, { useState, useEffect } from 'react';
import Icon from '../../../../components/AppIcon';

const TableWidget = ({ widget, data, loading, error, onDrill, filters }) => {
  const [tableData, setTableData] = useState([]);
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = widget.itemsPerPage || 10;

  useEffect(() => {
    if (data && data.length > 0) {
      setTableData(data);
    }
  }, [data]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const sortedData = sortBy
    ? [...tableData].sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
        }
        
        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();
        return sortOrder === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
      })
    : tableData;

  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const paginatedData = sortedData.slice(startIdx, endIdx);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const columns = widget.columns || (tableData.length > 0 ? Object.keys(tableData[0]) : []);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/30 rounded border border-dashed border-border">
        <div className="text-center">
          <Icon name="Loader2" size={32} className="mx-auto mb-2 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-destructive/5 rounded border border-destructive/20">
        <div className="text-center">
          <Icon name="AlertCircle" size={32} className="mx-auto mb-2 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  if (!tableData || tableData.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/30 rounded border border-dashed border-border">
        <div className="text-center">
          <Icon name="Table2" size={32} className="mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Table */}
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-muted border-b border-border">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-4 py-2 text-left font-medium text-foreground cursor-pointer hover:bg-muted/80 transition-colors"
                  onClick={() => handleSort(col)}
                >
                  <div className="flex items-center gap-2">
                    <span>{col}</span>
                    {sortBy === col && (
                      <Icon 
                        name={sortOrder === 'asc' ? 'ArrowUp' : 'ArrowDown'} 
                        size={14} 
                        className="text-primary"
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, idx) => (
              <tr
                key={idx}
                className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => onDrill && onDrill(row)}
              >
                {columns.map((col) => (
                  <td key={`${idx}-${col}`} className="px-4 py-2 text-foreground truncate">
                    {typeof row[col] === 'object' ? JSON.stringify(row[col]) : String(row[col] || '-')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
          <div className="text-xs text-muted-foreground">
            Showing {startIdx + 1} to {Math.min(endIdx, sortedData.length)} of {sortedData.length}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded hover:bg-muted disabled:opacity-50 transition-colors"
              title="Previous page"
            >
              <Icon name="ChevronLeft" size={16} />
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = totalPages <= 5 ? i + 1 : currentPage - 2 + i;
                if (page < 1 || page > totalPages) return null;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-2 py-1 rounded text-xs transition-colors ${
                      currentPage === page
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded hover:bg-muted disabled:opacity-50 transition-colors"
              title="Next page"
            >
              <Icon name="ChevronRight" size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableWidget;
