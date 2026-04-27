import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { type User, type UpdateProfilePayload } from '../../types/user';
import { ProfileHeader } from '../../components/client/profile/ProfileHeader';
import { PersonalInfoForm } from '../../components/client/profile/PersonalInfoForm';
import { SecuritySettings } from '../../components/client/profile/SecuritySettings';

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const ENDPOINT = '/auth/me';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get<{ user: User }>(ENDPOINT);
        setProfile(response.user);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Помилка завантаження');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (profile) {
      setProfile({
        ...profile,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile) return;

    setIsSaving(true);
    setError(null);
    try {
      const payload: UpdateProfilePayload = {
        fullName: profile.fullName,
        phone: profile.phone,
        email: profile.email,
      };

      const response = await api.patch<{ user: User }>(ENDPOINT, payload);

      setProfile(response.user);
      setSuccessMsg('Профіль успішно оновлено!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка збереження');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-pine border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full space-y-8 animate-in fade-in duration-500">
      <ProfileHeader />
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 font-medium text-sm">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 font-medium text-sm">
          {successMsg}
        </div>
      )}

      <PersonalInfoForm 
        profile={profile} 
        onChange={handleInputChange} 
        onSubmit={handleSubmit}
        isSaving={isSaving}
      />
      
      <SecuritySettings />
    </div>
  );
};

export default ProfilePage;
