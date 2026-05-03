import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchMetricValue } from '../api/FetchMetricValue';

const BASE = 'http://localhost:8080';

function mockFetch(data: unknown, ok = true, status = 200) {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(data),
  } as Response);
}

beforeEach(() => {
  vi.restoreAllMocks();
  global.fetch = vi.fn();
});

describe('fetchMetricValue — URL construction', () => {
  const args = ['AAPL', '2023-01-01', '2024-01-01', 'annual'] as const;

  it('builds correct URL for Price To Earnings Ratio', async () => {
    mockFetch({ peRatio: [1, 2] });
    await fetchMetricValue('Price To Earnings Ratio', ...args);
    expect(fetch).toHaveBeenCalledWith(
      `${BASE}/stocks/AAPL/2023-01-01/2024-01-01/annual/pe`
    );
  });

  it('builds correct URL for Price To Sales Ratio', async () => {
    mockFetch({ psRatio: [1] });
    await fetchMetricValue('Price To Sales Ratio', ...args);
    expect(fetch).toHaveBeenCalledWith(
      `${BASE}/stocks/AAPL/2023-01-01/2024-01-01/annual/ps`
    );
  });

  it('builds correct URL for Market Cap (no interval segment)', async () => {
    mockFetch({ marketCap: [1] });
    await fetchMetricValue('Market Cap', ...args);
    expect(fetch).toHaveBeenCalledWith(
      `${BASE}/stocks/AAPL/2023-01-01/2024-01-01/marketCapHistory`
    );
  });

  it('builds correct URL for Dividend Yield (%)', async () => {
    mockFetch({ yield: [1] });
    await fetchMetricValue('Dividend Yield (%)', ...args);
    expect(fetch).toHaveBeenCalledWith(
      `${BASE}/stocks/AAPL/2023-01-01/2024-01-01/annual/dividendInfo`
    );
  });

  it('builds correct URL for Earnings Per Share', async () => {
    mockFetch({ earningsPerShare: [1] });
    await fetchMetricValue('Earnings Per Share', ...args);
    expect(fetch).toHaveBeenCalledWith(
      `${BASE}/stocks/AAPL/2023-01-01/2024-01-01/annual/eps`
    );
  });

  it('builds correct URL for Revenues', async () => {
    mockFetch({ revenue: [1] });
    await fetchMetricValue('Revenues', ...args);
    expect(fetch).toHaveBeenCalledWith(
      `${BASE}/stocks/AAPL/2023-01-01/2024-01-01/annual/revenues`
    );
  });

  it('builds correct URL for Net Income', async () => {
    mockFetch({ netIncome: [1] });
    await fetchMetricValue('Net Income', ...args);
    expect(fetch).toHaveBeenCalledWith(
      `${BASE}/stocks/AAPL/2023-01-01/2024-01-01/annual/netIncome`
    );
  });
});

describe('fetchMetricValue — response mapping', () => {
  const args = ['MSFT', '2020-01-01', '2021-01-01', 'quarter'] as const;

  it('maps peRatio field from response', async () => {
    mockFetch({ peRatio: [10, 20] });
    const result = await fetchMetricValue('Price To Earnings Ratio', ...args);
    expect(result).toEqual({ ticker: 'MSFT', value: [10, 20] });
  });

  it('maps psRatio field from response', async () => {
    mockFetch({ psRatio: [5, 6] });
    const result = await fetchMetricValue('Price To Sales Ratio', ...args);
    expect(result).toEqual({ ticker: 'MSFT', value: [5, 6] });
  });

  it('maps marketCap field from response', async () => {
    mockFetch({ marketCap: [1e12] });
    const result = await fetchMetricValue('Market Cap', ...args);
    expect(result).toEqual({ ticker: 'MSFT', value: [1e12] });
  });

  it('maps yield field from response', async () => {
    mockFetch({ yield: [0.02] });
    const result = await fetchMetricValue('Dividend Yield (%)', ...args);
    expect(result).toEqual({ ticker: 'MSFT', value: [0.02] });
  });

  it('maps earningsPerShare field from response', async () => {
    mockFetch({ earningsPerShare: [3.5] });
    const result = await fetchMetricValue('Earnings Per Share', ...args);
    expect(result).toEqual({ ticker: 'MSFT', value: [3.5] });
  });

  it('maps revenue field from response', async () => {
    mockFetch({ revenue: [50e9] });
    const result = await fetchMetricValue('Revenues', ...args);
    expect(result).toEqual({ ticker: 'MSFT', value: [50e9] });
  });

  it('maps netIncome field from response', async () => {
    mockFetch({ netIncome: [10e9] });
    const result = await fetchMetricValue('Net Income', ...args);
    expect(result).toEqual({ ticker: 'MSFT', value: [10e9] });
  });
});

describe('fetchMetricValue — error handling', () => {
  it('throws on unknown metric before fetching', async () => {
    await expect(
      fetchMetricValue('Unknown Metric', 'AAPL', '2023-01-01', '2024-01-01', 'annual')
    ).rejects.toThrow('Unknown metric: Unknown Metric');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('throws when the API response is not ok', async () => {
    mockFetch({}, false, 500);
    await expect(
      fetchMetricValue('Revenues', 'AAPL', '2023-01-01', '2024-01-01', 'annual')
    ).rejects.toThrow('API error 500');
  });

  it('throws when fetch itself rejects', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    await expect(
      fetchMetricValue('Net Income', 'AAPL', '2023-01-01', '2024-01-01', 'annual')
    ).rejects.toThrow('Network error');
  });
});
