import { useState, type ReactNode } from 'react';
import { EmptyBlock } from './EmptyBlock';
import { PaginationControls } from './PaginationControls';

export const CARD_PAGE_SIZE = 4;

type ReportTableProps = {
  title: string;
  icon: ReactNode;
  headers: string[];
  rows: string[][];
  pageSize?: number;
};

export const ReportTable = ({ title, icon, headers, rows, pageSize = CARD_PAGE_SIZE }: ReportTableProps) => {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const visibleRows = rows.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (nextPage: number) => {
    setPage(Math.min(Math.max(nextPage, 1), totalPages));
  };

  return (
    <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center gap-2">
        {icon}
        <h2 className="font-black text-slate-900 text-lg">{title}</h2>
      </div>
      {rows.length === 0 ? (
        <div className="p-6">
          <EmptyBlock message="Немає даних для показу." />
        </div>
      ) : (
        <>
          <div className="p-4 space-y-3">
            {visibleRows.map((row, rowIndex) => {
              const [primary, ...values] = row;
              const itemIndex = startIndex + rowIndex;

              return (
                <article
                  key={`${title}-${itemIndex}`}
                  className="rounded-2xl bg-slate-50 border border-slate-100 p-4 min-w-0"
                >
                  <p className="text-sm font-black text-slate-900 leading-snug break-words">
                    {primary}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 mt-4">
                    {values.map((cell, valueIndex) => (
                      <div key={`${title}-${itemIndex}-${valueIndex}`} className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wider font-black text-slate-400">
                          {headers[valueIndex + 1]}
                        </p>
                        <p className="text-sm font-bold text-slate-700 mt-1 break-words">
                          {cell}
                        </p>
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
          <PaginationControls
            page={currentPage}
            pageSize={pageSize}
            totalItems={rows.length}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </section>
  );
};
