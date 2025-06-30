import { DonationEvent } from "~/types";

type Props = {
  data: DonationEvent;
};

export const DonationRow: React.FC<Props> = ({ data }) => {
  console.log(data);
  return (
    <div className="my-0.5 p-1 rounded-md bg-blue-300">
      <div className="flex justify-between">
        <span>별풍선</span>
        <span>{data.fromLabel}</span>
      </div>
      <p className="text-right">{data.amount}개</p>
      {data.message && <p>{data.message}</p>}
    </div>
  );
};
