import { ChevronLeft, ChevronRight } from 'lucide-react';

type PaginationControlsProps = {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
};

export const PaginationControls = ({ page, pageSize, totalItems, onPageChange }: PaginationControlsProps) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);
  const canGoBack = page > 1;
  const canGoForward = page < totalPages;

  if (totalPages <= 1) return null;

  return (
    <div className="px-4 pb-4 pt-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-100">
      <p className="text-xs font-bold text-slate-400">
        {from}-{to} з {totalItems}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          title="Попередня сторінка"
          aria-label="Попередня сторінка"
          disabled={!canGoBack}
          onClick={() => onPageChange(page - 1)}
          className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors ${
            canGoBack
              ? 'border-slate-200 text-slate-600 hover:border-pine hover:text-pine'
              : 'border-slate-100 text-slate-300 cursor-not-allowed'
          }`}
        >
          <ChevronLeft size={17} />
        </button>
        <span className="min-w-[70px] text-center text-xs font-black text-slate-600">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          title="Наступна сторінка"
          aria-label="Наступна сторінка"
          disabled={!canGoForward}
          onClick={() => onPageChange(page + 1)}
          className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors ${
            canGoForward
              ? 'border-slate-200 text-slate-600 hover:border-pine hover:text-pine'
              : 'border-slate-100 text-slate-300 cursor-not-allowed'
          }`}
        >
          <ChevronRight size={17} />
        </button>
      </div>
    </div>
  );
};
