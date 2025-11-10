import React, { useState, useEffect } from 'react';

// --- Reusable StatCard Component (Updated for flatter Spond-like design) ---
const StatCard = ({ icon, label, value, color }: { icon: string; label: string; value: number; color: string }) => (
  <div style={{
    background: 'white',
    borderRadius: '8px', // Slightly less rounded
    padding: '20px',
    // Lighter, more subtle shadow instead of the aggressive border-left and heavy shadow
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)', 
    border: '1px solid #e0e0e0', // Add a light border for definition
  }}>
    <div style={{ 
      fontSize: '12px', 
      fontWeight: '600', 
      color: '#9ca3af', 
      textTransform: 'uppercase',
      marginBottom: '8px'
    }}>
      {label}
    </div>
    <div style={{ 
      fontSize: '32px', 
      fontWeight: '700', 
      color: color, // Use the color for the value for emphasis
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    }}>
      {icon} {value}
    </div>
  </div>
);

// --- Main Coordinator Dashboard Component ---
export const CoordinatorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('events'); // Defaulting to 'events' to match Spond image
  const [selectedTeam, setSelectedTeam] = useState('g2016');
  const [stats, setStats] = useState({
    totalShifts: 49, // Hardcoded for visual representation of the image
    assignedShifts: 0, // Hardcoded for visual representation of the image
    pendingShifts: 49 // totalShifts - assignedShifts
  });

  // Note: Keeping the useEffect for state initialization, but using hardcoded values for the visual goal
  useEffect(() => {
    // In a real app, this would fetch data based on selectedTeam
    const events = JSON.parse(localStorage.getItem('dugnad_events') || '[]');
    const totalShifts = events.reduce((sum: number, e: any) => sum + (e.shifts?.length || 0), 0) || 49;
    const assignedShifts = events.reduce((sum: number, e: any) => 
      sum + (e.shifts?.filter((s: any) => s.assignedPeople > 0).length || 0), 0) || 0;
    
    setStats({
      totalShifts,
      assignedShifts,
      pendingShifts: totalShifts - assignedShifts
    });
  }, [selectedTeam]); // Now changes when the team changes

  const teams = [
    { id: 'g2016', name: 'Gutter 2016', color: '#2196F3', members: 24 },
    { id: 'j2015', name: 'Jenter 2015', color: '#E91E63', members: 18 },
    { id: 'g2014', name: 'Gutter 2014', color: '#4CAF50', members: 22 }
  ];

  const currentTeam = teams.find(t => t.id === selectedTeam);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f8f9fa' }}>
      
      {/* 1. Global Top Header (Mimicking Spond's Home/Messages/Fundraising Bar) */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #e0e0e0',
        padding: '0 24px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '24px',
          fontWeight: '600',
          fontSize: '15px'
        }}>
          {/* Logo Placeholder */}
          <span style={{ color: '#16a8b8', fontSize: '20px', fontWeight: '800' }}>SPOND-MIMIC</span>
          
          {/* Top Tabs */}
          {['Home', 'Messages', 'Fundraising'].map((item) => (
            <button key={item} style={{
              padding: '16px 8px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: item === 'Home' ? '#16a8b8' : '#6b7280',
              borderBottom: item === 'Home' ? '2px solid #16a8b8' : '2px solid transparent',
              transition: 'all 0.15s'
            }}>
              {item}
            </button>
          ))}
        </div>
        {/* User Profile (Espen Solhaug) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img 
            src="https://via.placeholder.com/32" 
            alt="User Profile" 
            style={{ borderRadius: '50%', width: '32px', height: '32px' }}
          />
          <span style={{ fontSize: '14px', color: '#4b5563' }}>Espen Solhaug</span>
        </div>
      </div>

      {/* 2. Main Page Content (Below Global Header) */}
      <div style={{ padding: '24px', flex: 1 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Group Header/Banner Area (KIL Fotball G2016) */}
          <div style={{
            height: '240px',
            borderRadius: '12px',
            overflow: 'hidden',
            marginBottom: '24px',
            position: 'relative',
            background: 'linear-gradient(135deg, #0d7f8a 0%, #16a8b8 100%)', // Placeholder color
            display: 'flex',
            alignItems: 'flex-end',
            padding: '24px',
            color: 'white',
          }}>
            {/* The actual image would go here as background-image or an <img/> tag */}
            <h1 style={{ fontSize: '32px', fontWeight: '700', margin: 0, zIndex: 1 }}>
              KIL Fotball G2016
            </h1>
          </div>

          {/* Group Content Area (Tabs + Main Content + Right Sidebar) */}
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

            {/* Left/Middle Content Area (Tabs & Events/Oversikt) */}
            <div style={{ flex: 3, minWidth: 0, background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                
                {/* Horizontal Menu (Events, Posts, Payments, Polls, Members, Files, Fundraising) */}
                <div style={{
                  borderBottom: '1px solid #e0e0e0',
                  display: 'flex',
                  padding: '0 16px',
                  overflowX: 'auto',
                }}>
                  {[
                    { id: 'events', label: 'Events' },
                    { id: 'posts', label: 'Posts' },
                    { id: 'payments', label: 'Payments' },
                    { id: 'polls', label: 'Polls' },
                    { id: 'members', label: 'Members' },
                    { id: 'files', label: 'Files' },
                    { id: 'fundraising', label: 'Fundraising' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        padding: '16px 12px',
                        background: 'transparent',
                        border: 'none',
                        // Spond uses a thin, clean line for the active tab
                        borderBottom: activeTab === tab.id ? '2px solid #16a8b8' : '2px solid transparent',
                        color: activeTab === tab.id ? '#16a8b8' : '#6b7280',
                        fontSize: '14px',
                        fontWeight: activeTab === tab.id ? '600' : '500',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s'
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content Area - Events/Oversikt */}
                <div style={{ padding: '24px' }}>
                  
                  {activeTab === 'events' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* Event Filter Bar (Event | Post | Poll | Payment request) */}
                        <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid #e0e0e0', paddingBottom: '16px' }}>
                            <span style={{ color: '#16a8b8', fontWeight: '600', borderBottom: '2px solid #16a8b8' }}>Event</span>
                            <span style={{ color: '#6b7280' }}>Post</span>
                            <span style={{ color: '#6b7280' }}>Poll</span>
                            <span style={{ color: '#6b7280' }}>Payment request</span>
                        </div>
                        
                        {/* Event List (Julecup) */}
                        <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
                            <div style={{ 
                                background: '#f4f4f4', 
                                padding: '12px 16px', 
                                fontSize: '14px', 
                                fontWeight: '600', 
                                color: '#4b5563' 
                            }}>
                                24 - 30 November
                            </div>
                            <div style={{ padding: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <div style={{ 
                                    background: '#16a8b8', 
                                    color: 'white', 
                                    padding: '8px', 
                                    borderRadius: '4px',
                                    textAlign: 'center',
                                    minWidth: '60px'
                                }}>
                                    <div style={{ fontSize: '12px', fontWeight: '500' }}>NOV</div>
                                    <div style={{ fontSize: '24px', fontWeight: '700' }}>30</div>
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 4px 0' }}>
                                        Julecup- sparebank1 østlandet
                                    </h3>
                                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                                        Sunday, 30 NOV at 08:00
                                    </p>
                                    <p style={{ fontSize: '12px', color: '#9ca3af', margin: '4px 0 0 0' }}>
                                        KIL Fotball G2016
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                  )}

                  {/* To view this content, change the initial useState('events') to useState('oversikt') */}
                  {activeTab === 'oversikt' && (
                     <>
                        {/* Team Selection is needed here since we removed the left nav */}
                        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1a1a1a' }}>
                           Dugnadsoversikt - {currentTeam?.name}
                        </h2>
                        {/* Stats - 3 equal columns */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                          gap: '24px',
                          marginBottom: '32px'
                        }}>
                          {/* Note: Updated StatCard style is applied here */}
                          <StatCard icon="??" label="Totalt vakter" value={stats.totalShifts} color="#2196F3" />
                          <StatCard icon="?" label="Tildelt" value={stats.assignedShifts} color="#4CAF50" />
                          <StatCard icon="?" label="Ventende" value={stats.pendingShifts} color="#FF9800" />
                        </div>
                        {/* Recent Activity */}
                        <div style={{
                          background: 'white',
                          borderRadius: '8px',
                          padding: '24px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                          border: '1px solid #e0e0e0'
                        }}>
                          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#1a1a1a' }}>
                            Siste aktivitet
                          </h2>
                          <p style={{ color: '#6b7280' }}>
                            Du har {stats.pendingShifts} ventende vakter
                          </p>
                        </div>
                      </>
                  )}
                </div>
            </div>

            {/* Right Sidebar (Attendance History / Actions) */}
            <div style={{ flex: 1, minWidth: '280px', maxWidth: '300px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Attendance History Card */}
              <div style={{
                background: 'white',
                borderRadius: '8px',
                padding: '24px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                border: '1px solid #e0e0e0'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#1a1a1a' }}>
                  Attendance history
                </h3>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 16px 0' }}>
                  Get an overview of attendance history across multiple events.
                </p>
                <button style={{
                  width: '100%',
                  padding: '10px 16px',
                  background: 'white',
                  color: '#4b5563',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background 0.15s'
                }}>
                  Export attendance history
                </button>
              </div>

              {/* Team Selector/Dugnad Group Selector (was your old left nav) */}
              <div style={{
                  background: 'white',
                  borderRadius: '8px',
                  padding: '16px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  border: '1px solid #e0e0e0'
              }}>
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1a1a1a',
                  marginBottom: '12px'
                }}>
                  Change Group
                </h3>
                {teams.map(team => (
                  <button
                    key={team.id}
                    onClick={() => setSelectedTeam(team.id)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: selectedTeam === team.id ? '#f0f9ff' : 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '4px',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '10px', height: '10px', background: team.color, borderRadius: '50%' }} />
                      <span style={{
                        fontSize: '14px',
                        fontWeight: selectedTeam === team.id ? '600' : '500',
                        color: selectedTeam === team.id ? '#2196F3' : '#4b5563'
                      }}>
                        {team.name}
                      </span>
                    </div>
                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>{team.members}</span>
                  </button>
                ))}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
