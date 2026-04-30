import type { NotificationItem } from './notificationTypes';

type NotificationListItemProps = {
  note: NotificationItem;
  onOpen: (note: NotificationItem) => void;
};

export const NotificationListItem = ({ note, onOpen }: NotificationListItemProps) => (
  <button
    type="button"
    onClick={() => onOpen(note)}
    className={`w-full text-left flex gap-4 p-4 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-200 ${
      note.isRead ? 'bg-white' : 'bg-slate-50/80'
    }`}
  >
    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${note.bg} ${note.color}`}>
      <note.icon size={18} />
    </div>
    <div className="flex-1">
      <div className="flex justify-between items-start mb-1">
        <h3 className={`text-sm ${note.isRead ? 'font-medium text-slate-700' : 'font-bold text-slate-900'}`}>
          {note.title}
        </h3>
        <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap ml-4">
          {note.time}
        </span>
      </div>
      <p className="text-[13px] text-slate-500 leading-relaxed">{note.message}</p>
    </div>
    {!note.isRead && (
      <div className="w-2 h-2 rounded-full bg-[#1a362d] mt-2 shrink-0" />
    )}
  </button>
);
