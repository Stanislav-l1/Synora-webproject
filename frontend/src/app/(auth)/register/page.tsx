'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';
import { useT, LocaleSwitcher } from '@/lib/i18n';

export default function RegisterPage() {
  const t = useT();
  const router = useRouter();
  const { register, isLoading } = useAuthStore();

  const passwordRules = [
    { label: t.auth.ruleMinLength, test: (p: string) => p.length >= 8 },
    { label: t.auth.ruleUppercase, test: (p: string) => /[A-Z]/.test(p) },
    { label: t.auth.ruleNumber, test: (p: string) => /\d/.test(p) },
  ];
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    const form = new FormData(e.currentTarget);
    const firstName = (form.get('firstName') as string).trim();
    const lastName = (form.get('lastName') as string).trim();
    const username = (form.get('username') as string).trim();
    const email = (form.get('email') as string).trim();

    const displayName = [firstName, lastName].filter(Boolean).join(' ') || undefined;

    try {
      await register({ username, email, password, displayName });
      router.push('/feed');
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[Object.keys(err.response?.data?.errors || {})[0]] ||
        t.auth.regError;
      setError(msg);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cloud px-4 py-8 relative overflow-hidden">
      <div className="blob-tyrian absolute -top-20 -right-20 w-80 h-80 pointer-events-none" />
      <div className="blob-banana absolute -bottom-20 -left-20 w-96 h-96 pointer-events-none" />

      <div className="w-full max-w-sm relative">
        <div className="bg-moss border border-moss-deep rounded-2xl p-8 shadow-xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-banana rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-moss-deep font-bold text-xl">S</span>
            </div>
            <h1 className="text-2xl font-bold text-cloud">{t.auth.registerTitle}</h1>
            <p className="text-sm text-moss-soft mt-1">{t.auth.registerSubtitle}</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-tyrian/20 border border-tyrian-glow/30 text-banana text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input tone="dark" label={t.auth.firstName} name="firstName" placeholder="John" required />
              <Input tone="dark" label={t.auth.lastName} name="lastName" placeholder="Doe" required />
            </div>

            <Input tone="dark" label={t.auth.username} name="username" placeholder="johndoe" required />

            <Input
              tone="dark"
              label={t.auth.email}
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />

            <div className="relative">
              <Input
                tone="dark"
                label={t.auth.passwordField}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-moss-soft hover:text-banana transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Password rules */}
            {password.length > 0 && (
              <div className="space-y-1.5 animate-fade-in">
                {passwordRules.map((rule) => {
                  const passed = rule.test(password);
                  return (
                    <div key={rule.label} className="flex items-center gap-2 text-xs">
                      <div
                        className={cn(
                          'w-4 h-4 rounded-full flex items-center justify-center transition-colors',
                          passed ? 'bg-banana' : 'bg-moss-deep',
                        )}
                      >
                        <Check size={10} className={passed ? 'text-moss-deep' : 'text-moss-soft'} />
                      </div>
                      <span className={passed ? 'text-cloud' : 'text-moss-soft'}>
                        {rule.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <label className="flex items-start gap-2 text-sm text-moss-soft cursor-pointer">
              <input
                type="checkbox"
                required
                className="w-4 h-4 mt-0.5 rounded border-moss-velvet bg-moss-deep accent-banana"
              />
              <span>
                <Link href="/terms" className="text-banana hover:text-banana-soft">{t.auth.terms}</Link>
                {' · '}
                <Link href="/privacy" className="text-banana hover:text-banana-soft">{t.auth.privacy}</Link>
              </span>
            </label>

            <Button type="submit" className="w-full" size="lg" loading={isLoading} variant="banana">
              {t.auth.registerBtn}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-moss-velvet" />
            <span className="text-xs text-moss-soft">{t.auth.orContinue}</span>
            <div className="flex-1 h-px bg-moss-velvet" />
          </div>

          {/* Social login */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" tone="dark" size="md">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub
            </Button>
            <Button variant="secondary" tone="dark" size="md">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6 text-sm text-cloud-ink/70">
          <LocaleSwitcher />
          <p>
            {t.auth.haveAccount}{' '}
            <Link href="/login" className="text-tyrian hover:text-tyrian-soft font-medium transition-colors">
              {t.auth.signIn}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
