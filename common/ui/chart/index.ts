import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Doughnut, Line } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  CategoryScale,
  Tooltip,
  Legend,
  ChartDataLabels,
  LinearScale,
  PointElement,
  LineElement,
  Filler
);

export { Doughnut, Line };
