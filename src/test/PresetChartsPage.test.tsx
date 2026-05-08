import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { PresetChartsPage } from '../pages/charting/PresetChartsPage';
import * as AuthContextModule from '../contexts/AuthContext';
import * as ThemeContextModule from '../contexts/ThemeContext';

// Stub chart components — they rely on D3 and ResizeObserver
vi.mock('../pages/charting/chart-types/LineChart', () => ({
  default: ({ metric }: any) => <div data-testid="line-chart">{metric}</div>,
}));

vi.mock('../pages/charting/chart-types/BarChart', () => ({
  default: ({ metric }: any) => <div data-testid="bar-chart">{metric}</div>,
}));

vi.mock('../pages/charting/chart-types/BubbleChart', () => ({
  default: ({ xMetric, yMetric }: any) => (
    <div data-testid="bubble-chart">{xMetric}|{yMetric}</div>
  ),
}));

function setup() {
  vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
    currentUser: { displayName: 'Test User', email: 'test@test.com' } as any,
    signup: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    resetPassword: vi.fn(),
    loginWithGoogle: vi.fn(),
  });
  vi.spyOn(ThemeContextModule, 'useTheme').mockReturnValue({
    theme: 'dark',
    toggleTheme: vi.fn(),
  });
}

function renderPage() {
  setup();
  return render(
    <MemoryRouter>
      <PresetChartsPage />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('PresetChartsPage — initial render', () => {
  it('renders the Preset Charts heading', () => {
    renderPage();
    expect(screen.getByText('Preset Charts')).toBeInTheDocument();
  });

  it('renders the ticker input', () => {
    renderPage();
    expect(
      screen.getByPlaceholderText('e.g. AAPL, TSLA, MSFT')
    ).toBeInTheDocument();
  });

  it('renders all 7 metric buttons', () => {
    renderPage();
    const metrics = [
      'Price To Sales Ratio',
      'Price To Earnings Ratio',
      'Market Cap',
      'Dividend Yield (%)',
      'Earnings Per Share',
      'Revenues',
      'Net Income',
    ];
    for (const m of metrics) {
      expect(screen.getByRole('button', { name: m })).toBeInTheDocument();
    }
  });

  it('renders all chart type buttons', () => {
    renderPage();
    expect(screen.getByRole('button', { name: 'Bar Chart' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Area Chart' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Line Chart' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bubble Chart' })).toBeInTheDocument();
  });

  it('renders all timeframe buttons', () => {
    renderPage();
    for (const tf of ['1Y', '3Y', '5Y', '10Y']) {
      expect(screen.getByRole('button', { name: tf })).toBeInTheDocument();
    }
  });

  it('shows "Enter a ticker to get started" before any search', () => {
    renderPage();
    expect(screen.getByText('Enter a ticker to get started')).toBeInTheDocument();
  });

  it('does not render a chart before search', () => {
    renderPage();
    expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
    expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
  });
});

describe('PresetChartsPage — ticker search', () => {
  it('renders a BarChart (default) after submitting a ticker', async () => {
    renderPage();
    await userEvent.type(
      screen.getByPlaceholderText('e.g. AAPL, TSLA, MSFT'),
      'AAPL'
    );
    await userEvent.click(screen.getByRole('button', { name: 'Search' }));
    await waitFor(() => {
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  it('uppercases the ticker on search', async () => {
    renderPage();
    await userEvent.type(
      screen.getByPlaceholderText('e.g. AAPL, TSLA, MSFT'),
      'aapl'
    );
    await userEvent.click(screen.getByRole('button', { name: 'Search' }));
    await waitFor(() => {
      expect(screen.getByText('AAPL')).toBeInTheDocument();
    });
  });

  it('shows the ticker chip after a successful search', async () => {
    renderPage();
    await userEvent.type(
      screen.getByPlaceholderText('e.g. AAPL, TSLA, MSFT'),
      'TSLA'
    );
    await userEvent.click(screen.getByRole('button', { name: 'Search' }));
    await waitFor(() => {
      expect(screen.getByText('TSLA')).toBeInTheDocument();
    });
  });

  it('ignores empty/whitespace-only ticker submission', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'Search' }));
    expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
  });

  it('clears ticker when the clear button is clicked', async () => {
    renderPage();
    await userEvent.type(
      screen.getByPlaceholderText('e.g. AAPL, TSLA, MSFT'),
      'AAPL'
    );
    await userEvent.click(screen.getByRole('button', { name: 'Search' }));
    await waitFor(() => screen.getByText('AAPL'));

    await userEvent.click(screen.getByRole('button', { name: /✕ clear/i }));
    expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
    expect(screen.getByText('Enter a ticker to get started')).toBeInTheDocument();
  });
});

describe('PresetChartsPage — chart type switching', () => {
  async function searchAndSwitchTo(type: string) {
    renderPage();
    await userEvent.type(
      screen.getByPlaceholderText('e.g. AAPL, TSLA, MSFT'),
      'AAPL'
    );
    await userEvent.click(screen.getByRole('button', { name: 'Search' }));
    await waitFor(() => screen.getByTestId('bar-chart'));
    await userEvent.click(screen.getByRole('button', { name: type }));
  }

  it('renders LineChart when "Line Chart" is selected', async () => {
    await searchAndSwitchTo('Line Chart');
    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });

  it('renders LineChart for "Area Chart" type (shared component)', async () => {
    await searchAndSwitchTo('Area Chart');
    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });
});

describe('PresetChartsPage — bubble chart mode', () => {
  it('shows multi-ticker input when Bubble Chart is selected', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'Bubble Chart' }));
    expect(
      screen.getByPlaceholderText('Add ticker (e.g. AAPL) and press Enter')
    ).toBeInTheDocument();
  });

  it('shows Y Axis Metric selector when Bubble Chart is selected', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'Bubble Chart' }));
    expect(screen.getByText('Y Axis Metric')).toBeInTheDocument();
  });

  it('shows "Add tickers to get started" empty state in bubble mode', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'Bubble Chart' }));
    expect(screen.getByText('Add tickers to get started')).toBeInTheDocument();
  });

  it('renders BubbleChart after adding tickers in bubble mode', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'Bubble Chart' }));
    const input = screen.getByPlaceholderText('Add ticker (e.g. AAPL) and press Enter');
    await userEvent.type(input, 'AAPL');
    await userEvent.click(screen.getByRole('button', { name: 'Add' }));
    await userEvent.type(input, 'MSFT');
    await userEvent.click(screen.getByRole('button', { name: 'Add' }));
    await waitFor(() => {
      expect(screen.getByTestId('bubble-chart')).toBeInTheDocument();
    });
  });
});

describe('PresetChartsPage — metric selection', () => {
  it('updates active metric when a metric button is clicked', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'Net Income' }));
    await userEvent.type(
      screen.getByPlaceholderText('e.g. AAPL, TSLA, MSFT'),
      'AAPL'
    );
    await userEvent.click(screen.getByRole('button', { name: 'Search' }));
    await waitFor(() => {
      expect(screen.getByTestId('bar-chart').textContent).toBe('Net Income');
    });
  });
});
