import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import * as d3 from 'd3';

import { API_BASE_URL } from '../../../config';

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

type BubbleChartProps = {
  tickers: string[];
  xMetric: string;
  yMetric: string;
  sizeMetric?: string;
  startDate: string;
  endDate: string;
  interval?: string;
  setLoading?: (loading: boolean) => void;
  containerWidth?: string | number;
  containerHeight?: string | number;
};

type TickerSnapshot = { ticker: string; value: number | null };
type BubblePoint = { ticker: string; x: number; y: number; size: number | null; colorIdx: number };

const RATIOS_FIELD: Record<string, string> = {
  'EV / EBITDA': 'evToEbitda',
  'Price to Book': 'pbRatio',
  'Debt to Equity': 'debtToEquity',
  'Return on Equity': 'roe',
  'Return on Assets': 'roa',
};

function metricToEndpoint(
  ticker: string,
  metricName: string,
  startDate: string,
  endDate: string,
  interval: string
) {
  if (metricName === 'Market Cap') {
    return `${API_BASE_URL}/stocks/${ticker}/${startDate}/${endDate}/marketCapHistory`;
  }
  if (RATIOS_FIELD[metricName]) {
    return `${API_BASE_URL}/stocks/${ticker}/${startDate}/${endDate}/${interval}/ratios`;
  }
  const slug =
    metricName === 'Price To Earnings Ratio' ? 'pe'
    : metricName === 'Price To Sales Ratio' ? 'ps'
    : metricName === 'Dividend Yield (%)' ? 'dividendInfo'
    : metricName === 'Earnings Per Share' ? 'eps'
    : metricName === 'Revenues' ? 'revenues'
    : metricName === 'Net Income' ? 'netIncome'
    : '';
  return `${API_BASE_URL}/stocks/${ticker}/${startDate}/${endDate}/${interval}/${slug}`;
}

function extractPoints(raw: any, metricName: string): { date: string; value: number }[] {
  if (metricName === 'Revenues' && raw?.monthlyRevenuePoints) {
    return raw.monthlyRevenuePoints.map((d: any) => ({ date: d.date, value: d.revenueActual }));
  }
  if (!Array.isArray(raw)) return [];
  const ratiosField = RATIOS_FIELD[metricName];
  return raw.map((d: any) => ({
    date: d.date,
    value: ratiosField
      ? d[ratiosField]
      : metricName === 'Market Cap' ? d.marketCap
      : metricName === 'Price To Sales Ratio' ? d.psRatio
      : metricName === 'Price To Earnings Ratio' ? d.peRatio
      : metricName === 'Dividend Yield (%)' ? d.yield
      : metricName === 'Earnings Per Share' ? d.eps
      : metricName === 'Net Income' ? d.ttmNetIncome
      : null,
  }));
}

async function fetchLastValue(
  tickers: string[],
  metricName: string,
  startDate: string,
  endDate: string,
  interval: string
): Promise<TickerSnapshot[]> {
  return Promise.all(
    tickers.map(async (ticker): Promise<TickerSnapshot> => {
      try {
        const endpoint = metricToEndpoint(ticker, metricName, startDate, endDate, interval);
        const raw = await (await fetch(endpoint)).json();
        const points = extractPoints(raw, metricName)
          .filter((p) => p.value != null)
          .sort((a, b) => a.date.localeCompare(b.date));
        const last = points[points.length - 1];
        return { ticker, value: last?.value ?? null };
      } catch {
        return { ticker, value: null };
      }
    })
  );
}

function formatAbbrev(v: d3.NumberValue) {
  const n = +v;
  if (n >= 1e12) return (n / 1e12).toFixed(1) + 'T';
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n.toFixed(2);
}

const BubbleChart = ({
  tickers,
  xMetric,
  yMetric,
  sizeMetric,
  startDate,
  endDate,
  interval = 'quarter',
  setLoading,
  containerWidth = '100%',
  containerHeight = '100%',
}: BubbleChartProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [xData, setXData] = useState<TickerSnapshot[]>([]);
  const [yData, setYData] = useState<TickerSnapshot[]>([]);
  const [sizeData, setSizeData] = useState<TickerSnapshot[]>([]);
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
    const key = JSON.stringify({ tickers, xMetric, yMetric, sizeMetric, startDate, endDate, interval });
    if (key === lastParams.current || !tickers.length || !xMetric || !yMetric) return;
    lastParams.current = key;
    setLoading?.(true);
    setXData([]);
    setYData([]);
    setSizeData([]);

    const hasSizeMetric = sizeMetric && sizeMetric !== 'None';
    const fetches: Promise<TickerSnapshot[]>[] = [
      fetchLastValue(tickers, xMetric, startDate, endDate, interval),
      fetchLastValue(tickers, yMetric, startDate, endDate, interval),
      ...(hasSizeMetric
        ? [fetchLastValue(tickers, sizeMetric!, startDate, endDate, interval)]
        : []),
    ];

    Promise.allSettled(fetches).then(([xRes, yRes, sizeRes]) => {
      if (xRes.status === 'fulfilled') setXData(xRes.value);
      if (yRes.status === 'fulfilled') setYData(yRes.value);
      if (sizeRes?.status === 'fulfilled') setSizeData(sizeRes.value);
      else setSizeData([]);
      setLoading?.(false);
    });
  }, [tickers.join(','), xMetric, yMetric, sizeMetric, startDate, endDate, interval]);

  /* ── Draw ── */
  useEffect(() => {
    const container = ref.current;
    if (!container || !xData.length || !yData.length) return;
    d3.select(container).selectAll('*').remove();

    const W = dimensions.width || container.offsetWidth || 600;
    const H = dimensions.height || container.offsetHeight || 420;
    if (W < 100 || H < 80) return;

    const points: BubblePoint[] = tickers.flatMap((ticker, i) => {
      const xSnap = xData.find((d) => d.ticker === ticker);
      const ySnap = yData.find((d) => d.ticker === ticker);
      if (xSnap?.value == null || ySnap?.value == null) return [];
      const sizeSnap = sizeData.find((d) => d.ticker === ticker);
      return [{ ticker, x: xSnap.value, y: ySnap.value, size: sizeSnap?.value ?? null, colorIdx: i }];
    });

    if (!points.length) return;

    const hasSizeMetric = sizeMetric && sizeMetric !== 'None' && sizeData.length > 0;

    const margin = { top: 52, right: 32, bottom: 64, left: 82 };
    const innerW = W - margin.left - margin.right;
    const innerH = H - margin.top - margin.bottom;

    /* ── Scales ── */
    const xVals = points.map((p) => p.x);
    const yVals = points.map((p) => p.y);
    const xMin = d3.min(xVals) ?? 0;
    const xMax = d3.max(xVals) ?? 1;
    const yMin = d3.min(yVals) ?? 0;
    const yMax = d3.max(yVals) ?? 1;

    // Padding handles zero and clustered values without degenerating to a single point
    const xPad = Math.abs(xMax - xMin) * 0.15 || Math.abs(xMax) * 0.15 || 1;
    const yPad = Math.abs(yMax - yMin) * 0.15 || Math.abs(yMax) * 0.15 || 1;

    const xScale = d3.scaleLinear()
      .domain([xMin - xPad, xMax + xPad])
      .nice()
      .range([0, innerW]);

    const yScale = d3.scaleLinear()
      .domain([yMin - yPad, yMax + yPad])
      .nice()
      .range([innerH, 0]);

    const FIXED_RADIUS = 14;
    let rScale: d3.ScalePower<number, number> | null = null;
    if (hasSizeMetric) {
      const sizeVals = points.map((p) => Math.abs(p.size ?? 0));
      const maxSize = d3.max(sizeVals) ?? 1;
      rScale = d3.scaleSqrt()
        .domain([0, Math.max(maxSize, 1)])
        .range([10, 40]);
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

    // Unique clip path ID to avoid collisions when multiple charts exist in the DOM
    const clipId = `bubble-clip-${Math.random().toString(36).slice(2)}`;
    svg
      .append('defs')
      .append('clipPath')
      .attr('id', clipId)
      .append('rect')
      .attr('width', innerW)
      .attr('height', innerH);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const textColor = isDark ? 'rgba(255,255,255,0.38)' : 'rgba(30,27,75,0.5)';
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(30,27,75,0.08)';
    const axisTitleColor = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(30,27,75,0.45)';
    const legendTextColor = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(30,27,75,0.6)';
    const tooltipBg = isDark ? 'rgba(10,8,20,0.92)' : 'rgba(255,255,255,0.96)';
    const tooltipTextColor = isDark ? '#e2e8f0' : '#1a1a2e';
    const labelColor = isDark ? 'rgba(255,255,255,0.75)' : 'rgba(30,27,75,0.75)';

    /* ── Grid lines ── */
    yScale.ticks(5).forEach((tick) => {
      g.append('line')
        .attr('x1', 0).attr('x2', innerW)
        .attr('y1', yScale(tick)).attr('y2', yScale(tick))
        .attr('stroke', gridColor).attr('stroke-dasharray', '4,4');
    });
    xScale.ticks(5).forEach((tick) => {
      g.append('line')
        .attr('x1', xScale(tick)).attr('x2', xScale(tick))
        .attr('y1', 0).attr('y2', innerH)
        .attr('stroke', gridColor).attr('stroke-dasharray', '4,4');
    });

    /* ── Axes ── */
    const yAxis = g.append('g').call(
      d3.axisLeft(yScale).ticks(5).tickFormat(formatAbbrev as any)
    );
    yAxis.select('.domain').remove();
    yAxis.selectAll('.tick line').remove();
    yAxis
      .selectAll('.tick text')
      .attr('fill', textColor)
      .attr('font-size', '12px')
      .attr('font-family', 'inherit');

    const xAxis = g
      .append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat(formatAbbrev as any));
    xAxis.select('.domain').remove();
    xAxis.selectAll('.tick line').remove();
    xAxis
      .selectAll('.tick text')
      .attr('fill', textColor)
      .attr('font-size', '12px')
      .attr('font-family', 'inherit');

    // Y axis title
    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -(margin.top + innerH / 2))
      .attr('y', 14)
      .attr('text-anchor', 'middle')
      .attr('fill', axisTitleColor)
      .attr('font-size', '11px')
      .attr('font-family', 'inherit')
      .text(yMetric);

    // X axis title
    g.append('text')
      .attr('x', innerW / 2)
      .attr('y', innerH + 48)
      .attr('text-anchor', 'middle')
      .attr('fill', axisTitleColor)
      .attr('font-size', '11px')
      .attr('font-family', 'inherit')
      .text(xMetric);

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

    /* ── Bubbles ── */
    const plot = g.append('g').attr('clip-path', `url(#${clipId})`);

    points.forEach((pt) => {
      const color = COLORS[pt.colorIdx % COLORS.length];
      const r = rScale ? rScale(Math.abs(pt.size ?? 0)) || FIXED_RADIUS : FIXED_RADIUS;
      const cx = xScale(pt.x);
      const cy = yScale(pt.y);

      const circle = plot
        .append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', r)
        .attr('fill', color)
        .attr('fill-opacity', 0.55)
        .attr('stroke', color)
        .attr('stroke-width', 1.5)
        .attr('stroke-opacity', 0.9)
        .style('cursor', 'pointer');

      // Label inside bubble when it's large enough, otherwise next to it
      const labelFits = r >= 18;
      plot
        .append('text')
        .attr('x', labelFits ? cx : cx + r + 5)
        .attr('y', labelFits ? cy + 4 : cy + 4)
        .attr('text-anchor', labelFits ? 'middle' : 'start')
        .attr('font-size', '11px')
        .attr('font-family', 'inherit')
        .attr('font-weight', '600')
        .attr('fill', labelFits ? 'white' : labelColor)
        .attr('pointer-events', 'none')
        .text(pt.ticker);

      const dimColor = isDark ? 'rgba(255,255,255,0.4)' : '#64748b';
      circle
        .on('pointerenter', function (event) {
          d3.select(this).attr('fill-opacity', 0.85);
          const [mx, my] = d3.pointer(event, container);
          const lines = [
            `<span style="color:${color};font-weight:600">${pt.ticker}</span>`,
            `<span style="color:${dimColor}">${xMetric}:</span> ${formatAbbrev(pt.x)}`,
            `<span style="color:${dimColor}">${yMetric}:</span> ${formatAbbrev(pt.y)}`,
          ];
          if (hasSizeMetric && pt.size != null) {
            lines.push(
              `<span style="color:${dimColor}">${sizeMetric}:</span> ${formatAbbrev(pt.size)}`
            );
          }
          tooltip
            .style('opacity', '1')
            .html(lines.join('<br/>'))
            .style('left', `${mx + 12}px`)
            .style('top', `${my - 10}px`);
        })
        .on('pointerleave', function () {
          d3.select(this).attr('fill-opacity', 0.55);
          tooltip.style('opacity', '0');
        });
    });

    /* ── Legend ── */
    const legendG = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top - 32})`);
    let lx = 0;
    points.forEach((pt) => {
      const color = COLORS[pt.colorIdx % COLORS.length];
      const row = legendG.append('g').attr('transform', `translate(${lx},0)`);
      row
        .append('circle')
        .attr('cx', 6)
        .attr('cy', 7)
        .attr('r', 6)
        .attr('fill', color)
        .attr('fill-opacity', 0.6);
      row
        .append('text')
        .attr('x', 16)
        .attr('y', 11)
        .attr('font-size', '12px')
        .attr('fill', legendTextColor)
        .attr('font-family', 'inherit')
        .text(pt.ticker);
      lx += pt.ticker.length * 7.2 + 28;
    });
  }, [xData, yData, sizeData, tickers.join(','), dimensions.width, dimensions.height, isDark]);

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

export default BubbleChart;
