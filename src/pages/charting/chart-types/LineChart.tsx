import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type LineChartProps = {
  tickers: string[];
  metric: string;
  secondaryMetric?: string;
  startDate: string;
  endDate: string;
  interval?: string; // Add interval prop
  setLoading?: (loading: boolean) => void;
};

const COLORS = d3.schemeCategory10;
const GRADIENT_ID = 'line-gradient';
const SHADOW_ID = 'line-shadow';

function getXAxisLabel(dateStr: string, interval: string) {
  if (interval === 'annual') {
    // Just the year
    return dateStr.slice(0, 4);
  }
  // Quarterly: show month and year
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
  }
  return dateStr;
}

const LineChart = ({
  metric,
  secondaryMetric,
  tickers,
  startDate,
  endDate,
  interval = 'quarter', // Set default value for interval
  setLoading,
}: LineChartProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  // Fix: store tickers as a string in the cache
  const lastFetchParams = useRef({
    tickers: '',
    metric: '',
    secondaryMetric: '',
    startDate: '',
    endDate: '',
    interval: '',
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Only fetch if params actually changed
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
    if (!tickers.length) return;
    const fetchData = async () => {
      // Fetch data for both metrics if secondaryMetric is set and not 'None'
      const fetchMetricData = async (metricName: string) => {
        const promises = tickers.map(async (ticker) => {
          // Build endpoint, only add interval for metrics that support it
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
      setLoading?.(true);
      const [primaryData, secondaryData] = await Promise.all([
        fetchMetricData(metric),
        secondaryMetric && secondaryMetric !== 'None'
          ? fetchMetricData(secondaryMetric)
          : Promise.resolve([]),
      ]);
      drawChart(primaryData, secondaryData);
      setLoading?.(false);
    };

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
      d3.select(ref.current).selectAll('*').remove();
      const container = ref.current;
      // Chart sizing and margins (match BarChart)
      const pageWidth = windowSize.width;
      const pageHeight = windowSize.height;
      const width = Math.floor(pageWidth * 0.8);
      const height = Math.floor(pageHeight * 0.8);
      const margin = {
        top: 40,
        right: 320,
        bottom: 60,
        left: 60,
      };

      // --- Date Normalization & Grouping ---
      function getDateKey(dateStr: string, interval: string) {
        if (interval === 'annual') return dateStr.slice(0, 4);
        return dateStr.slice(0, 7); // YYYY-MM
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
      // 2. For each ticker, for each date key, pick the last value in that month/year
      function groupPointsByDateKey(
        points: { date: string; value: number }[],
        interval: string
      ) {
        const grouped: Record<string, { date: string; value: number }> = {};
        points.forEach((p) => {
          const key = getDateKey(p.date, interval);
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
          const [year, month] = d.split('-');
          const dateObj = new Date(Number(year), Number(month) - 1, 1);
          const label = dateObj.toLocaleString('en-US', {
            month: 'short',
            year: 'numeric',
          });
          return [d, label];
        })
      );
      // For x scale, use allDateKeys, but for ticks, use one date per label
      const allLabels = Array.from(
        new Set(allDateKeys.map((d) => dateToLabel[d]))
      );
      const labelFirstDates = allLabels.map((lbl) =>
        allDateKeys.find((d) => dateToLabel[d] === lbl)
      );
      // X scale (dates)
      const x = d3
        .scalePoint()
        .domain(allDateKeys)
        .range([margin.left, width - margin.right]);
      // Y scales
      const yMin =
        d3.min(normalizedPrimary, (d) =>
          d3.min(Object.values(d.grouped), (p) => p.value)
        ) ?? 0;
      const yMax =
        d3.max(normalizedPrimary, (d) =>
          d3.max(Object.values(d.grouped), (p) => p.value)
        ) ?? 1;
      const yDomainMin = Math.min(0, yMin);
      const yDomainMax = Math.max(0, yMax);
      const y = d3
        .scaleLinear()
        .domain([yDomainMin, yDomainMax])
        .nice()
        .range([height - margin.bottom, margin.top]);
      let y2, y2Min, y2Max;
      if (normalizedSecondary.length) {
        y2Min =
          d3.min(normalizedSecondary, (d) =>
            d3.min(Object.values(d.grouped), (p) => p.value)
          ) ?? 0;
        y2Max =
          d3.max(normalizedSecondary, (d) =>
            d3.max(Object.values(d.grouped), (p) => p.value)
          ) ?? 1;
        y2 = d3
          .scaleLinear()
          .domain([Math.min(0, y2Min), Math.max(0, y2Max)])
          .nice()
          .range([height - margin.bottom, margin.top]);
      }
      const svg = d3
        .select(ref.current)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr(
          'style',
          'border-radius: 24px; background: #231133; box-shadow: 0 4px 24px #00000033;'
        );

      // Gradient fill
      svg
        .append('defs')
        .append('linearGradient')
        .attr('id', GRADIENT_ID)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%')
        .selectAll('stop')
        .data([
          { offset: '0%', color: '#a78bfa', opacity: 0.4 },
          { offset: '100%', color: '#a78bfa', opacity: 0 },
        ])
        .enter()
        .append('stop')
        .attr('offset', (d) => d.offset)
        .attr('stop-color', (d) => d.color)
        .attr('stop-opacity', (d) => d.opacity);

      // Drop shadow filter
      svg.append('defs').append('filter').attr('id', SHADOW_ID).html(`
          <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#a78bfa" flood-opacity="0.3" />
        `);

      // Y-axis number formatter
      const formatAbbrev = (domainValue: d3.NumberValue) => {
        const num =
          typeof domainValue === 'number'
            ? domainValue
            : Number(domainValue.valueOf());
        if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
        if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
        return num.toString();
      };

      // Axes
      svg
        .append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).tickFormat(formatAbbrev))
        .selectAll('text')
        .attr('fill', '#fff');
      if (normalizedSecondary.length && y2) {
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
            .axisBottom(x)
            .tickValues(labelFirstDates as string[])
            .tickFormat((d) => dateToLabel[d as string])
        )
        .selectAll('text')
        .attr('fill', '#fff')
        .attr('transform', 'rotate(-30)')
        .style('text-anchor', 'end');

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
      if (secondaryData.length && secondaryMetric && y2) {
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

      // Tooltip div
      d3.select(ref.current)
        .append('div')
        .attr('class', 'tooltip')
        .style('position', 'absolute')
        .style('background', '#222')
        .style('color', '#fff')
        .style('padding', '6px 12px')
        .style('border-radius', '6px')
        .style('pointer-events', 'none')
        .style('font-size', '13px')
        .style('opacity', 0);

      // Line generator (rounded ends)
      const line = d3
        .line<{ date: string; value: number }>()
        .x((d) => x(getDateKey(d.date, interval))!)
        .y((d) => y(d.value))
        .curve(d3.curveMonotoneX);
      const line2 = y2
        ? d3
            .line<{ date: string; value: number }>()
            .x((d) => x(getDateKey(d.date, interval))!)
            .y((d) => y2!(d.value))
        : null;

      // Draw lines and points for each ticker (primary metric, solid)
      normalizedPrimary.forEach((series, i) => {
        // REMOVE Area gradient fill for classic line chart
        // svg
        //   .append('path')
        //   .datum(Object.values(series.grouped))
        //   .attr('fill', `url(#${GRADIENT_ID})`)
        //   .attr('stroke', 'none')
        //   .attr(
        //     'd',
        //     d3
        //       .area<{ date: string; value: number }>()
        //       .x((d) => x(getDateKey(d.date, interval))!)
        //       .y0(y(0))
        //       .y1((d) => y(d.value))
        //       .curve(d3.curveMonotoneX)
        //   );
        // Line with shadow
        svg
          .append('path')
          .datum(Object.values(series.grouped))
          .attr('fill', 'none')
          .attr('stroke', COLORS[i % COLORS.length])
          .attr('stroke-width', 4)
          .attr('stroke-linecap', 'round')
          .attr('filter', `url(#${SHADOW_ID})`)
          .attr('d', line);
        // Points
        svg
          .selectAll(`.point-primary-${series.ticker}`)
          .data(Object.values(series.grouped))
          .enter()
          .append('circle')
          .attr('cx', (d) => x(getDateKey(d.date, interval))!)
          .attr('cy', (d) => y(d.value))
          .attr('r', 7)
          .attr('fill', '#a78bfa')
          .attr('stroke', '#fff')
          .attr('stroke-width', 2)
          .on('mouseover', function (event, d) {
            d3.select(ref.current)
              .select('.tooltip')
              .style('opacity', 1)
              .html(
                `<strong>${series.ticker}</strong><br/>${dateToLabel[getDateKey(d.date, interval)]}<br/>${metric}: ${d.value !== null && d.value !== undefined ? d.value.toFixed(2) : 'N/A'}`
              )
              .style('left', event.offsetX + 20 + 'px')
              .style('top', event.offsetY + 'px');
            d3.select(this).attr('fill', '#f472b6');
          })
          .on('mouseout', function () {
            d3.select(ref.current).select('.tooltip').style('opacity', 0);
            d3.select(this).attr('fill', '#a78bfa');
          });
      });
      // Draw lines and points for each ticker (secondary metric, dotted)
      if (
        normalizedSecondary.length &&
        y2 &&
        secondaryMetric &&
        secondaryMetric !== 'None'
      ) {
        normalizedSecondary.forEach((series, i) => {
          svg
            .append('path')
            .datum(Object.values(series.grouped))
            .attr('fill', 'none')
            .attr('stroke', COLORS[i % COLORS.length])
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '6,4')
            .attr('d', line2!);
          svg
            .selectAll(`.point-secondary-${series.ticker}`)
            .data(Object.values(series.grouped))
            .enter()
            .append('circle')
            .attr('cx', (d) => x(getDateKey(d.date, interval))!)
            .attr('cy', (d) => y2!(d.value))
            .attr('r', 6)
            .attr('fill', COLORS[i % COLORS.length])
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
            .on('mouseover', function (event, d) {
              d3.select(ref.current)
                .select('.tooltip')
                .style('opacity', 1)
                .html(
                  `<strong>${series.ticker}</strong><br/>${dateToLabel[getDateKey(d.date, interval)]}<br/>${secondaryMetric}: ${d.value !== null && d.value !== undefined ? d.value.toFixed(2) : 'N/A'}`
                )
                .style('left', event.offsetX + 20 + 'px')
                .style('top', event.offsetY + 'px');
              d3.select(this).attr('fill', '#f472b6');
            })
            .on('mouseout', function () {
              d3.select(ref.current).select('.tooltip').style('opacity', 0);
              d3.select(this).attr('fill', COLORS[i % COLORS.length]);
            });
        });
      }
      // Draw zero line if zero is within the domain
      if (yMin < 0 || yMax > 0) {
        svg
          .append('line')
          .attr('x1', margin.left)
          .attr('x2', width - margin.right)
          .attr('y1', y(0))
          .attr('y2', y(0))
          .attr('stroke', '#888')
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '4,2');
      }
      // Legend
      const legend = svg
        .append('g')
        .attr(
          'transform',
          `translate(${width - margin.right + 80},${margin.top})`
        );
      primaryData.forEach((series, i) => {
        legend
          .append('rect')
          .attr('x', 0)
          .attr('y', i * 24)
          .attr('width', 18)
          .attr('height', 6)
          .attr('fill', COLORS[i % COLORS.length]);
        legend
          .append('text')
          .attr('x', 26)
          .attr('y', i * 24 + 14)
          .attr('fill', '#fff')
          .attr('font-size', 14)
          .text(`${series.ticker} (${metric})`);
      });
      if (
        secondaryData.length &&
        secondaryMetric &&
        secondaryMetric !== 'None'
      ) {
        secondaryData.forEach((series, i) => {
          legend
            .append('rect')
            .attr('x', 0)
            .attr('y', (primaryData.length + i) * 24)
            .attr('width', 18)
            .attr('height', 6)
            .attr('fill', COLORS[i % COLORS.length])
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '6,4');
          legend
            .append('text')
            .attr('x', 26)
            .attr('y', (primaryData.length + i) * 24 + 14)
            .attr('fill', '#fff')
            .attr('font-size', 14)
            .text(`${series.ticker} (${secondaryMetric})`);
        });
      }
    };
    fetchData();
  }, [
    tickers.join(','),
    startDate,
    endDate,
    metric,
    secondaryMetric,
    interval,
    windowSize.width,
    windowSize.height,
  ]);
  return <div ref={ref} />;
};

export default LineChart;
