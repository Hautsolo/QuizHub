import {
  useState, useEffect, createContext, useContext, useMemo,
} from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import { authAPI } from '../utils/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token');
        const userData = localStorage.getItem('user');
        const guestData = localStorage.getItem('guest_user');

        if (token && userData) {
          try {
            setUser(JSON.parse(userData));
          } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('user');
          }
        } else if (guestData) {
          try {
            setUser(JSON.parse(guestData));
          } catch (error) {
            console.error('Error parsing guest data:', error);
            localStorage.removeItem('guest_user');
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { user: userData, access, refresh } = response.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      toast.success(`Welcome back, ${userData.username}!`);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { user: newUser, access, refresh } = response.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);

      toast.success(`Welcome to QuizHub, ${newUser.username}!`);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const loginAsGuest = async (guestName) => {
    try {
      // Create guest user
      const response = await fetch('http://localhost:8000/api/guest/create/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: guestName }),
      });

      if (response.ok) {
        const guestData = await response.json();
        const guestUser = {
          id: `guest_${guestData.id}`,
          username: guestData.display_name,
          isGuest: true,
          guestId: guestData.id,
          points: 0,
        };

        localStorage.setItem('guest_user', JSON.stringify(guestUser));
        setUser(guestUser);

        toast.success(`Welcome, ${guestData.display_name}!`);
        return { success: true };
      }
      throw new Error('Failed to create guest account');
    } catch (error) {
      toast.error('Failed to login as guest');
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('guest_user');
    setUser(null);
    toast.success('See you next time!');
  };

  const updateUser = (userData) => {
    setUser(userData);
    if (userData.isGuest) {
      localStorage.setItem('guest_user', JSON.stringify(userData));
    } else {
      localStorage.setItem('user', JSON.stringify(userData));
    }
  };

  const value = useMemo(() => ({
    user,
    login,
    register,
    loginAsGuest,
    logout,
    updateUser,
    loading,
    isAuthenticated: !!user,
    isGuest: user?.isGuest || false,
  }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
