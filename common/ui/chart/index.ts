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
import {
  WordCloudChart,
  WordCloudController,
  WordElement,
} from "chartjs-chart-wordcloud";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Chart, Doughnut, Line } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  CategoryScale,
  Tooltip,
  Legend,
  ChartDataLabels,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  WordCloudController,
  WordElement
);

export { Chart, Doughnut, Line, WordCloudChart, WordCloudController };
