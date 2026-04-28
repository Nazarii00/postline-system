import { ChevronLeft, ChevronRight } from 'lucide-react';

type PaginationProps = {
  activePage: number;
  className?: string;
  endIndex: number;
  itemLabel: string;
  onPageChange: (page: number) => void;
  pageNumbers: (number | string)[];
  startIndex: number;
  totalItems: number;
  totalPages: number;
};

export const Pagination = ({
  activePage,
  className = '',
  endIndex,
  itemLabel,
  onPageChange,
  pageNumbers,
  startIndex,
  totalItems,
  totalPages,
}: PaginationProps) => {
  if (totalItems === 0) return null;

  const from = Math.min(startIndex + 1, totalItems);
  const to = Math.min(endIndex, totalItems);

  return (
    <div className={`space-y-3 ${className}`}>
      {totalPages > 1 && (
        <div className="p-4 border border-slate-200 rounded-3xl flex items-center justify-between bg-white shadow-sm">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, activePage - 1))}
            disabled={activePage === 1}
            className="p-2 flex items-center gap-1 text-sm font-medium text-slate-600 disabled:opacity-50 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <ChevronLeft size={18} />
            <span className="hidden sm:inline">Попередня</span>
          </button>

          <div className="flex items-center gap-1">
            {pageNumbers.map((page, index) => (
              <button
                key={`${page}-${index}`}
                type="button"
                onClick={() => typeof page === 'number' && onPageChange(page)}
                disabled={page === '...'}
                className={`min-w-[36px] h-9 px-2 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                  page === '...'
                    ? 'text-slate-400 cursor-default'
                    : page === activePage
                      ? 'bg-pine text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, activePage + 1))}
            disabled={activePage === totalPages}
            className="p-2 flex items-center gap-1 text-sm font-medium text-slate-600 disabled:opacity-50 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <span className="hidden sm:inline">Наступна</span>
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
        Показано {from}-{to} з {totalItems} {itemLabel}
      </p>
    </div>
  );
};
