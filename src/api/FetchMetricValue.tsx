import { API_BASE_URL } from '../config';

export async function fetchMetricValue(
  metric: string,
  ticker: string,
  startDate: string,
  endDate: string,
  interval: string
) {
  let url = '';
  switch (metric) {
    case 'Price To Earnings Ratio':
      url = `${API_BASE_URL}/stocks/${ticker}/${startDate}/${endDate}/${interval}/pe`;
      break;
    case 'Price To Sales Ratio':
      url = `${API_BASE_URL}/stocks/${ticker}/${startDate}/${endDate}/${interval}/ps`;
      break;
    case 'Market Cap':
      url = `${API_BASE_URL}/stocks/${ticker}/${startDate}/${endDate}/marketCapHistory`;
      break;
    case 'Dividend Yield (%)':
      url = `${API_BASE_URL}/stocks/${ticker}/${startDate}/${endDate}/${interval}/dividendInfo`;
      break;
    case 'Earnings Per Share':
      url = `${API_BASE_URL}/stocks/${ticker}/${startDate}/${endDate}/${interval}/eps`;
      break;
    case 'Revenues':
      url = `${API_BASE_URL}/stocks/${ticker}/${startDate}/${endDate}/${interval}/revenues`;
      break;
    case 'Net Income':
      url = `${API_BASE_URL}/stocks/${ticker}/${startDate}/${endDate}/${interval}/netIncome`;
      break;
    default:
      throw new Error('Unknown metric: ' + metric);
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API error ${response.status} for metric "${metric}"`);
  }
  const data = await response.json();

  switch (metric) {
    case 'Market Cap':
      return { ticker, value: data.marketCap };
    case 'Price To Sales Ratio':
      return { ticker, value: data.psRatio };
    case 'Price To Earnings Ratio':
      return { ticker, value: data.peRatio };
    case 'Dividend Yield (%)':
      return { ticker, value: data.yield };
    case 'Earnings Per Share':
      return { ticker, value: data.earningsPerShare };
    case 'Revenues':
      return { ticker, value: data.revenue };
    case 'Net Income':
      return { ticker, value: data.netIncome };
    default:
      return { ticker, value: null };
  }
}
