// Utility to get start and end dates for a given timeframe
export function getDateRange(timeframe: string): {
  startDate: string;
  endDate: string;
} {
  const end = new Date();
  const start = new Date();
  if (timeframe === '1Y') start.setFullYear(end.getFullYear() - 1);
  else if (timeframe === '3Y') start.setFullYear(end.getFullYear() - 3);
  else if (timeframe === '5Y') start.setFullYear(end.getFullYear() - 5);
  else if (timeframe === '10Y') start.setFullYear(end.getFullYear() - 10);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}
