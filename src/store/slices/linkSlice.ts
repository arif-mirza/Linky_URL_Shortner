import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { linksApi } from '@/api';
import { ApiClientError } from '@/api/client';
import { logoutThunk } from '@/store/slices/authSlice';
import type { LinkItem, LinkStatus } from '@/types';

interface LinksState {
  items: LinkItem[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

const initialState: LinksState = {
  items: [],
  isLoading: false,
  isSubmitting: false,
  error: null,
};

export const fetchLinksThunk = createAsyncThunk('links/fetch', async (_payload, { rejectWithValue }) => {
  try {
    return await linksApi.list();
  } catch (error) {
    if (error instanceof ApiClientError) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Unable to fetch links');
  }
});

export const createLinkThunk = createAsyncThunk(
  'links/create',
  async (originalUrl: string, { rejectWithValue }) => {
    try {
      return await linksApi.create({ originalUrl });
    } catch (error) {
      if (error instanceof ApiClientError) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Unable to create link');
    }
  },
);

export const updateLinkThunk = createAsyncThunk(
  'links/update',
  async (payload: { id: string; originalUrl?: string; status?: LinkStatus }, { rejectWithValue }) => {
    try {
      return await linksApi.update(payload.id, {
        originalUrl: payload.originalUrl,
        status: payload.status,
      });
    } catch (error) {
      if (error instanceof ApiClientError) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Unable to update link');
    }
  },
);

export const deleteLinkThunk = createAsyncThunk('links/delete', async (id: string, { rejectWithValue }) => {
  try {
    return await linksApi.remove(id);
  } catch (error) {
    if (error instanceof ApiClientError) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Unable to delete link');
  }
});

const linksSlice = createSlice({
  name: 'links',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLinksThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLinksThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.links;
        state.error = null;
      })
      .addCase(fetchLinksThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = typeof action.payload === 'string' ? action.payload : 'Unable to fetch links';
      })
      .addCase(createLinkThunk.pending, (state) => {
        state.isSubmitting = true;
      })
      .addCase(createLinkThunk.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.items = [action.payload.link, ...state.items];
        state.error = null;
      })
      .addCase(createLinkThunk.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = typeof action.payload === 'string' ? action.payload : 'Unable to create link';
      })
      .addCase(updateLinkThunk.rejected, (state, action) => {
        state.error = typeof action.payload === 'string' ? action.payload : 'Unable to update link';
      })
      .addCase(deleteLinkThunk.rejected, (state, action) => {
        state.error = typeof action.payload === 'string' ? action.payload : 'Unable to delete link';
      })
      .addCase(updateLinkThunk.fulfilled, (state, action) => {
        state.items = state.items.map((item) =>
          item.id === action.payload.link.id ? action.payload.link : item,
        );
        state.error = null;
      })
      .addCase(deleteLinkThunk.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload.id);
        state.error = null;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.items = [];
        state.error = null;
        state.isLoading = false;
        state.isSubmitting = false;
      });
  },
});

export default linksSlice.reducer;
