type Props = {
  title: string;
};

export const HistoryUserSeparator: React.FC<Props> = ({ title }) => {
  return (
    <div className="flex w-full">
      <div className="border-b flex-1 h-[1px] my-auto border-gray-400"></div>
      <span className="w-fit px-2 text-gray-400">{title}</span>
      <div className="border-b flex-1 h-[1px] my-auto border-gray-400"></div>
    </div>
  );
};
