import React, { useState } from 'react';
import './CoordinatorLayout.css';

interface CoordinatorLayoutProps {
  children: React.ReactNode;
}

export const CoordinatorLayout: React.FC<CoordinatorLayoutProps> = ({ children }) => {
  const [selectedTeam, setSelectedTeam] = useState('g2016');

  const teams = [
    { id: 'g2016', name: 'Gutter 2016', color: '#2196F3', members: 24 },
    { id: 'j2015', name: 'Jenter 2015', color: '#E91E63', members: 18 },
    { id: 'g2014', name: 'Gutter 2014', color: '#4CAF50', members: 22 }
  ];

  const navigateTo = (path: string) => {
    window.location.href = path;
  };

  return (
    <div className="coordinator-layout">
      {/* Sidebar */}
      <aside className="coordinator-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">KIL</div>
          <h2 className="sidebar-club-name">Kongsvinger IL</h2>
          <p className="sidebar-season">Sesong 2025</p>
        </div>

        <div className="sidebar-section">
          <h3 className="sidebar-section-title">LAG</h3>
          {teams.map(team => (
            <button
              key={team.id}
              onClick={() => setSelectedTeam(team.id)}
              className={`team-button ${selectedTeam === team.id ? 'active' : ''}`}
            >
              <div className="team-info">
                <div className="team-dot" style={{ background: team.color }} />
                <span>{team.name}</span>
              </div>
              <span className="team-count">{team.members}</span>
            </button>
          ))}
        </div>

        <div className="sidebar-actions">
          <h3 className="sidebar-section-title">HANDLINGER</h3>
          <button onClick={() => navigateTo('/create-event')} className="btn btn-primary action-button">
            ➕ Nytt arrangement
          </button>
          <button onClick={() => navigateTo('/events-list')} className="btn btn-secondary action-button">
            📅 Mine arrangementer
          </button>
          <button onClick={() => navigateTo('/manage-families')} className="btn btn-secondary action-button">
            👥 Administrer familier
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="coordinator-main">
        {children}
      </main>
    </div>
  );
};



