import React from 'react';

export const LandingPage: React.FC = () => {
  const handleGetStarted = () => {
    window.location.href = '/register';
  };

  const handleLogin = () => {
    window.location.href = '/login';
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #16a8b8 0%, #1298a6 100%)',
        color: 'white',
      }}
    >
      {/* Header */}
      <header style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '24px', fontWeight: '700' }}>Dugnad+</div>
        <button onClick={handleLogin} className="btn btn-secondary" style={{ color: 'white', borderColor: 'white' }}>
          Logg inn
        </button>
      </header>

      {/* Hero Section */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: '40px 20px',
        }}
      >
        <h1
          style={{
            fontSize: 'clamp(32px, 5vw, 56px)',
            fontWeight: '700',
            marginBottom: '24px',
            lineHeight: '1.2',
          }}
        >
          Velkommen til Dugnad+
        </h1>

        <p
          style={{
            fontSize: 'clamp(18px, 3vw, 24px)',
            marginBottom: '48px',
            maxWidth: '600px',
            opacity: 0.95,
          }}
        >
          Den smarte måten å organisere dugnad på. Rettferdig fordeling, enkel administrasjon, og fornøyde foreldre.
        </p>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={handleGetStarted} className="btn btn-large" style={{ background: 'white', color: '#16a8b8' }}>
            Kom i gang
          </button>
          <button onClick={handleLogin} className="btn btn-large btn-secondary" style={{ color: 'white', borderColor: 'white' }}>
            Logg inn
          </button>
        </div>

        {/* Features */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '32px',
            marginTop: '80px',
            maxWidth: '900px',
            width: '100%',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚡</div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>Automatisk fordeling</h3>
            <p style={{ fontSize: '16px', opacity: 0.9 }}>Algoritme fordeler vakter rettferdig basert på poeng</p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📱</div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>Enkel for alle</h3>
            <p style={{ fontSize: '16px', opacity: 0.9 }}>Desktop for koordinatorer, mobil for foreldre</p>
          </div>

          <div style={{ fontSize: '48px', marginBottom: '16px', textAlign: 'center' }}>
            <div>🏆</div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>Poengsystem</h3>
            <p style={{ fontSize: '16px', opacity: 0.9 }}>Fire nivåer med fordeler og sponsorrabatter</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ padding: '24px', textAlign: 'center', opacity: 0.8, fontSize: '14px' }}>
        © 2025 Dugnad+ | Laget for norske idrettslag
      </footer>
    </div>
  );
};
