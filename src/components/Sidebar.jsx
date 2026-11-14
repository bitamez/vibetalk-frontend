
import {
  MessageCircle,
  Search,
  LogOut,
  Plus,
  UserCircle,
  MessagesSquare,
  Users,
} from 'lucide-react';

import Avatar from './Avatar.jsx';
import UserList from './UserList.jsx';

function formatTime(value) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Sidebar({
  user,
  conversations = [],
  activeConversation,
  search = '',
  searchResults = [],
  onSearch,
  onSelectUser,
  onSelectConversation,
  onCreateGroup,
  onOpenProfile,
  onLogout,
  mobileVisible = true,
}) {
  return (
    <aside
      className={`${
        mobileVisible ? 'flex' : 'hidden'
      } h-full w-full shrink-0 overflow-hidden bg-white md:flex md:w-[430px]`}
    >
      {/* Navigation rail */}
      <div className="flex w-[76px] shrink-0 flex-col items-center border-r border-slate-100 bg-white py-6">
        <div className="mb-10 grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-500 text-white shadow-lg shadow-blue-100">
          <MessageCircle size={23} />
        </div>

        <div className="flex flex-1 flex-col items-center gap-5">
          <div
            title="Messages"
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600"
          >
            <MessagesSquare size={21} />
          </div>

          <button
            type="button"
            onClick={onCreateGroup}
            title="Create a group"
            className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600"
          >
            <Users size={21} />
          </button>
        </div>

        <button
          type="button"
          onClick={onLogout}
          title="Sign out"
          className="rounded-xl p-3 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
        >
          <LogOut size={19} />
        </button>
      </div>

      {/* Conversations panel */}
      <div className="flex min-w-0 flex-1 flex-col bg-slate-50">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-5 pt-7">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Chats
            </h1>

            <p className="mt-1 text-xs text-slate-400">
              Your recent conversations
            </p>
          </div>

          <button
            type="button"
            onClick={onCreateGroup}
            title="Create a group"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-100 transition hover:bg-blue-700 active:scale-95"
          >
            <Plus size={21} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search people or chats..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            />
          </div>
        </div>

        {/* Search results */}
        <UserList
          users={searchResults}
          onSelect={onSelectUser}
        />

        {/* Conversation heading */}
        <div className="flex items-center justify-between px-5 pb-3 pt-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Recent chats
          </span>

          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
            {conversations.length}
          </span>
        </div>

        {/* Conversation list */}
        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {conversations.map((conversation) => {
            const other = conversation.members?.find(
              (member) => member.id !== user?.id
            );

            const title = conversation.is_group
              ? conversation.name
              : other?.fullName || other?.username || 'Direct chat';

            const selected =
              activeConversation?.id === conversation.id;

            return (
              <button
                key={conversation.id}
                type="button"
                onClick={() => onSelectConversation(conversation)}
                className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${
                  selected
                    ? 'bg-white shadow-sm ring-1 ring-blue-100'
                    : 'hover:bg-white'
                }`}
              >
                <Avatar
                  name={title}
                  src={
                    conversation.is_group
                      ? undefined
                      : other?.avatarUrl
                  }
                />

                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-slate-800">
                      {title}
                    </span>

                    <span className="shrink-0 text-[10px] text-slate-400">
                      {formatTime(conversation.last_message?.createdAt)}
                    </span>
                  </span>

                  <span className="mt-1 block truncate text-xs text-slate-400">
                    {conversation.last_message?.body || 'Start a conversation'}
                  </span>
                </span>

                {conversation.unread_count > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-bold text-white">
                    {conversation.unread_count}
                  </span>
                )}
              </button>
            );
          })}

          {!conversations.length && (
            <div className="px-5 py-12 text-center">
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-500">
                <MessageCircle size={22} />
              </div>

              <p className="text-sm font-semibold text-slate-600">
                No conversations yet
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-400">
                Search for someone and start a conversation.
              </p>
            </div>
          )}
        </div>

        {/* Current user profile */}
        <div className="border-t border-slate-200 bg-white p-4">
          <button
            type="button"
            onClick={onOpenProfile}
            className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-slate-50"
          >
            <Avatar
              name={user?.fullName || user?.username || 'User'}
              src={user?.avatarUrl}
              size="sm"
            />

            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-slate-800">
                {user?.fullName || user?.username}
              </span>

              <span className="text-xs text-slate-400">
                @{user?.username}
              </span>
            </span>

            <UserCircle
              size={19}
              className="text-slate-400"
            />
          </button>
        </div>
      </div>
    </aside>
  );
}
