import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';

const ThemeDisplay = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggleTheme}>toggle</button>
    </>
  );
};

function renderWithProvider() {
  return render(
    <ThemeProvider>
      <ThemeDisplay />
    </ThemeProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove('dark');
});

describe('ThemeProvider — initial state', () => {
  it('defaults to dark theme when localStorage is empty', () => {
    renderWithProvider();
    expect(screen.getByTestId('theme').textContent).toBe('dark');
  });

  it('restores light theme from localStorage', () => {
    localStorage.setItem('qe-theme', 'light');
    renderWithProvider();
    expect(screen.getByTestId('theme').textContent).toBe('light');
  });

  it('defaults to dark when localStorage has an unrecognised value', () => {
    localStorage.setItem('qe-theme', 'blue');
    renderWithProvider();
    expect(screen.getByTestId('theme').textContent).toBe('dark');
  });
});

describe('ThemeProvider — DOM class side-effect', () => {
  it('adds "dark" class to <html> when theme is dark', () => {
    renderWithProvider();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('removes "dark" class from <html> when theme is light', () => {
    localStorage.setItem('qe-theme', 'light');
    renderWithProvider();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});

describe('ThemeProvider — localStorage persistence', () => {
  it('persists dark theme to localStorage on mount', () => {
    renderWithProvider();
    expect(localStorage.getItem('qe-theme')).toBe('dark');
  });

  it('persists light theme to localStorage on mount', () => {
    localStorage.setItem('qe-theme', 'light');
    renderWithProvider();
    expect(localStorage.getItem('qe-theme')).toBe('light');
  });
});

describe('ThemeProvider — toggleTheme', () => {
  it('toggles from dark to light', async () => {
    renderWithProvider();
    await userEvent.click(screen.getByRole('button', { name: 'toggle' }));
    expect(screen.getByTestId('theme').textContent).toBe('light');
  });

  it('toggles from light to dark', async () => {
    localStorage.setItem('qe-theme', 'light');
    renderWithProvider();
    await userEvent.click(screen.getByRole('button', { name: 'toggle' }));
    expect(screen.getByTestId('theme').textContent).toBe('dark');
  });

  it('updates localStorage after toggle', async () => {
    renderWithProvider();
    await userEvent.click(screen.getByRole('button', { name: 'toggle' }));
    expect(localStorage.getItem('qe-theme')).toBe('light');
  });

  it('updates <html> class after toggle to light', async () => {
    renderWithProvider();
    await userEvent.click(screen.getByRole('button', { name: 'toggle' }));
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('double toggle returns to original theme', async () => {
    renderWithProvider();
    const btn = screen.getByRole('button', { name: 'toggle' });
    await userEvent.click(btn);
    await userEvent.click(btn);
    expect(screen.getByTestId('theme').textContent).toBe('dark');
  });
});

describe('useTheme — outside provider', () => {
  it('returns default context values when used outside ThemeProvider', () => {
    const Bare = () => {
      const { theme } = useTheme();
      return <span data-testid="bare">{theme}</span>;
    };
    render(<Bare />);
    expect(screen.getByTestId('bare').textContent).toBe('dark');
  });
});
