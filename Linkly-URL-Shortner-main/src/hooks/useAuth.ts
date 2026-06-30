"use client";

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useStore';
import { loginThunk, logoutThunk, registerThunk, restoreSessionThunk } from '@/store/slices/authSlice';
import type { LoginRequest, RegisterRequest } from '@/types';

export function useAuth() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  const bootstrapSession = useCallback(async () => {
    if (auth.initialized || auth.isLoading) {
      return;
    }
    await dispatch(restoreSessionThunk());
  }, [auth.initialized, auth.isLoading, dispatch]);

  const performLogin = async (payload: LoginRequest) => {
    await dispatch(loginThunk(payload)).unwrap();
  };

  const performRegister = async (payload: RegisterRequest) => {
    await dispatch(registerThunk(payload)).unwrap();
  };

  const performLogout = async () => {
    await dispatch(logoutThunk()).unwrap();
  };

  return {
    ...auth,
    bootstrapSession,
    performLogin,
    performRegister,
    performLogout,
  };
}
