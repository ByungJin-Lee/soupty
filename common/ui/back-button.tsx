"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "react-feather";

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
      <ArrowLeft />
    </button>
  );
}
