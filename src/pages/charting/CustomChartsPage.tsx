import { useState, useEffect } from 'react';
import { FaPlus, FaTimes, FaTrash, FaEdit } from 'react-icons/fa';
import LineChart from './chart-types/LineChart';
import BarChart from './chart-types/BarChart';
import { useAuth } from '../../contexts/AuthContext';
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
import { db } from '../../firebase';
import { ChartingNavbar } from '../../components/navbar/ChartingNavbar';

const METRICS = [
  { label: 'Earnings Per Share',      sub: 'Profit per share'               },
  { label: 'Price To Earnings Ratio', sub: 'Valuation vs. earnings'        },
  { label: 'Price To Sales Ratio',    sub: 'Valuation vs. revenue'         },
  { label: 'Revenues',               sub: 'Total company revenue'          },
  { label: 'Net Income',             sub: 'Total company profit'           },
  { label: 'Market Cap',             sub: 'Total company valuation'        },
  { label: 'Dividend Yield %',       sub: 'Annual dividend as % of price'  },
];

const CHART_TYPES = ['Bar Chart', 'Line Chart'] as const;

interface CustomChart {
  title: string;
  tickers: string[];
  metric: string;
  chartType: string;
  startDate: string;
  endDate: string;
}

/* ── Shared input style ── */
const inputCls =
  'w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-white/25 transition focus:border-purple-500/50 focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-purple-500/30';

export default function CustomChartsPage() {
  const { currentUser } = useAuth();
  const [showModal, setShowModal]               = useState(false);
  const [title, setTitle]                       = useState('');
  const [tickerInput, setTickerInput]           = useState('');
  const [tickers, setTickers]                   = useState<string[]>([]);
  const [selectedMetric, setSelectedMetric]     = useState(METRICS[0].label);
  const [selectedChartType, setSelectedChartType] = useState<string>(CHART_TYPES[0]);
  const [startDate, setStartDate]               = useState('');
  const [endDate, setEndDate]                   = useState('');
  const [customCharts, setCustomCharts]         = useState<CustomChart[]>([]);
  const [chartIds, setChartIds]                 = useState<string[]>([]);
  const [activeTab, setActiveTab]               = useState(0);
  const [editIdx, setEditIdx]                   = useState<number | null>(null);

  /* ── Firestore sync ── */
  useEffect(() => {
    if (!currentUser) return;
    const chartsRef = collection(db, 'users', currentUser.uid, 'customCharts');
    const q = query(chartsRef, orderBy('title'));
    return onSnapshot(q, (snapshot) => {
      const charts: CustomChart[] = [];
      const ids: string[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        const t: string[] = Array.isArray(data.tickers)
          ? data.tickers
          : typeof data.ticker === 'string'
          ? [data.ticker]
          : [];
        charts.push({
          title: data.title || '',
          tickers: t,
          metric: data.metric || '',
          chartType: data.chartType || '',
          startDate: data.startDate || '',
          endDate: data.endDate || '',
        });
        ids.push(d.id);
      });
      setCustomCharts(charts);
      setChartIds(ids);
      setActiveTab((prev) => Math.min(prev, Math.max(0, charts.length - 1)));
    });
  }, [currentUser]);

  /* ── Ticker helpers ── */
  const handleAddTicker = () => {
    const t = tickerInput.trim().toUpperCase();
    if (t && !tickers.includes(t)) setTickers((prev) => [...prev, t]);
    setTickerInput('');
  };
  const handleRemoveTicker = (t: string) =>
    setTickers((prev) => prev.filter((tk) => tk !== t));

  /* ── CRUD ── */
  const handleAddOrUpdateChart = async () => {
    const chart: CustomChart = {
      title, tickers,
      metric: selectedMetric,
      chartType: selectedChartType,
      startDate, endDate,
    };
    if (editIdx !== null) {
      if (currentUser) {
        const ref = doc(db, 'users', currentUser.uid, 'customCharts', chartIds[editIdx]);
        await setDoc(ref, chart, { merge: true });
      } else {
        setCustomCharts((prev) => {
          const arr = [...prev];
          arr[editIdx] = chart;
          return arr;
        });
      }
      setEditIdx(null);
    } else {
      if (currentUser) {
        await addDoc(collection(db, 'users', currentUser.uid, 'customCharts'), chart);
      } else {
        setCustomCharts((prev) => {
          const next = [...prev, chart];
          setActiveTab(next.length - 1);
          return next;
        });
      }
    }
    closeModal();
  };

  const handleDeleteChart = async (idx: number) => {
    if (currentUser && chartIds[idx]) {
      await deleteDoc(doc(db, 'users', currentUser.uid, 'customCharts', chartIds[idx]));
    } else {
      setCustomCharts((prev) => prev.filter((_, i) => i !== idx));
    }
    setActiveTab((prev) => Math.max(0, prev - (idx <= prev ? 1 : 0)));
  };

  const openEditModal = (idx: number) => {
    const c = customCharts[idx];
    setEditIdx(idx);
    setTitle(c.title);
    setTickers(c.tickers || []);
    setTickerInput('');
    setSelectedMetric(c.metric);
    setSelectedChartType(c.chartType);
    setStartDate(c.startDate);
    setEndDate(c.endDate);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditIdx(null);
    setTitle('');
    setTickers([]);
    setTickerInput('');
    setStartDate('');
    setEndDate('');
    setSelectedMetric(METRICS[0].label);
    setSelectedChartType(CHART_TYPES[0]);
  };

  /* ── Chart renderer ── */
  const renderChart = (chart: CustomChart, idx: number) => {
    const { tickers, metric, chartType, startDate, endDate } = chart;
    if (!tickers?.length || !metric || !chartType) return null;
    const props = { key: `chart-${idx}`, tickers, metric, startDate, endDate, containerWidth: '100%', containerHeight: '100%' };
    return chartType === 'Line Chart' ? <LineChart {...props} /> : <BarChart {...props} />;
  };

  const activeChart = customCharts[activeTab];

  return (
    <div className="flex min-h-screen flex-col bg-[#06050f] text-white">
      {/* Ambient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-48 -left-48 h-[600px] w-[600px] rounded-full bg-purple-700/15 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-violet-600/10 blur-[120px]" />
      </div>

      <ChartingNavbar activeMode="custom" />

      <main className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-6 py-8">

        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Custom Charts</h1>
            <p className="mt-1 text-sm text-white/45">
              Build and save personalized analytics dashboards to your account.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow shadow-purple-900/40 transition hover:bg-purple-500"
          >
            <FaPlus className="text-xs" /> New Chart
          </button>
        </div>

        {/* Empty state */}
        {customCharts.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 rounded-2xl border border-white/[0.07] bg-white/[0.03] py-24 text-center backdrop-blur-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10 ring-1 ring-purple-500/20">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                <rect x="3"  y="3"  width="7" height="7" rx="1.5" stroke="#A855F7" strokeWidth="2" />
                <rect x="14" y="3"  width="7" height="7" rx="1.5" stroke="#A855F7" strokeWidth="2" />
                <rect x="3"  y="14" width="7" height="7" rx="1.5" stroke="#A855F7" strokeWidth="2" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="#A855F7" strokeWidth="2" />
              </svg>
            </div>
            <div>
              <div className="text-base font-semibold text-white/60">No charts yet</div>
              <div className="mt-1 text-sm text-white/30">Create your first chart to start building your dashboard</div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow shadow-purple-900/40 transition hover:bg-purple-500"
            >
              <FaPlus className="text-xs" /> Create your first chart
            </button>
            {!currentUser && (
              <p className="text-xs text-white/25">Sign in to save charts across sessions</p>
            )}
          </div>
        ) : (
          <>
            {/* Tab strip */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {customCharts.map((chart, idx) => (
                <div
                  key={idx}
                  className={`group flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    activeTab === idx
                      ? 'bg-purple-600 text-white shadow shadow-purple-900/30'
                      : 'border border-white/[0.07] bg-white/[0.03] text-white/55 hover:border-purple-500/25 hover:bg-white/[0.07] hover:text-white'
                  }`}
                >
                  <button
                    onClick={() => setActiveTab(idx)}
                    className="max-w-[140px] truncate"
                  >
                    {chart.title || chart.tickers?.join(', ') || `Chart ${idx + 1}`}
                  </button>
                  {/* Edit */}
                  <button
                    onClick={(e) => { e.stopPropagation(); openEditModal(idx); }}
                    className={`opacity-0 transition group-hover:opacity-100 ${activeTab === idx ? 'text-white/70 hover:text-white' : 'text-white/30 hover:text-white/70'}`}
                    title="Edit chart"
                  >
                    <FaEdit className="text-xs" />
                  </button>
                  {/* Delete */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteChart(idx); }}
                    className={`opacity-0 transition group-hover:opacity-100 ${activeTab === idx ? 'text-red-300 hover:text-red-200' : 'text-white/30 hover:text-red-400'}`}
                    title="Delete chart"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                </div>
              ))}
            </div>

            {/* Active chart metadata strip */}
            {activeChart && (
              <div className="flex flex-wrap items-center gap-3 text-xs text-white/35">
                {activeChart.tickers.map((t) => (
                  <span key={t} className="rounded-md bg-purple-500/15 px-2 py-0.5 font-semibold text-purple-300 ring-1 ring-purple-500/20">
                    {t}
                  </span>
                ))}
                <span className="text-white/20">·</span>
                <span>{activeChart.metric}</span>
                <span className="text-white/20">·</span>
                <span>{activeChart.chartType}</span>
                {activeChart.startDate && (
                  <>
                    <span className="text-white/20">·</span>
                    <span>{activeChart.startDate} → {activeChart.endDate || 'present'}</span>
                  </>
                )}
              </div>
            )}

            {/* Chart area */}
            <div className="relative min-h-[520px] flex-1 rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-sm">
              <div className="absolute inset-0 p-4">
                {activeChart ? renderChart(activeChart, activeTab) : null}
              </div>
            </div>
          </>
        )}
      </main>

      {/* ── Create / Edit modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/[0.09] bg-[#0d0b1e] p-8 shadow-2xl shadow-purple-950/50 max-h-[90vh]">

            {/* Modal header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  {editIdx !== null ? 'Edit Chart' : 'New Chart'}
                </h2>
                <p className="mt-0.5 text-sm text-white/40">
                  {editIdx !== null
                    ? 'Update the settings for this chart'
                    : 'Configure your chart — it will be saved to your account'}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/[0.07] hover:text-white"
              >
                <FaTimes />
              </button>
            </div>

            <div className="flex flex-col gap-5">

              {/* Title */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-white/40">
                  Chart Title
                </label>
                <input
                  className={inputCls}
                  placeholder="e.g. Apple Revenue Analysis"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Tickers */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-white/40">
                  Stock Tickers
                </label>
                <div className="flex gap-2">
                  <input
                    className={inputCls}
                    placeholder="Add ticker (e.g. AAPL) and press Enter"
                    value={tickerInput}
                    onChange={(e) => setTickerInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTicker(); } }}
                  />
                  <button
                    type="button"
                    onClick={handleAddTicker}
                    className="rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-500"
                  >
                    Add
                  </button>
                </div>
                {tickers.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {tickers.map((t) => (
                      <span
                        key={t}
                        className="flex items-center gap-1.5 rounded-lg bg-purple-500/15 px-3 py-1 text-xs font-semibold text-purple-300 ring-1 ring-purple-500/20"
                      >
                        {t}
                        <button
                          type="button"
                          onClick={() => handleRemoveTicker(t)}
                          className="text-purple-400/60 transition hover:text-red-400"
                        >
                          <FaTimes className="text-[10px]" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Metric */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-white/40">
                  Metric
                </label>
                <div className="flex flex-wrap gap-2">
                  {METRICS.map((m) => (
                    <button
                      key={m.label}
                      type="button"
                      onClick={() => setSelectedMetric(m.label)}
                      className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                        selectedMetric === m.label
                          ? 'bg-purple-600 text-white shadow shadow-purple-900/30'
                          : 'border border-white/[0.07] bg-white/[0.03] text-white/55 hover:border-purple-500/25 hover:bg-white/[0.07] hover:text-white'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
                <p className="mt-1.5 text-xs text-white/30">
                  {METRICS.find((m) => m.label === selectedMetric)?.sub}
                </p>
              </div>

              {/* Chart Type */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-white/40">
                  Chart Type
                </label>
                <div className="flex gap-2">
                  {CHART_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedChartType(type)}
                      className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                        selectedChartType === type
                          ? 'bg-purple-600 text-white shadow shadow-purple-900/30'
                          : 'border border-white/[0.07] bg-white/[0.03] text-white/55 hover:border-purple-500/25 hover:bg-white/[0.07] hover:text-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-white/40">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className={inputCls}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-white/40">
                    End Date
                  </label>
                  <input
                    type="date"
                    className={inputCls}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-white/[0.08] px-5 py-2.5 text-sm font-semibold text-white/60 transition hover:border-white/20 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddOrUpdateChart}
                  disabled={!title && tickers.length === 0}
                  className="rounded-xl bg-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow shadow-purple-900/40 transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {editIdx !== null ? 'Save Changes' : 'Create Chart'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
