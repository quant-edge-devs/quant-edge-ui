import { useState } from 'react';
import LineChart from './chart-types/LineChart';
import BarChart from './chart-types/BarChart';

interface PresetChartsProps {
  onBack?: () => void;
}

const METRICS = [
  { label: 'Revenues', value: 'Revenues' },
  { label: 'P/S Ratio', value: 'Price To Sales Ratio' },
  { label: 'P/E Ratio', value: 'Price To Earnings Ratio' },
  { label: 'Market Cap', value: 'Market Cap' },
  { label: 'Dividend Yield (%)', value: 'Dividend Yield (%)' },
  { label: 'EPS', value: 'Earnings Per Share' },
  { label: 'Net Income', value: 'Net Income' },
];

const TIME_FRAMES = [
  { label: '1 Year', value: 1 },
  { label: '3 Years', value: 3 },
  { label: '5 Years', value: 5 },
];

const CHART_TYPES = [
  { label: 'Line Chart', value: 'line' },
  { label: 'Bar Chart', value: 'bar' },
];

const INTERVALS = [
  { label: 'Quarterly', value: 'quarter' },
  { label: 'Annual', value: 'annual' },
];

function getDates(years: number) {
  const end = new Date();
  const start = new Date();
  start.setFullYear(end.getFullYear() - years);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

export default function PresetCharts({ onBack }: PresetChartsProps) {
  const [selectedMetric, setSelectedMetric] = useState(METRICS[0].value);
  const [ticker, setTicker] = useState('AAPL');
  const [input, setInput] = useState('AAPL');
  const [selectedTimeFrame, setSelectedTimeFrame] = useState(1);
  const [selectedChartType, setSelectedChartType] = useState<'line' | 'bar'>(
    'line'
  );
  const [selectedInterval, setSelectedInterval] = useState('quarter');
  const [loading, setLoading] = useState(false);
  const { startDate, endDate } = getDates(selectedTimeFrame);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTicker(input.trim().toUpperCase() || 'AAPL');
  };

  return (
    <div className="min-h-screen bg-[#181425] p-4">
      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="animate-pulse rounded-lg border border-fuchsia-600 bg-[#231133] px-8 py-6 text-xl font-semibold text-white shadow-lg">
            Loading chart...
          </div>
        </div>
      )}
      <div className="mb-6 flex items-center">
        {onBack && (
          <button
            className="mr-4 rounded-lg border border-fuchsia-600 bg-black px-4 py-2 font-semibold text-white hover:bg-fuchsia-700"
            onClick={onBack}
          >
            ← Back to Dashboard
          </button>
        )}
        <h1 className="text-2xl font-bold text-white">Preset Charts</h1>
      </div>
      <form onSubmit={handleSearch} className="mb-6 flex max-w-xl gap-2">
        <input
          className="flex-1 rounded-lg border border-fuchsia-600 bg-black px-4 py-2 text-white focus:outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter stock ticker (e.g. AAPL)"
        />
        <button
          type="submit"
          className="cursor-pointer rounded-lg bg-fuchsia-600 px-4 py-2 font-semibold text-white hover:bg-fuchsia-700"
        >
          Search
        </button>
      </form>
      <div className="mb-4 flex items-center gap-2">
        {METRICS.map((m) => (
          <button
            key={m.value}
            className={`cursor-pointer rounded-lg border border-fuchsia-600 px-4 py-2 font-semibold text-white transition ${selectedMetric === m.value ? 'bg-fuchsia-600' : 'bg-black hover:bg-fuchsia-700'}`}
            onClick={() => {
              setLoading(true);
              setSelectedMetric(m.value);
            }}
          >
            {m.label}
          </button>
        ))}
        <select
          className="ml-4 cursor-pointer rounded-lg border border-fuchsia-600 bg-black px-4 py-2 text-white"
          value={selectedTimeFrame}
          onChange={(e) => {
            setLoading(true);
            setSelectedTimeFrame(Number(e.target.value));
          }}
        >
          {TIME_FRAMES.map((tf) => (
            <option key={tf.value} value={tf.value}>
              {tf.label}
            </option>
          ))}
        </select>
        <select
          className="ml-4 cursor-pointer rounded-lg border border-fuchsia-600 bg-black px-4 py-2 text-white"
          value={selectedChartType}
          onChange={(e) => {
            setLoading(true);
            setSelectedChartType(e.target.value as 'line' | 'bar');
          }}
        >
          {CHART_TYPES.map((ct) => (
            <option key={ct.value} value={ct.value}>
              {ct.label}
            </option>
          ))}
        </select>
        <select
          className="ml-4 cursor-pointer rounded-lg border border-fuchsia-600 bg-black px-4 py-2 text-white"
          value={selectedInterval}
          onChange={(e) => {
            setLoading(true);
            setSelectedInterval(e.target.value);
          }}
        >
          {INTERVALS.map((intv) => (
            <option key={intv.value} value={intv.value}>
              {intv.label}
            </option>
          ))}
        </select>
      </div>
      <div className="rounded-lg border border-fuchsia-600 bg-black p-4">
        {selectedChartType === 'line' ? (
          <LineChart
            tickers={[ticker]}
            metric={selectedMetric}
            startDate={startDate}
            endDate={endDate}
            interval={selectedInterval}
            setLoading={setLoading}
          />
        ) : (
          <BarChart
            tickers={[ticker]}
            metric={selectedMetric}
            startDate={startDate}
            endDate={endDate}
            interval={selectedInterval}
            setLoading={setLoading}
          />
        )}
      </div>
    </div>
  );
}
