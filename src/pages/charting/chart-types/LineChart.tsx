import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

type LineChartProps = {
  tickers: string[];
  metric: string;
  startDate: string;
  endDate: string;
};

const COLORS = d3.schemeCategory10;

function getQuarterLabel(dateStr: string) {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth();
  const quarter = Math.floor(month / 3) + 1;
  return `Q${quarter} ${year}`;
}

const LineChart = ({ metric, tickers, startDate, endDate }: LineChartProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tickers.length) return;

    const fetchData = async () => {
      const promises = tickers.map(async (ticker) => {
        // Fetch all data points for this ticker and metric
        const response = await fetch(
          // Use the same endpoint logic as in FetchMetricValue, but for a range
          `http://localhost:8080/api/stocks/${
            metric === 'Price To Earnings Ratio'
              ? 'pe'
              : metric === 'Price To Sales Ratio'
                ? 'ps'
                : metric === 'Market Cap'
                  ? 'marketCapHistory'
                  : metric === 'Dividend Yield (%)'
                    ? 'dividendInfo'
                    : metric === 'Earnings Per Share'
                      ? 'eps'
                      : ''
          }/${ticker}/${startDate}/${endDate}`
        );
        const data = await response.json();
        // Map to { date, value } using fetchMetricValue logic
        let points: { date: string; value: number }[] = [];
        if (Array.isArray(data)) {
          points = data.map((d: any) => {
            let value = null;
            if (metric === 'Market Cap') value = d.marketCap;
            else if (metric === 'Price To Sales Ratio') value = d.psRatio;
            else if (metric === 'Price To Earnings Ratio') value = d.peRatio;
            else if (metric === 'Dividend Yield (%)') value = d.yield;
            else if (metric === 'Earnings Per Share') value = d.eps;
            return { date: d.date, value };
          });
        }
        return { ticker, points };
      });
      const results = await Promise.all(promises);
      drawChart(results);
    };

    const drawChart = (
      data: { ticker: string; points: { date: string; value: number }[] }[]
    ) => {
      d3.select(ref.current).selectAll('*').remove();

      const container = ref.current;
      const width =
        container && container.offsetWidth ? container.offsetWidth : 700;
      const height =
        container && container.offsetHeight ? container.offsetHeight : 400;
      const margin = { top: 40, right: 120, bottom: 60, left: 60 };

      // Get all unique dates
      const allDates = Array.from(
        new Set(data.flatMap((d) => d.points.map((p) => p.date)))
      ).sort();

      // Map each date to its quarter label
      const dateToQuarter = Object.fromEntries(
        allDates.map((d) => [d, getQuarterLabel(d)])
      );

      // Get unique quarters in order
      const allQuarters = Array.from(
        new Set(allDates.map((d) => dateToQuarter[d]))
      );

      // For x scale, use allDates, but for ticks, use one date per quarter
      const quarterFirstDates = allQuarters.map((q) =>
        allDates.find((d) => dateToQuarter[d] === q)
      );

      // X scale (dates)
      const x = d3
        .scalePoint()
        .domain(allDates)
        .range([margin.left, width - margin.right]);

      const y = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d3.max(d.points, (p) => p.value)) || 1])
        .nice()
        .range([height - margin.bottom, margin.top]);

      const svg = d3
        .select(ref.current)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

      // Axes
      svg
        .append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(
          d3
            .axisBottom(x)
            .tickValues(quarterFirstDates as string[])
            .tickFormat((d) => dateToQuarter[d as string])
        )
        .selectAll('text')
        .attr('fill', '#fff')
        .attr('transform', 'rotate(-30)')
        .style('text-anchor', 'end');

      svg
        .append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .selectAll('text')
        .attr('fill', '#fff');

      // Axis labels
      svg
        .append('text')
        .attr('x', width / 2)
        .attr('y', height - 15)
        .attr('text-anchor', 'middle')
        .attr('fill', '#fff')
        .attr('font-size', 14)
        .text('Quarter');

      svg
        .append('text')
        .attr('transform', `rotate(-90)`)
        .attr('x', -height / 2)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .attr('fill', '#fff')
        .attr('font-size', 14)
        .text(metric);

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

      // Line generator
      const line = d3
        .line<{ date: string; value: number }>()
        .x((d) => x(d.date)!)
        .y((d) => y(d.value));

      // Draw lines and points for each ticker
      data.forEach((series, i) => {
        svg
          .append('path')
          .datum(series.points)
          .attr('fill', 'none')
          .attr('stroke', COLORS[i % COLORS.length])
          .attr('stroke-width', 2)
          .attr('d', line);

        svg
          .selectAll(`.point-${series.ticker}`)
          .data(series.points)
          .enter()
          .append('circle')
          .attr('cx', (d) => x(d.date)!)
          .attr('cy', (d) => y(d.value))
          .attr('r', 3)
          .attr('fill', COLORS[i % COLORS.length])
          .on('mouseover', function (event, d) {
            d3.select(ref.current)
              .select('.tooltip')
              .style('opacity', 1)
              .html(
                `<strong>${series.ticker}</strong><br/>${getQuarterLabel(
                  d.date
                )}<br/>${metric}: ${d.value !== null && d.value !== undefined ? d.value.toFixed(2) : 'N/A'}`
              )
              .style('left', event.offsetX + 20 + 'px')
              .style('top', event.offsetY + 'px');
          })
          .on('mouseout', function () {
            d3.select(ref.current).select('.tooltip').style('opacity', 0);
          });
      });

      // Legend
      const legend = svg
        .append('g')
        .attr(
          'transform',
          `translate(${width - margin.right + 20},${margin.top})`
        );

      data.forEach((series, i) => {
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
          .text(series.ticker);
      });
    };

    fetchData();
  }, [tickers, startDate, endDate, metric]);

  return <div ref={ref} />;
};

export default LineChart;
