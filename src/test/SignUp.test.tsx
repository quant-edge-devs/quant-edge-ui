import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { SignUp } from '../pages/sign-up/index';
import * as AuthContextModule from '../contexts/AuthContext';
import * as ThemeContextModule from '../contexts/ThemeContext';
import * as firebaseAuth from 'firebase/auth';

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

function renderSignUp(overrides: Parameters<typeof mockAuth>[0] = {}) {
  mockAuth(overrides);
  mockTheme();
  return render(
    <MemoryRouter>
      <SignUp />
    </MemoryRouter>
  );
}

async function fillForm(opts: {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
} = {}) {
  const {
    firstName = 'Jane',
    lastName = 'Doe',
    email = 'jane@example.com',
    password = 'secret123',
    confirmPassword = 'secret123',
  } = opts;

  if (firstName) await userEvent.type(screen.getByLabelText('First name'), firstName);
  if (lastName) await userEvent.type(screen.getByLabelText('Last name'), lastName);
  if (email) await userEvent.type(screen.getByLabelText('Email'), email);
  if (password) await userEvent.type(screen.getByLabelText('Password'), password);
  if (confirmPassword)
    await userEvent.type(screen.getByLabelText('Confirm password'), confirmPassword);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('SignUp — rendering', () => {
  it('renders the "Create your account" heading', () => {
    renderSignUp();
    expect(screen.getByText('Create your account')).toBeInTheDocument();
  });

  it('renders all form fields', () => {
    renderSignUp();
    expect(screen.getByLabelText('First name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm password')).toBeInTheDocument();
  });

  it('renders Create account button', () => {
    renderSignUp();
    expect(screen.getByRole('button', { name: 'Create account' })).toBeInTheDocument();
  });

  it('renders Continue with Google button', () => {
    renderSignUp();
    expect(
      screen.getByRole('button', { name: /Continue with Google/i })
    ).toBeInTheDocument();
  });

  it('renders link to sign-in page', () => {
    renderSignUp();
    expect(screen.getByRole('link', { name: 'Sign in' })).toBeInTheDocument();
  });
});

describe('SignUp — validation', () => {
  it('shows required error for firstName when left blank', async () => {
    renderSignUp();
    await userEvent.type(screen.getByLabelText('Last name'), 'Doe');
    await userEvent.type(screen.getByLabelText('Email'), 'j@e.com');
    await userEvent.type(screen.getByLabelText('Password'), 'pass');
    await userEvent.type(screen.getByLabelText('Confirm password'), 'pass');
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));
    await waitFor(() => {
      expect(screen.getByText('Required')).toBeInTheDocument();
    });
  });

  it('shows password mismatch error when passwords differ', async () => {
    renderSignUp();
    await fillForm({ password: 'abc123', confirmPassword: 'xyz999' });
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });
});

describe('SignUp — form submission', () => {
  it('calls signup with email and password', async () => {
    const mockUser = { user: { uid: '1' } };
    const signup = vi.fn().mockResolvedValue(mockUser);
    vi.mocked(firebaseAuth.updateProfile).mockResolvedValue(undefined);
    renderSignUp({ signup });

    await fillForm();
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => {
      expect(signup).toHaveBeenCalledWith('jane@example.com', 'secret123');
    });
  });

  it('calls updateProfile with combined display name', async () => {
    const mockUser = { user: { uid: '1' } };
    const signup = vi.fn().mockResolvedValue(mockUser);
    vi.mocked(firebaseAuth.updateProfile).mockResolvedValue(undefined);
    renderSignUp({ signup });

    await fillForm({ firstName: 'Jane', lastName: 'Doe' });
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => {
      expect(firebaseAuth.updateProfile).toHaveBeenCalledWith(mockUser.user, {
        displayName: 'Jane Doe',
      });
    });
  });

  it('navigates to /charting after successful signup', async () => {
    const mockUser = { user: { uid: '1' } };
    const signup = vi.fn().mockResolvedValue(mockUser);
    vi.mocked(firebaseAuth.updateProfile).mockResolvedValue(undefined);
    renderSignUp({ signup });

    await fillForm();
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/charting');
    });
  });

  it('shows error message when signup fails', async () => {
    const signup = vi.fn().mockRejectedValue(new Error('Email already in use'));
    renderSignUp({ signup });

    await fillForm();
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => {
      expect(screen.getByText('Email already in use')).toBeInTheDocument();
    });
  });

  it('does not navigate on signup failure', async () => {
    const signup = vi.fn().mockRejectedValue(new Error('Error'));
    renderSignUp({ signup });

    await fillForm();
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => expect(signup).toHaveBeenCalled());
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

describe('SignUp — Google sign-in', () => {
  it('calls loginWithGoogle when Continue with Google is clicked', async () => {
    const loginWithGoogle = vi.fn().mockResolvedValue({});
    renderSignUp({ loginWithGoogle });

    await userEvent.click(
      screen.getByRole('button', { name: /Continue with Google/i })
    );

    expect(loginWithGoogle).toHaveBeenCalledOnce();
  });
});
