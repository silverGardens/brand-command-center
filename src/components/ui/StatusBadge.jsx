const statusConfig = {
  active:    { bg: 'bg-status-green/20', text: 'text-status-green', dot: 'bg-status-green', label: 'Active' },
  draft:     { bg: 'bg-muted/20',        text: 'text-muted',        dot: 'bg-muted',        label: 'Draft' },
  published: { bg: 'bg-status-green/20', text: 'text-status-green', dot: 'bg-status-green', label: 'Published' },
  inactive:  { bg: 'bg-muted/20',        text: 'text-muted',        dot: 'bg-muted',        label: 'Inactive' },
  building:  { bg: 'bg-status-yellow/20',text: 'text-status-yellow',dot: 'bg-status-yellow',label: 'Building' },
};

export default function StatusBadge({ status = 'inactive', label }) {
  const cfg = statusConfig[status] ?? statusConfig.inactive;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {label ?? cfg.label}
    </span>
  );
}
