import { X } from "react-feather";

interface FilterButtonProps {
  value?: string | null;
  placeholder: string;
  displayValue?: string;
  onClick: () => void;
  onReset?: () => void;
  prefix?: React.ReactNode;
  className?: string;
}

export const FilterButton: React.FC<FilterButtonProps> = ({
  value,
  placeholder,
  displayValue,
  onClick,
  onReset,
  prefix,
  className = "",
}) => {
  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReset?.();
  };

  const hasValue = value !== undefined && value !== null && value !== "";

  return (
    <div
      onClick={onClick}
      className={`flex items-center py-1.5 px-2 bg-gray-200 rounded-md text-sm gap-2 cursor-pointer hover:bg-gray-300 transition-colors ${className}`}
    >
      {hasValue ? (
        <>
          {prefix}
          <span>{displayValue || value}</span>
          {onReset && (
            <button
              className="py-1 hover:bg-gray-400 rounded p-0.5 transition-colors"
              onClick={handleReset}
              aria-label="필터 제거"
            >
              <X size={14} />
            </button>
          )}
        </>
      ) : (
        <>
          {prefix}
          <span>{placeholder}</span>
        </>
      )}
    </div>
  );
};