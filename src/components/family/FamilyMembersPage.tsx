import React, { useState, useEffect } from 'react';

export const FamilyMembersPage: React.FC = () => {
  const [children, setChildren] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('dugnad_family');
    if (stored) {
      const family = JSON.parse(stored);
      setChildren(family.children || []);
    }
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', paddingBottom: '80px' }}>
      <div style={{ background: 'linear-gradient(135deg, #16a8b8 0%, #1298a6 100%)', padding: '24px', color: 'white' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700' }}>Familie</h1>
      </div>
      <div style={{ padding: '20px' }}>
        {children.map((child) => (
          <div key={child.id} className="card" style={{ padding: '20px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600' }}>{child.name}</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Født {child.birthYear}</p>
          </div>
        ))}
      </div>
      <div className="bottom-nav">
        <button className="bottom-nav-item" onClick={() => window.location.href = '/family-dashboard'}>
          <div className="bottom-nav-icon">🏠</div>
          Hjem
        </button>
        <button className="bottom-nav-item" onClick={() => window.location.href = '/my-shifts'}>
          <div className="bottom-nav-icon">📅</div>
          Vakter
        </button>
        <button className="bottom-nav-item active">
          <div className="bottom-nav-icon">👨‍👩‍👧</div>
          Familie
        </button>
        <button className="bottom-nav-item" onClick={() => window.location.href = '/points-tier'}>
          <div className="bottom-nav-icon">⭐</div>
          Poeng
        </button>
      </div>
    </div>
  );
};
