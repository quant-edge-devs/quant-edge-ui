import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type BarChartProps = {
  tickers: string[];
  metric: string;
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
  startDate,
  endDate,
  interval = 'quarter',
  setLoading,
}: BarChartProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tickers.length || !metric) return;
    const fetchData = async () => {
      const promises = tickers.map(async (ticker) => {
        const endpoint =
          metric === 'Market Cap'
            ? `${API_BASE_URL}/stocks/marketCapHistory/${ticker}/${startDate}/${endDate}`
            : `${API_BASE_URL}/stocks/${
                metric === 'Price To Earnings Ratio'
                  ? 'pe'
                  : metric === 'Price To Sales Ratio'
                    ? 'ps'
                    : metric === 'Dividend Yield (%)'
                      ? 'dividendInfo'
                      : metric === 'Earnings Per Share'
                        ? 'eps'
                        : metric === 'Revenues'
                          ? 'revenues'
                          : metric === 'Net Income'
                            ? 'netIncome'
                            : ''
              }/${ticker}/${startDate}/${endDate}/${interval}`;
        const response = await fetch(endpoint);
        const data = await response.json();
        let points: { date: string; value: number }[] = [];
        if (
          metric === 'Revenues' &&
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
            if (metric === 'Market Cap') value = d.marketCap;
            else if (metric === 'Price To Sales Ratio') value = d.psRatio;
            else if (metric === 'Price To Earnings Ratio') value = d.peRatio;
            else if (metric === 'Dividend Yield (%)') value = d.yield;
            else if (metric === 'Earnings Per Share') value = d.eps;
            else if (metric === 'Net Income') value = d.ttmNetIncome;
            return { date: d.date, value };
          });
        }
        return { ticker, points };
      });
      const results = await Promise.all(promises);
      drawChart(results);
      setLoading?.(false);
    };

    const drawChart = (
      data: { ticker: string; points: { date: string; value: number }[] }[]
    ) => {
      d3.select(ref.current).selectAll('*').remove();

      const container = ref.current;
      const width =
        container && container.offsetWidth ? container.offsetWidth : 700;
      const height = 400;
      const margin = { top: 40, right: 120, bottom: 60, left: 60 };

      // Get all unique dates
      const allDates = Array.from(
        new Set(data.flatMap((d) => d.points.map((p) => p.date)))
      ).sort();

      // Map each date to its x-axis label
      const dateToLabel = Object.fromEntries(
        allDates.map((d) => [d, getXAxisLabel(d, interval)])
      );

      // Get unique labels in order
      const allLabels = Array.from(
        new Set(allDates.map((d) => dateToLabel[d]))
      );

      // For x axis ticks, use one date per label
      const labelFirstDates = allLabels.map((lbl) =>
        allDates.find((d) => dateToLabel[d] === lbl)
      );

      // X scale (dates)
      const x0 = d3
        .scaleBand()
        .domain(allDates)
        .range([margin.left, width - margin.right])
        .padding(0.2);

      // X1: for tickers within each date
      const x1 = d3
        .scaleBand()
        .domain(tickers)
        .range([0, x0.bandwidth()])
        .padding(0.1);

      // Y scale
      // Ensure y-axis always includes zero
      const yMin = d3.min(data, (d) => d3.min(d.points, (p) => p.value)) ?? 0;
      const yMax = d3.max(data, (d) => d3.max(d.points, (p) => p.value)) ?? 1;
      const yDomainMin = Math.min(0, yMin);
      const yDomainMax = Math.max(0, yMax);
      const y = d3
        .scaleLinear()
        .domain([yDomainMin, yDomainMax])
        .nice()
        .range([height - margin.bottom, margin.top]);

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
        .attr('height', height);

      // Axes
      svg
        .append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).tickFormat(formatAbbrev))
        .selectAll('text')
        .attr('fill', '#fff');

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

      // Draw bars
      svg
        .append('g')
        .selectAll('g')
        .data(allDates)
        .enter()
        .append('g')
        .attr('transform', (d) => `translate(${x0(d)},0)`)
        .selectAll('rect')
        .data((date) =>
          data.map((series) => ({
            ticker: series.ticker,
            value: series.points.find((p) => p.date === date)?.value ?? null,
            date,
          }))
        )
        .enter()
        .append('rect')
        .attr('x', (d) => x1(d.ticker)!)
        .attr('y', (d) =>
          d.value !== null ? (d.value >= 0 ? y(d.value) : y(0)) : y(0)
        )
        .attr('width', x1.bandwidth())
        .attr('height', (d) =>
          d.value !== null ? Math.abs(y(0) - y(d.value)) : 0
        )
        .attr('fill', (d) => COLORS[tickers.indexOf(d.ticker) % COLORS.length])
        .on('mouseover', function (event, d) {
          tooltip
            .style('opacity', 1)
            .html(
              `<strong>${d.ticker}</strong><br/>${getXAxisLabel(d.date, interval)}<br/>${metric}: ${d.value !== null && d.value !== undefined ? formatAbbrev(d.value) : 'N/A'}`
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
          d3.select(this).attr(
            'fill',
            COLORS[tickers.indexOf(d.ticker) % COLORS.length]
          );
        });

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

      // Legend
      const legend = svg
        .append('g')
        .attr(
          'transform',
          `translate(${width - margin.right + 20},${margin.top})`
        );

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
          .text(ticker);
      });
    };

    fetchData();
  }, [tickers, metric, startDate, endDate, interval]);

  return <div ref={ref} />;
};

export default BarChart;
