
import { Navigate } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">
          <LoaderCircle
            size={28}
            className="animate-spin text-blue-600"
          />
        </div>

        <p className="text-sm font-semibold text-slate-600">
          Loading VibeTalk...
        </p>

        <p className="text-xs text-slate-400">
          Preparing your conversations
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
