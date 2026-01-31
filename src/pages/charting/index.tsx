import { useState, useEffect } from 'react';
import { FaTrash, FaRegEdit } from 'react-icons/fa';
import Chart from './RenderChart';
import VerticalNavbar from '../../components/navbar/VerticalNavbar';
import WelcomeDashboard from './welcome-modal/WelcomeDashboard';
import SelectDashboardType from './welcome-modal/SelectDashboardType';
import PresetCharts from './PresetCharts';
import { db } from '../../firebase'; // fix import for db as named export
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type ChartData = {
  id: string; // Add dashboard ID for Firestore
  title: string;
  chartType: string;
  selectedStocks: string[];
  startDate: string;
  endDate: string;
  primaryMetric: string;
  secondaryMetric: string;
};

const PRIMARY_METRICS = [
  'Price To Sales Ratio',
  'Price To Earnings Ratio',
  'Market Cap',
  'Dividend Yield (%)',
  'Earnings Per Share',
  'Revenues',
  'Net Income',
];
const SECONDARY_METRICS = [
  'None',
  'Price To Sales Ratio',
  'Price To Earnings Ratio',
  'Market Cap',
  'Dividend Yield (%)',
  'Earnings Per Share',
  'Revenues',
  'Net Income',
];
const CHART_TYPE = ['Bar Chart', 'Line Chart'];

// Modal component for adding/editing a chart
function AddChartModal({
  open,
  onClose,
  onAdd,
  initialData,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (data: Partial<ChartData>) => void; // Accept partial ChartData (id is added later)
  initialData?: ChartData;
}) {
  const [title, setTitle] = useState('');
  const [chartType, setChartType] = useState(CHART_TYPE[0]);
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
  const [primaryMetric, setPrimaryMetric] = useState(PRIMARY_METRICS[0]);
  const [secondaryMetric, setSecondaryMetric] = useState(SECONDARY_METRICS[0]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ ticker: string; name: string }[]>(
    []
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchTickers = async () => {
      if (query.trim().length === 0) {
        setResults([]);
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/stocks?ticker=${query}`);
        const data = await response.json();
        setResults(
          (data.tickerResults || []).map((item: any) => ({
            ticker: item.ticker,
            name: item.name,
          }))
        );
        setIsDropdownOpen(true);
      } catch (error) {
        setResults([]);
      }
    };
    const delayDebounce = setTimeout(fetchTickers, 200);
    return () => clearTimeout(delayDebounce);
  }, [query]);

  // this is to populate the form if editing an existing chart
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setChartType(initialData.chartType);
      setSelectedStocks(initialData.selectedStocks);
      setPrimaryMetric(initialData.primaryMetric);
      setSecondaryMetric(initialData.secondaryMetric);
      setStartDate(initialData.startDate);
      setEndDate(initialData.endDate);
    } else {
      resetForm();
    }
  }, [initialData, open]);

  // if the ticker is not already selected add it to the selectedStocks array
  // when a ticker is selected from the dropdown
  // we need to close the dropdown and reset the query
  const handleSelect = (ticker: string) => {
    if (!selectedStocks.includes(ticker)) {
      setSelectedStocks([...selectedStocks, ticker]);
    }
    setQuery('');
    setResults([]);
    setIsDropdownOpen(false);
  };

  // remove ticker from selectedStocks array
  const handleRemove = (ticker: string) => {
    setSelectedStocks(selectedStocks.filter((t) => t !== ticker));
  };

  // reset the form to initial state
  const resetForm = () => {
    setTitle('');
    setChartType(CHART_TYPE[0]);
    setSelectedStocks([]);
    setPrimaryMetric(PRIMARY_METRICS[0]);
    setSecondaryMetric(SECONDARY_METRICS[0]);
    setQuery('');
    setResults([]);
    setIsDropdownOpen(false);
  };

  // calls onAdd function (passed as a prop) and sends form data
  // creates the chart and closes the modal
  // it also updates the chart if necessary
  // resets the form fields to their initial empty state
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      // id will be added in parent
      title,
      chartType,
      selectedStocks,
      startDate,
      endDate,
      primaryMetric,
      secondaryMetric,
    });
    onClose();
    resetForm();
  };

  // ensures the modal only appears when it should be open (when open is true)
  if (!open) return null;

  return (
    // this is the div for the entire page when the add chart modal is open
    <div className="fixed inset-0 z-50 flex items-center justify-center border border-white bg-black/60">
      {/* this is the actual modal box */}
      <div className="relative w-full max-w-lg rounded-2xl border border-white bg-[#181425] p-8 shadow-2xl">
        {/* this is the close button for the modal*/}
        <button
          className="absolute top-4 right-4 cursor-pointer text-xl text-purple-200 hover:text-fuchsia-400"
          onClick={() => {
            resetForm();
            onClose();
          }}
        >
          ×
        </button>
        <h2 className="mb-1 text-xl font-semibold text-white">Add New Chart</h2>
        <div className="mb-6 text-sm text-purple-200">
          Configure your financial chart by selecting stocks and metrics
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Chart Title Input */}
          <div>
            <label className="mb-1 block text-xs text-purple-200">
              Chart Title
            </label>
            <input
              className="w-full rounded-md border border-fuchsia-700/40 bg-[#231133] p-3 text-white placeholder-purple-400 focus:ring-2 focus:ring-fuchsia-400 focus:outline-none"
              placeholder="Enter chart title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Chart Type Input */}
          <div>
            <label className="mb-1 block text-xs text-purple-200">
              Chart Type
            </label>
            <select
              className="w-full rounded-md border border-fuchsia-700/40 bg-[#231133] p-3 text-white focus:outline-none"
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
            >
              {CHART_TYPE.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Select Stocks Input */}
          <div>
            <label className="mb-1 block text-xs text-purple-200">
              Select Stocks
            </label>
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                placeholder="Search for stock tickers..."
                className="w-full rounded border border-gray-300 bg-[#231133] px-4 py-2 text-white placeholder-purple-400 focus:ring-2 focus:ring-fuchsia-400 focus:outline-none"
              />
              {isDropdownOpen && results.length > 0 && (
                <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                  {results.map((item, i) => (
                    <li
                      key={i}
                      onClick={() => handleSelect(item.ticker)}
                      className="flex cursor-pointer justify-between p-2 hover:bg-blue-50"
                    >
                      <span className="font-medium text-black">
                        {item.ticker}
                      </span>
                      <span className="text-sm text-black">{item.name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Selected tickers */}
            {selectedStocks.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedStocks.map((ticker, i) => (
                  <div
                    key={i}
                    className="flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700"
                  >
                    {ticker}
                    <button
                      onClick={() => handleRemove(ticker)}
                      className="ml-2 font-bold text-blue-500 hover:text-red-600"
                      type="button"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Y-Axis Metric (Primary) */}
          <div>
            <label className="mb-1 block text-xs text-purple-200">
              Y-Axis Metric (Primary)
            </label>
            <select
              className="w-full rounded-md border border-fuchsia-700/40 bg-[#231133] p-3 text-white focus:outline-none"
              value={primaryMetric}
              onChange={(e) => setPrimaryMetric(e.target.value)}
            >
              {PRIMARY_METRICS.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="mb-1 block text-xs text-purple-200">
              Start Date
            </label>
            <input
              className="w-full rounded-md border border-fuchsia-700/40 bg-[#231133] p-3 text-white placeholder-purple-400 focus:ring-2 focus:ring-fuchsia-400 focus:outline-none"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          {/* End Date */}
          <div>
            <label className="mb-1 block text-xs text-purple-200">
              End Date
            </label>
            <input
              className="w-full rounded-md border border-fuchsia-700/40 bg-[#231133] p-3 text-white placeholder-purple-400 focus:ring-2 focus:ring-fuchsia-400 focus:outline-none"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {/* Cancel and Submit Buttons */}
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              className="cursor-pointer rounded-lg bg-[#231133] px-6 py-2 font-semibold text-white transition hover:bg-[#2d1840]"
              onClick={() => {
                resetForm();
                onClose();
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cursor-pointer rounded-lg bg-fuchsia-600 px-6 py-2 font-semibold text-white transition hover:bg-fuchsia-700"
            >
              Add Chart
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export const Charting = () => {
  const [charts, setCharts] = useState<(ChartData | null)[]>([null]);
  const [modalOpen, setModalOpen] = useState(false);
  // Use localStorage to only show welcome/select modal the first time
  const [welcomeOpen, setWelcomeOpen] = useState(
    () => !localStorage.getItem('hasSeenChartingWelcome')
  );
  const [selectTypeOpen, setSelectTypeOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'preset' | number>(0); // default to first custom chart
  const [presetUnlocked, setPresetUnlocked] = useState(false);
  const [editingTab, setEditingTab] = useState<number | null>(null);
  const [tabNameInput, setTabNameInput] = useState('');
  const [editingChartIdx, setEditingChartIdx] = useState<number | null>(null);

  // Load dashboards from Firestore on sign in
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const dashboardsCol = collection(db, 'users', user.uid, 'dashboards');
        const snapshot = await getDocs(dashboardsCol);
        const dashboards = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          // Fill in missing fields with defaults
          return {
            id: docSnap.id,
            title: data.title || 'Untitled',
            chartType: data.chartType || 'Bar Chart',
            selectedStocks: data.selectedStocks || [],
            startDate: data.startDate || '',
            endDate: data.endDate || '',
            primaryMetric: data.primaryMetric || PRIMARY_METRICS[0],
            secondaryMetric: data.secondaryMetric || SECONDARY_METRICS[0],
          };
        });
        if (dashboards.length > 0) {
          setCharts(dashboards);
        } else {
          setCharts([null]);
        }
        // Fetch presetUnlocked flag
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data().presetUnlocked) {
          setPresetUnlocked(true);
        } else {
          setPresetUnlocked(false);
        }
      } else {
        setCharts([null]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Save dashboards to Firestore on change
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const saveDashboards = async () => {
        const dashboardsCol = collection(db, 'users', user.uid, 'dashboards');
        // Remove nulls
        const dashboards = charts.filter(Boolean) as ChartData[];
        // Save or update each dashboard
        for (let i = 0; i < dashboards.length; i++) {
          const dashboard = dashboards[i];
          await setDoc(doc(dashboardsCol, dashboard.id), dashboard);
          console.log('Saved dashboard:');
        }
        // Delete dashboards in Firestore that are no longer in charts
        const snapshot = await getDocs(dashboardsCol);
        const idsInFirestore = snapshot.docs.map((doc) => doc.id);
        const idsInCharts = dashboards.map((d) => d.id);
        for (const id of idsInFirestore) {
          if (!idsInCharts.includes(id)) {
            await deleteDoc(doc(dashboardsCol, id));
          }
        }
      };
      saveDashboards();
    }
  }, [charts]);

  // Add a new chart to the first empty slot or update if editing
  const handleAddChart = (chart: Partial<ChartData>) => {
    if (editingChartIdx !== null) {
      // Edit mode: update chart
      const updated = [...charts];
      if (updated[editingChartIdx]) {
        updated[editingChartIdx] = {
          ...updated[editingChartIdx],
          ...chart,
        } as ChartData;
      }
      setCharts(updated);
      setEditingChartIdx(null);
      setModalOpen(false);
      setActiveTab(editingChartIdx);
      return;
    }
    // looks for first null value in charts array, which represents an empty slot
    const idx = charts.findIndex((c) => c === null);
    // if empty slot exists, add the chart there
    if (idx !== -1) {
      // copy the charts array
      const updated: (ChartData | null)[] = [...charts];
      // insert the new chart with a unique id
      updated[idx] = { ...chart, id: crypto.randomUUID() } as ChartData;
      // if all slots are filled, add a new empty slot
      if (updated.every((c) => c !== null)) {
        (updated as (ChartData | null)[]).push(null);
      }
      // update state
      setCharts(updated);
      setActiveTab(idx); // Switch to new chart tab
    }
    setModalOpen(false);
  };

  // Rename chart tab
  const handleRenameTab = (idx: number) => {
    // trim whitespace and ensure tabNameInput is not empty and chart exists
    if (tabNameInput.trim() && charts[idx]) {
      // creates copy of the charts array
      const updated = [...charts];
      // updates the title of the chart at index idx
      updated[idx] = { ...charts[idx], title: tabNameInput } as ChartData;
      // updates the state with the new charts array
      setCharts(updated);
      // hides the input field
      setEditingTab(null);
    }
  };

  // Remove a chart and keep at least one empty slot
  const handleRemoveChart = (idx: number) => {
    const updated = [...charts];
    // Remove from Firestore if it exists
    const chart = updated[idx];
    if (chart && chart.id) {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const dashboardsCol = collection(db, 'users', user.uid, 'dashboards');
        deleteDoc(doc(dashboardsCol, chart.id));
      }
    }
    updated[idx] = null;
    // Remove trailing empty slots, but keep at least one
    while (
      updated.length > 1 &&
      updated[updated.length - 1] === null &&
      updated[updated.length - 2] === null
    ) {
      updated.pop();
    }
    setCharts(updated);
  };

  return (
    <div className="font-inter bg-fuchisa flex min-h-screen text-white">
      <VerticalNavbar />
      <div className="flex-1">
        <WelcomeDashboard
          open={welcomeOpen}
          onClose={() => {
            setWelcomeOpen(false);
            setSelectTypeOpen(true);
            localStorage.setItem('hasSeenChartingWelcome', 'true');
          }}
        />
        <SelectDashboardType
          open={selectTypeOpen}
          onSelect={async (type) => {
            setSelectTypeOpen(false);
            if (type === 'preset') {
              setPresetUnlocked(true);
              setActiveTab('preset');
              // Save presetUnlocked flag to Firestore
              const auth = getAuth();
              const user = auth.currentUser;
              if (user) {
                await setDoc(
                  doc(db, 'users', user.uid),
                  { presetUnlocked: true },
                  { merge: true }
                );
              }
            } else {
              setActiveTab(0);
            }
          }}
        />
        {/* Tab Bar */}
        <div className="flex items-center gap-2 border-b border-fuchsia-700/40 bg-[#181425] px-8 pt-4">
          {presetUnlocked && (
            <button
              className={`border-b-2 px-6 py-2 font-semibold transition ${
                activeTab === 'preset'
                  ? 'border-fuchsia-600 text-fuchsia-400'
                  : 'border-transparent text-white hover:text-fuchsia-400'
              }`}
              onClick={() => setActiveTab('preset')}
            >
              Preset Charts
            </button>
          )}
          {/* Add Preset Charts button if not unlocked and user has already seen the modal */}
          {!presetUnlocked && !welcomeOpen && (
            <button
              className="ml-2 cursor-pointer rounded-lg bg-fuchsia-600 px-4 py-2 font-semibold text-white hover:bg-fuchsia-700"
              onClick={async () => {
                setPresetUnlocked(true);
                setActiveTab('preset');
                const auth = getAuth();
                const user = auth.currentUser;
                if (user) {
                  await setDoc(
                    doc(db, 'users', user.uid),
                    { presetUnlocked: true },
                    { merge: true }
                  );
                }
              }}
            >
              + Add Preset Charts
            </button>
          )}
          {charts.map((chart, idx) =>
            chart ? (
              <div key={idx} className="relative flex items-center">
                {editingTab === idx ? (
                  <input
                    className="rounded border border-fuchsia-600 bg-[#231133] px-4 py-2 text-white focus:outline-none"
                    value={tabNameInput}
                    autoFocus
                    onChange={(e) => setTabNameInput(e.target.value)}
                    onBlur={() => handleRenameTab(idx)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRenameTab(idx);
                    }}
                  />
                ) : (
                  <button
                    className={`border-b-2 px-6 py-2 font-semibold transition ${
                      activeTab === idx
                        ? 'border-fuchsia-600 text-fuchsia-400'
                        : 'border-transparent text-white hover:text-fuchsia-400'
                    }`}
                    onClick={() => setActiveTab(idx)}
                    onDoubleClick={() => {
                      setEditingTab(idx);
                      setTabNameInput(chart.title);
                    }}
                  >
                    {chart.title}
                  </button>
                )}
              </div>
            ) : null
          )}
          <button
            className="ml-2 cursor-pointer rounded-lg bg-fuchsia-600 px-4 py-2 font-semibold text-white hover:bg-fuchsia-700"
            onClick={() => setModalOpen(true)}
          >
            + Add Chart
          </button>
        </div>
        {/* Tab Content */}
        {presetUnlocked && activeTab === 'preset' && <PresetCharts />}
        {typeof activeTab === 'number' && charts[activeTab] && (
          <div className="flex gap-8 px-8 py-8">
            <div className="flex-1">
              <div className="mb-2 text-xl font-semibold">
                {charts[activeTab]?.title}
              </div>
              <div className="mb-6 text-sm text-purple-200">
                Create and customize financial visualizations
              </div>
              <div className="relative rounded-2xl border-2 border-fuchsia-700/40 bg-[#181425] p-1 shadow-lg">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-white">
                    {charts[activeTab]?.title}
                  </span>
                  <div className="flex gap-2">
                    <button
                      className="text-purple-300 hover:text-fuchsia-400"
                      onClick={() => {
                        setEditingChartIdx(activeTab as number);
                        setModalOpen(true);
                      }}
                    >
                      <FaRegEdit />
                    </button>
                    <button
                      className="text-purple-300 hover:text-red-400"
                      onClick={() => handleRemoveChart(activeTab)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                <div className="mb-2 flex h-200 items-center justify-center rounded-lg bg-[#16131f] p-0">
                  <span className="h-full w-full text-purple-400">
                    <Chart
                      tickers={charts[activeTab]?.selectedStocks}
                      metric={charts[activeTab]?.primaryMetric}
                      startDate={charts[activeTab]?.startDate}
                      endDate={charts[activeTab]?.endDate}
                      chartType={charts[activeTab]?.chartType}
                    />
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        <AddChartModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingChartIdx(null);
          }}
          onAdd={handleAddChart}
          initialData={
            editingChartIdx !== null && charts[editingChartIdx] !== null
              ? charts[editingChartIdx]
              : undefined
          }
        />
      </div>
    </div>
  );
};
