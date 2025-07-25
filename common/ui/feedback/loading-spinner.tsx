type Props = {
  message?: string;
};

export const LoadingSpinner: React.FC<Props> = ({ 
  message = "불러오는 중..." 
}) => {
  return (
    <div className="p-6 flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <div className="text-gray-600">{message}</div>
      </div>
    </div>
  );
};