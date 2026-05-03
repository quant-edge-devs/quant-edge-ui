import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserAvatar from '../components/navbar/UserAvatar';

describe('UserAvatar — initials', () => {
  it('shows two-letter initials for a full name', () => {
    render(<UserAvatar displayName="Jane Doe" />);
    expect(screen.getByRole('button').textContent).toBe('JD');
  });

  it('shows single initial for a one-word display name', () => {
    render(<UserAvatar displayName="Alice" />);
    expect(screen.getByRole('button').textContent).toBe('A');
  });

  it('falls back to first letter of email when no displayName', () => {
    render(<UserAvatar email="test@example.com" />);
    expect(screen.getByRole('button').textContent).toBe('T');
  });

  it('shows "?" when both displayName and email are absent', () => {
    render(<UserAvatar />);
    expect(screen.getByRole('button').textContent).toBe('?');
  });

  it('uses first and last word initials for multi-word names', () => {
    render(<UserAvatar displayName="John Michael Doe" />);
    expect(screen.getByRole('button').textContent).toBe('JD');
  });
});

describe('UserAvatar — dropdown visibility', () => {
  it('dropdown is hidden initially', () => {
    render(<UserAvatar displayName="Jane Doe" />);
    expect(screen.queryByText('Sign out')).not.toBeInTheDocument();
  });

  it('dropdown opens when avatar button is clicked', async () => {
    render(<UserAvatar displayName="Jane Doe" email="jane@example.com" />);
    await userEvent.click(screen.getByTitle('Jane Doe'));
    expect(screen.getByText('Sign out')).toBeInTheDocument();
  });

  it('displays displayName in dropdown header', async () => {
    render(<UserAvatar displayName="Jane Doe" email="jane@example.com" />);
    await userEvent.click(screen.getByTitle('Jane Doe'));
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  it('displays email in dropdown header when provided', async () => {
    render(<UserAvatar displayName="Jane Doe" email="jane@example.com" />);
    await userEvent.click(screen.getByTitle('Jane Doe'));
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('shows "Account" in header when displayName is absent', async () => {
    render(<UserAvatar email="jane@example.com" />);
    await userEvent.click(screen.getByTitle('jane@example.com'));
    expect(screen.getByText('Account')).toBeInTheDocument();
  });

  it('closes dropdown on outside click', async () => {
    render(
      <div>
        <UserAvatar displayName="Jane Doe" />
        <button data-testid="outside">outside</button>
      </div>
    );
    await userEvent.click(screen.getByTitle('Jane Doe'));
    expect(screen.getByText('Sign out')).toBeInTheDocument();
    await userEvent.click(screen.getByTestId('outside'));
    expect(screen.queryByText('Sign out')).not.toBeInTheDocument();
  });
});

describe('UserAvatar — sign out', () => {
  it('calls onSignOut when Sign out button is clicked', async () => {
    const onSignOut = vi.fn();
    render(<UserAvatar displayName="Jane Doe" onSignOut={onSignOut} />);
    await userEvent.click(screen.getByTitle('Jane Doe'));
    await userEvent.click(screen.getByText('Sign out'));
    expect(onSignOut).toHaveBeenCalledOnce();
  });

  it('closes dropdown after signing out', async () => {
    const onSignOut = vi.fn();
    render(<UserAvatar displayName="Jane Doe" onSignOut={onSignOut} />);
    await userEvent.click(screen.getByTitle('Jane Doe'));
    await userEvent.click(screen.getByText('Sign out'));
    expect(screen.queryByText('Sign out')).not.toBeInTheDocument();
  });
});

describe('UserAvatar — aria attributes', () => {
  it('sets aria-expanded=false initially', () => {
    render(<UserAvatar displayName="Jane Doe" />);
    expect(screen.getByRole('button').getAttribute('aria-expanded')).toBe('false');
  });

  it('sets aria-expanded=true when dropdown is open', async () => {
    render(<UserAvatar displayName="Jane Doe" />);
    await userEvent.click(screen.getByTitle('Jane Doe'));
    expect(screen.getByTitle('Jane Doe').getAttribute('aria-expanded')).toBe('true');
  });
});
