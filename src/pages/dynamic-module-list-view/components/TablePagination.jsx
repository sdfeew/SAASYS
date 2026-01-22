import React from 'react';

import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const TablePagination = ({ 
  currentPage, 
  totalPages, 
  pageSize, 
  totalRecords,
  onPageChange, 
  onPageSizeChange 
}) => {
  const pageSizeOptions = [
    { value: '10', label: '10 per page' },
    { value: '25', label: '25 per page' },
    { value: '50', label: '50 per page' },
    { value: '100', label: '100 per page' }
  ];

  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalRecords);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page) => {
    onPageChange(page);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages?.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages?.push(i);
        }
        pages?.push('...');
        pages?.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages?.push(1);
        pages?.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages?.push(i);
        }
      } else {
        pages?.push(1);
        pages?.push('...');
        pages?.push(currentPage - 1);
        pages?.push(currentPage);
        pages?.push(currentPage + 1);
        pages?.push('...');
        pages?.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="bg-card border-t border-border px-4 md:px-6 lg:px-8 py-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Records Info */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            Showing {startRecord} to {endRecord} of {totalRecords} records
          </span>
          <Select
            options={pageSizeOptions}
            value={pageSize?.toString()}
            onChange={(value) => onPageSizeChange(parseInt(value))}
            className="w-40"
          />
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            iconName="ChevronLeft"
            onClick={handlePrevious}
            disabled={currentPage === 1}
          />

          {/* Desktop Page Numbers */}
          <div className="hidden md:flex items-center gap-1">
            {getPageNumbers()?.map((page, index) => (
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="px-3 py-2 text-muted-foreground">
                  ...
                </span>
              ) : (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => handlePageClick(page)}
                >
                  {page}
                </Button>
              )
            ))}
          </div>

          {/* Mobile Page Info */}
          <div className="md:hidden px-4 py-2 bg-muted rounded-md">
            <span className="text-sm font-medium text-foreground">
              {currentPage} / {totalPages}
            </span>
          </div>

          <Button
            variant="outline"
            size="icon"
            iconName="ChevronRight"
            onClick={handleNext}
            disabled={currentPage === totalPages}
          />
        </div>
      </div>
    </div>
  );
};

export default TablePagination;