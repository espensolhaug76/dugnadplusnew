import React, { useState, useEffect } from 'react';
import './CoordinatorLayout.css';

const StatCard = ({ icon, label, value, color }: { icon: string; label: string; value: number; color: string }) => (
  <div className="stat-card" style={{ borderLeft: '4px solid ' + color }}>
    <div style={{ fontSize: '32px', marginBottom: '8px', color: color }}>{icon}</div>
    <div className="stat-card-value">{value}</div>
    <div className="stat-card-label">{label}</div>
  </div>
);

export const CoordinatorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('oversikt');
  const [stats, setStats] = useState({
    totalShifts: 0,
    assignedShifts: 0,
    pendingShifts: 0
  });

  useEffect(() => {
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

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div className="dashboard-banner">
        <h1 className="dashboard-title">Dugnadsoversikt</h1>
        <p className="dashboard-subtitle">Gutter 2016</p>
      </div>

      <div className="dashboard-tabs">
        {[
          { id: 'oversikt', label: '📊 Oversikt' },
          { id: 'vakter', label: '📅 Vakter' },
          { id: 'familier', label: '⚽ Spillere' },
          { id: 'arrangementer', label: '🎪 Arrangementer' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="dashboard-content">
        {activeTab === 'oversikt' && (
          <>
            <div className="stats-grid">
              <StatCard icon="📊" label="Totalt vakter" value={stats.totalShifts} color="#2196F3" />
              <StatCard icon="✅" label="Tildelt" value={stats.assignedShifts} color="#4CAF50" />
              <StatCard icon="⏳" label="Ventende" value={stats.pendingShifts} color="#FF9800" />
            </div>

            <div className="card">
              <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: 'var(--spacing-md)' }}>
                Siste aktivitet
              </h2>
              {stats.totalShifts === 0 ? (
                <div className="text-center" style={{ padding: 'var(--spacing-xl)', color: 'var(--text-secondary)' }}>
                  <div style={{ fontSize: '48px', marginBottom: 'var(--spacing-md)' }}>📭</div>
                  <p>Ingen aktivitet ennå</p>
                  <p style={{ fontSize: '14px', marginTop: '8px' }}>
                    Opprett ditt første arrangement for å komme i gang!
                  </p>
                </div>
              ) : (
                <div>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                    Du har {stats.pendingShifts} ventende vakter som trenger oppmerksomhet
                  </p>
                  <div style={{ 
                    padding: 'var(--spacing-md)', 
                    backgroundColor: 'var(--background)', 
                    borderRadius: 'var(--radius-md)',
                    borderLeft: '4px solid var(--warning-color)'
                  }}>
                    <strong>Tips:</strong> Klikk på "Mine arrangementer" i menyen til venstre for å administrere vakter
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'vakter' && (
          <div>
            {(() => {
              const events = JSON.parse(localStorage.getItem('dugnad_events') || '[]');
              const families = JSON.parse(localStorage.getItem('dugnad_families') || '[]');
              
              const allShifts = events.flatMap((e: any) => 
                (e.shifts || []).map((s: any) => ({ 
                  ...s, 
                  eventName: e.eventName, 
                  eventDate: e.date,
                  eventId: e.id 
                }))
              );

              if (allShifts.length === 0) {
                return (
                  <div className="card text-center" style={{ padding: 'var(--spacing-xl)' }}>
                    <div style={{ fontSize: '48px', marginBottom: 'var(--spacing-md)' }}>📅</div>
                    <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Ingen vakter ennå</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                      Opprett arrangementer for å se vakter her
                    </p>
                    <button 
                      onClick={() => window.location.href = '/create-event'}
                      className="btn btn-primary"
                    >
                      📅 Opprett arrangement
                    </button>
                  </div>
                );
              }

              // Group by event
              const eventGroups = events.filter((e: any) => e.shifts?.length > 0);

              return (
                <>
                  <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>
                      Vaktoversikt
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                      {allShifts.length} vakter på {eventGroups.length} arrangementer
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                    {eventGroups.map((event: any) => (
                      <div key={event.id} className="card" style={{ padding: 'var(--spacing-lg)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
                          <div>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px', color: 'var(--primary-color)' }}>
                              {event.eventName}
                            </h3>
                            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                              📅 {event.date} • ⏰ {event.startTime} - {event.endTime}
                            </p>
                          </div>
                          <button
                            onClick={() => window.location.href = '/events-list'}
                            className="btn btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '14px' }}
                          >
                            ✏️ Rediger
                          </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {event.shifts.map((shift: any) => {
                            const assignedFamilies = (shift.assignedFamilies || []).map((fid: string) => 
                              families.find((f: any) => f.id === fid)
                            ).filter(Boolean);

                            return (
                              <div 
                                key={shift.id}
                                style={{ 
                                  padding: '12px',
                                  background: 'var(--background)',
                                  borderRadius: 'var(--radius-md)',
                                  display: 'grid',
                                  gridTemplateColumns: '200px 150px 150px 1fr',
                                  gap: '12px',
                                  alignItems: 'center',
                                  fontSize: '14px'
                                }}
                              >
                                <div style={{ fontWeight: '600' }}>{shift.name}</div>
                                <div style={{ color: 'var(--text-secondary)' }}>
                                  ⏰ {shift.startTime} - {shift.endTime}
                                </div>
                                <div>
                                  <span style={{ 
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    background: assignedFamilies.length >= shift.peopleNeeded ? '#dcfce7' : '#fee2e2',
                                    color: assignedFamilies.length >= shift.peopleNeeded ? '#166534' : '#991b1b',
                                    fontSize: '13px',
                                    fontWeight: '600'
                                  }}>
                                    {assignedFamilies.length}/{shift.peopleNeeded}
                                  </span>
                                </div>
                                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                  {assignedFamilies.length > 0 
                                    ? assignedFamilies.map((f: any) => 
                                        f.players?.map((p: any) => p.name).join(', ')
                                      ).join(' • ')
                                    : 'Ingen tildelt'
                                  }
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {activeTab === 'familier' && (
          <div>
            {(() => {
              const families = JSON.parse(localStorage.getItem('dugnad_families') || '[]');
              const allPlayers = families.flatMap((f: any) => 
                f.players.map((p: any) => ({ ...p, parents: f.parents, familyId: f.id }))
              );
              
              const subgroups = ['KIL BLÅ', 'KIL BRUN', 'KIL HVIT', 'KIL ORANSJE', 'KIL RØD'];
              const groupedPlayers = subgroups.map(sg => ({
                name: sg,
                players: allPlayers.filter((p: any) => p.subgroup === sg)
              })).filter(g => g.players.length > 0);

              if (allPlayers.length === 0) {
                return (
                  <div className="card text-center" style={{ padding: 'var(--spacing-xl)' }}>
                    <div style={{ fontSize: '48px', marginBottom: 'var(--spacing-md)' }}>⚽</div>
                    <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Ingen spillere ennå</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                      Importer spillere fra Excel for å komme i gang
                    </p>
                    <button 
                      onClick={() => window.location.href = '/import-families'}
                      className="btn btn-primary"
                    >
                      📁 Importer spillere
                    </button>
                  </div>
                );
              }

              return (
                <>
                  <div style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>
                        Spilleroversikt
                      </h2>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        {allPlayers.length} spillere fordelt på {groupedPlayers.length} lag
                      </p>
                    </div>
                    <button 
                      onClick={() => window.location.href = '/manage-families'}
                      className="btn btn-secondary"
                    >
                      👥 Administrer familier
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                    {groupedPlayers.map((group: any) => (
                      <div key={group.name} className="card" style={{ padding: 'var(--spacing-lg)' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: 'var(--spacing-md)', color: 'var(--primary-color)' }}>
                          {group.name} ({group.players.length} spillere)
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--spacing-sm)' }}>
                          {group.players.map((player: any) => (
                            <div 
                              key={player.id}
                              style={{ 
                                padding: '12px',
                                background: 'var(--background)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-color)',
                                fontSize: '14px'
                              }}
                            >
                              <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                                {player.name}
                              </div>
                              <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                                👨‍👩‍👧 {player.parents?.map((p: any) => typeof p === 'string' ? p : p.name).join(', ') || 'Ingen foresatte'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {activeTab === 'arrangementer' && (
          <div className="card text-center" style={{ padding: 'var(--spacing-xl)' }}>
            <div style={{ fontSize: '48px', marginBottom: 'var(--spacing-md)' }}>🎪</div>
            <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Arrangementer</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Arrangementsoversikt kommer snart...</p>
          </div>
        )}
      </div>
    </div>
  );
};



