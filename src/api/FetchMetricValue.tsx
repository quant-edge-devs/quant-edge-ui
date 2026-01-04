const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

console.log('API_BASE_URL:', API_BASE_URL);
export async function fetchMetricValue(
  metric: string,
  ticker: string,
  startDate: string,
  endDate: string
) {
  let url = '';
  switch (metric) {
    case 'Price To Earnings Ratio':
      url = `${API_BASE_URL}/stocks/pe/${ticker}/${startDate}/${endDate}`;
      break;
    case 'Price To Sales Ratio':
      url = `${API_BASE_URL}/stocks/ps/${ticker}/${startDate}/${endDate}`;
      break;
    case 'Market Cap':
      url = `${API_BASE_URL}/stocks/marketCapHistory/${ticker}/${startDate}/${endDate}`;
      break;
    case 'Dividend Yield (%)':
      url = `${API_BASE_URL}/stocks/dividendInfo/${ticker}/${startDate}/${endDate}`;
      break;
    case 'Earnings Per Share':
      url = `${API_BASE_URL}/stocks/eps/${ticker}/${startDate}/${endDate}`;
      break;
    case 'Revenues':
      url = `${API_BASE_URL}/stocks/revenues/${ticker}/${startDate}/${endDate}`;
      break;
    default:
      throw new Error('Unknown metric: ' + metric);
  }
  const response = await fetch(url);
  const data = await response.json();
  // Adjust the property based on your API's response
  if (metric === 'Market Cap') return { ticker, value: data.marketCap };
  if (metric === 'Price To Sales Ratio') return { ticker, value: data.psRatio };
  if (metric === 'Price To Earnings Ratio')
    return { ticker, value: data.peRatio };
  if (metric === 'Dividend Yield (%)') return { ticker, value: data.yield };
  if (metric === 'Earnings Per Share')
    return { ticker, value: data.earningsPerShare };
  if (metric === 'Revenues') return { ticker, value: data.revenue };
  // Add more as needed
  return { ticker, value: null };
}
