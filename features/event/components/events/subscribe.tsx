import { SubscribeEvent } from "~/types";

type Props = {
  data: SubscribeEvent;
};

export const SubscribeRow: React.FC<Props> = ({ data }) => {
  return (
    <div className="my-0.5 p-1 rounded-md bg-rose-300">
      <div className="flex justify-between">
        <span>구독</span>
        <span>{data.label}</span>
      </div>
      <p className="text-right">
        {data.tier}티어 {data.renew}개월
      </p>
    </div>
  );
};
