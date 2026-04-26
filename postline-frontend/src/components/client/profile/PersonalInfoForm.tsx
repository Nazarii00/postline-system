import React from 'react';
import { Phone, Mail } from 'lucide-react';
// Вкажіть правильний шлях до вашого файлу з типами User
import { type User } from '../../../types/user'; 

interface PersonalInfoFormProps {
  profile: User; // Використовуємо ваш тип
  isSaving: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ 
  profile, 
  isSaving, 
  onChange, 
  onSubmit 
}) => {
  const getInitials = (name: string): string => {
    if (!name) return 'UI';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="bg-white/90 backdrop-blur rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="h-32 bg-gradient-to-r from-pine/90 to-pine w-full"></div>
      
      <div className="px-6 md:px-10 pb-10 relative">
        <div className="flex flex-col sm:flex-row sm:items-end gap-5 mb-8">
          <div className="w-24 h-24 rounded-full bg-white p-1.5 shadow-sm shrink-0 -mt-12 relative z-10">
            <div className="w-full h-full bg-pine/10 rounded-full flex items-center justify-center border border-pine/20">
              <span className="text-2xl font-black text-pine">
                {getInitials(profile.fullName)}
              </span>
            </div>
          </div>
          <div className="pt-2 sm:pt-0 sm:pb-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
              {profile.fullName || 'Завантаження...'}
            </h2>
            <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">
              ID: {profile.id ? `PL-${profile.id}` : '---'}
            </p>
          </div>
        </div>

        <form className="space-y-6" onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">
                Прізвище та Ім'я
              </label>
              <input 
                type="text" 
                name="fullName"
                value={profile.fullName} 
                onChange={onChange}
                required
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pine/20 focus:border-pine focus:bg-white transition-all text-sm font-medium text-slate-900"
              />
            </div>
            
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">
                Телефон
              </label>
              <div className="relative">
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="tel" 
                  name="phone"
                  value={profile.phone} 
                  onChange={onChange}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pine/20 focus:border-pine focus:bg-white transition-all text-sm font-medium text-slate-900 font-mono"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">
                Електронна пошта
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="email" 
                  name="email"
                  value={profile.email} 
                  onChange={onChange}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pine/20 focus:border-pine focus:bg-white transition-all text-sm font-medium text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button 
              type="submit" 
              disabled={isSaving}
              className="px-8 py-3.5 bg-pine text-white text-sm font-bold rounded-2xl hover:bg-pine/90 active:scale-95 transition-all shadow-lg shadow-pine/20 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Збереження...' : 'Зберегти зміни'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};