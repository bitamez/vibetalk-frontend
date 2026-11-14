
import { Check, Trash2 } from 'lucide-react';

import Avatar from './Avatar.jsx';

export default function Message({
  message,
  currentUserId,
  onDelete,
}) {
  const mine = message.sender_id === currentUserId;

  const content = message.body ?? message.content ?? '';

  const senderName =
    message.sender?.fullName ||
    message.sender?.username ||
    'User';

  const time = message.created_at
    ? new Date(message.created_at).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <div
      className={`mb-4 flex items-end gap-2 ${
        mine ? 'justify-end' : 'justify-start'
      }`}
    >
      {!mine && (
        <Avatar
          name={senderName}
          src={message.sender?.avatarUrl}
          size="sm"
        />
      )}

      <div
        className={`group relative max-w-[82%] rounded-2xl px-4 py-3 shadow-sm md:max-w-[65%] ${
          mine
            ? 'rounded-br-md bg-blue-600 text-white'
            : 'rounded-bl-md border border-slate-200 bg-white text-slate-700'
        }`}
      >
        {!mine && (
          <p className="mb-1 text-xs font-bold text-emerald-600">
            {senderName}
          </p>
        )}

        <p className="whitespace-pre-wrap break-words text-sm leading-6">
          {content}
        </p>

        <div
          className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
            mine ? 'text-blue-100' : 'text-slate-400'
          }`}
        >
          <span>{time}</span>

          {mine && (
            <Check
              size={12}
              className="text-emerald-300"
            />
          )}
        </div>

        {mine && onDelete && (
          <button
            type="button"
            onClick={() => onDelete(message.id)}
            title="Delete message"
            aria-label="Delete message"
            className="absolute -top-3 right-1 hidden rounded-lg border border-slate-100 bg-white p-1.5 text-slate-500 shadow-md transition hover:text-red-500 group-hover:block"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
