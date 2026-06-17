import React from 'react';

export const getInitials = (name: string) => {
  if (!name) return '??';
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  } else if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return '??';
};

interface ProfileAvatarProps {
  name: string;
  avatarUrl?: string | null;
  className?: string;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ name, avatarUrl, className = '' }) => {
  // Always render initials for consistency and to match the requirement 
  // "foto profil customer hapus dan ganti jadi inisial nama customer"
  // Even if avatarUrl exists, we ignore it and show the circular initials.

  // We ensure the rounded shape is applied natively if not passed in className,
  // but it's usually best to ensure "rounded-full" is included.
  const hasRounded = className.includes('rounded-');
  const roundedClass = hasRounded ? '' : 'rounded-full';

  return (
    <div className={`bg-[#152549] text-white flex items-center justify-center font-bold tracking-wide ${roundedClass} ${className}`}>
      {getInitials(name)}
    </div>
  );
};
