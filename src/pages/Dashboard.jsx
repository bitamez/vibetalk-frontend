
import { useCallback, useEffect, useRef, useState } from 'react';

import api from '../services/api.js';
import { getSocket } from '../services/socket.js';
import { useAuth } from '../context/AuthContext.jsx';

import Sidebar from '../components/Sidebar.jsx';
import ChatWindow from '../components/ChatWindow.jsx';
import ProfileModal from '../components/ProfileModal.jsx';
import Loading from '../components/Loading.jsx';

export default function Dashboard() {
  const { user, setUser, logout } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);

  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [olderMessagesLoading, setOlderMessagesLoading] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);

  const [typing, setTyping] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [error, setError] = useState('');

  const typingTimeout = useRef(null);
  const activeConversationRef = useRef(null);
  const messageRequestId = useRef(0);
  const olderRequestInProgress = useRef(false);

  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      const { data } = await api.get('/conversations');
      const items = data.conversations || [];

      setConversations(items);

      return items;
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Could not load conversations.'
      );

      return [];
    }
  }, []);

  // Initial conversation loading
  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        const { data } = await api.get('/conversations');

        if (mounted) {
          setConversations(data.conversations || []);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err.response?.data?.message ||
            'Could not load conversations.'
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initialize();

    return () => {
      mounted = false;
    };
  }, []);

  // Search users
  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      return;
    }

    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get('/users', {
          params: { q: search.trim() },
        });

        if (!cancelled) {
          setSearchResults(data.users || []);
        }
      } catch {
        if (!cancelled) {
          setSearchResults([]);
        }
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search]);

  // Load messages and mark conversation as read
  const openConversation = useCallback(async (conversation) => {
    if (!conversation?.id) return;

    const previous = activeConversationRef.current;
    const socket = getSocket();

    // Invalidate previous message requests
    const requestId = ++messageRequestId.current;

    clearTimeout(typingTimeout.current);

    if (previous?.id) {
      socket?.emit('typing:stop', {
        conversationId: previous.id,
      });
    }

    if (previous?.id && previous.id !== conversation.id) {
      socket?.emit('conversation:leave', previous.id);
    }

    setActiveConversation(conversation);
    activeConversationRef.current = conversation;

    setMessages([]);
    setHasMoreMessages(true);
    setOlderMessagesLoading(false);
    olderRequestInProgress.current = false;

    setTyping(false);
    setError('');
    setMobileChatOpen(true);
    setMessagesLoading(true);

    socket?.emit('conversation:join', conversation.id);

    try {
      const { data } = await api.get(
        `/messages/${conversation.id}`
      );

      if (
        requestId !== messageRequestId.current ||
        activeConversationRef.current?.id !== conversation.id
      ) {
        return;
      }

      const initialMessages = data.messages || [];

      setMessages(initialMessages);
      setHasMoreMessages(initialMessages.length === 50);

      await api.put(`/messages/${conversation.id}/read`);

      if (
        requestId !== messageRequestId.current ||
        activeConversationRef.current?.id !== conversation.id
      ) {
        return;
      }

      setConversations((current) =>
        current.map((item) =>
          item.id === conversation.id
            ? { ...item, unread_count: 0 }
            : item
        )
      );
    } catch (err) {
      if (requestId === messageRequestId.current) {
        setError(
          err.response?.data?.message ||
          'Could not load messages.'
        );
      }
    } finally {
      if (requestId === messageRequestId.current) {
        setMessagesLoading(false);
      }
    }
  }, []);

  // Load older messages using cursor pagination
  const loadOlderMessages = useCallback(async () => {
    const conversation = activeConversationRef.current;

    if (
      !conversation?.id ||
      !hasMoreMessages ||
      olderRequestInProgress.current ||
      messages.length === 0
    ) {
      return 0;
    }

    const oldestMessage = messages[0];
    const requestId = messageRequestId.current;

    olderRequestInProgress.current = true;
    setOlderMessagesLoading(true);

    try {
      const { data } = await api.get(
        `/messages/${conversation.id}`,
        {
          params: {
            before: oldestMessage.created_at,
            beforeId: oldestMessage.id,
          },
        }
      );

      // Ignore responses for an old conversation
      if (
        requestId !== messageRequestId.current ||
        activeConversationRef.current?.id !== conversation.id
      ) {
        return 0;
      }

      const olderMessages = data.messages || [];

      // No older messages remain
      if (olderMessages.length === 0) {
        setHasMoreMessages(false);
        return 0;
      }

      // Remove duplicates using the messages available at request time
      const existingIds = new Set(
        messages.map((message) => message.id)
      );

      const uniqueOlderMessages = olderMessages.filter(
        (message) => !existingIds.has(message.id)
      );

      // No new messages means pagination has reached its end
      if (uniqueOlderMessages.length === 0) {
        setHasMoreMessages(false);
        return 0;
      }

      // Prepend older messages without removing newer messages
      setMessages((current) => {
        const currentIds = new Set(
          current.map((message) => message.id)
        );

        const newMessages = uniqueOlderMessages.filter(
          (message) => !currentIds.has(message.id)
        );

        return [...newMessages, ...current];
      });

      setHasMoreMessages(olderMessages.length === 50);

      // Return the count directly, not from inside the state updater
      return uniqueOlderMessages.length;
    } catch (err) {
      if (requestId === messageRequestId.current) {
        setError(
          err.response?.data?.message ||
          'Could not load older messages.'
        );
      }

      return 0;
    } finally {
      if (requestId === messageRequestId.current) {
        olderRequestInProgress.current = false;
        setOlderMessagesLoading(false);
      }
    }
  }, [messages, hasMoreMessages]);

  // Listen for real-time events
  useEffect(() => {
    const socket = getSocket();

    if (!socket) return;

    function handleNewMessage(message) {
      const conversationId = message.conversation_id;

      if (!conversationId) return;

      const isActive =
        activeConversationRef.current?.id === conversationId;

      setConversations((current) =>
        current.map((conversation) => {
          if (conversation.id !== conversationId) {
            return conversation;
          }

          return {
            ...conversation,
            last_message: {
              id: message.id,
              body: message.body,
              senderId: message.sender_id,
              createdAt: message.created_at,
            },
            updated_at: message.created_at,
            unread_count: isActive
              ? 0
              : (conversation.unread_count || 0) +
                (message.sender_id === user.id ? 0 : 1),
          };
        })
      );

      if (isActive) {
        setMessages((current) => {
          const exists = current.some(
            (item) => item.id === message.id
          );

          return exists ? current : [...current, message];
        });

        if (message.sender_id !== user.id) {
          api.put(`/messages/${conversationId}/read`).catch(
            () => {}
          );
        }
      }
    }

    function handleDeletedMessage(payload) {
      setMessages((current) =>
        current.filter((message) => message.id !== payload.id)
      );

      loadConversations();
    }

    function handleTypingStart(payload) {
      if (
        payload.conversationId ===
          activeConversationRef.current?.id &&
        payload.userId !== user.id
      ) {
        setTyping(true);
      }
    }

    function handleTypingStop(payload) {
      if (
        payload.conversationId ===
          activeConversationRef.current?.id
      ) {
        setTyping(false);
      }
    }

    socket.on('message:new', handleNewMessage);
    socket.on('message:deleted', handleDeletedMessage);
    socket.on('typing:start', handleTypingStart);
    socket.on('typing:stop', handleTypingStop);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('message:deleted', handleDeletedMessage);
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);
    };
  }, [user.id, loadConversations]);

  // Send message through HTTP
  async function handleSendMessage(body) {
    const conversation = activeConversationRef.current;

    if (!conversation?.id) return false;

    try {
      const { data } = await api.post('/messages', {
        conversationId: conversation.id,
        body,
      });

      if (activeConversationRef.current?.id === conversation.id) {
        setMessages((current) => {
          const exists = current.some(
            (message) => message.id === data.message.id
          );

          return exists
            ? current
            : [...current, data.message];
        });
      }

      loadConversations();

      return true;
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Message could not be sent.'
      );

      return false;
    }
  }

  // Typing indicator
  function handleTyping() {
    const conversation = activeConversationRef.current;

    if (!conversation?.id) return;

    const socket = getSocket();

    socket?.emit('typing:start', {
      conversationId: conversation.id,
    });

    clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      socket?.emit('typing:stop', {
        conversationId: conversation.id,
      });
    }, 1200);
  }

  // Stop typing after sending
  function stopTyping() {
    clearTimeout(typingTimeout.current);

    const conversation = activeConversationRef.current;

    if (conversation?.id) {
      getSocket()?.emit('typing:stop', {
        conversationId: conversation.id,
      });
    }
  }

  // Delete message
  async function handleDeleteMessage(messageId) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this message?'
    );

    if (!confirmed) return;

    try {
      await api.delete(`/messages/${messageId}`);

      setMessages((current) =>
        current.filter((message) => message.id !== messageId)
      );

      loadConversations();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Could not delete message.'
      );
    }
  }

  // Create or open a direct conversation
  async function handleSelectUser(person) {
    try {
      setError('');

      const { data } = await api.post('/conversations', {
        isGroup: false,
        memberIds: [person.id],
      });

      setSearch('');
      setSearchResults([]);

      const items = await loadConversations();

      const conversation = items.find(
        (item) => item.id === data.conversation.id
      );

      if (conversation) {
        await openConversation(conversation);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Could not start conversation.'
      );
    }
  }

  // Create a group using usernames entered by the user
  async function handleCreateGroup() {
    const name = window.prompt('Enter a name for your group');

    if (!name?.trim()) return;

    const usernames = window.prompt(
      'Enter usernames separated by commas (without @)'
    );

    if (!usernames?.trim()) return;

    try {
      const names = [
        ...new Set(
          usernames
            .split(',')
            .map((item) => item.trim().replace(/^@/, ''))
            .filter(Boolean)
        ),
      ];

      const memberIds = [];

      for (const username of names) {
        const { data } = await api.get('/users', {
          params: { q: username },
        });

        const person = (data.users || []).find(
          (item) =>
            item.username.toLowerCase() === username.toLowerCase()
        );

        if (!person) {
          throw new Error(`User @${username} was not found.`);
        }

        memberIds.push(person.id);
      }

      if (!memberIds.length) {
        throw new Error('Add at least one other group member.');
      }

      const { data } = await api.post('/conversations', {
        isGroup: true,
        name: name.trim(),
        memberIds,
      });

      const items = await loadConversations();

      const conversation = items.find(
        (item) => item.id === data.conversation.id
      );

      if (conversation) {
        await openConversation(conversation);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Could not create group.'
      );
    }
  }

  // Update profile
  async function handleSaveProfile(profileData) {
    const { data } = await api.put('/users/me', profileData);

    setUser(data.user);
  }

  // Cleanup
  useEffect(() => {
    return () => {
      clearTimeout(typingTimeout.current);

      messageRequestId.current += 1;

      const conversation = activeConversationRef.current;

      if (conversation?.id) {
        getSocket()?.emit('typing:stop', {
          conversationId: conversation.id,
        });

        getSocket()?.emit('conversation:leave', conversation.id);
      }
    };
  }, []);

  if (loading) {
    return (
      <Loading
        message="Loading your conversations..."
        fullScreen
      />
    );
  }

  return (
    <main className="flex h-screen overflow-hidden bg-slate-50 text-slate-800">
      <Sidebar
        user={user}
        conversations={conversations}
        activeConversation={activeConversation}
        search={search}
        searchResults={searchResults}
        onSearch={setSearch}
        onSelectUser={handleSelectUser}
        onSelectConversation={openConversation}
        onCreateGroup={handleCreateGroup}
        onOpenProfile={() => setProfileOpen(true)}
        onLogout={logout}
        mobileVisible={!mobileChatOpen}
      />

  <div
  className={`${
    mobileChatOpen ? 'flex' : 'hidden'
  } min-h-0 min-w-0 flex-1 flex-col md:flex`}
>
        {error && (
          <div className="flex items-center justify-between bg-red-50 px-4 py-2 text-sm text-red-600">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError('')}
              className="font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {messagesLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loading message="Loading messages..." />
          </div>
        ) : (
          <ChatWindow
            user={user}
            conversation={activeConversation}
            messages={messages}
            typing={typing}
            onLoadOlder={loadOlderMessages}
            hasMoreMessages={hasMoreMessages}
            olderMessagesLoading={olderMessagesLoading}
            onSendMessage={async (body) => {
              const sent = await handleSendMessage(body);

              if (sent) {
                stopTyping();
              }

              return sent;
            }}
            onTyping={handleTyping}
            onDeleteMessage={handleDeleteMessage}
            onBack={() => setMobileChatOpen(false)}
          />
        )}
      </div>

      {profileOpen && (
        <ProfileModal
          user={user}
          onClose={() => setProfileOpen(false)}
          onSave={handleSaveProfile}
        />
      )}
    </main>
  );
}
