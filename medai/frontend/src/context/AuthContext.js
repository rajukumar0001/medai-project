/**
 * Auth Context
 * Global authentication state management with JWT
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback
} from 'react';

import api from '../api/axios';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: localStorage.getItem('medai_token') || null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        user: action.payload.user,
        token: action.payload.token,
        error: null
      };

    case 'AUTH_FAIL':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        error: action.payload
      };

    case 'LOGOUT':
      return {
        ...initialState,
        token: null,
        isLoading: false
      };

    case 'UPDATE_USER':
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload
        }
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };

    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ================= Load User =================
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('medai_token');

      if (!token) {
        dispatch({
          type: 'SET_LOADING',
          payload: false
        });
        return;
      }

      try {
        const { data } = await api.get('/auth/me');

        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: data.user,
            token
          }
        });

      } catch (error) {
        localStorage.removeItem('medai_token');

        dispatch({
          type: 'SET_LOADING',
          payload: false
        });
      }
    };

    loadUser();
  }, []);

  // ================= LOGIN =================
  const login = useCallback(async (email, password) => {
    dispatch({ type: 'AUTH_START' });

    try {
      const { data } = await api.post('/auth/login', {
        email,
        password
      });

      localStorage.setItem('medai_token', data.token);

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: data
      });

      return {
        success: true,
        message: data.message
      };

    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Login failed';

      dispatch({
        type: 'AUTH_FAIL',
        payload: message
      });

      return {
        success: false,
        message
      };
    }
  }, []);

  // ================= REGISTER =================
  const register = useCallback(async (formData) => {
    dispatch({ type: 'AUTH_START' });

    try {
      const { data } = await api.post('/auth/register', formData);

      localStorage.setItem('medai_token', data.token);

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: data
      });

      return {
        success: true,
        message: data.message
      };

    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Registration failed';

      dispatch({
        type: 'AUTH_FAIL',
        payload: message
      });

      return {
        success: false,
        message
      };
    }
  }, []);

  // ================= LOGOUT =================
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {}

    localStorage.removeItem('medai_token');

    dispatch({
      type: 'LOGOUT'
    });
  }, []);

  // ================= UPDATE USER =================
  const updateUser = useCallback((userData) => {
    dispatch({
      type: 'UPDATE_USER',
      payload: userData
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ================= USE AUTH =================
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};