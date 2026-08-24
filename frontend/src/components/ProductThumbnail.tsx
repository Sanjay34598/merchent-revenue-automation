import React from 'react';

interface ProductThumbnailProps {
  name: string;
  category: string;
  size?: number;
}

export const ProductThumbnail: React.FC<ProductThumbnailProps> = ({ name, category, size = 44 }) => {
  const n = name.toLowerCase();

  // Determine realistic color palette & bottle/pack shape based on product name
  let bg = '#FEF3C7';
  let accent = '#D97706';
  let label = 'Juice';

  if (n.includes('juice') || n.includes('aamras')) {
    bg = '#FFEDD5'; accent = '#EA580C'; label = 'JUICE';
  } else if (n.includes('milk') || n.includes('paneer') || n.includes('butter') || n.includes('dahi')) {
    bg = '#E0F2FE'; accent = '#0284C7'; label = 'DAIRY';
  } else if (n.includes('oil') || n.includes('ghee')) {
    bg = '#FEF9C3'; accent = '#CA8A04'; label = 'OIL';
  } else if (n.includes('bread') || n.includes('biscuit') || n.includes('parle') || n.includes('bun')) {
    bg = '#FFEDD5'; accent = '#9A3412'; label = 'BAKERY';
  } else if (n.includes('salt') || n.includes('atta') || n.includes('rice') || n.includes('dal')) {
    bg = '#F1F5F9'; accent = '#475569'; label = 'STAPLE';
  } else if (n.includes('coca') || n.includes('cola') || n.includes('pepsi') || n.includes('drink')) {
    bg = '#FEE2E2'; accent = '#DC2626'; label = 'DRINK';
  }

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: 10,
      background: bg,
      border: `1px solid ${accent}33`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      overflow: 'hidden',
      position: 'relative'
    }}>
      <div style={{
        width: size * 0.5,
        height: size * 0.65,
        borderRadius: 4,
        background: '#FFFFFF',
        border: `1.5px solid ${accent}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 2,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ width: '100%', height: 3, background: accent, borderRadius: 1 }} />
        <div style={{ fontSize: 7, fontWeight: 900, color: accent, textAlign: 'center', lineHeight: 1 }}>
          {label}
        </div>
        <div style={{ width: '80%', height: 2, background: `${accent}66`, borderRadius: 1 }} />
      </div>
    </div>
  );
};
