import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Logo } from '../components/Logo';
import * as ThemeContextModule from '../contexts/ThemeContext';

function mockTheme(theme: 'dark' | 'light') {
  vi.spyOn(ThemeContextModule, 'useTheme').mockReturnValue({
    theme,
    toggleTheme: vi.fn(),
  });
}

describe('Logo', () => {
  it('renders dark logo when theme is dark', () => {
    mockTheme('dark');
    render(<Logo />);
    expect(screen.getByAltText('QuantEdge').getAttribute('src')).toBe(
      '/quantedge-logo.svg'
    );
  });

  it('renders light logo when theme is light', () => {
    mockTheme('light');
    render(<Logo />);
    expect(screen.getByAltText('QuantEdge').getAttribute('src')).toBe(
      '/quantedge-logo-light.svg'
    );
  });

  it('applies the className prop to the img element', () => {
    mockTheme('dark');
    render(<Logo className="custom-class" />);
    expect(screen.getByAltText('QuantEdge')).toHaveClass('custom-class');
  });

  it('uses default className when none is provided', () => {
    mockTheme('dark');
    render(<Logo />);
    expect(screen.getByAltText('QuantEdge')).toHaveClass('h-8', 'w-auto');
  });
});
