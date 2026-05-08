import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import * as d3 from 'd3';

type HeatmapChartProps = {
  tickers: string[];
  matrix: number[][];
  containerWidth?: string | number;
  containerHeight?: string | number;
};

function corrLabel(r: number) {
  const abs = Math.abs(r);
  const dir = r >= 0 ? 'positive' : 'negative';
  if (abs >= 0.9) return `Very strong ${dir}`;
  if (abs >= 0.7) return `Strong ${dir}`;
  if (abs >= 0.5) return `Moderate ${dir}`;
  if (abs >= 0.3) return `Weak ${dir}`;
  return 'Very weak / no correlation';
}

function cellColor(r: number, isDark: boolean): string {
  const neutral = isDark ? [30, 27, 60] : [245, 243, 255];
  const target = r >= 0 ? [124, 58, 237] : [239, 68, 68];
  const t = Math.abs(r);
  const rgb = neutral.map((n, i) => Math.round(n + (target[i] - n) * t));
  return `rgb(${rgb.join(',')})`;
}

function valTextColor(r: number, isDark: boolean): string {
  if (isDark) return 'rgba(255,255,255,0.9)';
  return Math.abs(r) > 0.55 ? 'rgba(255,255,255,0.92)' : 'rgba(30,27,75,0.85)';
}

const HeatmapChart = ({
  tickers,
  matrix,
  containerWidth = '100%',
  containerHeight = '100%',
}: HeatmapChartProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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

  useEffect(() => {
    const container = ref.current;
    if (!container || !tickers.length || !matrix.length) return;
    d3.select(container).selectAll('*').remove();

    const W = dimensions.width || container.offsetWidth || 600;
    const H = dimensions.height || container.offsetHeight || 500;
    if (W < 100 || H < 80) return;

    const n = tickers.length;
    const margin = { top: 72, right: 24, bottom: 48, left: 72 };
    const innerW = W - margin.left - margin.right;
    const innerH = H - margin.top - margin.bottom;
    const cellW = innerW / n;
    const cellH = innerH / n;

    const svg = d3
      .select(container)
      .append('svg')
      .attr('width', W)
      .attr('height', H)
      .style('display', 'block');

    const plot = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const textColor = isDark ? 'rgba(255,255,255,0.65)' : 'rgba(30,27,75,0.72)';
    const dimTextColor = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(30,27,75,0.38)';
    const tooltipBg = isDark ? 'rgba(10,8,20,0.92)' : 'rgba(255,255,255,0.96)';
    const tooltipTextColor = isDark ? '#e2e8f0' : '#1a1a2e';

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

    // Column headers
    tickers.forEach((t, j) => {
      plot
        .append('text')
        .attr('x', j * cellW + cellW / 2)
        .attr('y', -14)
        .attr('text-anchor', 'middle')
        .attr('fill', textColor)
        .attr('font-size', Math.min(13, cellW / t.length + 4) + 'px')
        .attr('font-weight', '600')
        .attr('font-family', 'inherit')
        .text(t);
    });

    // Row labels
    tickers.forEach((t, i) => {
      plot
        .append('text')
        .attr('x', -14)
        .attr('y', i * cellH + cellH / 2)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .attr('fill', textColor)
        .attr('font-size', Math.min(13, cellH / t.length + 4) + 'px')
        .attr('font-weight', '600')
        .attr('font-family', 'inherit')
        .text(t);
    });

    // Cells
    matrix.forEach((row, i) => {
      row.forEach((r, j) => {
        const x = j * cellW;
        const y = i * cellH;
        const isDiag = i === j;
        const cellG = plot.append('g');

        cellG
          .append('rect')
          .attr('x', x + 2)
          .attr('y', y + 2)
          .attr('width', cellW - 4)
          .attr('height', cellH - 4)
          .attr('rx', 8)
          .attr('fill', cellColor(r, isDark))
          .attr('stroke', isDiag ? 'rgba(168,85,247,0.55)' : 'none')
          .attr('stroke-width', isDiag ? 1.5 : 0);

        const fontSize = Math.max(9, Math.min(13, Math.min(cellW, cellH) * 0.22));
        cellG
          .append('text')
          .attr('x', x + cellW / 2)
          .attr('y', y + cellH / 2)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('fill', valTextColor(r, isDark))
          .attr('font-size', fontSize + 'px')
          .attr('font-weight', '700')
          .attr('font-family', 'inherit')
          .text(isNaN(r) ? '—' : r.toFixed(2));

        // Transparent hover target
        cellG
          .append('rect')
          .attr('x', x + 2)
          .attr('y', y + 2)
          .attr('width', cellW - 4)
          .attr('height', cellH - 4)
          .attr('rx', 8)
          .attr('fill', 'transparent')
          .on('pointerenter', function (event) {
            const [mx, my] = d3.pointer(event, container);
            tooltip
              .style('opacity', '1')
              .html(
                `<div style="margin-bottom:4px;font-size:11px;color:${isDark ? 'rgba(255,255,255,0.4)' : '#64748b'}">${tickers[i]} × ${tickers[j]}</div>` +
                  `<span style="font-size:16px;font-weight:700">${isNaN(r) ? '—' : r.toFixed(4)}</span><br/>` +
                  `<span style="font-size:11px;color:${isDark ? 'rgba(255,255,255,0.45)' : '#64748b'}">${isNaN(r) ? 'Insufficient data' : corrLabel(r)}</span>`
              )
              .style('left', `${mx + 14}px`)
              .style('top', `${my - 14}px`);
          })
          .on('pointerleave', () => tooltip.style('opacity', '0'));
      });
    });

    // Color legend bar
    const legW = Math.min(220, innerW * 0.5);
    const legH = 7;
    const legX = margin.left + innerW - legW;
    const legY = H - 18;

    const defs = svg.append('defs');
    const legGrad = defs
      .append('linearGradient')
      .attr('id', 'corr-leg-grad')
      .attr('x1', '0')
      .attr('x2', '1');
    legGrad.append('stop').attr('offset', '0%').attr('stop-color', '#ef4444');
    legGrad
      .append('stop')
      .attr('offset', '50%')
      .attr('stop-color', isDark ? 'rgb(30,27,60)' : 'rgb(245,243,255)');
    legGrad.append('stop').attr('offset', '100%').attr('stop-color', '#7c3aed');

    svg
      .append('rect')
      .attr('x', legX)
      .attr('y', legY)
      .attr('width', legW)
      .attr('height', legH)
      .attr('rx', 4)
      .attr('fill', 'url(#corr-leg-grad)');

    [
      { x: legX, anchor: 'start', label: '−1' },
      { x: legX + legW / 2, anchor: 'middle', label: '0' },
      { x: legX + legW, anchor: 'end', label: '+1' },
    ].forEach(({ x, anchor, label }) => {
      svg
        .append('text')
        .attr('x', x)
        .attr('y', legY - 5)
        .attr('text-anchor', anchor)
        .attr('fill', dimTextColor)
        .attr('font-size', '10px')
        .attr('font-family', 'inherit')
        .text(label);
    });
  }, [tickers, matrix, dimensions.width, dimensions.height, isDark]);

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

export default HeatmapChart;
