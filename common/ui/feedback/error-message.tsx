type Props = {
  title?: string;
  message: string;
};

export const ErrorMessage: React.FC<Props> = ({ 
  title = "오류 발생", 
  message 
}) => {
  return (
    <div className="p-6 flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="text-red-500 mb-2">{title}</div>
        <div className="text-gray-600">{message}</div>
      </div>
    </div>
  );
};