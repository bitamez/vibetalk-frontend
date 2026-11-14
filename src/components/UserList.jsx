
import { MessageCircle } from 'lucide-react';
import Avatar from './Avatar.jsx';

export default function UserList({ users = [], onSelect }) {
  if (!users.length) return null;

  return (
    <div className="mx-4 mb-3 max-h-56 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
      <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        People
      </p>

      {users.map((person) => (
        <button
          key={person.id}
          type="button"
          onClick={() => onSelect(person)}
          className="group flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-blue-50"
        >
          <Avatar
            name={person.fullName || person.username}
            src={person.avatarUrl}
            size="sm"
          />

          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-slate-800">
              {person.fullName || person.username}
            </span>

            <span className="block truncate text-xs text-slate-400">
              @{person.username}
            </span>
          </span>

          <span className="flex items-center gap-1 text-xs font-semibold text-blue-600 transition group-hover:text-emerald-600">
            <MessageCircle size={14} />
            Chat
          </span>
        </button>
      ))}
    </div>
  );
}
