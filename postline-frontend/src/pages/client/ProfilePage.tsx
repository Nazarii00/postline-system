import React, { useState, useEffect } from 'react';
import { api } from '../../services/api'; // Ваш клієнт api
import { type User, type UpdateProfilePayload } from '../../types/user'; // Ваші типи
import { ProfileHeader } from '../../components/client/profile/ProfileHeader';
import { PersonalInfoForm } from '../../components/client/profile/PersonalInfoForm';
import { SecuritySettings } from '../../components/client/profile/SecuritySettings';

const ProfilePage: React.FC = () => {
  // Використовуємо User | null, щоб TS не вимагав одразу заповнювати id (number), role тощо
  const [profile, setProfile] = useState<User | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Шлях до бекенду
  const ENDPOINT = '/auth/me'; 

  useEffect(() => {
    const fetchProfile = async () => {
    try {
      // Вказуємо TS, що ми чекаємо об'єкт, в якому є поле user типу User
      const response = await api.get<{ user: User }>(ENDPOINT);
      
      // Зберігаємо в стейт саме вкладений об'єкт user
      setProfile(response.user); 
      
    } catch (err) {
      console.error("Помилка:", err);
      setError(err instanceof Error ? err.message : 'Помилка завантаження');
    } finally {
      setIsLoading(false);
    }
  };

    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Оновлюємо стейт тільки якщо профіль вже завантажено
    if (profile) {
      setProfile({
        ...profile,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile) return;
    
    setIsSaving(true);
    try {
      const payload: UpdateProfilePayload = {
        fullName: profile.fullName,
        phone: profile.phone,
        email: profile.email
      };

      // Тут теж дістаємо .user з відповіді
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

  // Показуємо лоадер, доки дані не прийшли
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