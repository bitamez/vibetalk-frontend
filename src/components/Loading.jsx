
import { LoaderCircle } from 'lucide-react';

export default function Loading({
  message = 'Loading...',
  fullScreen = false,
}) {
  return (
    <div
      className={`flex items-center justify-center gap-3 ${
        fullScreen
          ? 'min-h-screen bg-slate-50'
          : 'py-8'
      }`}
    >
      <LoaderCircle
        size={22}
        className="animate-spin text-blue-600"
      />

      <span className="text-sm font-medium text-slate-500">
        {message}
      </span>
    </div>
  );
}
