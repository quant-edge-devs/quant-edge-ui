import BarChart from './chart-types/BarChart';
import LineChart from './chart-types/LineChart';

type ChartProps = {
  tickers: string[];
  metric: string;
  secondaryMetric?: string;
  startDate: string;
  endDate: string;
  chartType: string;
};

const Chart = ({ chartType, ...props }: ChartProps) => {
  // Make chart container fill parent and pass explicit width/height to chart components
  // Use style to ensure the chart fits the card
  const chartContainerStyle = {
    width: '100%',
    height: '100%',
    minHeight: 400,
    minWidth: 0,
    display: 'flex',
    alignItems: 'stretch',
    justifyContent: 'stretch',
  };
  if (!props.tickers.length) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl bg-gradient-to-br from-[#231133] to-[#3b0764] text-sm text-purple-200 shadow-lg">
        Please select at least one ticker to render the chart.
      </div>
    );
  }
  switch (chartType) {
    case 'Bar Chart':
      return (
        <div style={chartContainerStyle} className="h-full w-full">
          <BarChart
            {...props}
            containerWidth="100%"
            containerHeight="100%"
            {...(props.secondaryMetric
              ? { secondaryMetric: props.secondaryMetric }
              : {})}
          />
        </div>
      );
    case 'Line Chart':
      return (
        <div style={chartContainerStyle} className="h-full w-full">
          <LineChart
            {...props}
            containerWidth="100%"
            containerHeight="100%"
            {...(props.secondaryMetric
              ? { secondaryMetric: props.secondaryMetric }
              : {})}
          />
        </div>
      );
    default:
      return (
        <div className="flex h-full items-center justify-center rounded-2xl bg-gradient-to-br from-[#231133] to-[#3b0764] text-sm text-purple-200 shadow-lg">
          Unsupported chart type
        </div>
      );
  }
};

export default Chart;
