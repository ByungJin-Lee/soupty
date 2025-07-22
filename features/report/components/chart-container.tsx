import { memo, ReactNode } from "react";

interface ChartContainerProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const ChartContainer = memo<ChartContainerProps>(({
  title,
  subtitle,
  children,
  className = "",
  isLoading = false,
  error = null,
  onRetry,
}) => {
  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <div className="text-center">
          <div className="text-red-600 font-medium mb-2">차트 로드 오류</div>
          <div className="text-red-500 text-sm mb-4">{error}</div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              다시 시도
            </button>
          )}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-6 ${className}`}>
        <div className="animate-pulse">
          {title && <div className="h-6 bg-gray-300 rounded w-1/3 mb-2"></div>}
          {subtitle && <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>}
          <div className="h-64 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-gray-200">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
});

ChartContainer.displayName = "ChartContainer";