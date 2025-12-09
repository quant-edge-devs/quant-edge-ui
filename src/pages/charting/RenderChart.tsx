import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { fetchMetricValue } from '../../api/FetchMetricValue';

type ChartProps = {
  tickers: string[];
  metric: string;
  startDate: string;
  endDate: string;
};

const Chart = ({ tickers, metric, startDate, endDate }: ChartProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tickers.length || !metric) return;

    // Fetch metric data for each ticker
    const fetchData = async () => {
      const promises = tickers.map((ticker) =>
        fetchMetricValue(metric, ticker, startDate)
      );
      const results = await Promise.all(promises);
      drawChart(results);
    };

    const drawChart = (data: { ticker: string; value: number }[]) => {
      d3.select(ref.current).selectAll('*').remove();

      const width = 300;
      const height = 180;
      const margin = { top: 20, right: 20, bottom: 40, left: 50 };

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
        .attr('width', x.bandwidth());

      svg
        .append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .attr('fill', '#fff');

      svg
        .append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .selectAll('text')
        .attr('fill', '#fff');
    };

    fetchData();
  }, [tickers, metric, startDate, endDate]);

  return <div ref={ref} />;
};

export default Chart;
