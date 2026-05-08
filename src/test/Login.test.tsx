import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { Login } from '../pages/log-in/LoginPage';
import * as AuthContextModule from '../contexts/AuthContext';
import * as ThemeContextModule from '../contexts/ThemeContext';

const mockNavigate = vi.fn();

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function mockAuth(overrides: Partial<ReturnType<typeof AuthContextModule.useAuth>> = {}) {
  vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
    currentUser: null,
    signup: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    resetPassword: vi.fn(),
    loginWithGoogle: vi.fn(),
    ...overrides,
  });
}

function mockTheme() {
  vi.spyOn(ThemeContextModule, 'useTheme').mockReturnValue({
    theme: 'dark',
    toggleTheme: vi.fn(),
  });
}

function renderLogin(overrides: Parameters<typeof mockAuth>[0] = {}) {
  mockAuth(overrides);
  mockTheme();
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Login — rendering', () => {
  it('renders the "Welcome back" heading', () => {
    renderLogin();
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
  });

  it('renders email and password fields', () => {
    renderLogin();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('renders Sign in button', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('renders Continue with Google button', () => {
    renderLogin();
    expect(
      screen.getByRole('button', { name: /Continue with Google/i })
    ).toBeInTheDocument();
  });

  it('renders a link to the sign-up page', () => {
    renderLogin();
    expect(screen.getByRole('link', { name: 'Sign up' })).toBeInTheDocument();
  });

  it('renders Forgot password? link', () => {
    renderLogin();
    expect(screen.getByText('Forgot password?')).toBeInTheDocument();
  });
});

describe('Login — already signed-in state', () => {
  it('shows "Signed in as" message when user is already logged in', () => {
    renderLogin({
      currentUser: { displayName: 'Jane Doe', email: 'jane@example.com' } as any,
    });
    expect(screen.getByText(/Signed in as/i)).toBeInTheDocument();
  });

  it('shows "Sign out" button when user is already logged in', () => {
    renderLogin({
      currentUser: { displayName: 'Jane Doe', email: 'jane@example.com' } as any,
    });
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument();
  });

  it('displays displayName when user is logged in', () => {
    renderLogin({
      currentUser: { displayName: 'Jane Doe', email: 'jane@example.com' } as any,
    });
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });
});

describe('Login — form submission', () => {
  it('calls login with entered email and password', async () => {
    const login = vi.fn().mockResolvedValue({});
    renderLogin({ login });

    await userEvent.type(screen.getByLabelText('Email'), 'user@test.com');
    await userEvent.type(screen.getByLabelText('Password'), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith('user@test.com', 'secret123');
    });
  });

  it('navigates to /charting/custom after successful login', async () => {
    const login = vi.fn().mockResolvedValue({});
    renderLogin({ login });

    await userEvent.type(screen.getByLabelText('Email'), 'user@test.com');
    await userEvent.type(screen.getByLabelText('Password'), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/charting/custom');
    });
  });

  it('shows error message on failed login', async () => {
    const login = vi.fn().mockRejectedValue(new Error('Invalid credentials'));
    renderLogin({ login });

    await userEvent.type(screen.getByLabelText('Email'), 'wrong@test.com');
    await userEvent.type(screen.getByLabelText('Password'), 'wrongpass');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('does not navigate on failed login', async () => {
    const login = vi.fn().mockRejectedValue(new Error('Failed'));
    renderLogin({ login });

    await userEvent.type(screen.getByLabelText('Email'), 'x@x.com');
    await userEvent.type(screen.getByLabelText('Password'), 'pass');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => expect(login).toHaveBeenCalled());
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

describe('Login — Google sign-in', () => {
  it('calls loginWithGoogle when Continue with Google is clicked', async () => {
    const loginWithGoogle = vi.fn().mockResolvedValue({});
    renderLogin({ loginWithGoogle });

    await userEvent.click(
      screen.getByRole('button', { name: /Continue with Google/i })
    );

    expect(loginWithGoogle).toHaveBeenCalledOnce();
  });
});

describe('Login — sign-out from already-logged-in state', () => {
  it('calls logout when Sign out button is clicked', async () => {
    const logout = vi.fn().mockResolvedValue(undefined);
    renderLogin({
      currentUser: { displayName: 'Jane', email: 'jane@test.com' } as any,
      logout,
    });

    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(logout).toHaveBeenCalledOnce();
  });
});
