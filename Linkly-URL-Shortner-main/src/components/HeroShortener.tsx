'use client';

import Link from 'next/link';
import { CircleHelp, Link2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAuth, useLinks } from '@/hooks';
import { Button, GradientTitle, ToggleSwitch } from '@/components';

const GUEST_LIMIT = 5;

export function HeroShortener() {
  const [url, setUrl] = useState('');
  const [autoPaste, setAutoPaste] = useState(false);
  const [copiedFlash, setCopiedFlash] = useState(false);
  const { isAuthenticated } = useAuth();
  const { isSubmitting, items, error, shortenLink, copyShortUrl } = useLinks();

  const remainingCount = useMemo(() => {
    if (isAuthenticated) {
      return null;
    }

    return String(Math.max(GUEST_LIMIT - items.length, 0)).padStart(2, '0');
  }, [isAuthenticated, items.length]);

  const onShorten = async () => {
    if (!url.trim()) {
      return;
    }

    const created = await shortenLink(url.trim());

    if (autoPaste) {
      const copied = await copyShortUrl(created);
      if (copied) {
        setCopiedFlash(true);
        setTimeout(() => setCopiedFlash(false), 1200);
      }
    }

    setUrl('');
  };

  if (isAuthenticated) {
    return (
      <section className="mx-auto mt-2 w-full max-w-6xl px-3 pb-2">
        <div className="relative mx-auto flex w-full max-w-4xl items-center rounded-[34px] border border-[#2B3D66] bg-[#151E31]/90 p-2 shadow-[0_8px_28px_rgba(0,20,60,0.4)] lg:hidden">
          <div className="pl-3 pr-2 text-[#8194bc]">
            <Link2 size={17} />
          </div>
          <input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="Enter the link here"
            className="h-11 flex-1 bg-transparent text-sm text-[#D2D9EA] outline-none placeholder:text-[#7282a7]"
          />
          <Button
            onClick={onShorten}
            disabled={isSubmitting}
            className="h-11 min-w-13 px-0 sm:min-w-34 sm:px-6"
            aria-label="Shorten URL"
          >
            {isSubmitting ? (
              '...'
            ) : (
              <>
                <span className="text-xl leading-none sm:hidden">&#8594;</span>
                <span className="hidden sm:inline">Shorten Now!</span>
              </>
            )}
          </Button>
        </div>

        <div className="mt-2.5 flex items-center justify-center gap-2 text-xs text-[#9DA8C1]">
          <ToggleSwitch checked={autoPaste} onChange={setAutoPaste} />
          <span>Auto Paste to Clipboard</span>
        </div>

        {error ? <p className="mt-2 text-center text-xs text-[#ef7a7a] md:text-sm">{error}</p> : null}
      </section>
    );
  }

  return (
    <section className="mx-auto mt-8 w-full max-w-5xl px-3 text-center md:mt-14">
      <GradientTitle size="lg" />
      <p className="mx-auto mt-4 max-w-2xl text-sm text-[#93A0BE] md:text-base">
        Linkly is an efficient and easy-to-use URL shortening service that streamlines your
        online experience.
      </p>

      <div className="relative mx-auto mt-7 flex w-full max-w-3xl items-center rounded-[34px] border border-[#2B3D66] bg-[#151E31]/90 p-2 shadow-[0_8px_28px_rgba(0,20,60,0.4)]">
        <div className="pl-3 pr-2 text-[#8194bc]">
          <Link2 size={18} />
        </div>
        <input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="Enter the link here"
          className="h-12 flex-1 bg-transparent text-sm text-[#D2D9EA] outline-none placeholder:text-[#7282a7]"
        />
        <Button
          onClick={onShorten}
          disabled={isSubmitting}
          className="h-12 min-w-13 px-0 sm:min-w-42.5 sm:px-6"
          aria-label="Shorten URL"
        >
          {isSubmitting ? (
            '...'
          ) : (
            <>
              <span className="text-xl leading-none sm:hidden">&#8594;</span>
              <span className="hidden sm:inline">Shorten Now!</span>
            </>
          )}
        </Button>
      </div>

      <div className="mt-4 flex items-center justify-center gap-3 text-sm text-[#9DA8C1]">
        <ToggleSwitch checked={autoPaste} onChange={setAutoPaste} />
        <span>Auto Paste from Clipboard</span>
      </div>

      <p
        className={`mt-2 text-xs transition-all duration-300 md:text-sm ${copiedFlash ? 'translate-y-0 opacity-100 text-[#21c06f]' : '-translate-y-1 opacity-0 text-transparent'}`}
        aria-live="polite"
      >
        Short URL copied to clipboard.
      </p>

      {remainingCount ? (
        <div className="mt-3 text-xs text-[#8a97b8] md:text-sm">
          <p className="flex items-center justify-center gap-1.5">
            <span>You can create</span>
            <span className="font-bold text-[#ff4d9e]">{remainingCount}</span>
            <span>more links.</span>
          </p>
          <p className="mt-1 flex items-center justify-center gap-1.5">
            <Link href="/register" className="font-semibold text-white underline decoration-[#8097ce] underline-offset-2">
              Register Now
            </Link>
            <span>to enjoy Unlimited usage</span>
            <CircleHelp size={12} className="text-[#9fb0d6]" />
          </p>
        </div>
      ) : (
        <p className="mt-3 text-xs text-[#8a97b8] md:text-sm">Unlimited link creation unlocked for your account.</p>
      )}
      {error ? <p className="mt-2 text-xs text-[#ef7a7a] md:text-sm">{error}</p> : null}
    </section>
  );
}
