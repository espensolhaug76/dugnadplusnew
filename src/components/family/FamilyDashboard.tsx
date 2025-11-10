import React from 'react';

export const FamilyDashboard: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', paddingBottom: '80px' }}>
      <div style={{ background: 'linear-gradient(135deg, #16a8b8 0%, #1298a6 100%)', padding: '24px', color: 'white' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Familiedashboard</h1>
        <div className="badge badge-basis">Basis Nivå</div>
      </div>
      <div style={{ padding: '20px' }}>
        <div className="card" style={{ padding: '24px', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Dine poeng</h2>
          <div style={{ fontSize: '48px', fontWeight: '700', color: 'var(--primary-color)', marginBottom: '16px' }}>0</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '0%' }} />
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px' }}>100 poeng til Aktiv nivå</p>
        </div>
      </div>
      <div className="bottom-nav">
        <button className="bottom-nav-item active">
          <div className="bottom-nav-icon">🏠</div>
          Hjem
        </button>
        <button className="bottom-nav-item" onClick={() => window.location.href = '/my-shifts'}>
          <div className="bottom-nav-icon">📅</div>
          Vakter
        </button>
        <button className="bottom-nav-item" onClick={() => window.location.href = '/family-members'}>
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
