import React from 'react';

export const ProfileHeader: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
        Мій профіль
      </h1>
      <p className="text-slate-500 text-sm md:text-base mt-2">
        Персональні дані та налаштування безпеки.
      </p>
    </div>
  );
};