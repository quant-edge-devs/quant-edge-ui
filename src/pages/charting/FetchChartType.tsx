import BarChart from './chart-types/BarChart';
import LineChart from './chart-types/LineChart';
// ...import other chart types...

type ChartProps = {
  tickers: string[];
  metric: string;
  startDate: string;
  endDate: string;
  chartType: string;
};
const Chart = ({ chartType, ...props }: ChartProps) => {
  switch (chartType) {
    case 'Bar Chart':
      return <BarChart {...props} />;
    case 'Line Chart':
      return <LineChart {...props} />;
    // Add more cases for other chart types
    default:
      return <div>Unsupported chart type</div>;
  }
};

export default Chart;
