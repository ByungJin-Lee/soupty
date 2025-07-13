import { StatsType } from "~/types/stats";
import { StatsRow } from "./stats-row";

type Props = {
  types: StatsType[];
};

export const StatsViewer: React.FC<Props> = ({ types }) => {
  return (
    <div className="">
      {types.map((type) => (
        <div key={type}>
          <StatsRow type={type} />
        </div>
      ))}
    </div>
  );
};
