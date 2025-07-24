"use client";

interface PrintButtonProps {
  className?: string;
}

export function PrintButton({ className = "" }: PrintButtonProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <button
      onClick={handlePrint}
      className={`text-gray-400 hover:text-gray-600 cursor-pointer ${className}`}
      aria-label="Print page"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="6,9 6,2 18,2 18,9" />
        <path d="M6,18H4a2,2 0 0,1-2-2V11a2,2 0 0,1,2-2H20a2,2 0 0,1,2,2v5a2,2 0 0,1-2,2H18" />
        <rect x="6" y="14" width="12" height="8" />
      </svg>
    </button>
  );
}