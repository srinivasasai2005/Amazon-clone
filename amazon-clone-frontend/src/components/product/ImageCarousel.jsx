import { useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

export default function ImageCarousel({ images = [] }) {
  const [selected, setSelected] = useState(0);
  const [zoomed,   setZoomed]   = useState(false);

  if (!images.length) {
    return (
      <div style={{ width: '100%', height: 380, display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#f5f5f5', borderRadius: 4, color: '#999' }}>
        No images available
      </div>
    );
  }

  const prev = () => setSelected(i => (i - 1 + images.length) % images.length);
  const next = () => setSelected(i => (i + 1) % images.length);

  return (
    <div style={{ display: 'flex', gap: 12, userSelect: 'none' }}>
      {/* Thumbnail strip */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: 60, flexShrink: 0 }}>
        {images.map((img, i) => (
          <div key={i} onClick={() => setSelected(i)}
            style={{ width: 56, height: 56, border: i === selected ? '2px solid #FF9900' : '2px solid #DDD',
              borderRadius: 3, overflow: 'hidden', cursor: 'pointer', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#f8f8f8', transition: 'border-color 0.15s' }}>
            <img src={img} alt={`View ${i + 1}`} loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              onError={e => { e.target.src = 'https://placehold.co/56x56?text=?'; }} />
          </div>
        ))}
      </div>

      {/* Main image */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center',
        justifyContent: 'center', minHeight: 380, background: '#f8f8f8', borderRadius: 6,
        overflow: 'hidden', cursor: zoomed ? 'zoom-out' : 'zoom-in' }}
        onClick={() => setZoomed(z => !z)}>

        <img src={images[selected]} alt={`Product image ${selected + 1}`}
          style={{ maxWidth: zoomed ? '150%' : '100%', maxHeight: zoomed ? '600px' : '380px',
            objectFit: 'contain', transition: 'all 0.3s ease' }}
          onError={e => { e.target.src = 'https://placehold.co/400x400?text=No+Image'; }} />

        {!zoomed && (
          <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.4)',
            color: 'white', borderRadius: 4, padding: '3px 6px', display: 'flex',
            alignItems: 'center', gap: 4, fontSize: 11 }}>
            <ZoomIn size={12} /> Zoom
          </div>
        )}

        {images.length > 1 && (
          <>
            <button onClick={e => { e.stopPropagation(); prev(); }}
              style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: '50%',
                width: 34, height: 34, cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>
              <ChevronLeft size={18} />
            </button>
            <button onClick={e => { e.stopPropagation(); next(); }}
              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: '50%',
                width: 34, height: 34, cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* Dot indicators */}
        <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: 6 }}>
          {images.map((_, i) => (
            <div key={i} onClick={e => { e.stopPropagation(); setSelected(i); }}
              style={{ width: 8, height: 8, borderRadius: '50%', cursor: 'pointer', transition: 'all 0.2s',
                background: i === selected ? '#FF9900' : 'rgba(255,255,255,0.7)',
                transform: i === selected ? 'scale(1.3)' : 'scale(1)' }} />
          ))}
        </div>
      </div>
    </div>
  );
}
