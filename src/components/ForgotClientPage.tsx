'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useState } from 'react';
import { Button, FormInput, GradientTitle } from '@/components';
import { useAuth } from '@/hooks';

export function ForgotClientPage() {
  const router = useRouter();
  const { initialized, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (initialized && isAuthenticated) {
      router.replace('/');
    }
  }, [initialized, isAuthenticated, router]);

  if (!initialized || isAuthenticated) {
    return <section className="mx-auto min-h-[calc(100vh-150px)] w-full max-w-4xl px-4 py-8" />;
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-150px)] w-full max-w-4xl flex-col justify-between px-4 pb-7 pt-4">
      <div className="mx-auto w-full max-w-xl text-center">
        <GradientTitle>
          Reset Your Password
        </GradientTitle>
        <p className="mx-auto mt-4 max-w-lg text-sm text-[#93A0BE] md:text-base">
          Enter your account email to receive a reset link.
        </p>

        <form className="mt-7 space-y-4">
          <FormInput
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            required
          />
          <Button fullWidth type="submit">Send Reset Link</Button>
        </form>

        <div className="mt-4">
          <Link href="/login" className="inline-flex items-center justify-center rounded-full border border-[#2B3D66] px-5 py-2 text-sm text-[#c6d3ef] hover:bg-white/10">
            Back to Login
          </Link>
        </div>
      </div>

      <p className="pb-1 text-center text-xs text-[#8ea0c7] md:text-sm">
        <Link href="/register" className="text-[#3f7cff] underline decoration-[#3f7cff] underline-offset-2">
          Register
        </Link>{' '}
        if you don&apos;t have an account
      </p>
    </section>
  );
}
