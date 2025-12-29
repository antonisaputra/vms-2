
import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) {
    return null;
  }

  const handlePrevious = () => {
    onPageChange(Math.max(1, currentPage - 1));
  };

  const handleNext = () => {
    onPageChange(Math.min(totalPages, currentPage + 1));
  };
  
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between border-t border-border bg-card px-4 py-3 sm:px-6 mt-6 rounded-b-lg">
      <div className="flex-1 flex justify-between sm:hidden">
        <button onClick={handlePrevious} disabled={currentPage === 1} className="relative inline-flex items-center px-4 py-2 border border-border text-sm font-medium rounded-md text-card-foreground bg-card hover:bg-secondary disabled:opacity-50">
          Sebelumnya
        </button>
        <button onClick={handleNext} disabled={currentPage === totalPages} className="relative ml-3 inline-flex items-center px-4 py-2 border border-border text-sm font-medium rounded-md text-card-foreground bg-card hover:bg-secondary disabled:opacity-50">
          Berikutnya
        </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Menampilkan <span className="font-medium">{startItem}</span> - <span className="font-medium">{endItem}</span> dari <span className="font-medium">{totalItems}</span> hasil
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button onClick={handlePrevious} disabled={currentPage === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-border bg-card text-sm font-medium text-muted-foreground hover:bg-secondary disabled:opacity-50">
              <span className="sr-only">Sebelumnya</span>
              &lt;
            </button>
            {/* Page numbers could be added here for more complex pagination */}
            <span className="relative inline-flex items-center px-4 py-2 border border-border bg-card text-sm font-medium text-muted-foreground">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button onClick={handleNext} disabled={currentPage === totalPages} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-border bg-card text-sm font-medium text-muted-foreground hover:bg-secondary disabled:opacity-50">
              <span className="sr-only">Berikutnya</span>
              &gt;
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
