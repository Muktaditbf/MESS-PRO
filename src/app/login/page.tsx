'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction } from './actions';
import { User, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await loginAction(name.trim(), password);

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      if (result.mustChangePassword) {
        router.push('/change-password');
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-base px-4">
      {/* Animated teal orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Login Card */}
      <div className="animate-fade-up relative z-10 w-full max-w-[380px]">
        <div className="glass-card-static p-8">
          {/* Logo */}
          <div className="mb-6 flex flex-col items-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full border-2 border-teal/30 bg-teal-dim">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#00b4a6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 21V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v13" />
                <path d="M3 21h18" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                <path d="M10 11h4" />
                <path d="M12 11v4" />
                <path d="M6 11h.01" />
                <path d="M18 11h.01" />
                <path d="M6 15h.01" />
                <path d="M18 15h.01" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-text-primary">Pro Mess</h1>
            <p className="mt-1 text-sm text-text-muted">Sign in to continue</p>
          </div>

          {/* Divider */}
          <div className="mb-6 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Name"
              placeholder="Your name"
              icon={<User size={16} />}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="username"
              id="login-name"
            />

            <Input
              label="Password"
              placeholder="••••••••"
              icon={<Lock size={16} />}
              type="password"
              showPasswordToggle
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              id="login-password"
            />

            {/* Remember me + Forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-xs text-text-muted">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-border bg-surface accent-teal"
                />
                Remember me
              </label>
              <button
                type="button"
                className="text-xs font-medium text-teal transition-colors hover:text-teal-dark"
                onClick={() =>
                  alert('Please contact admin (Muktadi) to reset your password.')
                }
              >
                Forgot password?
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg bg-negative-dim px-3 py-2 text-sm text-negative">
                {error}
              </div>
            )}

            {/* Submit */}
            <Button type="submit" loading={loading} size="lg" id="login-submit">
              Sign In →
            </Button>
          </form>

          {/* Footer */}
          <p className="mt-5 text-center text-[11px] text-text-muted">
            No self-signup — accounts created by admin
          </p>
        </div>
      </div>
    </div>
  );
}
