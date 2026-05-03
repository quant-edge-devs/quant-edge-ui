import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';
import { RequireAuth } from '../components/require-auth.tsx/index';
import * as AuthContextModule from '../contexts/AuthContext';

function setup(currentUser: object | null) {
  vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
    currentUser: currentUser as any,
    signup: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    resetPassword: vi.fn(),
    loginWithGoogle: vi.fn(),
  });
}

function renderApp(currentUser: object | null) {
  setup(currentUser);
  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route element={<RequireAuth />}>
          <Route path="/protected" element={<div>Protected Content</div>} />
        </Route>
        <Route path="/auth/log-in" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('RequireAuth', () => {
  it('renders the outlet when user is authenticated', () => {
    renderApp({ uid: '123', email: 'user@test.com' });
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to /auth/log-in when user is not authenticated', () => {
    renderApp(null);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('does not render protected content after redirect', () => {
    renderApp(null);
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
