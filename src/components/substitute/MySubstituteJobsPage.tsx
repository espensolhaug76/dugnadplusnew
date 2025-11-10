import React from 'react';

export const MySubstituteJobsPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', padding: '20px' }}>
      <h1>Mine vikaroppdrag</h1>
      <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Ingen vikaroppdrag ennå</p>
      </div>
    </div>
  );
};
