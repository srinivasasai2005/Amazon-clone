export default function RatingStars({ rating = 0, small = false }) {
  const r     = Math.max(0, Math.min(5, Number(rating)));
  const full  = Math.floor(r);
  const half  = r % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  const size  = small ? 12 : 16;

  const Star = ({ type }) => {
    const base = { display: 'inline-block', width: size, height: size, position: 'relative', flexShrink: 0 };
    if (type === 'full') return (
      <span style={{ ...base, color: '#FFA41C', fontSize: size }}>★</span>
    );
    if (type === 'half') return (
      <span style={{ ...base, position: 'relative', display: 'inline-block' }}>
        <span style={{ color: '#DDD', fontSize: size, position: 'absolute' }}>★</span>
        <span style={{ color: '#FFA41C', fontSize: size, position: 'absolute', overflow: 'hidden', width: '50%' }}>★</span>
        <span style={{ fontSize: size, opacity: 0 }}>★</span>
      </span>
    );
    return <span style={{ ...base, color: '#DDD', fontSize: size }}>★</span>;
  };

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 0, lineHeight: 1 }}
      title={`${r.toFixed(1)} out of 5`}>
      {Array.from({ length: full  }).map((_, i) => <Star key={`f${i}`} type="full" />)}
      {half ? <Star type="half" /> : null}
      {Array.from({ length: empty }).map((_, i) => <Star key={`e${i}`} type="empty" />)}
    </span>
  );
}
