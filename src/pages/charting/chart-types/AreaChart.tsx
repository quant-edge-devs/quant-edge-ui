import React from 'react';

interface AreaChartProps {
  tickers: string[];
  metric: string;
  startDate: string;
  endDate: string;
  interval: string;
  setLoading: (loading: boolean) => void;
}

// Placeholder AreaChart. Replace with D3 or charting logic as needed.
const AreaChart: React.FC<AreaChartProps> = (props) => {
  React.useEffect(() => {
    props.setLoading(false);
  }, []);
  return (
    <div className="flex h-full w-full items-center justify-center text-fuchsia-400">
      Area Chart coming soon!
    </div>
  );
};

export default AreaChart;
