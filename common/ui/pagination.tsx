import { usePaginationContext } from "../context/pagination";

interface PaginationProps {
  totalCount: number;
  totalPages: number;
  onPageChange?: (page: number, pageSize: number) => void;
  onPageSizeChange?: (page: number, pageSize: number) => void;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
  maxButtons?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  totalCount,
  totalPages,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  showPageSizeSelector = true,
  maxButtons = 5,
}) => {
  const { page, pageSize, setPage, setPageSize } = usePaginationContext();

  if (totalPages <= 1) return null;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    onPageChange?.(newPage, pageSize);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    onPageSizeChange?.(1, newPageSize);
  };

  const renderPageButtons = () => {
    const buttons = [];
    const startPage = Math.max(1, page - Math.floor(maxButtons / 2));
    const endPage = Math.min(totalPages, startPage + maxButtons - 1);

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 mx-1 rounded ${
            i === page
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  return (
    <div className="flex items-center justify-between p-4 border-t">
      {showPageSizeSelector && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">페이지 크기:</span>
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          className="px-3 py-1 mx-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
        >
          이전
        </button>
        {renderPageButtons()}
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          className="px-3 py-1 mx-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
        >
          다음
        </button>
      </div>

      <div className="text-sm text-gray-600">
        총 {totalCount}개 중 {(page - 1) * pageSize + 1}-
        {Math.min(page * pageSize, totalCount)}개 표시
      </div>
    </div>
  );
};