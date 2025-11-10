import React, { useState } from 'react';

type Role = 'coordinator' | 'family' | 'substitute' | null;

export const RoleSelectionPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<Role>(null);

  const handleContinue = () => {
    if (!selectedRole) {
      alert('Vennligst velg en rolle');
      return;
    }

    // Update user with role
    const storedUser = localStorage.getItem('dugnad_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      user.role = selectedRole;
      localStorage.setItem('dugnad_user', JSON.stringify(user));
    }

    // Route based on role
    if (selectedRole === 'coordinator') {
      window.location.href = '/create-club';
    } else if (selectedRole === 'family') {
      window.location.href = '/select-club';
    } else if (selectedRole === 'substitute') {
      window.location.href = '/substitute-marketplace';
    }
  };

  const roles = [
    {
      id: 'coordinator' as Role,
      icon: '👔',
      title: 'Jeg starter ny klubb/lag',
      description: 'Jeg er dugnadsansvarlig eller koordinator',
      badge: 'Koordinator',
    },
    {
      id: 'family' as Role,
      icon: '👨‍👩‍👧‍👦',
      title: 'Jeg blir med i eksisterende lag',
      description: 'Jeg er forelder med barn på laget',
      badge: 'Familie',
    },
    {
      id: 'substitute' as Role,
      icon: '💼',
      title: 'Jeg vil jobbe som vikar',
      description: 'Jeg vil ta vikarvakter mot betaling',
      badge: 'Vikar',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', padding: '20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '60px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px' }}>
            Hva får deg hit?
          </h1>
          <p style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>
            Velg rollen som passer deg best
          </p>
        </div>

        {/* Role Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
          {roles.map((role) => (
            <div
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className="card"
              style={{
                padding: '24px',
                cursor: 'pointer',
                border: selectedRole === role.id ? '2px solid var(--primary-color)' : '2px solid transparent',
                transition: 'all 0.2s',
                background: selectedRole === role.id ? 'rgba(22, 168, 184, 0.05)' : 'white',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                {/* Radio Button */}
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: '2px solid',
                    borderColor: selectedRole === role.id ? 'var(--primary-color)' : 'var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {selectedRole === role.id && (
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: 'var(--primary-color)',
                      }}
                    />
                  )}
                </div>

                {/* Icon */}
                <div style={{ fontSize: '48px', flexShrink: 0 }}>{role.icon}</div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px', color: 'var(--text-primary)' }}>
                    {role.title}
                  </h3>
                  <p style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>{role.description}</p>
                </div>

                {/* Badge */}
                <div
                  className="badge"
                  style={{
                    background: selectedRole === role.id ? 'var(--primary-color)' : 'var(--background)',
                    color: selectedRole === role.id ? 'white' : 'var(--text-secondary)',
                    padding: '6px 16px',
                    fontSize: '13px',
                  }}
                >
                  {role.badge}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          className="btn btn-primary btn-large"
          style={{ width: '100%' }}
          disabled={!selectedRole}
        >
          Fortsett
        </button>
      </div>
    </div>
  );
};
