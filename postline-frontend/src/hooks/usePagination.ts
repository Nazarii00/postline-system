import { useMemo, useState } from 'react';

export const getPageNumbers = (activePage: number, totalPages: number) => {
  if (totalPages <= 1) return [];

  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (activePage <= 4) {
    return [1, 2, 3, 4, 5, '...', totalPages];
  }

  if (activePage >= totalPages - 3) {
    return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, '...', activePage - 1, activePage, activePage + 1, '...', totalPages];
};

export const usePagination = <T,>(items: T[], pageSize: number) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const activePage = totalPages > 0 ? Math.min(currentPage, totalPages) : 1;
  const startIndex = (activePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const paginatedItems = useMemo(
    () => items.slice(startIndex, endIndex),
    [endIndex, items, startIndex]
  );

  const pageNumbers = useMemo(
    () => getPageNumbers(activePage, totalPages),
    [activePage, totalPages]
  );

  return {
    activePage,
    currentPage,
    endIndex,
    pageNumbers,
    pageSize,
    paginatedItems,
    setCurrentPage,
    startIndex,
    totalItems,
    totalPages,
  };
};
