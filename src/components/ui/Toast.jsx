import { useToast } from '../../hooks/useToast';

const borderColors = {
  success: 'border-l-status-green',
  error: 'border-l-status-red',
  info: 'border-l-accent',
};

const textColors = {
  success: 'text-status-green',
  error: 'text-status-red',
  info: 'text-accent',
};

export default function Toast() {
  const { toasts } = useToast();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 min-w-[280px] max-w-sm">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`bg-elevated border border-border border-l-4 ${borderColors[toast.type]} rounded-md px-4 py-3 shadow-lg flex items-start gap-3 animate-in`}
          style={{ animation: 'slideIn 0.2s ease-out' }}
        >
          <span className={`text-xs font-semibold uppercase tracking-wide mt-0.5 ${textColors[toast.type]}`}>
            {toast.type}
          </span>
          <p className="text-primary text-sm flex-1">{toast.message}</p>
        </div>
      ))}
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
