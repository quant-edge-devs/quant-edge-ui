import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { fetchMetricValue } from '../../../api/FetchMetricValue';

type BarChartProps = {
  tickers: string[];
  metric: string;
  startDate: string;
  endDate: string;
};

const BarChart = ({ tickers, metric, startDate, endDate }: BarChartProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tickers.length || !metric) return;

    const fetchData = async () => {
      const promises = tickers.map((ticker) =>
        fetchMetricValue(metric, ticker, startDate, endDate)
      );
      const results = await Promise.all(promises);
      drawChart(results);
    };

    const drawChart = (data: { ticker: string; value: number }[]) => {
      d3.select(ref.current).selectAll('*').remove();

      const width = 300;
      const height = 180;
      const margin = { top: 20, right: 20, bottom: 40, left: 50 };

      const tooltip = d3
        .select(ref.current)
        .append('div')
        .style('position', 'absolute')
        .style('background', '#222')
        .style('color', '#fff')
        .style('padding', '6px 12px')
        .style('border-radius', '6px')
        .style('pointer-events', 'none')
        .style('font-size', '13px')
        .style('opacity', 0);

      const svg = d3
        .select(ref.current)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

      const x = d3
        .scaleBand()
        .domain(data.map((d) => d.ticker))
        .range([margin.left, width - margin.right])
        .padding(0.2);

      const y = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.value) || 1])
        .nice()
        .range([height - margin.bottom, margin.top]);

      svg
        .append('g')
        .attr('fill', '#a21caf')
        .selectAll('rect')
        .data(data)
        .join('rect')
        .attr('x', (d) => x(d.ticker)!)
        .attr('y', (d) => y(d.value))
        .attr('height', (d) => y(0) - y(d.value))
        .attr('width', x.bandwidth())
        .on('mouseover', function (event, d) {
          tooltip
            .style('opacity', 1)
            .html(
              `<strong>${d.ticker}</strong><br/>${metric}: ${formatValue(d.value)}`
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
        .on('mouseout', function () {
          tooltip.style('opacity', 0);
          d3.select(this).attr('fill', '#a21caf');
        });

      svg
        .append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .attr('fill', '#fff');

      svg
        .append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).tickFormat(formatValue as any))
        .selectAll('text')
        .attr('fill', '#fff');

      // X axis label
      svg
        .append('text')
        .attr('x', width / 2)
        .attr('y', height - 5)
        .attr('text-anchor', 'middle')
        .attr('fill', '#fff')
        .attr('font-size', 12)
        .text('Ticker');

      // Y axis label (dynamic)
      svg
        .append('text')
        .attr('transform', `rotate(-90)`)
        .attr('x', -height / 2)
        .attr('y', 5)
        .attr('text-anchor', 'middle')
        .attr('fill', '#fff')
        .attr('font-size', 12)
        .text(metric);
    };

    fetchData();
  }, [tickers, metric, startDate, endDate]);

  return <div ref={ref} />;
};

function formatValue(val: number) {
  if (Math.abs(val) >= 1e12) return (val / 1e12).toFixed(2) + 'T';
  if (Math.abs(val) >= 1e9) return (val / 1e9).toFixed(2) + 'B';
  if (Math.abs(val) >= 1e6) return (val / 1e6).toFixed(2) + 'M';
  if (Math.abs(val) >= 1e3) return (val / 1e3).toFixed(2) + 'K';
  return val.toString();
}

export default BarChart;
