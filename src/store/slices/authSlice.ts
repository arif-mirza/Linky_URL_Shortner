import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getRuntimeAuthToken, setRuntimeAuthToken } from '@/api/runtimeAuth';
import { authApi } from '@/api';
import { ApiClientError } from '@/api/client';
import type { AuthUser, LoginRequest, RegisterRequest } from '@/types';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialized: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  initialized: false,
  error: null,
};

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (payload: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authApi.login(payload);
      setRuntimeAuthToken(response.token);
      return response;
    } catch (error) {
      if (error instanceof ApiClientError) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Unable to login');
    }
  },
);

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (payload: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await authApi.register(payload);
      setRuntimeAuthToken(response.token);
      return response;
    } catch (error) {
      if (error instanceof ApiClientError) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Unable to register');
    }
  },
);

export const logoutThunk = createAsyncThunk('auth/logout', async (_payload, { rejectWithValue }) => {
  try {
    setRuntimeAuthToken(null);
    return true;
  } catch (error) {
    if (error instanceof ApiClientError) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Unable to logout');
  }
});

export const restoreSessionThunk = createAsyncThunk('auth/restore-session', async (_payload, { rejectWithValue }) => {
  const token = getRuntimeAuthToken();
  if (!token) {
    return { user: null as AuthUser | null, token: null };
  }

  try {
    const response = await authApi.me();
    return { user: response.user, token };
  } catch (error) {
    setRuntimeAuthToken(null);

    if (error instanceof ApiClientError) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Unable to restore session');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    initializeAuth: (state) => {
      state.initialized = true;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.initialized = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = typeof action.payload === 'string' ? action.payload : 'Unable to login';
      })
      .addCase(registerThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.initialized = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = typeof action.payload === 'string' ? action.payload : 'Unable to register';
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.initialized = true;
        state.error = null;
      })
      .addCase(restoreSessionThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(restoreSessionThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.initialized = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = !!action.payload.user && !!action.payload.token;
        state.error = null;
      })
      .addCase(restoreSessionThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.initialized = true;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = typeof action.payload === 'string' ? action.payload : null;
      })
      .addCase(logoutThunk.rejected, (state, action) => {
        state.error = typeof action.payload === 'string' ? action.payload : 'Unable to logout';
      });
  },
});

export const { clearAuthError, initializeAuth } = authSlice.actions;
export default authSlice.reducer;
