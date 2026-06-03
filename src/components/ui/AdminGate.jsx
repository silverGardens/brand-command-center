import { useState } from 'react';

export default function AdminGate({ children }) {
  const adminKey = import.meta.env.VITE_ADMIN_KEY;

  // Gate disabled if no key configured
  if (!adminKey) return children;

  const stored = localStorage.getItem('bcc_auth');
  if (stored === adminKey) return children;

  return <AdminGateForm adminKey={adminKey} />;
}

function AdminGateForm({ adminKey }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [authed, setAuthed] = useState(false);

  if (authed) return null; // parent will re-render with children

  function handleSubmit(e) {
    e.preventDefault();
    if (value === adminKey) {
      localStorage.setItem('bcc_auth', value);
      window.location.reload();
    } else {
      setError('Incorrect access key.');
    }
  }

  return (
    <div className="fixed inset-0 bg-app flex items-center justify-center z-50">
      <div className="bg-elevated border border-border rounded-md p-10 w-full max-w-md shadow-2xl">
        <div className="flex items-center gap-2 mb-8">
          <span className="text-2xl">⌘</span>
          <h1 className="text-primary text-xl font-semibold">Brand Command Center</h1>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            value={value}
            onChange={e => { setValue(e.target.value); setError(''); }}
            placeholder="Enter access key..."
            className="bg-surface border border-border rounded-md px-4 py-2.5 text-primary placeholder-muted focus:outline-none focus:border-accent text-sm"
            autoFocus
          />
          {error && <p className="text-status-red text-sm">{error}</p>}
          <button
            type="submit"
            className="bg-accent hover:bg-accent-hover text-white rounded-md py-2.5 font-medium text-sm transition-colors"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}
