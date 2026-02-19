import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type BarChartProps = {
  tickers: string[];
  metric: string;
  secondaryMetric?: string;
  startDate: string;
  endDate: string;
  interval?: string; // Add interval prop
  setLoading?: (loading: boolean) => void;
  containerWidth?: string | number;
  containerHeight?: string | number;
};

// Replace d3.schemeCategory10 with new purple/dark theme colors
const COLORS = [
  '#a78bfa', // Light purple
  '#7c3aed', // Vivid purple
  '#6d28d9', // Deep purple
  '#c084fc', // Soft purple
  '#f472b6', // Pink accent
  '#818cf8', // Indigo
  '#312e81', // Dark indigo
  '#f3e8ff', // Pale purple
  '#ede9fe', // Lavender
  '#581c87', // Rich purple
];

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
  const [primaryData, setPrimaryData] = useState<any[]>([]);
  const [secondaryData, setSecondaryData] = useState<any[]>([]);
  const lastFetchParams = useRef({
    tickers: '',
    metric: '',
    secondaryMetric: '',
    startDate: '',
    endDate: '',
    interval: '',
  });

  // Use ResizeObserver for true dynamic resizing
  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    const observer = new window.ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });
    observer.observe(container);
    // Set initial size
    setDimensions({
      width: container.offsetWidth,
      height: container.offsetHeight,
    });
    return () => observer.disconnect();
  }, []);

  // Fetch data only when chart params change (NOT on resize)
  useEffect(() => {
    const paramsString = JSON.stringify({
      tickers: JSON.stringify(tickers),
      metric,
      secondaryMetric,
      startDate,
      endDate,
      interval,
    });
    if (
      lastFetchParams.current &&
      paramsString === JSON.stringify(lastFetchParams.current)
    )
      return;
    lastFetchParams.current = {
      tickers: JSON.stringify(tickers),
      metric,
      secondaryMetric: secondaryMetric || '',
      startDate,
      endDate,
      interval,
    };
    if (!tickers.length || !metric) return;
    setLoading?.(true);
    const fetchMetricData = async (metricName: string) => {
      const promises = tickers.map(async (ticker) => {
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
        const response = await fetch(endpoint);
        const data = await response.json();
        let points: { date: string; value: number }[] = [];
        if (
          metricName === 'Revenues' &&
          data &&
          Array.isArray(data.monthlyRevenuePoints)
        ) {
          points = data.monthlyRevenuePoints.map((d: any) => ({
            date: d.date,
            value: d.revenueActual,
          }));
        } else if (Array.isArray(data)) {
          points = data.map((d: any) => {
            let value = null;
            if (metricName === 'Market Cap') value = d.marketCap;
            else if (metricName === 'Price To Sales Ratio') value = d.psRatio;
            else if (metricName === 'Price To Earnings Ratio')
              value = d.peRatio;
            else if (metricName === 'Dividend Yield (%)') value = d.yield;
            else if (metricName === 'Earnings Per Share') value = d.eps;
            else if (metricName === 'Net Income') value = d.ttmNetIncome;
            return { date: d.date, value };
          });
        }
        return { ticker, points };
      });
      return Promise.all(promises);
    };
    Promise.all([
      fetchMetricData(metric),
      secondaryMetric && secondaryMetric !== 'None'
        ? fetchMetricData(secondaryMetric)
        : Promise.resolve([]),
    ]).then(([primary, secondary]) => {
      setPrimaryData(primary);
      setSecondaryData(secondary);
      setLoading?.(false);
    });
    // eslint-disable-next-line
  }, [
    tickers.join(','),
    metric,
    secondaryMetric,
    startDate,
    endDate,
    interval,
  ]);

  // Draw chart when data or dimensions change
  useEffect(() => {
    d3.select(ref.current).selectAll('*').remove();
    if (!primaryData.length) return;

    const BAR_GRADIENT_ID = 'bar-gradient';
    const BAR_SHADOW_ID = 'bar-shadow';

    const drawChart = (
      primaryData: {
        ticker: string;
        points: { date: string; value: number }[];
      }[],
      secondaryData: {
        ticker: string;
        points: { date: string; value: number }[];
      }[]
    ) => {
      // --- DEBUG LOGS ---
      console.log('TICKERS:', tickers);
      console.log('primaryData:', primaryData);
      console.log('secondaryData:', secondaryData);
      // --- END DEBUG LOGS ---

      // Chart sizing and margins
      // Use container size if available, else fallback to window size
      const parent = ref.current?.parentElement;
      const width =
        typeof containerWidth === 'number'
          ? containerWidth
          : parent?.offsetWidth || dimensions.width * 0.85;
      const height =
        typeof containerHeight === 'number'
          ? containerHeight
          : parent?.offsetHeight || dimensions.height * 0.8;
      const margin = {
        top: 60,
        right: 320, // Increased space for legend and right axis
        bottom: 80,
        left: 80,
      };

      // Helper to get normalized date key (month or year)
      function getDateKey(dateStr: string, interval: string) {
        if (interval === 'annual') return dateStr.slice(0, 4);
        // Default: monthly/quarterly, use YYYY-MM
        return dateStr.slice(0, 7);
      }

      // 1. Build a set of all normalized date keys
      const allDateKeysSet = new Set<string>();
      primaryData.forEach((series) => {
        series.points.forEach((p) =>
          allDateKeysSet.add(getDateKey(p.date, interval))
        );
      });
      secondaryData.forEach((series) => {
        series.points.forEach((p) =>
          allDateKeysSet.add(getDateKey(p.date, interval))
        );
      });
      const allDateKeys = Array.from(allDateKeysSet).sort();
      console.log('allDateKeys:', allDateKeys);

      // 2. For each ticker, for each date key, pick the last value in that month/year
      function groupPointsByDateKey(
        points: { date: string; value: number }[],
        interval: string
      ) {
        const grouped: Record<string, { date: string; value: number }> = {};
        points.forEach((p) => {
          const key = getDateKey(p.date, interval);
          // Always take the last value for the key (by date string sort)
          if (!grouped[key] || p.date > grouped[key].date) {
            grouped[key] = p;
          }
        });
        return grouped;
      }
      // Build normalized data for primary and secondary
      const normalizedPrimary = primaryData.map((series) => ({
        ticker: series.ticker,
        grouped: groupPointsByDateKey(series.points, interval),
      }));
      const normalizedSecondary = secondaryData.map((series) => ({
        ticker: series.ticker,
        grouped: groupPointsByDateKey(series.points, interval),
      }));

      // Map each date key to its x-axis label
      const dateToLabel = Object.fromEntries(
        allDateKeys.map((d) => {
          if (interval === 'annual') return [d, d];
          // d is YYYY-MM, convert to 'Month YYYY'
          const [year, month] = d.split('-');
          const dateObj = new Date(Number(year), Number(month) - 1, 1);
          const label = dateObj.toLocaleString('en-US', {
            month: 'short',
            year: 'numeric',
          });
          return [d, label];
        })
      );
      // Get unique labels in order
      const allLabels = Array.from(
        new Set(allDateKeys.map((d) => dateToLabel[d]))
      );

      // For x axis ticks, use one date per label
      const labelFirstDates = allLabels.map((lbl) =>
        allDateKeys.find((d) => dateToLabel[d] === lbl)
      );

      // X scale (dates)
      const x0 = d3
        .scaleBand()
        .domain(allDateKeys)
        .range([margin.left, width - margin.right])
        .padding(0.2);

      // X1: for tickers within each date
      const x1 = d3
        .scaleBand()
        .domain(tickers)
        .range([0, x0.bandwidth()])
        .padding(0.1);

      // Y scales
      const yMin =
        d3.min(primaryData, (d) => d3.min(d.points, (p) => p.value)) ?? 0;
      const yMax =
        d3.max(primaryData, (d) => d3.max(d.points, (p) => p.value)) ?? 1;
      const yDomainMin = Math.min(0, yMin);
      const yDomainMax = Math.max(0, yMax);
      const y = d3
        .scaleLinear()
        .domain([yDomainMin, yDomainMax])
        .nice()
        .range([height - margin.bottom, margin.top]);
      let y2, y2Min, y2Max;
      if (secondaryData.length) {
        y2Min =
          d3.min(secondaryData, (d) => d3.min(d.points, (p) => p.value)) ?? 0;
        y2Max =
          d3.max(secondaryData, (d) => d3.max(d.points, (p) => p.value)) ?? 1;
        y2 = d3
          .scaleLinear()
          .domain([Math.min(0, y2Min), Math.max(0, y2Max)])
          .nice()
          .range([height - margin.bottom, margin.top]);
      }

      // Y-axis number formatter
      const formatAbbrev = (domainValue: d3.NumberValue) => {
        const num =
          typeof domainValue === 'number'
            ? domainValue
            : Number(domainValue.valueOf());
        if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
        if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
        return num.toString();
      };

      const svg = d3
        .select(ref.current)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr(
          'style',
          // Use the requested background color
          'border-radius: 24px; background: #181a2a; box-shadow: 0 4px 24px #a78bfa33, 0 1.5px 8px #00000033;'
        );

      // Gradient fill for bars (update to purple gradient)
      svg
        .append('defs')
        .append('linearGradient')
        .attr('id', BAR_GRADIENT_ID)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%')
        .selectAll('stop')
        .data([
          { offset: '0%', color: '#a78bfa', opacity: 0.95 },
          { offset: '100%', color: '#7c3aed', opacity: 0.65 },
        ])
        .enter()
        .append('stop')
        .attr('offset', (d) => d.offset)
        .attr('stop-color', (d) => d.color)
        .attr('stop-opacity', (d) => d.opacity);

      // Drop shadow filter for bars (update to purple shadow)
      svg.append('defs').append('filter').attr('id', BAR_SHADOW_ID).html(`
          <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#a78bfa" flood-opacity="0.45" />
        `);

      // Grid lines (make more subtle, purple-tinted)
      svg
        .append('g')
        .attr('class', 'grid-y')
        .selectAll('line')
        .data(y.ticks(6))
        .enter()
        .append('line')
        .attr('x1', margin.left)
        .attr('x2', width - margin.right)
        .attr('y1', (d) => y(d))
        .attr('y2', (d) => y(d))
        .attr('stroke', '#a78bfa')
        .attr('stroke-opacity', 0.1)
        .attr('stroke-dasharray', '6,4');

      // Axes
      svg
        .append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).tickFormat(formatAbbrev))
        .selectAll('text')
        .attr('fill', '#fff');
      if (secondaryData.length && y2) {
        svg
          .append('g')
          .attr('transform', `translate(${width - margin.right},0)`)
          .call(d3.axisRight(y2).tickFormat(formatAbbrev))
          .selectAll('text')
          .attr('fill', '#fff');
      }
      svg
        .append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(
          d3
            .axisBottom(x0)
            .tickValues(labelFirstDates as string[])
            .tickFormat((d) => dateToLabel[d as string])
        )
        .selectAll('text')
        .attr('fill', '#fff')
        .attr('transform', 'rotate(-30)')
        .style('text-anchor', 'end');

      // Tooltip (update to purple/dark theme)
      const tooltip = d3
        .select(ref.current)
        .append('div')
        .attr('class', 'tooltip')
        .style('position', 'absolute')
        .style(
          'background',
          'linear-gradient(135deg, #231133 60%, #3b0764 100%)'
        )
        .style('color', '#f3e8ff')
        .style('padding', '8px 16px')
        .style('border-radius', '8px')
        .style('pointer-events', 'none')
        .style('font-size', '14px')
        .style('box-shadow', '0 2px 8px #a78bfa55')
        .style('opacity', 0);

      // Draw bars for primary metric (solid, rounded, gradient, shadow)
      svg
        .append('g')
        .selectAll('g')
        .data(allDateKeys)
        .enter()
        .append('g')
        .attr('transform', (d) => `translate(${x0(d)},0)`)
        .selectAll('rect')
        .data((dateKey) => {
          const mapped = tickers.map((ticker, i) => {
            const series = normalizedPrimary.find((s) => s.ticker === ticker);
            let value = null;
            if (series && series.grouped[dateKey]) {
              value = series.grouped[dateKey].value;
            }
            return {
              ticker,
              value,
              date: dateKey,
              color: COLORS[i % COLORS.length],
            };
          });
          console.log('Bar mapping for dateKey', dateKey, mapped);
          return mapped;
        })
        .enter()
        .append('rect')
        .attr('x', (d) => x1(d.ticker)!)
        .attr('y', (d) =>
          d.value !== null ? (d.value >= 0 ? y(d.value) : y(0)) : y(0)
        )
        .attr('width', x1.bandwidth() / (secondaryData.length ? 2 : 1))
        .attr('height', (d) =>
          d.value !== null ? Math.abs(y(0) - y(d.value)) : 0
        )
        .attr('rx', 8)
        .attr('fill', (d) => d.color)
        .attr('filter', `url(#${BAR_SHADOW_ID})`)
        .on('mouseover', function (event, d) {
          tooltip
            .style('opacity', 1)
            .html(
              `<strong style=\"color:#a78bfa\">${d.ticker}</strong><br/><span style=\"color:#ede9fe\">${dateToLabel[d.date]}</span><br/><span style=\"color:#f472b6\">${metric}: ${d.value !== null && d.value !== undefined ? formatAbbrev(d.value) : 'N/A'}</span>`
            )
            .style('left', event.offsetX + 20 + 'px')
            .style('top', event.offsetY + 'px');
          d3.select(this).attr('fill', '#f472b6');
        })
        .on('mousemove', function (event) {
          tooltip
            .style('left', event.offsetX + 20 + 'px')
            .style('top', event.offsetY + 'px');
        })
        .on('mouseout', function (_, d) {
          tooltip.style('opacity', 0);
          d3.select(this).attr('fill', d.color);
        });
      // Draw bars for secondary metric (striped/outlined, right axis)
      if (
        secondaryData.length &&
        y2 &&
        secondaryMetric &&
        secondaryMetric !== 'None'
      ) {
        svg
          .append('g')
          .selectAll('g')
          .data(allDateKeys)
          .enter()
          .append('g')
          .attr('transform', (d) => `translate(${x0(d)},0)`)
          .selectAll('rect')
          .data((dateKey) =>
            tickers.map((ticker, i) => {
              const series = normalizedSecondary.find(
                (s) => s.ticker === ticker
              );
              let value = null;
              if (series && series.grouped[dateKey]) {
                value = series.grouped[dateKey].value;
              }
              return {
                ticker,
                value,
                date: dateKey,
                color: COLORS[i % COLORS.length],
              };
            })
          )
          .enter()
          .append('rect')
          .attr('x', (d) => x1(d.ticker)! + x1.bandwidth() / 2)
          .attr('y', (d) =>
            d.value !== null ? (d.value >= 0 ? y2(d.value) : y2(0)) : y2(0)
          )
          .attr('width', x1.bandwidth() / 2)
          .attr('height', (d) =>
            d.value !== null ? Math.abs(y2(0) - y2(d.value)) : 0
          )
          .attr('fill', (d) => d.color)
          .attr('stroke', '#fff')
          .attr('stroke-width', 2)
          .attr('fill-opacity', 0.5)
          .on('mouseover', function (event, d) {
            tooltip
              .style('opacity', 1)
              .html(
                `<strong>${d.ticker}</strong><br/>${dateToLabel[d.date]}<br/>${secondaryMetric}: ${d.value !== null && d.value !== undefined ? formatAbbrev(d.value) : 'N/A'}`
              )
              .style('left', event.offsetX + 20 + 'px')
              .style('top', event.offsetY + 'px');
            d3.select(this).attr('fill', '#f472b6');
          })
          .on('mousemove', function (event) {
            tooltip
              .style('left', event.offsetX + 20 + 'px')
              .style('top', event.offsetY + 'px');
          })
          .on('mouseout', function (_, d) {
            tooltip.style('opacity', 0);
            d3.select(this).attr('fill', d.color);
          });
      }
      // Draw zero line for clarity (make purple)
      svg
        .append('line')
        .attr('x1', margin.left)
        .attr('x2', width - margin.right)
        .attr('y1', y(0))
        .attr('y2', y(0))
        .attr('stroke', '#a78bfa')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '4,2');
      // Axis labels
      svg
        .append('text')
        .attr('x', width / 2)
        .attr('y', height - 15)
        .attr('text-anchor', 'middle')
        .attr('fill', '#fff')
        .attr('font-size', 14)
        .text(interval === 'annual' ? 'Year' : 'Month');
      svg
        .append('text')
        .attr('transform', `rotate(-90)`)
        .attr('x', -height / 2)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .attr('fill', '#fff')
        .attr('font-size', 14)
        .text(metric);
      if (
        secondaryData.length &&
        secondaryMetric &&
        secondaryMetric !== 'None' &&
        y2
      ) {
        svg
          .append('text')
          .attr('transform', `rotate(-90)`)
          .attr('x', -height / 2)
          .attr('y', width - margin.right + 40)
          .attr('text-anchor', 'middle')
          .attr('fill', '#fff')
          .attr('font-size', 14)
          .text(secondaryMetric);
      }
      // Legend
      const legend = svg
        .append('g')
        .attr(
          'transform',
          `translate(${width - margin.right + 40},${margin.top})`
        ); // Move legend further right inside SVG
      tickers.forEach((ticker, i) => {
        legend
          .append('rect')
          .attr('x', 0)
          .attr('y', i * 24)
          .attr('width', 18)
          .attr('height', 18)
          .attr('fill', COLORS[i % COLORS.length]);
        legend
          .append('text')
          .attr('x', 26)
          .attr('y', i * 24 + 14)
          .attr('fill', '#fff')
          .attr('font-size', 14)
          .text(`${ticker} (${metric})`);
      });
      if (
        secondaryData.length &&
        secondaryMetric &&
        secondaryMetric !== 'None'
      ) {
        tickers.forEach((ticker, i) => {
          legend
            .append('rect')
            .attr('x', 0)
            .attr('y', (tickers.length + i) * 24)
            .attr('width', 18)
            .attr('height', 18)
            .attr('fill', COLORS[i % COLORS.length])
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
            .attr('fill-opacity', 0.5);
          legend
            .append('text')
            .attr('x', 26)
            .attr('y', (tickers.length + i) * 24 + 14)
            .attr('fill', '#fff')
            .attr('font-size', 14)
            .text(`${ticker} (${secondaryMetric})`);
        });
      }
    };

    drawChart(primaryData, secondaryData);
  }, [
    primaryData,
    secondaryData,
    dimensions.width,
    dimensions.height,
    containerWidth,
    containerHeight,
  ]);

  return (
    <div
      ref={ref}
      style={{
        width: containerWidth,
        height: containerHeight,
        minHeight: 320,
        minWidth: 0,
        position: 'relative',
      }}
      className="bar-chart-container"
    >
      {/* Chart will be rendered here by D3 using dimensions */}
      {/* ...existing code... */}
    </div>
  );
};

export default BarChart;
