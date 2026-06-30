import { GradientTitle } from '@/components';

export function ResetClientPage() {
  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-8 text-center">
      <GradientTitle />
      <p className="mx-auto mt-6 max-w-xl text-sm text-[#93A0BE] md:text-base">
        Reset password page UI is ready. Connect your secure reset token validation and update
        password endpoint here.
      </p>
    </section>
  );
}
