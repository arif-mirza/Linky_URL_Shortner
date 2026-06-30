'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks';
import { Button, FormInput, GradientTitle } from '@/components';

export function RegisterClientPage() {
  const router = useRouter();
  const { performRegister, initialized, isAuthenticated, isLoading, error } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (initialized && isAuthenticated) {
      router.replace('/');
    }
  }, [initialized, isAuthenticated, router]);

  if (!initialized || isAuthenticated) {
    return <section className="mx-auto min-h-[calc(100vh-150px)] w-full max-w-4xl px-4 py-8" />;
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    if (password !== confirmPassword) {
      setLocalError('Password and confirm password do not match');
      return;
    }

    try {
      await performRegister({ name, email, password });
      router.push('/');
    } catch {
      // Error state is handled by Redux and displayed below the form.
    }
  };

  return (
    <section className="mx-auto flex min-h-[calc(100vh-150px)] w-full max-w-4xl flex-col justify-between px-4 pb-7 pt-4">
      <div className="mx-auto w-full max-w-xl">
        <GradientTitle />
        <p className="mx-auto mt-4 max-w-lg text-center text-sm text-[#93A0BE] md:text-base">
          Linkly is an efficient and easy-to-use URL shortening service that streamlines your
          online experience.
        </p>

        <form onSubmit={onSubmit} className="mt-7 space-y-4">
          <FormInput
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            required
          />
          <FormInput
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Name"
            required
          />
          <FormInput
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            required
          />
          <FormInput
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Confirm Password"
            required
          />
          <Button className="mx-auto block min-w-45" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register'}
          </Button>
        </form>

        {localError ? <p className="mt-4 text-center text-sm text-[#ef7a7a]">{localError}</p> : null}
        {error ? <p className="mt-4 text-center text-sm text-[#ef7a7a]">{error}</p> : null}

      </div>

      <p className="pb-1 text-center text-xs text-[#8ea0c7] md:text-sm">
        <Link href="/login" className="text-[#3f7cff] underline decoration-[#3f7cff] underline-offset-2">
          Sign in
        </Link>{' '}
        if already registered
      </p>
    </section>
  );
}
