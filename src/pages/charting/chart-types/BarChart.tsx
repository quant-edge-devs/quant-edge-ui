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
};

const COLORS = d3.schemeCategory10;

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

const BarChart = ({
  tickers,
  metric,
  secondaryMetric,
  startDate,
  endDate,
  interval = 'quarter',
  setLoading,
}: BarChartProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
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
    setLoading?.(true);
    Promise.all([
      fetchMetricData(metric),
      secondaryMetric && secondaryMetric !== 'None'
        ? fetchMetricData(secondaryMetric)
        : Promise.resolve([]),
    ]).then(([primaryData, secondaryData]) => {
      drawChart(primaryData, secondaryData);
      setLoading?.(false);
    });

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
      const pageWidth = windowSize.width;
      const pageHeight = windowSize.height;
      const width = Math.floor(pageWidth * 0.85); // Shrink SVG width for legend
      const height = Math.floor(pageHeight * 0.8);
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
          'border-radius: 24px; background: #231133; box-shadow: 0 4px 24px #00000033;'
        );

      // Gradient fill for bars
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
          { offset: '0%', color: '#a78bfa', opacity: 0.8 },
          { offset: '100%', color: '#a78bfa', opacity: 0.3 },
        ])
        .enter()
        .append('stop')
        .attr('offset', (d) => d.offset)
        .attr('stop-color', (d) => d.color)
        .attr('stop-opacity', (d) => d.opacity);

      // Drop shadow filter for bars
      svg.append('defs').append('filter').attr('id', BAR_SHADOW_ID).html(`
          <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#a78bfa" flood-opacity="0.3" />
        `);

      // Grid lines
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
        .attr('stroke', '#fff')
        .attr('stroke-opacity', 0.12)
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

      // Tooltip
      const tooltip = d3
        .select(ref.current)
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
              `<strong>${d.ticker}</strong><br/>${dateToLabel[d.date]}<br/>${metric}: ${d.value !== null && d.value !== undefined ? formatAbbrev(d.value) : 'N/A'}`
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
      // Draw zero line for clarity
      svg
        .append('line')
        .attr('x1', margin.left)
        .attr('x2', width - margin.right)
        .attr('y1', y(0))
        .attr('y2', y(0))
        .attr('stroke', '#888')
        .attr('stroke-width', 1)
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
  }, [
    tickers.join(','),
    metric,
    secondaryMetric,
    startDate,
    endDate,
    interval,
    windowSize.width,
    windowSize.height,
  ]);

  return <div ref={ref} />;
};

export default BarChart;
