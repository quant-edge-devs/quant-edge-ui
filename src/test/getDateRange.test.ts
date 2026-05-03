import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getDateRange } from '../pages/charting/getDateRange';

const FIXED_NOW = new Date('2024-06-15T12:00:00.000Z');

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(FIXED_NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('getDateRange', () => {
  it('returns today as endDate for all timeframes', () => {
    for (const tf of ['1Y', '3Y', '5Y', '10Y']) {
      expect(getDateRange(tf).endDate).toBe('2024-06-15');
    }
  });

  it('1Y — startDate is exactly one year back', () => {
    expect(getDateRange('1Y').startDate).toBe('2023-06-15');
  });

  it('3Y — startDate is exactly three years back', () => {
    expect(getDateRange('3Y').startDate).toBe('2021-06-15');
  });

  it('5Y — startDate is exactly five years back', () => {
    expect(getDateRange('5Y').startDate).toBe('2019-06-15');
  });

  it('10Y — startDate is exactly ten years back', () => {
    expect(getDateRange('10Y').startDate).toBe('2014-06-15');
  });

  it('unknown timeframe — startDate equals endDate (no subtraction applied)', () => {
    const { startDate, endDate } = getDateRange('UNKNOWN');
    expect(startDate).toBe(endDate);
  });

  it('returns ISO date strings in YYYY-MM-DD format', () => {
    const { startDate, endDate } = getDateRange('1Y');
    expect(startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
