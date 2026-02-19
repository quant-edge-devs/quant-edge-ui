import { useState, useEffect } from 'react';
import { FaPlus, FaTimes, FaTrash, FaEdit } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import LineChart from './chart-types/LineChart';
import BarChart from './chart-types/BarChart';
import { useAuth } from '../../../src/contexts/AuthContext';
import {
  collection,
  addDoc,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../../../src/firebase';

const METRICS = [
  {
    label: 'Earnings Per Share',
    value: 'Earnings Per Share',
    sub: 'Profit per share',
  },
  {
    label: 'Price To Earnings Ratio',
    value: 'Price To Earnings Ratio',
    sub: 'Valuation vs. earnings',
  },
  {
    label: 'Price To Sales Ratio',
    value: 'Price To Sales Ratio',
    sub: 'Company valuation vs. revenue',
  },
  { label: 'Revenues', value: 'Revenues', sub: 'Total company revenue' },
  { label: 'Net Income', value: 'Net Income', sub: 'Total company profit' },
  { label: 'Market Cap', value: 'Market Cap', sub: 'Total company valuation' },
  {
    label: 'Dividend Yield %',
    value: 'Dividend Yield %',
    sub: 'Annual dividend as % of price',
  },
];
const CHART_TYPES = ['Bar Chart', 'Line Chart'];

interface CustomChart {
  title: string;
  tickers: string[];
  metric: string;
  chartType: string;
  startDate: string;
  endDate: string;
}

export default function CustomChartsPage() {
  const { currentUser } = useAuth();
  // Set showModal to false by default
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [tickerInput, setTickerInput] = useState('');
  const [tickers, setTickers] = useState<string[]>([]);
  const [selectedMetric, setSelectedMetric] = useState(METRICS[0].value);
  const [selectedChartType, setSelectedChartType] = useState(CHART_TYPES[0]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [customCharts, setCustomCharts] = useState<CustomChart[]>([]);
  const [chartIds, setChartIds] = useState<string[]>([]); // To track Firestore doc ids
  const [activeTab, setActiveTab] = useState(0);
  const [editIdx, setEditIdx] = useState<number | null>(null);

  // Add ticker to tickers array
  const handleAddTicker = () => {
    const t = tickerInput.trim().toUpperCase();
    if (t && !tickers.includes(t)) {
      setTickers([...tickers, t]);
    }
    setTickerInput('');
  };

  // Remove ticker
  const handleRemoveTicker = (t: string) => {
    setTickers(tickers.filter((tk) => tk !== t));
  };

  // Load charts from Firestore if signed in
  useEffect(() => {
    if (!currentUser) return;
    const chartsRef = collection(db, 'users', currentUser.uid, 'customCharts');
    const q = query(chartsRef, orderBy('title'));
    const unsub = onSnapshot(q, (snapshot) => {
      const charts: CustomChart[] = [];
      const ids: string[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Migration logic: support old and new chart formats
        let tickers: string[] = [];
        if (Array.isArray(data.tickers)) {
          tickers = data.tickers;
        } else if (typeof data.ticker === 'string') {
          tickers = [data.ticker];
        }
        charts.push({
          title: data.title || '',
          tickers,
          metric: data.metric || '',
          chartType: data.chartType || '',
          startDate: data.startDate || '',
          endDate: data.endDate || '',
        });
        ids.push(doc.id);
      });
      setCustomCharts(charts);
      setChartIds(ids);
      setActiveTab((prev) => Math.min(prev, charts.length - 1));
    });
    return () => unsub();
  }, [currentUser]);

  // Add chart (Firestore or local)
  const handleAddChart = async () => {
    const newChart: CustomChart = {
      title,
      tickers,
      metric: selectedMetric,
      chartType: selectedChartType,
      startDate,
      endDate,
    };
    if (currentUser) {
      const chartsRef = collection(
        db,
        'users',
        currentUser.uid,
        'customCharts'
      );
      await addDoc(chartsRef, newChart);
    } else {
      setCustomCharts((prevCharts) => {
        const newCharts = [...prevCharts, newChart];
        setActiveTab(newCharts.length - 1);
        return newCharts;
      });
    }
    setShowModal(false);
    setTitle('');
    setTickers([]);
    setTickerInput('');
    setStartDate('');
    setEndDate('');
  };

  // Edit chart (autosave)
  const handleEditChart = async (idx: number, updated: CustomChart) => {
    if (currentUser) {
      const chartId = chartIds[idx];
      if (!chartId) return;
      const chartRef = doc(
        db,
        'users',
        currentUser.uid,
        'customCharts',
        chartId
      );
      await setDoc(chartRef, updated, { merge: true });
    } else {
      setCustomCharts((prev) => {
        const arr = [...prev];
        arr[idx] = updated;
        return arr;
      });
    }
  };

  // Delete chart
  const handleDeleteChart = async (idx: number) => {
    if (currentUser) {
      const chartId = chartIds[idx];
      if (!chartId) return;
      const chartRef = doc(
        db,
        'users',
        currentUser.uid,
        'customCharts',
        chartId
      );
      await deleteDoc(chartRef);
    } else {
      setCustomCharts((prev) => prev.filter((_, i) => i !== idx));
    }
    setActiveTab((prev) => Math.max(0, prev - (idx === prev ? 1 : 0)));
  };

  // Chart rendering logic for each custom chart
  const renderChart = (chart: CustomChart, idx: number) => {
    const { tickers, metric, chartType, startDate, endDate } = chart;
    if (!tickers || !tickers.length || !metric || !chartType) return null;
    const chartKey = `chart-${idx}`;
    if (chartType === 'Line Chart') {
      return (
        <LineChart
          key={chartKey}
          tickers={tickers}
          metric={metric}
          startDate={startDate}
          endDate={endDate}
          containerWidth="100%"
          containerHeight="100%"
        />
      );
    } else if (chartType === 'Bar Chart') {
      return (
        <BarChart
          key={chartKey}
          tickers={tickers}
          metric={metric}
          startDate={startDate}
          endDate={endDate}
          containerWidth="100%"
          containerHeight="100%"
        />
      );
    }
    return null;
  };

  // Open modal for editing
  const handleEditButton = (idx: number) => {
    setEditIdx(idx);
    setTitle(customCharts[idx].title);
    setTickers(customCharts[idx].tickers || []);
    setTickerInput('');
    setSelectedMetric(customCharts[idx].metric);
    setSelectedChartType(customCharts[idx].chartType);
    setStartDate(customCharts[idx].startDate);
    setEndDate(customCharts[idx].endDate);
    setShowModal(true);
  };

  // Add or update chart
  const handleAddOrUpdateChart = async () => {
    const newChart: CustomChart = {
      title,
      tickers,
      metric: selectedMetric,
      chartType: selectedChartType,
      startDate,
      endDate,
    };
    if (editIdx !== null) {
      await handleEditChart(editIdx, newChart);
      setEditIdx(null);
    } else {
      await handleAddChart();
    }
    setShowModal(false);
    setTitle('');
    setTickers([]);
    setTickerInput('');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="font-inter flex h-screen overflow-y-auto bg-[radial-gradient(ellipse_at_center,_#1E1B4B_30%,_#0F172A_100%)] text-white">
      <div className="flex h-screen flex-1 flex-col">
        {/* Navbar */}
        <header className="flex items-center justify-between px-12 py-6">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-4">
              <span className="rounded-xl bg-[#672eeb] p-2">
                <svg width="40" height="40" fill="none" viewBox="0 0 32 32">
                  <rect width="32" height="32" rx="12" fill="#672eeb" />
                  <path
                    d="M10 22V12M16 22V16M22 22V10"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span className="ml-2 text-3xl font-bold text-white">
                QuantEdge
              </span>
            </Link>
          </div>
          <nav className="flex items-center gap-6">
            <Link
              to="/contact-us"
              className="text-lg font-medium text-white transition hover:text-[#672eeb]"
            >
              Feedback
            </Link>
          </nav>
        </header>
        {/* Main content */}
        <main className="flex w-full flex-col items-center pt-8 pb-16">
          <div className="relative mb-6 flex w-full items-center justify-between">
            <Link
              to="/charting/preset"
              className="ml-4 cursor-pointer rounded-lg border border-[#672eeb] bg-[#672eeb] px-4 py-2 text-lg font-semibold text-white shadow transition hover:bg-[#672eeb]"
            >
              &lt;-- Preset Charts
            </Link>
            {/* Centered title block */}
            <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
              <h1 className="mb-2 text-4xl font-extrabold text-white">
                Custom Charts
              </h1>
              <div className="text-lg text-slate-300">
                Build your personalized analytics dashboard
              </div>
            </div>
            <button
              className="mr-4 flex cursor-pointer items-center gap-2 rounded-lg bg-[#672eeb] px-5 py-2 text-lg font-semibold text-white shadow transition hover:bg-[#672eeb]"
              onClick={() => setShowModal(true)}
            >
              <FaPlus /> Add Chart
            </button>
          </div>
          {/* Modal for creating custom chart */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
              <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-[#672eeb] bg-[#181a2a] p-10 shadow-2xl">
                <button
                  className="absolute top-4 right-4 cursor-pointer text-xl text-purple-200 hover:text-fuchsia-400"
                  onClick={() => {
                    setShowModal(false);
                    setEditIdx(null);
                  }}
                >
                  <FaTimes />
                </button>
                <div className="mb-6 flex items-center gap-3">
                  <span className="rounded-full bg-[#672eeb] p-2">
                    <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                      <rect width="24" height="24" rx="8" fill="#672eeb" />
                      <path
                        d="M12 7v5l3 3"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  <span className="text-2xl font-bold text-white">
                    {editIdx !== null
                      ? 'Edit Custom Chart'
                      : 'Create Custom Chart'}
                  </span>
                </div>
                <form className="flex flex-col gap-6">
                  <div>
                    <label className="mb-1 block text-xs text-purple-200">
                      Chart Title
                    </label>
                    <input
                      className="w-full rounded-md border border-[#672eeb] bg-[#23203a] p-3 text-white placeholder-purple-200 focus:ring-1 focus:ring-[#672eeb] focus:outline-none"
                      placeholder="e.g., Apple Revenue Analysis"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-purple-200">
                      Stock Tickers
                    </label>
                    <div className="flex gap-2">
                      <input
                        className="w-full rounded-md border border-[#672eeb] bg-[#23203a] p-3 text-white placeholder-purple-200 focus:ring-1 focus:ring-[#672eeb] focus:outline-none"
                        placeholder="Enter ticker (e.g., AAPL)"
                        value={tickerInput}
                        onChange={(e) => setTickerInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTicker();
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="rounded-lg bg-[#672eeb] px-4 py-2 font-semibold text-white transition hover:bg-[#672eeb]"
                        onClick={handleAddTicker}
                      >
                        Add
                      </button>
                    </div>
                    {/* Show selected tickers */}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {tickers.map((t) => (
                        <span
                          key={t}
                          className="flex items-center gap-1 rounded bg-[#2d1e4a] px-3 py-1 text-sm text-white"
                        >
                          {t}
                          <button
                            type="button"
                            className="ml-1 text-pink-300 hover:text-pink-500"
                            onClick={() => handleRemoveTicker(t)}
                          >
                            <FaTimes />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-purple-200">
                      Metric
                    </label>
                    <div className="mb-2 flex flex-wrap gap-3">
                      {METRICS.map((m) => (
                        <button
                          key={m.value}
                          type="button"
                          className={`flex min-h-[80px] w-44 max-w-[180px] flex-col items-start justify-between rounded-xl border px-4 py-3 text-left font-bold break-words whitespace-normal text-white transition ${
                            selectedMetric === m.value
                              ? 'border-[#672eeb] bg-[#2d1e4a]'
                              : 'border-[#23203a]/60 bg-[#23203a] hover:bg-[#2d1e4a]/80'
                          }`}
                          onClick={() => setSelectedMetric(m.value)}
                        >
                          <span className="text-base font-bold break-words whitespace-normal">
                            {m.label}
                          </span>
                          <span className="mt-1 text-xs leading-tight font-normal break-words whitespace-normal text-purple-200">
                            {m.sub}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-purple-200">
                      Chart Type
                    </label>
                    <div className="mb-2 flex gap-2">
                      {CHART_TYPES.map((type) => (
                        <button
                          key={type}
                          type="button"
                          className={`rounded-lg px-6 py-2 font-semibold transition ${
                            selectedChartType === type
                              ? 'bg-[#672eeb] text-white'
                              : 'bg-[#23203a] text-slate-300 hover:bg-[#2d1e4a]/80'
                          }`}
                          onClick={() => setSelectedChartType(type)}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-purple-200">
                      Start Date
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-md border border-[#672eeb] bg-[#23203a] p-3 text-white placeholder-purple-200 focus:ring-1 focus:ring-[#672eeb] focus:outline-none"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-purple-200">
                      End Date
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-md border border-[#672eeb] bg-[#23203a] p-3 text-white placeholder-purple-200 focus:ring-1 focus:ring-[#672eeb] focus:outline-none"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      className="cursor-pointer rounded-lg bg-[#672eeb] px-6 py-2 font-semibold text-white transition hover:bg-[#672eeb]"
                      onClick={() => {
                        setShowModal(false);
                        setEditIdx(null);
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="cursor-pointer rounded-lg bg-[#672eeb] px-6 py-2 font-semibold text-white transition hover:bg-[#672eeb]"
                      onClick={handleAddOrUpdateChart}
                    >
                      {editIdx !== null ? 'Update Chart' : '+ Add Chart'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {/* Custom charts dashboard placeholder */}
          <div className="mt-4 flex w-full flex-col items-center justify-center">
            {customCharts.length === 0 ? (
              <div className="text-lg text-slate-400">
                No custom charts yet. Add your first chart!
              </div>
            ) : (
              <>
                <div className="mb-4 flex flex-wrap gap-2">
                  {customCharts.map((chart, idx) => (
                    <button
                      key={idx}
                      className={`rounded-t-lg border-b-2 px-6 py-2 font-semibold transition ${
                        activeTab === idx
                          ? 'border-[#672eeb] bg-[#672eeb] text-white'
                          : 'border-transparent bg-[#23203a] text-slate-300 hover:bg-[#2d1e4a]/80'
                      }`}
                      onClick={() => setActiveTab(idx)}
                    >
                      {chart.title ||
                        (chart.tickers && chart.tickers.join(', ')) ||
                        `Chart ${idx + 1}`}
                      <span className="ml-2 flex items-center gap-2">
                        <button
                          className="inline cursor-pointer rounded-full p-1 text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditButton(idx);
                          }}
                          title="Edit chart"
                          tabIndex={-1}
                        >
                          <FaEdit />
                        </button>
                        <FaTrash
                          className="inline cursor-pointer text-pink-300 hover:text-pink-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteChart(idx);
                          }}
                          title="Delete chart"
                        />
                      </span>
                    </button>
                  ))}
                </div>
                <div className="relative flex min-h-[800px] w-full max-w-[1400px] flex-1 flex-col items-center justify-center overflow-auto rounded-2xl border-2 border-dashed border-[#672eeb]/40 bg-[#181a2a] p-4">
                  {/* Chart area same as PresetChartsPage */}
                  <div className="flex h-full w-full flex-col items-center justify-center">
                    <div className="flex w-full flex-1 items-center justify-center">
                      <div className="h-full w-full" style={{ minHeight: 320 }}>
                        {renderChart(customCharts[activeTab], activeTab)}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
