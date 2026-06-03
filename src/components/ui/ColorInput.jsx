export default function ColorInput({ label, value, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-muted uppercase tracking-wide">{label}</label>}
      <div className="flex items-center gap-2">
        <div className="relative w-9 h-9 rounded-md overflow-hidden border border-border flex-shrink-0">
          <input
            type="color"
            value={value || '#000000'}
            onChange={e => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
          />
          <div
            className="w-full h-full rounded-md"
            style={{ backgroundColor: value || '#000000' }}
          />
        </div>
        <input
          type="text"
          value={value || ''}
          onChange={e => {
            const v = e.target.value;
            if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v);
          }}
          placeholder="#000000"
          className="flex-1 bg-elevated border border-border rounded-md px-3 py-2 text-primary text-sm placeholder-muted focus:outline-none focus:border-accent font-mono"
          maxLength={7}
        />
      </div>
    </div>
  );
}
