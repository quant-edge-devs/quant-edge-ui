import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

type LineChartProps = {
  tickers: string[];
  metric: string; // Should be "Price To Earnings Ratio"
  startDate: string;
  endDate: string;
};

const COLORS = d3.schemeCategory10;

const LineChart = ({ tickers, startDate, endDate }: LineChartProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tickers.length) return;

    const fetchData = async () => {
      // Fetch data for all tickers
      const promises = tickers.map(async (ticker) => {
        const response = await fetch(
          `http://localhost:8080/api/stocks/pe/${ticker}/${startDate}/${endDate}`
        );
        const data = await response.json();
        // Group by ticker
        return {
          ticker,
          points: data
            .filter((d: any) => d.ticker === ticker)
            .map((d: any) => ({
              date: d.date,
              value: d.peRatio,
            })),
        };
      });
      const results = await Promise.all(promises);
      drawChart(results);
    };

    const drawChart = (
      data: { ticker: string; points: { date: string; value: number }[] }[]
    ) => {
      d3.select(ref.current).selectAll('*').remove();

      const width = 400;
      const height = 220;
      const margin = { top: 30, right: 80, bottom: 40, left: 50 };

      // Get all unique dates
      const allDates = Array.from(
        new Set(data.flatMap((d) => d.points.map((p) => p.date)))
      ).sort();

      // X scale (dates)
      const x = d3
        .scalePoint()
        .domain(allDates)
        .range([margin.left, width - margin.right]);

      // Y scale (PE Ratio)
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
            .tickFormat((d) => d3.timeFormat('%Y-%m-%d')(new Date(d as string)))
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
        .attr('y', height - 5)
        .attr('text-anchor', 'middle')
        .attr('fill', '#fff')
        .attr('font-size', 12)
        .text('Date');

      svg
        .append('text')
        .attr('transform', `rotate(-90)`)
        .attr('x', -height / 2)
        .attr('y', 15)
        .attr('text-anchor', 'middle')
        .attr('fill', '#fff')
        .attr('font-size', 12)
        .text('PE Ratio');

      // Line generator
      const line = d3
        .line<{ date: string; value: number }>()
        .x((d) => x(d.date)!)
        .y((d) => y(d.value));

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
                `<strong>${series.ticker}</strong><br/>${d.date}<br/>PE Ratio: ${d.value.toFixed(
                  2
                )}`
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
          `translate(${width - margin.right + 10},${margin.top})`
        );

      data.forEach((series, i) => {
        legend
          .append('rect')
          .attr('x', 0)
          .attr('y', i * 20)
          .attr('width', 14)
          .attr('height', 14)
          .attr('fill', COLORS[i % COLORS.length]);

        legend
          .append('text')
          .attr('x', 20)
          .attr('y', i * 20 + 11)
          .attr('fill', '#fff')
          .attr('font-size', 12)
          .text(series.ticker);
      });
    };

    fetchData();
  }, [tickers, startDate, endDate]);

  return <div ref={ref} />;
};

export default LineChart;
