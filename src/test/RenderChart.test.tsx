import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Chart from '../pages/charting/RenderChart';

// Stub heavy D3 chart components so tests don't need real DOM sizing
vi.mock('../pages/charting/chart-types/LineChart', () => ({
  default: (props: any) => <div data-testid="line-chart" data-metric={props.metric} />,
}));

vi.mock('../pages/charting/chart-types/BarChart', () => ({
  default: (props: any) => <div data-testid="bar-chart" data-metric={props.metric} />,
}));

vi.mock('../pages/charting/chart-types/BubbleChart', () => ({
  default: (props: any) => (
    <div data-testid="bubble-chart" data-xmetric={props.xMetric} data-ymetric={props.yMetric} />
  ),
}));

const baseProps = {
  tickers: ['AAPL'],
  metric: 'Revenues',
  startDate: '2023-01-01',
  endDate: '2024-01-01',
};

describe('Chart (RenderChart)', () => {
  it('renders a BarChart for "Bar Chart" chartType', () => {
    render(<Chart {...baseProps} chartType="Bar Chart" />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('renders a LineChart for "Line Chart" chartType', () => {
    render(<Chart {...baseProps} chartType="Line Chart" />);
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('renders an unsupported message for an unknown chartType', () => {
    render(<Chart {...baseProps} chartType="Pie Chart" />);
    expect(screen.getByText('Unsupported chart type')).toBeInTheDocument();
  });

  it('shows a message when tickers array is empty', () => {
    render(<Chart {...baseProps} tickers={[]} chartType="Bar Chart" />);
    expect(
      screen.getByText('Please select at least one ticker to render the chart.')
    ).toBeInTheDocument();
  });

  it('does not render a chart when tickers is empty', () => {
    render(<Chart {...baseProps} tickers={[]} chartType="Bar Chart" />);
    expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
  });

  it('passes metric prop through to chart component', () => {
    render(<Chart {...baseProps} chartType="Bar Chart" />);
    expect(screen.getByTestId('bar-chart').getAttribute('data-metric')).toBe('Revenues');
  });

  it('renders bar chart when secondaryMetric is provided', () => {
    render(<Chart {...baseProps} chartType="Bar Chart" secondaryMetric="Net Income" />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('renders a BubbleChart for "Bubble Chart" chartType', () => {
    render(
      <Chart
        {...baseProps}
        chartType="Bubble Chart"
        secondaryMetric="Net Income"
        tickers={['AAPL', 'MSFT']}
      />
    );
    expect(screen.getByTestId('bubble-chart')).toBeInTheDocument();
  });

  it('passes xMetric and yMetric through to BubbleChart', () => {
    render(
      <Chart
        {...baseProps}
        chartType="Bubble Chart"
        metric="Revenues"
        secondaryMetric="Net Income"
        tickers={['AAPL', 'MSFT']}
      />
    );
    const el = screen.getByTestId('bubble-chart');
    expect(el.getAttribute('data-xmetric')).toBe('Revenues');
    expect(el.getAttribute('data-ymetric')).toBe('Net Income');
  });
});
