
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import api from '../services/api.js';

import {
  connectSocket,
  disconnectSocket,
} from '../services/socket.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore an existing login session
  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      const token = localStorage.getItem('vibetalk_token');

      if (!token) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/users/me');

        if (!mounted) return;

        setUser(data.user);
        connectSocket(token);
      } catch (error) {
        localStorage.removeItem('vibetalk_token');
        disconnectSocket();

        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  // Login
  async function login(credentials) {
    const { data } = await api.post('/auth/login', credentials);

    localStorage.setItem('vibetalk_token', data.token);

    setUser(data.user);
    connectSocket(data.token);

    return data.user;
  }

  // Registration does not automatically authenticate
  async function register(userData) {
    const { data } = await api.post('/auth/register', userData);

    return data.user;
  }

  // Logout
  function logout() {
    localStorage.removeItem('vibetalk_token');

    disconnectSocket();

    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
