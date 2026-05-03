import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { ChartingNavbar } from '../components/navbar/ChartingNavbar';
import * as AuthContextModule from '../contexts/AuthContext';
import * as ThemeContextModule from '../contexts/ThemeContext';

function mockAuth(currentUser: object | null = null) {
  vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
    currentUser: currentUser as any,
    signup: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    resetPassword: vi.fn(),
    loginWithGoogle: vi.fn(),
  });
}

function mockTheme(theme: 'dark' | 'light' = 'dark') {
  const toggleTheme = vi.fn();
  vi.spyOn(ThemeContextModule, 'useTheme').mockReturnValue({ theme, toggleTheme });
  return { toggleTheme };
}

function renderNavbar(props: Parameters<typeof ChartingNavbar>[0] = {}) {
  return render(
    <MemoryRouter>
      <ChartingNavbar {...props} />
    </MemoryRouter>
  );
}

describe('ChartingNavbar — general rendering', () => {
  it('renders the QuantEdge logo', () => {
    mockAuth();
    mockTheme();
    renderNavbar();
    expect(screen.getByAltText('QuantEdge')).toBeInTheDocument();
  });

  it('renders Feedback link', () => {
    mockAuth();
    mockTheme();
    renderNavbar();
    expect(screen.getByText('Feedback')).toBeInTheDocument();
  });
});

describe('ChartingNavbar — mode toggle', () => {
  it('does not render Preset/Custom links when activeMode is undefined', () => {
    mockAuth();
    mockTheme();
    renderNavbar();
    expect(screen.queryByText('Preset')).not.toBeInTheDocument();
    expect(screen.queryByText('Custom')).not.toBeInTheDocument();
  });

  it('renders both Preset and Custom links when activeMode is provided', () => {
    mockAuth();
    mockTheme();
    renderNavbar({ activeMode: 'preset' });
    expect(screen.getByText('Preset')).toBeInTheDocument();
    expect(screen.getByText('Custom')).toBeInTheDocument();
  });
});

describe('ChartingNavbar — theme toggle', () => {
  it('shows sun icon in dark mode', () => {
    mockAuth();
    mockTheme('dark');
    renderNavbar();
    // Title attribute signals which icon is shown
    expect(screen.getByTitle('Switch to light mode')).toBeInTheDocument();
  });

  it('shows moon icon in light mode', () => {
    mockAuth();
    mockTheme('light');
    renderNavbar();
    expect(screen.getByTitle('Switch to dark mode')).toBeInTheDocument();
  });

  it('calls toggleTheme when the theme button is clicked', async () => {
    mockAuth();
    const { toggleTheme } = mockTheme('dark');
    renderNavbar();
    await userEvent.click(screen.getByTitle('Switch to light mode'));
    expect(toggleTheme).toHaveBeenCalledOnce();
  });
});

describe('ChartingNavbar — user avatar', () => {
  it('does not render UserAvatar when user is not signed in', () => {
    mockAuth(null);
    mockTheme();
    renderNavbar();
    // Avatar button would show initials; if not signed in there should be none
    expect(screen.queryByRole('button', { name: /account/i })).not.toBeInTheDocument();
  });

  it('renders UserAvatar when user is signed in', () => {
    mockAuth({ displayName: 'Jane Doe', email: 'jane@example.com' });
    mockTheme();
    renderNavbar();
    // UserAvatar renders a button whose title is the display name
    expect(screen.getByTitle('Jane Doe')).toBeInTheDocument();
  });
});
