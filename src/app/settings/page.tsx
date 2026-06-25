'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import { changePasswordAction } from '@/app/change-password/actions';
import { Settings, Lock, ShieldCheck } from 'lucide-react';

export default function SettingsPage() {
  const { profile } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

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
      } else {
        setSuccess('Password updated successfully!');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <Settings size={20} className="text-teal" /> Settings
            </h1>
            <p className="text-sm text-text-muted">Manage your account</p>
          </div>
        </div>

        <GlassCard hover={false}>
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
            <div 
              className="flex items-center justify-center rounded-full font-bold text-white text-2xl h-16 w-16"
              style={{ backgroundColor: profile?.avatar_color || '#00b4a6' }}
            >
              {profile?.name ? profile.name.substring(0, 2).toUpperCase() : '?'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">{profile?.name}</h2>
              <p className="text-sm text-text-muted capitalize">Role: {profile?.role}</p>
            </div>
          </div>

          <h3 className="text-base font-semibold text-text-primary flex items-center gap-2 mb-4">
            <Lock size={16} className="text-teal" /> Change Password
          </h3>

          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-sm">
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
            />

            <Input
              label="Confirm New Password"
              placeholder="Confirm new password"
              icon={<ShieldCheck size={16} />}
              type="password"
              showPasswordToggle
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />

            {error && <p className="text-sm text-negative bg-negative-dim px-3 py-2 rounded-lg">{error}</p>}
            {success && <p className="text-sm text-teal bg-teal-dim px-3 py-2 rounded-lg">{success}</p>}

            <Button type="submit" loading={loading} className="w-full">
              Update Password
            </Button>
          </form>
        </GlassCard>
      </div>
    </AppShell>
  );
}
