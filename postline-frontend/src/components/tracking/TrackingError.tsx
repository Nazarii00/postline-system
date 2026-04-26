import { AlertCircle } from 'lucide-react';

export const TrackingError = ({ message }: { message: string }) => (
  <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur p-6 rounded-3xl border border-red-200 text-red-600 shadow-sm flex items-center justify-center gap-3 animate-in fade-in">
    <AlertCircle size={24} />
    <p className="font-bold text-lg">{message}</p>
  </div>
);