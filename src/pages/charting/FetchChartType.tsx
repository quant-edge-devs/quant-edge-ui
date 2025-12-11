import BarChart from './chart-types/BarChart';
import LineChart from './chart-types/LineChart';
// ...import other chart types...

const Chart = ({ chartType, ...props }) => {
  switch (chartType) {
    case 'Bar Chart':
      return (
        <BarChart
          tickers={[]}
          metric={''}
          startDate={''}
          endDate={''}
          chartType={''}
          {...props}
        />
      );
    case 'Line Chart':
      return <LineChart {...props} />;
    // Add more cases for other chart types
    default:
      return <div>Unsupported chart type</div>;
  }
};

export default Chart;
