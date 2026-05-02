import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import * as d3 from 'd3';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type BarChartProps = {
  tickers: string[];
  metric: string;
  secondaryMetric?: string;
  startDate: string;
  endDate: string;
  interval?: string;
  setLoading?: (loading: boolean) => void;
  containerWidth?: string | number;
  containerHeight?: string | number;
};

const COLORS = [
  '#a78bfa',
  '#34d399',
  '#60a5fa',
  '#f472b6',
  '#fbbf24',
  '#818cf8',
  '#c084fc',
  '#2dd4bf',
];

type DataPoint = { date: string; value: number };
type Series = { ticker: string; points: DataPoint[] };

function getDateKey(dateStr: string, interval: string) {
  return interval === 'annual' ? dateStr.slice(0, 4) : dateStr.slice(0, 7);
}

function groupByDateKey(points: DataPoint[], interval: string) {
  const grouped: Record<string, DataPoint> = {};
  points.forEach((p) => {
    const key = getDateKey(p.date, interval);
    if (!grouped[key] || p.date > grouped[key].date) grouped[key] = p;
  });
  return grouped;
}

function dateLabel(key: string, interval: string) {
  if (interval === 'annual') return key;
  const [y, m] = key.split('-');
  return new Date(+y, +m - 1, 1).toLocaleString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}

function formatAbbrev(v: d3.NumberValue) {
  const n = +v;
  if (n >= 1e12) return (n / 1e12).toFixed(1) + 'T';
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n.toFixed(2);
}

async function fetchSeriesData(
  tickers: string[],
  metricName: string,
  startDate: string,
  endDate: string,
  interval: string
): Promise<Series[]> {
  return Promise.all(
    tickers.map(async (ticker) => {
      const endpoint =
        metricName === 'Market Cap'
          ? `${API_BASE_URL}/stocks/${ticker}/${startDate}/${endDate}/marketCapHistory`
          : `${API_BASE_URL}/stocks/${ticker}/${startDate}/${endDate}/${interval}/${
              metricName === 'Price To Earnings Ratio'
                ? 'pe'
                : metricName === 'Price To Sales Ratio'
                  ? 'ps'
                  : metricName === 'Dividend Yield (%)'
                    ? 'dividendInfo'
                    : metricName === 'Earnings Per Share'
                      ? 'eps'
                      : metricName === 'Revenues'
                        ? 'revenues'
                        : metricName === 'Net Income'
                          ? 'netIncome'
                          : ''
            }`;
      const raw = await (await fetch(endpoint)).json();
      let points: DataPoint[] = [];
      if (metricName === 'Revenues' && raw?.monthlyRevenuePoints) {
        points = raw.monthlyRevenuePoints.map((d: any) => ({
          date: d.date,
          value: d.revenueActual,
        }));
      } else if (Array.isArray(raw)) {
        points = raw.map((d: any) => ({
          date: d.date,
          value:
            metricName === 'Market Cap'
              ? d.marketCap
              : metricName === 'Price To Sales Ratio'
                ? d.psRatio
                : metricName === 'Price To Earnings Ratio'
                  ? d.peRatio
                  : metricName === 'Dividend Yield (%)'
                    ? d.yield
                    : metricName === 'Earnings Per Share'
                      ? d.eps
                      : metricName === 'Net Income'
                        ? d.ttmNetIncome
                        : null,
        }));
      }
      return { ticker, points: points.filter((p) => p.value != null) };
    })
  );
}

const BarChart = ({
  tickers,
  metric,
  secondaryMetric,
  startDate,
  endDate,
  interval = 'quarter',
  setLoading,
  containerWidth = '100%',
  containerHeight = '100%',
}: BarChartProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [primaryData, setPrimaryData] = useState<Series[]>([]);
  const [secondaryData, setSecondaryData] = useState<Series[]>([]);
  const lastParams = useRef('');
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  /* ── Resize observer ── */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setDimensions({ width, height });
    });
    ro.observe(el);
    setDimensions({ width: el.offsetWidth, height: el.offsetHeight });
    return () => ro.disconnect();
  }, []);

  /* ── Data fetch ── */
  useEffect(() => {
    const key = JSON.stringify({
      tickers,
      metric,
      secondaryMetric,
      startDate,
      endDate,
      interval,
    });
    if (key === lastParams.current || !tickers.length || !metric) return;
    lastParams.current = key;
    setLoading?.(true);
    Promise.all([
      fetchSeriesData(tickers, metric, startDate, endDate, interval),
      secondaryMetric && secondaryMetric !== 'None'
        ? fetchSeriesData(
            tickers,
            secondaryMetric,
            startDate,
            endDate,
            interval
          )
        : Promise.resolve([]),
    ]).then(([primary, secondary]) => {
      setPrimaryData(primary);
      setSecondaryData(secondary);
      setLoading?.(false);
    });
  }, [
    tickers.join(','),
    metric,
    secondaryMetric,
    startDate,
    endDate,
    interval,
  ]);

  /* ── Draw ── */
  useEffect(() => {
    const container = ref.current;
    if (!container || !primaryData.length) return;
    d3.select(container).selectAll('*').remove();

    const W = dimensions.width || container.offsetWidth || 600;
    const H = dimensions.height || container.offsetHeight || 420;
    if (W < 100 || H < 80) return;

    const hasSecondary =
      secondaryData.length > 0 && secondaryMetric && secondaryMetric !== 'None';
    const margin = {
      top: 52,
      right: hasSecondary ? 62 : 24,
      bottom: 80,
      left: 82,
    };
    const innerW = W - margin.left - margin.right;
    const innerH = H - margin.top - margin.bottom;

    /* ── Build date key universe ── */
    const keySet = new Set<string>();
    [...primaryData, ...(hasSecondary ? secondaryData : [])].forEach((s) =>
      s.points.forEach((p) => keySet.add(getDateKey(p.date, interval)))
    );
    const allKeys = Array.from(keySet).sort();

    /* ── Smart x-tick reduction ── */
    const MAX_TICKS = 10;
    const step = Math.max(1, Math.ceil(allKeys.length / MAX_TICKS));
    const tickKeys = allKeys.filter((_, i) => i % step === 0);

    /* ── Normalized data ── */
    const normPrimary = primaryData.map((s) => ({
      ticker: s.ticker,
      grouped: groupByDateKey(s.points, interval),
    }));
    const normSecondary = secondaryData.map((s) => ({
      ticker: s.ticker,
      grouped: groupByDateKey(s.points, interval),
    }));

    /* ── Scales ── */
    const x0 = d3.scaleBand().domain(allKeys).range([0, innerW]).padding(0.22);
    const x1 = d3
      .scaleBand()
      .domain(tickers)
      .range([0, x0.bandwidth()])
      .padding(0.12);

    const allPrimaryVals = normPrimary.flatMap((s) =>
      Object.values(s.grouped).map((p) => p.value)
    );
    const yMin = d3.min(allPrimaryVals) ?? 0;
    const yMax = d3.max(allPrimaryVals) ?? 1;
    const y = d3
      .scaleLinear()
      .domain([Math.min(0, yMin), yMax])
      .nice()
      .range([innerH, 0]);

    let y2: d3.ScaleLinear<number, number> | null = null;
    if (hasSecondary) {
      const allSecVals = normSecondary.flatMap((s) =>
        Object.values(s.grouped).map((p) => p.value)
      );
      y2 = d3
        .scaleLinear()
        .domain([Math.min(0, d3.min(allSecVals) ?? 0), d3.max(allSecVals) ?? 1])
        .nice()
        .range([innerH, 0]);
    }

    /* ── SVG ── */
    const svg = d3
      .select(container)
      .append('svg')
      .attr('width', W)
      .attr('height', H)
      .style('border-radius', '14px')
      .style('background', 'transparent')
      .style('display', 'block');

    // Gradient defs per color
    const defs = svg.append('defs');
    COLORS.forEach((color, i) => {
      const g = defs
        .append('linearGradient')
        .attr('id', `bar-grad-${i}`)
        .attr('x1', '0')
        .attr('y1', '0')
        .attr('x2', '0')
        .attr('y2', '1');
      g.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', color)
        .attr('stop-opacity', 0.9);
      g.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', color)
        .attr('stop-opacity', 0.5);
    });

    const plot = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const textColor = isDark ? 'rgba(255,255,255,0.38)' : 'rgba(30,27,75,0.5)';
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(30,27,75,0.08)';
    const axisTitleColor = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(30,27,75,0.45)';
    const legendTextColor = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(30,27,75,0.6)';
    const tooltipBg = isDark ? 'rgba(10,8,20,0.92)' : 'rgba(255,255,255,0.96)';
    const tooltipTextColor = isDark ? '#e2e8f0' : '#1a1a2e';

    /* ── Grid lines ── */
    y.ticks(5).forEach((tick) => {
      plot
        .append('line')
        .attr('x1', 0)
        .attr('x2', innerW)
        .attr('y1', y(tick))
        .attr('y2', y(tick))
        .attr('stroke', gridColor)
        .attr('stroke-dasharray', '4,4');
    });

    /* ── Axes ── */
    const yAxis = plot.append('g').call(
      d3
        .axisLeft(y)
        .ticks(5)
        .tickFormat(formatAbbrev as any)
    );
    yAxis.select('.domain').remove();
    yAxis.selectAll('.tick line').remove();
    yAxis
      .selectAll('.tick text')
      .attr('fill', textColor)
      .attr('font-size', '12px')
      .attr('font-family', 'inherit');

    if (hasSecondary && y2) {
      const y2Axis = plot
        .append('g')
        .attr('transform', `translate(${innerW},0)`)
        .call(
          d3
            .axisRight(y2)
            .ticks(5)
            .tickFormat(formatAbbrev as any)
        );
      y2Axis.select('.domain').remove();
      y2Axis.selectAll('.tick line').remove();
      y2Axis
        .selectAll('.tick text')
        .attr('fill', 'rgba(255,255,255,0.38)')
        .attr('font-size', '12px')
        .attr('font-family', 'inherit');
    }

    const xAxis = plot
      .append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(
        d3
          .axisBottom(x0)
          .tickValues(tickKeys)
          .tickFormat((d) => dateLabel(d as string, interval))
      );
    xAxis.select('.domain').remove();
    xAxis.selectAll('.tick line').remove();
    xAxis
      .selectAll('.tick text')
      .attr('fill', textColor)
      .attr('font-size', '11px')
      .attr('font-family', 'inherit')
      .attr('transform', 'rotate(-38)')
      .style('text-anchor', 'end')
      .attr('dx', '-0.4em')
      .attr('dy', '0.2em');

    // Y-axis title — rotated, centered along chart height, at x=14 (clear of tick values that start at x≥32)
    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -(margin.top + innerH / 2))
      .attr('y', 14)
      .attr('text-anchor', 'middle')
      .attr('fill', axisTitleColor)
      .attr('font-size', '11px')
      .attr('font-family', 'inherit')
      .text(metric);

    // X-axis title — centered below tick labels (rotated ticks end ~36px below axis; title at ~64px)
    plot
      .append('text')
      .attr('x', innerW / 2)
      .attr('y', innerH + 64)
      .attr('text-anchor', 'middle')
      .attr('fill', axisTitleColor)
      .attr('font-size', '11px')
      .attr('font-family', 'inherit')
      .text(interval === 'annual' ? 'Year' : 'Month');

    /* ── Zero line ── */
    if (yMin < 0) {
      plot
        .append('line')
        .attr('x1', 0)
        .attr('x2', innerW)
        .attr('y1', y(0))
        .attr('y2', y(0))
        .attr('stroke', 'rgba(168,85,247,0.4)')
        .attr('stroke-dasharray', '4,3')
        .attr('stroke-width', 1);
    }

    /* ── Tooltip ── */
    const tooltip = d3
      .select(container)
      .append('div')
      .style('position', 'absolute')
      .style('background', tooltipBg)
      .style('border', '1px solid rgba(168,85,247,0.3)')
      .style('color', tooltipTextColor)
      .style('padding', '10px 14px')
      .style('border-radius', '10px')
      .style('font-size', '13px')
      .style('line-height', '1.6')
      .style('pointer-events', 'none')
      .style('white-space', 'nowrap')
      .style('box-shadow', '0 4px 24px rgba(109,40,217,0.25)')
      .style('opacity', '0')
      .style('transition', 'opacity 0.15s');

    /* ── Primary bars ── */
    allKeys.forEach((dateKey) => {
      const gx = plot
        .append('g')
        .attr('transform', `translate(${x0(dateKey)},0)`);
      tickers.forEach((ticker, i) => {
        const series = normPrimary.find((s) => s.ticker === ticker);
        const pt = series?.grouped[dateKey];
        if (!pt) return;

        const barH = Math.abs(y(0) - y(pt.value));
        const barY = pt.value >= 0 ? y(pt.value) : y(0);
        const color = COLORS[i % COLORS.length];

        const rect = gx
          .append('rect')
          .attr('x', x1(ticker)!)
          .attr('y', barY)
          .attr('width', hasSecondary ? x1.bandwidth() / 2 : x1.bandwidth())
          .attr('height', barH)
          .attr('rx', 4)
          .attr('fill', `url(#bar-grad-${i % COLORS.length})`);

        rect
          .on('pointerenter', function (event) {
            d3.select(this).attr('fill', color).attr('opacity', 1);
            const [] = d3.pointer(event, container);
            tooltip
              .style('opacity', '1')
              .html(
                `<div style="margin-bottom:4px;font-size:11px;color:rgba(255,255,255,0.4)">${dateLabel(dateKey, interval)}</div>` +
                  `<span style="color:${color}">${ticker}</span>: ${formatAbbrev(pt.value)}`
              )
              .style(
                'left',
                `${(x0(dateKey) ?? 0) + margin.left + x0.bandwidth() / 2 + 8}px`
              )
              .style('top', `${barY + margin.top - 10}px`);
          })
          .on('pointerleave', function () {
            d3.select(this)
              .attr('fill', `url(#bar-grad-${i % COLORS.length})`)
              .attr('opacity', 1);
            tooltip.style('opacity', '0');
          });
      });
    });

    /* ── Secondary bars ── */
    if (hasSecondary && y2) {
      allKeys.forEach((dateKey) => {
        const gx = plot
          .append('g')
          .attr('transform', `translate(${x0(dateKey)},0)`);
        tickers.forEach((ticker, i) => {
          const series = normSecondary.find((s) => s.ticker === ticker);
          const pt = series?.grouped[dateKey];
          if (!pt) return;

          const color = COLORS[(i + 4) % COLORS.length];
          const barH = Math.abs(y2!(0) - y2!(pt.value));
          const barY = pt.value >= 0 ? y2!(pt.value) : y2!(0);

          gx.append('rect')
            .attr('x', x1(ticker)! + x1.bandwidth() / 2)
            .attr('y', barY)
            .attr('width', x1.bandwidth() / 2)
            .attr('height', barH)
            .attr('rx', 4)
            .attr('fill', color)
            .attr('fill-opacity', 0.45)
            .attr('stroke', color)
            .attr('stroke-width', 1)
            .on('pointerenter', function () {
              tooltip
                .style('opacity', '1')
                .html(
                  `<div style="margin-bottom:4px;font-size:11px;color:${isDark ? 'rgba(255,255,255,0.4)' : 'rgba(30,27,75,0.5)'}">${dateLabel(dateKey, interval)}</div>` +
                    `<span style="color:${color}">${ticker} (${secondaryMetric})</span>: ${formatAbbrev(pt.value)}`
                )
                .style(
                  'left',
                  `${(x0(dateKey) ?? 0) + margin.left + x0.bandwidth() / 2 + 8}px`
                )
                .style('top', `${barY + margin.top - 10}px`);
            })
            .on('pointerleave', () => tooltip.style('opacity', '0'));
        });
      });
    }

    /* ── Legend (top, horizontal) ── */
    const legendG = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top - 32})`);
    const items = [
      ...tickers.map((t, i) => ({
        label: `${t} · ${metric}`,
        color: COLORS[i % COLORS.length],
        secondary: false,
      })),
      ...(hasSecondary
        ? tickers.map((t, i) => ({
            label: `${t} · ${secondaryMetric}`,
            color: COLORS[(i + 4) % COLORS.length],
            secondary: true,
          }))
        : []),
    ];
    let lx = 0;
    items.forEach(({ label, color, secondary }) => {
      const row = legendG.append('g').attr('transform', `translate(${lx},0)`);
      row
        .append('rect')
        .attr('x', 0)
        .attr('y', 2)
        .attr('width', 12)
        .attr('height', 12)
        .attr('rx', 3)
        .attr('fill', color)
        .attr('fill-opacity', secondary ? 0.5 : 0.9);
      row
        .append('text')
        .attr('x', 18)
        .attr('y', 12)
        .attr('font-size', '12px')
        .attr('fill', legendTextColor)
        .attr('font-family', 'inherit')
        .text(label);
      lx += label.length * 7.2 + 32;
    });
  }, [primaryData, secondaryData, dimensions.width, dimensions.height, isDark]);

  return (
    <div
      ref={ref}
      style={{
        width: containerWidth,
        height: containerHeight,
        minHeight: 0,
        minWidth: 0,
        position: 'relative',
      }}
    />
  );
};

export default BarChart;
