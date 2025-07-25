type Props = {
  message?: string;
};

export const NotFound: React.FC<Props> = ({ 
  message = "요청하신 내용을 찾을 수 없습니다." 
}) => {
  return (
    <div className="p-6 flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="text-gray-600">{message}</div>
      </div>
    </div>
  );
};