import React, { useState } from 'react';

const SPORT_SHIFTS = {
  football: [
    { name: 'Kioskvakt', people: 2 },
    { name: 'Billettsalg', people: 1 },
    { name: 'Fair play/kampvert', people: 1 }
  ],
  handball: [
    { name: 'Kioskvakt', people: 2 },
    { name: 'Billettsalg', people: 1 },
    { name: 'Fair play/kampvert', people: 1 },
    { name: 'Sekretæriat', people: 2 }
  ],
  ishockey: [
    { name: 'Kioskvakt', people: 2 },
    { name: 'Billettsalg', people: 1 },
    { name: 'Fair play/kampvert', people: 1 },
    { name: 'Sekretæriat', people: 2 }
  ]
};

const DURATION_OPTIONS = [1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6];

export const CreateEvent: React.FC = () => {
  const [eventName, setEventName] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('15:00');
  const [location, setLocation] = useState('Stadion');
  const [sport, setSport] = useState('football');
  const [slotDuration, setSlotDuration] = useState(2);
  const [shifts, setShifts] = useState<any[]>([]);
  const [assignmentMode, setAssignmentMode] = useState<'auto' | 'manual' | 'self-service'>('auto');
  const [selfServiceOpenDate, setSelfServiceOpenDate] = useState('');
  const [selfServiceOpenTime, setSelfServiceOpenTime] = useState('12:00');

  const generateShifts = () => {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const totalMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    const slotMinutes = slotDuration * 60;
    const numSlots = Math.floor(totalMinutes / slotMinutes);

    const newShifts: any[] = [];
    const sportShifts = SPORT_SHIFTS[sport as keyof typeof SPORT_SHIFTS];

    for (let i = 0; i < numSlots; i++) {
      const slotStart = startH * 60 + startM + i * slotMinutes;
      const slotEnd = slotStart + slotMinutes;
      const slotStartTime = `${String(Math.floor(slotStart / 60)).padStart(2, '0')}:${String(slotStart % 60).padStart(2, '0')}`;
      const slotEndTime = `${String(Math.floor(slotEnd / 60)).padStart(2, '0')}:${String(slotEnd % 60).padStart(2, '0')}`;

      sportShifts.forEach(shift => {
        newShifts.push({
          id: `${Date.now()}-${Math.random()}`,
          name: shift.name,
          startTime: slotStartTime,
          endTime: slotEndTime,
          peopleNeeded: shift.people,
          assignedPeople: 0,
          assignedFamilies: [],
          status: 'open'
        });
      });
    }

    setShifts(newShifts);
  };

  const handleSave = () => {
    if (!eventName || !date || shifts.length === 0) {
      alert('⚠️ Fyll inn arrangementsnavn, dato og generer vakter!');
      return;
    }

    if (assignmentMode === 'self-service' && !selfServiceOpenDate) {
      alert('⚠️ Sett når vaktene åpnes for selvvalg!');
      return;
    }

    const event = {
      id: `${Date.now()}-${Math.random()}`,
      eventName,
      date,
      startTime,
      endTime,
      location,
      sport,
      slotDuration,
      shifts,
      assignmentMode,
      selfServiceOpenDate: assignmentMode === 'self-service' ? `${selfServiceOpenDate}T${selfServiceOpenTime}` : null,
      selfServiceStatus: assignmentMode === 'self-service' ? 'pending' : null
    };

    const existing = JSON.parse(localStorage.getItem('dugnad_events') || '[]');
    localStorage.setItem('dugnad_events', JSON.stringify([...existing, event]));

    alert('✅ Arrangement lagret!');
    window.location.href = '/events-list';
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      <button
        onClick={() => window.location.href = '/coordinator-dashboard'}
        className="btn btn-secondary"
        style={{ marginBottom: '16px' }}
      >
        ← Tilbake
      </button>

      <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
        Opprett nytt arrangement
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Fyll inn detaljer og generer vakter automatisk
      </p>

      <div className="card" style={{ padding: '32px', marginBottom: '24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <label className="input-label">Arrangementsnavn *</label>
          <input
            type="text"
            className="input"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder="F.eks. Hjemmekamp mot Strømmen"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div>
            <label className="input-label">Dato *</label>
            <input
              type="date"
              className="input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className="input-label">Starttid</label>
            <input
              type="time"
              className="input"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div>
            <label className="input-label">Sluttid</label>
            <input
              type="time"
              className="input"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div>
            <label className="input-label">Idrett</label>
            <select className="input" value={sport} onChange={(e) => setSport(e.target.value)}>
              <option value="football">⚽ Fotball</option>
              <option value="handball">🤾 Håndball</option>
              <option value="ishockey">🏒 Ishockey</option>
            </select>
          </div>
          <div>
            <label className="input-label">Vaktlengde</label>
            <select
              className="input"
              value={slotDuration}
              onChange={(e) => setSlotDuration(parseFloat(e.target.value))}
            >
              {DURATION_OPTIONS.map(dur => (
                <option key={dur} value={dur}>{dur} timer</option>
              ))}
            </select>
          </div>
          <div>
            <label className="input-label">Sted</label>
            <input
              type="text"
              className="input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={generateShifts}
          className="btn btn-primary"
          style={{ width: '100%', marginBottom: '24px' }}
        >
          ✨ Generer vakter
        </button>

        {shifts.length > 0 && (
          <div style={{ padding: '16px', background: '#dcfce7', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
            <strong>✅ {shifts.length} vakter generert!</strong>
          </div>
        )}

        {/* Assignment Mode Selection */}
        <div style={{ marginTop: '24px', padding: '20px', background: '#f0f9ff', borderRadius: 'var(--radius-md)' }}>
          <label className="input-label" style={{ marginBottom: '12px', display: 'block' }}>
            Hvordan skal vakter tildeles? *
          </label>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ 
              padding: '16px', 
              background: assignmentMode === 'auto' ? 'white' : 'transparent',
              border: `2px solid ${assignmentMode === 'auto' ? 'var(--primary-color)' : 'var(--border-color)'}`,
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'start',
              gap: '12px'
            }}>
              <input
                type="radio"
                name="assignmentMode"
                value="auto"
                checked={assignmentMode === 'auto'}
                onChange={(e) => setAssignmentMode(e.target.value as any)}
                style={{ marginTop: '2px' }}
              />
              <div>
                <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                  🤖 Automatisk tildeling
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Systemet tildeler vakter basert på poeng og preferanser
                </div>
              </div>
            </label>

            <label style={{ 
              padding: '16px', 
              background: assignmentMode === 'manual' ? 'white' : 'transparent',
              border: `2px solid ${assignmentMode === 'manual' ? 'var(--primary-color)' : 'var(--border-color)'}`,
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'start',
              gap: '12px'
            }}>
              <input
                type="radio"
                name="assignmentMode"
                value="manual"
                checked={assignmentMode === 'manual'}
                onChange={(e) => setAssignmentMode(e.target.value as any)}
                style={{ marginTop: '2px' }}
              />
              <div>
                <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                  ✋ Manuell tildeling
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Du fordeler vaktene selv med dra-og-slipp
                </div>
              </div>
            </label>

            <label style={{ 
              padding: '16px', 
              background: assignmentMode === 'self-service' ? 'white' : 'transparent',
              border: `2px solid ${assignmentMode === 'self-service' ? 'var(--primary-color)' : 'var(--border-color)'}`,
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'start',
              gap: '12px'
            }}>
              <input
                type="radio"
                name="assignmentMode"
                value="self-service"
                checked={assignmentMode === 'self-service'}
                onChange={(e) => setAssignmentMode(e.target.value as any)}
                style={{ marginTop: '2px' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                  👥 Selvvalg (First come, first serve)
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  Familiene velger sine egne vakter
                </div>
                
                {assignmentMode === 'self-service' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label className="input-label" style={{ fontSize: '12px' }}>Åpner for valg (dato)</label>
                      <input
                        type="date"
                        className="input"
                        value={selfServiceOpenDate}
                        onChange={(e) => setSelfServiceOpenDate(e.target.value)}
                        style={{ fontSize: '14px', padding: '8px' }}
                      />
                    </div>
                    <div>
                      <label className="input-label" style={{ fontSize: '12px' }}>Åpner for valg (tid)</label>
                      <input
                        type="time"
                        className="input"
                        value={selfServiceOpenTime}
                        onChange={(e) => setSelfServiceOpenTime(e.target.value)}
                        style={{ fontSize: '14px', padding: '8px' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={() => window.location.href = '/coordinator-dashboard'}
          className="btn"
        >
          Avbryt
        </button>
        <button
          onClick={handleSave}
          className="btn btn-primary"
          style={{ flex: 1 }}
        >
          💾 Lagre arrangement
        </button>
      </div>
    </div>
  );
};
