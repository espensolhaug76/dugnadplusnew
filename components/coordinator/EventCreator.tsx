import React from 'react';

export const EventCreator: React.FC = () => {
  const eventTypes = [
    {
      id: 'single',
      icon: '?????',
      title: 'Enkelt arrangement',
      description: 'Opprett ett enkelt arrangement',
      route: '/create-single-event'
    },
    {
      id: 'season',
      icon: '??',
      title: 'Sesongkamper',
      description: 'Opprett serie med kamper gjennom sesongen',
      route: '/create-season-events'
    },
    {
      id: 'multiday',
      icon: '??',
      title: 'Flerdag arrangement',
      description: 'Opprett arrangement over flere dager (turnering, cup, etc)',
      route: '/create-multiday-events'
    }
  ];

  return (
    // Use .page class and the layout structure defined in App.css
    <div className="page" style={{ flexDirection: 'row' }}>
      <div className="sidebar" style={{ width: '280px', minWidth: '280px', position: 'sticky', top: 0 }}>
        {/* Use the sidebar-nav-item style for consistency */}
        <button 
          onClick={() => window.location.href = '/coordinator-dashboard'}
          className="sidebar-nav-item"
          style={{
            marginTop: '12px',
            color: 'var(--primary-color)',
            fontWeight: '600',
            fontSize: '16px',
            justifyContent: 'flex-start'
          }}
        >
          ? Tilbake
        </button>
      </div>

      <div className="main-content" style={{ marginLeft: '280px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: 'var(--spacing-sm)', color: 'var(--text-primary)' }}>
          Opprett arrangement
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xl)' }}>
          Velg type arrangement du vil opprette
        </p>

        <div style={{ display: 'grid', gap: 'var(--spacing-md)', maxWidth: '800px' }}>
          {eventTypes.map((type) => (
            <div
              key={type.id}
              onClick={() => window.location.href = type.route}
              className="card" // Use the card class for consistent styling
              style={{
                cursor: 'pointer',
                border: '2px solid var(--border-color)', // Default border
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-lg)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary-color)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; // Revert to card shadow
              }}
            >
              <div style={{ fontSize: '48px' }}>{type.icon}</div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px', color: 'var(--text-primary)' }}>
                  {type.title}
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {type.description}
                </p>
              </div>
              <div style={{ fontSize: '24px', color: 'var(--primary-color)' }}>?</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
