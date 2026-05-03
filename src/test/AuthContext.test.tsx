import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as firebaseAuth from 'firebase/auth';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

// Helper component that exposes auth methods via buttons
const AuthConsumer = () => {
  const { currentUser, signup, login, logout, resetPassword, loginWithGoogle } = useAuth();
  return (
    <div>
      <span data-testid="user">{currentUser ? currentUser.email : 'null'}</span>
      <button onClick={() => signup('a@b.com', 'pass')}>signup</button>
      <button onClick={() => login('a@b.com', 'pass')}>login</button>
      <button onClick={() => logout()}>logout</button>
      <button onClick={() => resetPassword('a@b.com')}>reset</button>
      <button onClick={() => loginWithGoogle()}>google</button>
    </div>
  );
};

function renderWithAuth() {
  return render(
    <AuthProvider>
      <AuthConsumer />
    </AuthProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  // Default: onAuthStateChanged calls callback with null (not signed in)
  vi.mocked(firebaseAuth.onAuthStateChanged).mockImplementation((_auth, cb) => {
    (cb as (u: null) => void)(null);
    return vi.fn();
  });
});

describe('AuthProvider — initial state', () => {
  it('renders children after auth state resolves', async () => {
    renderWithAuth();
    await waitFor(() => {
      expect(screen.getByTestId('user')).toBeInTheDocument();
    });
  });

  it('currentUser is null when no user is signed in', async () => {
    renderWithAuth();
    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('null');
    });
  });

  it('currentUser reflects user returned by onAuthStateChanged', async () => {
    vi.mocked(firebaseAuth.onAuthStateChanged).mockImplementation((_auth, cb) => {
      (cb as (u: { email: string }) => void)({ email: 'user@test.com' });
      return vi.fn();
    });
    renderWithAuth();
    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('user@test.com');
    });
  });
});

describe('AuthProvider — auth methods', () => {
  it('signup calls createUserWithEmailAndPassword with correct args', async () => {
    vi.mocked(firebaseAuth.createUserWithEmailAndPassword).mockResolvedValue({} as any);
    renderWithAuth();
    await waitFor(() => screen.getByTestId('user'));
    await userEvent.click(screen.getByRole('button', { name: 'signup' }));
    expect(firebaseAuth.createUserWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'a@b.com',
      'pass'
    );
  });

  it('login calls signInWithEmailAndPassword with correct args', async () => {
    vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockResolvedValue({} as any);
    renderWithAuth();
    await waitFor(() => screen.getByTestId('user'));
    await userEvent.click(screen.getByRole('button', { name: 'login' }));
    expect(firebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'a@b.com',
      'pass'
    );
  });

  it('logout calls firebaseSignOut', async () => {
    vi.mocked(firebaseAuth.signOut).mockResolvedValue(undefined);
    renderWithAuth();
    await waitFor(() => screen.getByTestId('user'));
    await userEvent.click(screen.getByRole('button', { name: 'logout' }));
    expect(firebaseAuth.signOut).toHaveBeenCalled();
  });

  it('resetPassword calls sendPasswordResetEmail with correct args', async () => {
    vi.mocked(firebaseAuth.sendPasswordResetEmail).mockResolvedValue(undefined);
    renderWithAuth();
    await waitFor(() => screen.getByTestId('user'));
    await userEvent.click(screen.getByRole('button', { name: 'reset' }));
    expect(firebaseAuth.sendPasswordResetEmail).toHaveBeenCalledWith(
      expect.anything(),
      'a@b.com'
    );
  });

  it('loginWithGoogle calls signInWithPopup', async () => {
    vi.mocked(firebaseAuth.signInWithPopup).mockResolvedValue({} as any);
    renderWithAuth();
    await waitFor(() => screen.getByTestId('user'));
    await userEvent.click(screen.getByRole('button', { name: 'google' }));
    await waitFor(() => {
      expect(firebaseAuth.signInWithPopup).toHaveBeenCalled();
    });
  });
});

describe('AuthProvider — onAuthStateChanged lifecycle', () => {
  it('unsubscribes from onAuthStateChanged on unmount', () => {
    const unsubscribe = vi.fn();
    vi.mocked(firebaseAuth.onAuthStateChanged).mockReturnValue(unsubscribe as any);
    const { unmount } = renderWithAuth();
    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });
});
