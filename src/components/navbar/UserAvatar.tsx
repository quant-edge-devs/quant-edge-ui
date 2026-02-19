import React, { useState, useRef, useEffect } from 'react';

interface UserAvatarProps {
  displayName?: string | null;
  email?: string | null;
  onSignOut?: () => void;
}

function getInitials(displayName?: string | null, email?: string | null) {
  if (displayName) {
    const names = displayName.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return '?';
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  displayName,
  email,
  onSignOut,
}) => {
  const initials = getInitials(displayName, email);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-purple-400 bg-gradient-to-br from-purple-600 to-indigo-700 text-lg font-bold text-white shadow-md focus:ring-2 focus:ring-purple-400 focus:outline-none"
        title={displayName || email || 'User'}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        {initials}
      </button>
      {open && (
        <div className="animate-fade-in absolute right-0 z-20 mt-2 w-36 rounded-lg border border-[#8B5CF6] bg-[#23203a] py-2 shadow-xl">
          <button
            className="block w-full cursor-pointer px-4 py-2 text-left text-sm text-white transition hover:bg-[#8B5CF6]/20"
            onClick={() => {
              setOpen(false);
              onSignOut && onSignOut();
            }}
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
