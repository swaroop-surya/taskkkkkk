import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-[#FDFDFE] border-t border-[#D6D9DF] sm:px-6">
      <div className="flex justify-between flex-1 sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-[#1E252B] bg-[#FDFDFE] border border-[#D6D9DF] disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-[#1E252B] bg-[#FDFDFE] border border-[#D6D9DF] disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-[#8F9192]">
            Showing <span className="font-semibold text-[#1E252B]">{(currentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="font-semibold text-[#1E252B]">{Math.min(currentPage * pageSize, totalItems)}</span> of{' '}
            <span className="font-semibold text-[#1E252B]">{totalItems}</span> results
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-lg shadow-2xs -space-x-px" aria-label="Pagination">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-lg border border-[#D6D9DF] bg-[#FDFDFE] text-xs font-medium text-[#8F9192] hover:bg-[#F0F3F5] disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              const isActive = pageNum === currentPage;
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`relative inline-flex items-center px-3.5 py-1.5 border text-xs font-semibold ${
                    isActive
                      ? 'z-10 bg-[#3D766D] border-[#3D766D] text-[#FDFDFE]'
                      : 'border-[#D6D9DF] bg-[#FDFDFE] text-[#1E252B] hover:bg-[#F0F3F5]'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-lg border border-[#D6D9DF] bg-[#FDFDFE] text-xs font-medium text-[#8F9192] hover:bg-[#F0F3F5] disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};
