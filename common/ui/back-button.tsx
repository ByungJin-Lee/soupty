"use client";

import { useRouter } from "next/navigation";

interface BackButtonProps {
  className?: string;
}

export function BackButton({ className = "" }: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    router.back();
  };

  return (
    <button
      onClick={handleClick}
      className={`text-gray-400 hover:text-gray-600 cursor-pointer ${className}`}
      aria-label="Go back"
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
        <path d="M19 12H5" />
        <path d="M12 19l-7-7 7-7" />
      </svg>
    </button>
  );
}
