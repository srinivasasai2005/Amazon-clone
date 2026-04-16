export default function EmptyState({ icon = '📦', title = 'Nothing here yet', message = '', action = null }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '40vh', gap: 12, padding: 32, textAlign: 'center' }}>
      <div style={{ fontSize: 64, lineHeight: 1 }}>{icon}</div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111', margin: 0 }}>{title}</h2>
      {message && <p style={{ color: '#555', fontSize: 15, maxWidth: 400, margin: 0 }}>{message}</p>}
      {action && (
        <button onClick={action.onClick}
          style={{ marginTop: 8, padding: '10px 24px', background: '#FF9900', border: 'none',
            borderRadius: 20, fontSize: 14, fontWeight: 600, cursor: 'pointer',
            color: '#111', transition: 'background 0.2s' }}
          onMouseEnter={e => e.target.style.background = '#e68900'}
          onMouseLeave={e => e.target.style.background = '#FF9900'}>
          {action.label}
        </button>
      )}
    </div>
  );
}
