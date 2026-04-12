'use client';

import { useState } from 'react';
import { Camera, Save } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';
import type { ApiResponse, User } from '@/types';

export default function SettingsPage() {
  const { user } = useAuth();
  const { setUser } = useAuthStore();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    try {
      const res = await api.put<ApiResponse<User>>('/users/me', {
        displayName: displayName || null,
        bio: bio || null,
      });
      setUser(res.data.data);
    } finally {
      setIsSaving(false);
    }
  }

  if (!user) return null;

  return (
    <AppShell>
      <div className="max-w-feed mx-auto px-4 py-6 space-y-6">
        <h1 className="text-xl font-semibold text-content-primary">Settings</h1>

        {/* Profile */}
        <Card>
          <CardHeader>
            <h2 className="text-base font-medium text-content-primary">Profile</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar name={user.displayName || user.username} size="xl" />
                <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-accent rounded-full flex items-center justify-center text-white hover:bg-accent-hover transition-colors">
                  <Camera size={14} />
                </button>
              </div>
              <div>
                <p className="text-sm font-medium text-content-primary">@{user.username}</p>
                <p className="text-xs text-content-secondary">{user.email}</p>
              </div>
            </div>

            <Input
              label="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How others see you"
            />

            <Textarea
              label="Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others about yourself"
              rows={3}
            />

            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                loading={isSaving}
                icon={<Save size={14} />}
              >
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account */}
        <Card>
          <CardHeader>
            <h2 className="text-base font-medium text-content-primary">Account</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Email"
              value={user.email}
              disabled
            />
            <Input
              label="Username"
              value={user.username}
              disabled
            />
            <p className="text-xs text-content-tertiary">
              Contact support to change your email or username.
            </p>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card>
          <CardHeader>
            <h2 className="text-base font-medium text-danger">Danger Zone</h2>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-content-primary">Delete Account</p>
                <p className="text-xs text-content-secondary">
                  Permanently delete your account and all data
                </p>
              </div>
              <Button variant="danger" size="sm">
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
