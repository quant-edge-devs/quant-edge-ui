import BarChart from './chart-types/BarChart';
import LineChart from './chart-types/LineChart';

type ChartProps = {
  tickers: string[];
  metric: string;
  startDate: string;
  endDate: string;
  chartType: string;
};

const Chart = ({ chartType, ...props }: ChartProps) => {
  if (!props.tickers.length) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-purple-400">
        Please select at least one ticker to render the chart.
      </div>
    );
  }
  switch (chartType) {
    case 'Bar Chart':
      return <BarChart {...props} />;
    case 'Line Chart':
      return <LineChart {...props} />;
    default:
      return (
        <div className="flex h-full items-center justify-center text-sm text-purple-400">
          Unsupported chart type
        </div>
      );
  }
};

export default Chart;
