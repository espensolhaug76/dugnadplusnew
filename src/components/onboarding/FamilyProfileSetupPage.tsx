import React, { useState } from 'react';

interface Child {
  id: string;
  name: string;
  birthYear: number;
}

export const FamilyProfileSetupPage: React.FC = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [childName, setChildName] = useState('');
  const [childYear, setChildYear] = useState(new Date().getFullYear() - 10);

  const handleAddChild = () => {
    if (!childName.trim()) {
      alert('Vennligst skriv inn barnets navn');
      return;
    }

    const newChild: Child = {
      id: Date.now().toString(),
      name: childName.trim(),
      birthYear: childYear,
    };

    setChildren([...children, newChild]);
    setChildName('');
  };

  const handleRemoveChild = (id: string) => {
    setChildren(children.filter((child) => child.id !== id));
  };

  const handleComplete = () => {
    if (children.length === 0) {
      alert('Vennligst legg til minst ett barn');
      return;
    }

    // Save family data
    const familyData = {
      id: Date.now().toString(),
      children: children,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem('dugnad_family', JSON.stringify(familyData));
    window.location.href = '/family-dashboard';
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - i);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', padding: '20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '60px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px' }}>
            Legg til familiemedlemmer
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>
            Hvem skal være med på laget?
          </p>
        </div>

        {/* Add Child Form */}
        <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Legg til barn</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="input-label">Barnets navn</label>
              <input
                type="text"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                className="input"
                placeholder="F.eks. Emma"
              />
            </div>

            <div>
              <label className="input-label">Fødselsår</label>
              <select
                value={childYear}
                onChange={(e) => setChildYear(parseInt(e.target.value))}
                className="input"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <button onClick={handleAddChild} className="btn btn-primary">
              + Legg til barn
            </button>
          </div>
        </div>

        {/* Children List */}
        {children.length > 0 && (
          <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Dine barn ({children.length})</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {children.map((child) => (
                <div
                  key={child.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    background: 'var(--background)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div>
                    <p style={{ fontWeight: '600' }}>{child.name}</p>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Født {child.birthYear}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveChild(child.id)}
                    style={{
                      padding: '8px 16px',
                      background: 'var(--danger-color)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                    }}
                  >
                    Fjern
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Complete Button */}
        <button
          onClick={handleComplete}
          className="btn btn-primary btn-large"
          style={{ width: '100%' }}
          disabled={children.length === 0}
        >
          Fullfør registrering
        </button>
      </div>
    </div>
  );
};
