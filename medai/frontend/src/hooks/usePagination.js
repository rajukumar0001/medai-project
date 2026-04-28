import { useState } from 'react';

export const usePagination = (initialPage = 1, initialLimit = 10) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const goToPage = (p) => setPage(p);
  const nextPage = (total) => { if (page < total) setPage(p => p + 1); };
  const prevPage = () => { if (page > 1) setPage(p => p - 1); };
  const reset = () => setPage(1);

  return { page, limit, setLimit, goToPage, nextPage, prevPage, reset };
};
