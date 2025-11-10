import React, { useState, useEffect } from 'react';

// NOTE: StatCard is defined outside to allow it to be used within the main component scope
const StatCard = ({ icon, label, value, color }: { icon: string; label: string; value: number; color: string }) => (
  <div className="stat-card" style={{ borderLeft: 4px solid , border: '1px solid var(--border-color)' }}>
    <div style={{ fontSize: '32px', marginBottom: '8px', color: color }}>{icon}</div>
    <div className="stat-card-value" style={{ fontSize: '28px' }}>
      {value}
    </div>
    <div className="stat-card-label" style={{ fontWeight: '500' }}>
      {label}
    </div>
  </div>
);

export const CoordinatorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('oversikt');
  const [selectedTeam, setSelectedTeam] = useState('g2016');
  const [stats, setStats] = useState({
    totalShifts: 0,
    assignedShifts: 0,
    pendingShifts: 0
  });

  useEffect(() => {
    // Logic to fetch stats based on localStorage (kept from original)
    const events = JSON.parse(localStorage.getItem('dugnad_events') || '[]');
    const totalShifts = events.reduce((sum: number, e: any) => sum + (e.shifts?.length || 0), 0);
    const assignedShifts = events.reduce((sum: number, e: any) => 
      sum + (e.shifts?.filter((s: any) => s.assignedPeople > 0).length || 0), 0);
    
    setStats({
      totalShifts,
      assignedShifts,
      pendingShifts: totalShifts - assignedShifts
    });
  }, []);

  const teams = [
    { id: 'g2016', name: 'Gutter 2016', color: '#2196F3', members: 24 },
    { id: 'j2015', name: 'Jenter 2015', color: '#E91E63', members: 18 },
    { id: 'g2014', name: 'Gutter 2014', color: '#4CAF50', members: 22 }
  ];

  const currentTeam = teams.find(t => t.id === selectedTeam);

  return (
    // Use .page and the layout structure defined in App.css
    <div className="page" style={{ flexDirection: 'row' }}>
      
      {/* Sidebar - Use the .sidebar class */}
      <div className="sidebar" style={{ width: '260px', minWidth: '260px', position: 'sticky', top: 0 }}>
        
        {/* Club Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{
            width: '56px',
            height: '56px',
            background: 'linear-gradient(135deg, var(--primary-color) 0%, #0d7f8a 100%)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '22px',
            fontWeight: '700',
            marginBottom: '12px'
          }}>
            KIL
          </div>
          <h2 style={{ fontSize: '17px', fontWeight: '600', margin: '0 0 4px 0' }}>
            Kongsvinger IL
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            Sesong 2025
          </p>
        </div>

        {/* Teams */}
        <div style={{ padding: 'var(--spacing-md)', borderBottom: '1px solid var(--border-color)', flex: 1 }}>
          <h3 style={{
            fontSize: '11px',
            fontWeight: '600',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: 'var(--spacing-md)',
            paddingLeft: '4px'
          }}>
            LAG
          </h3>
          {teams.map(team => (
            <button
              key={team.id}
              onClick={() => setSelectedTeam(team.id)}
              className={selectedTeam === team.id ? 'sidebar-nav-item active' : 'sidebar-nav-item'}
              style={{
                background: selectedTeam === team.id ? 'var(--primary-color)' : 'transparent',
                color: selectedTeam === team.id ? 'white' : 'var(--text-secondary)',
                fontWeight: selectedTeam === team.id ? '600' : '500',
                justifyContent: 'space-between',
              }}
              onMouseEnter={(e) => {
                if (selectedTeam !== team.id) e.currentTarget.style.background = 'var(--background)';
              }}
              onMouseLeave={(e) => {
                if (selectedTeam !== team.id) e.currentTarget.style.background = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '10px', height: '10px', background: team.color, borderRadius: '50%' }} />
                <span>
                  {team.name}
                </span>
              </div>
              <span style={{ fontSize: '12px', opacity: 0.8 }}>{team.members}</span>
            </button>
          ))}
        </div>

        {/* Handlinger */}
        <div style={{ padding: 'var(--spacing-md)' }}>
          <h3 style={{
            fontSize: '11px',
            fontWeight: '600',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: 'var(--spacing-md)',
            paddingLeft: '4px'
          }}>
            HANDLINGER
          </h3>
          <button
            onClick={() => window.location.href = '/create-event'}
            className="btn btn-primary"
            style={{ marginBottom: 'var(--spacing-sm)', width: '100%' }}
          >
            <span>?</span>
            Nytt arrangement
          </button>
          <button
            onClick={() => window.location.href = '/events-list'}
            className="btn"
            style={{ marginBottom: 'var(--spacing-sm)', width: '100%', background: 'white', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
          >
            <span>??</span>
            Mine arrangementer
          </button>
          <button
            onClick={() => window.location.href = '/manage-families'}
            className="btn"
            style={{ width: '100%', background: 'white', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
          >
            <span>??</span>
            Administrer familier
          </button>
        </div>
      </div>

      {/* Main Content - Use the .main-content class */}
      <div className="main-content" style={{ marginLeft: '260px', padding: 0 }}>
        {/* Top Banner (Mimics Spond's KIL Fotball G2016 banner) */}
        <div style={{
          background: 'linear-gradient(135deg, var(--primary-color) 0%, #0d7f8a 100%)',
          padding: 'var(--spacing-xl) var(--spacing-lg)',
          color: 'white'
        }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>
            Dugnadsoversikt
          </h1>
          <p style={{ fontSize: '15px', opacity: 0.9, margin: '4px 0 0 0' }}>
            {currentTeam?.name}
          </p>
        </div>

        {/* Horizontal Menu */}
        <div style={{
          background: 'white',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          padding: '0 var(--spacing-lg)'
        }}>
          {[
            { id: 'oversikt', label: 'Oversikt', icon: '??' },
            { id: 'vakter', label: 'Vakter', icon: '??' },
            { id: 'familier', label: 'Familier', icon: '??' },
            { id: 'arrangementer', label: 'Arrangementer', icon: '??' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: 'var(--spacing-md) var(--spacing-lg)',
                background: 'transparent',
                border: 'none',
                // Updated to use App.css primary color for consistency
                borderBottom: activeTab === tab.id ? '3px solid var(--primary-color)' : '3px solid transparent',
                color: activeTab === tab.id ? 'var(--primary-color)' : 'var(--text-secondary)',
                fontSize: '15px',
                fontWeight: activeTab === tab.id ? '600' : '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div style={{ padding: 'var(--spacing-xl)' }}>
          {activeTab === 'oversikt' && (
            <>
              {/* Stats - 3 equal columns */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 'var(--spacing-lg)',
                marginBottom: 'var(--spacing-xl)'
              }}>
                <StatCard icon="??" label="Totalt vakter" value={stats.totalShifts} color="#2196F3" />
                <StatCard icon="?" label="Tildelt" value={stats.assignedShifts} color="#4CAF50" />
                <StatCard icon="?" label="Ventende" value={stats.pendingShifts} color="#FF9800" />
              </div>

              {/* Recent Activity */}
              <div className="card">
                <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: 'var(--spacing-md)' }}>
                  Siste aktivitet
                </h2>
                {stats.totalShifts === 0 ? (
                  <div className="text-center" style={{ padding: 'var(--spacing-xl)', color: 'var(--text-secondary)' }}>
                    <div style={{ fontSize: '48px', marginBottom: 'var(--spacing-md)' }}>??</div>
                    <p>Ingen aktivitet ennå</p>
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Du har {stats.pendingShifts} ventende vakter
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
