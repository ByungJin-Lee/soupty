import { EChartsInstance } from "echarts-for-react";

export const connectGrouper = (s: EChartsInstance) => {
  s.group = "report";
};

export const colors = {
  red: { border: "#ef4444", background: "rgba(239, 68, 68, 0.1)" },
  green: { border: "#10b981", background: "rgba(16, 185, 129, 0.1)" },
  blue: { border: "#3b82f6", background: "rgba(59, 130, 246, 0.1)" },
  yellow: { border: "#f59e0b", background: "rgba(245, 158, 11, 0.1)" },
};
