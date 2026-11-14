
import { useState } from 'react';
import { UserRound } from 'lucide-react';

export default function Avatar({
  name = 'User',
  src,
  size = 'md',
  className = '',
}) {
  const [imageError, setImageError] = useState(false);

  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-11 w-11 text-sm',
    lg: 'h-14 w-14 text-lg',
    xl: 'h-20 w-20 text-2xl',
  };

  const initials = name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const sizeClass = sizes[size] || sizes.md;

  if (src && !imageError) {
    return (
      <img
        src={src}
        alt={`${name}'s avatar`}
        onError={() => setImageError(true)}
        className={`${sizeClass} shrink-0 rounded-2xl object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-500 font-bold text-white shadow-sm ${className}`}
      aria-label={`${name}'s avatar`}
      title={name}
    >
      {initials || <UserRound />}
    </div>
  );
}
