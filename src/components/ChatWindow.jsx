
import { useLayoutEffect, useRef } from 'react';
import {
  ArrowLeft,
  MessageCircle,
} from 'lucide-react';

import Avatar from './Avatar.jsx';
import Message from './Message.jsx';
import MessageInput from './MessageInput.jsx';

export default function ChatWindow({
  user,
  conversation,
  messages = [],
  typing = false,
  onSendMessage,
  onTyping,
  onDeleteMessage,
  onBack,
  onLoadOlder,
  hasMoreMessages = false,
  olderMessagesLoading = false,
}) {
  const messagesContainerRef = useRef(null);
  const pendingScrollRef = useRef(null);
  const previousFirstIdRef = useRef(null);
  const previousLastIdRef = useRef(null);
  const initializedRef = useRef(false);
  const loadingRef = useRef(false);

  const other = conversation?.members?.find(
    (member) => member.id !== user?.id
  );

  const title = conversation?.is_group
    ? conversation.name
    : other?.fullName || other?.username || 'Direct chat';

  // Reset scroll tracking when changing conversations.
  useLayoutEffect(() => {
    initializedRef.current = false;
    pendingScrollRef.current = null;
    loadingRef.current = false;

    previousFirstIdRef.current = null;
    previousLastIdRef.current = null;

    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = 0;
    }
  }, [conversation?.id]);

  // Maintain scroll position when messages change.
  useLayoutEffect(() => {
    const container = messagesContainerRef.current;

    if (!container) return;

    const firstId = messages[0]?.id ?? null;
    const lastId = messages[messages.length - 1]?.id ?? null;

    if (pendingScrollRef.current) {
      // Preserve the user's position after older messages are prepended.
      const previous = pendingScrollRef.current;

      container.scrollTop =
        previous.scrollTop +
        (container.scrollHeight - previous.scrollHeight);

      pendingScrollRef.current = null;
    } else if (!initializedRef.current) {
      // Initially show the newest messages.
      container.scrollTop = container.scrollHeight;
      initializedRef.current = true;
    } else if (
      lastId &&
      lastId !== previousLastIdRef.current &&
      firstId === previousFirstIdRef.current
    ) {
      // Scroll down when a new message is appended.
      container.scrollTop = container.scrollHeight;
    }

    previousFirstIdRef.current = firstId;
    previousLastIdRef.current = lastId;
  }, [messages]);

  // Load older messages.
  async function requestOlderMessages() {
    const container = messagesContainerRef.current;

    if (
      !container ||
      !hasMoreMessages ||
      olderMessagesLoading ||
      loadingRef.current ||
      !onLoadOlder
    ) {
      return;
    }

    loadingRef.current = true;

    // Save the current scroll position before loading.
    pendingScrollRef.current = {
      scrollHeight: container.scrollHeight,
      scrollTop: container.scrollTop,
    };

    try {
      const loadedCount = await onLoadOlder();

      if (!loadedCount) {
        pendingScrollRef.current = null;
      }
    } catch (err) {
      pendingScrollRef.current = null;
      console.error('Could not load older messages:', err);
    } finally {
      loadingRef.current = false;
    }
  }

  // Automatically load older messages near the top.
  function handleScroll() {
    const container = messagesContainerRef.current;

    if (!container) return;

    if (container.scrollTop <= 80) {
      requestOlderMessages();
    }
  }

  if (!conversation) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center bg-slate-50 p-8">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-3xl bg-white text-blue-600 shadow-sm">
            <MessageCircle size={36} />
          </div>

          <h2 className="text-xl font-bold text-slate-900">
            Welcome to VibeTalk
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Choose a conversation from your chats to start messaging.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white">

      {/* Chat header */}
      <header className="flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 py-4 md:px-7">
        <button
          type="button"
          className="rounded-xl p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600 md:hidden"
          onClick={onBack}
          aria-label="Back to conversations"
        >
          <ArrowLeft size={20} />
        </button>

        <Avatar
          name={title}
          src={conversation.is_group ? undefined : other?.avatarUrl}
        />

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-bold text-slate-900 md:text-base">
            {title}
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            {conversation.is_group
              ? `${conversation.members?.length || 0} members`
              : 'VibeTalk conversation'}
          </p>
        </div>
      </header>

      {/* Scrollable message area */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain bg-slate-50 px-4 py-6 md:px-8"
      >
        {hasMoreMessages && (
          <div className="mb-5 flex justify-center">
            <button
              type="button"
              onClick={requestOlderMessages}
              disabled={olderMessagesLoading}
              className="rounded-full border border-blue-200 bg-white px-4 py-2 text-xs font-semibold text-blue-600 shadow-sm transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {olderMessagesLoading
                ? 'Loading older messages...'
                : 'Load older messages'}
            </button>
          </div>
        )}

        {messages.length === 0 && (
          <div className="py-16 text-center">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-white text-blue-600 shadow-sm">
              <MessageCircle size={22} />
            </div>

            <p className="text-sm font-semibold text-slate-700">
              No messages yet
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Send the first message and say hello!
            </p>
          </div>
        )}

        {messages.map((message) => (
          <Message
            key={message.id}
            message={message}
            currentUserId={user.id}
            onDelete={onDeleteMessage}
          />
        ))}

        {typing && (
          <p className="mb-3 text-xs font-medium text-emerald-600">
            Someone is typing...
          </p>
        )}
      </div>

      {/* Fixed message input */}
      <div className="shrink-0">
        <MessageInput
          onSend={onSendMessage}
          onTyping={onTyping}
        />
      </div>
    </section>
  );
}
