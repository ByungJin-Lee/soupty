import { EChartsInstance } from "echarts-for-react";

export const connectGrouper = (s: EChartsInstance) => {
  s.group = "report";
};
