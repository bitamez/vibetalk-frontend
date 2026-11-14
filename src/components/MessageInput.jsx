
import { useState } from 'react';
import { Send } from 'lucide-react';

export default function MessageInput({
  onSend,
  onTyping,
  disabled = false,
}) {
  const [text, setText] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();

    const message = text.trim();

    if (!message || disabled) return;

    const sent = await onSend(message);

    if (sent !== false) {
      setText('');
    }
  }

  function handleChange(e) {
    setText(e.target.value);
    onTyping?.();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-3 border-t border-slate-200 bg-white p-4 md:px-6"
    >
      <textarea
        rows="1"
        value={text}
        onChange={handleChange}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
        placeholder="Write a message..."
        maxLength={5000}
        disabled={disabled}
        className="min-h-[48px] max-h-32 flex-1 resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
      />

      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm transition hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Send message"
      >
        <Send size={19} />
      </button>
    </form>
  );
}
