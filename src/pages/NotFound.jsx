
import { Link } from 'react-router-dom';
import { MessageCircle, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">

      {/* Content card */}
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/60 sm:p-14">

        {/* Logo */}
        <div className="mx-auto mb-7 grid h-16 w-16 place-items-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
          <MessageCircle size={30} />
        </div>

        {/* Error code */}
        <h1 className="text-7xl font-black tracking-tight text-blue-600 sm:text-8xl">
          404
        </h1>

        {/* Heading */}
        <h2 className="mt-4 text-2xl font-bold text-slate-900">
          Page not found
        </h2>

        {/* Description */}
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
          Oops! The page you're looking for doesn't exist,
          may have been moved, or is temporarily unavailable.
        </p>

        {/* Back button */}
        <Link
          to="/"
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
        >
          <ArrowLeft size={18} />
          Back to VibeTalk
        </Link>

        {/* Footer */}
        <div className="mt-9 border-t border-slate-100 pt-5">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} VibeTalk. Connect and communicate.
          </p>
        </div>

      </div>
    </main>
  );
}
