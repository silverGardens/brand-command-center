export default function Analytics() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-primary text-2xl font-semibold">Analytics</h1>
        <p className="text-muted text-sm mt-1">Portfolio-wide performance across all sites</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Subscribers', value: '—', note: 'Across all sites' },
          { label: 'Total Posts', value: '—', note: 'Published' },
          { label: 'Active Sites', value: '—', note: 'Currently live' },
        ].map(card => (
          <div key={card.label} className="bg-surface border border-border rounded-md p-5">
            <p className="text-muted text-xs font-semibold uppercase tracking-wide mb-2">{card.label}</p>
            <p className="text-primary text-3xl font-bold mb-1">{card.value}</p>
            <p className="text-muted text-xs">{card.note}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface border border-border rounded-md p-8 text-center">
        <p className="text-muted text-sm">Analytics dashboard coming soon.</p>
        <p className="text-muted text-xs mt-2">Subscriber growth, post performance, and traffic data will appear here.</p>
      </div>
    </div>
  );
}
