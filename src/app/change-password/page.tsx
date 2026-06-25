'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { changePasswordAction } from './actions';
import { Lock, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ChangePasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const result = await changePasswordAction(newPassword);

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      router.push('/dashboard');
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

      {/* Card */}
      <div className="animate-fade-up relative z-10 w-full max-w-[380px]">
        <div className="glass-card-static p-8">
          {/* Icon */}
          <div className="mb-6 flex flex-col items-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full border-2 border-teal/30 bg-teal-dim">
              <ShieldCheck size={24} className="text-teal" />
            </div>
            <h1 className="text-xl font-bold text-text-primary">
              Set Your New Password
            </h1>
            <p className="mt-1 text-center text-sm text-text-muted">
              You must change your password before continuing
            </p>
          </div>

          <div className="mb-6 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="New Password"
              placeholder="Enter new password"
              icon={<Lock size={16} />}
              type="password"
              showPasswordToggle
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              id="new-password"
            />

            <Input
              label="Confirm Password"
              placeholder="Confirm new password"
              icon={<Lock size={16} />}
              type="password"
              showPasswordToggle
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              id="confirm-password"
            />

            {error && (
              <div className="rounded-lg bg-negative-dim px-3 py-2 text-sm text-negative">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} size="lg" id="change-password-submit">
              Update Password →
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
