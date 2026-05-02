import React, { useState, useRef, useEffect } from 'react';

interface UserAvatarProps {
  displayName?: string | null;
  email?: string | null;
  onSignOut?: () => void;
}

function getInitials(displayName?: string | null, email?: string | null) {
  if (displayName) {
    const names = displayName.trim().split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return '?';
}

const UserAvatar: React.FC<UserAvatarProps> = ({ displayName, email, onSignOut }) => {
  const initials = getInitials(displayName, email);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        title={displayName || email || 'Account'}
        aria-haspopup="true"
        aria-expanded={open}
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/[0.12] bg-purple-500/15 text-sm font-semibold text-purple-300 transition hover:border-white/[0.22] hover:bg-purple-500/25 focus:outline-none"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-white/[0.09] bg-[#0d0b1e]/95 shadow-xl shadow-black/40 backdrop-blur-xl">
          {/* Account info */}
          <div className="border-b border-white/[0.07] px-4 py-3">
            <div className="truncate text-xs font-semibold text-white/80">
              {displayName || 'Account'}
            </div>
            {email && (
              <div className="mt-0.5 truncate text-[11px] text-white/35">{email}</div>
            )}
          </div>
          {/* Actions */}
          <div className="p-1">
            <button
              className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/60 transition hover:bg-white/[0.06] hover:text-white"
              onClick={() => { setOpen(false); onSignOut?.(); }}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
