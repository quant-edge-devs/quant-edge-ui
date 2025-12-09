export async function fetchMetricValue(
  metric: string,
  ticker: string,
  startDate: string
) {
  let url = '';
  switch (metric) {
    case 'Price To Earnings Ratio':
      url = `http://localhost:8080/api/stocks/pe/${ticker}/${startDate}`;
      break;
    case 'Price To Sales Ratio':
      url = `http://localhost:8080/api/stocks/ps/${ticker}/${startDate}`;
      break;
    case 'Market Cap ($B)':
      url = `http://localhost:8080/api/stocks/marketcap/${ticker}/${startDate}`;
      break;
    case 'Dividend Yield (%)':
      url = `http://localhost:8080/api/stocks/dividendyield/${ticker}/${startDate}`;
      break;
    case 'Earnings Per Share':
      url = `http://localhost:8080/api/stocks/eps/${ticker}/${startDate}`;
      break;
    default:
      throw new Error('Unknown metric: ' + metric);
  }
  const response = await fetch(url);
  const data = await response.json();
  // Adjust the property based on your API's response
  if (metric === 'Market Cap ($B)') return { ticker, value: data.marketCap };
  if (metric === 'Price To Sales Ratio') return { ticker, value: data.psRatio };
  if (metric === 'Price To Earnings Ratio')
    return { ticker, value: data.peRatio };
  if (metric === 'Dividend Yield (%)')
    return { ticker, value: data.dividendYield };
  if (metric === 'Earnings Per Share')
    return { ticker, value: data.earningsPerShare };
  // Add more as needed
  return { ticker, value: null };
}
