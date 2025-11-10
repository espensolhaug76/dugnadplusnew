import React, { useState, useEffect } from 'react';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface Event {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  sport: string;
  slotDuration: number;
  shifts: Shift[];
}

interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  peopleNeeded: number;
  assignedPeople: number;
  status: string;
}

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

const generateShifts = (startTime: string, endTime: string, slotDuration: number, sport: string): Shift[] => {
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  
  const totalMinutes = (endH * 60 + endM) - (startH * 60 + startM);
  const slotMinutes = slotDuration * 60;
  const numSlots = Math.floor(totalMinutes / slotMinutes);

  const shifts: Shift[] = [];
  const sportShifts = SPORT_SHIFTS[sport as keyof typeof SPORT_SHIFTS] || SPORT_SHIFTS.football;

  for (let i = 0; i < numSlots; i++) {
    const slotStart = startH * 60 + startM + i * slotMinutes;
    const slotEnd = slotStart + slotMinutes;
    const slotStartTime = `${String(Math.floor(slotStart / 60)).padStart(2, '0')}:${String(slotStart % 60).padStart(2, '0')}`;
    const slotEndTime = `${String(Math.floor(slotEnd / 60)).padStart(2, '0')}:${String(slotEnd % 60).padStart(2, '0')}`;

    sportShifts.forEach(shift => {
      shifts.push({
        id: `slot${i}-${shift.name}`,
        name: shift.name,
        startTime: slotStartTime,
        endTime: slotEndTime,
        peopleNeeded: shift.people,
        assignedPeople: 0,
        status: 'open'
      });
    });
  }

  return shifts;
};

export const MultiDayBulkCreator: React.FC = () => {
  const [eventName, setEventName] = useState('');
  const [location, _setLocation] = useState('Stadion');
  const [sport, setSport] = useState('football');
  const [slotDuration, _setSlotDuration] = useState(0);
  const [assignmentMode, setAssignmentMode] = useState<'auto' | 'manual' | 'self-service'>('auto');
  const [selfServiceOpenDate, setSelfServiceOpenDate] = useState('');
  const [selfServiceOpenTime, setSelfServiceOpenTime] = useState('12:00');
  const [events, setEvents] = useState<Event[]>([
    {
      id: 'day1',
      date: '',
      startTime: '09:00',
      endTime: '15:00',
      sport: 'football',
      slotDuration: 0,
      shifts: []
    }
  ]);

  const addDay = () => {
    const newEvent: Event = {
      id: `day${events.length + 1}`,
      date: '',
      startTime: '09:00',
      endTime: '15:00',
      sport,
      slotDuration: 0,
      shifts: []
    };
    setEvents([...events, newEvent]);
  };

  const removeDay = (eventId: string) => {
    setEvents(events.filter(e => e.id !== eventId));
  };

  const copyDay = (eventId: string) => {
    const eventToCopy = events.find(e => e.id === eventId);
    if (eventToCopy) {
      const newEvent = {
        ...eventToCopy,
        id: `day${Date.now()}`,
        date: ''
      };
      setEvents([...events, newEvent]);
    }
  };

  const updateEvent = (eventId: string, field: string, value: any) => {
    setEvents(events.map(e => 
      e.id === eventId ? { ...e, [field]: value } : e
    ));
  };

  const regenerateShifts = (eventId: string) => {
    setEvents(events.map(e => {
      if (e.id === eventId && e.slotDuration > 0) {
        return {
          ...e,
          shifts: generateShifts(e.startTime, e.endTime, e.slotDuration, e.sport)
        };
      }
      return e;
    }));
  };

  const saveAllEvents = () => {
    const validEvents = events.filter(e => e.date && e.shifts.length > 0);
    
    if (validEvents.length === 0) {
      alert('⚠️ Legg til minst én dag med dato og vakter!');
      return;
    }

    if (assignmentMode === 'self-service' && !selfServiceOpenDate) {
      alert('⚠️ Sett når vaktene åpnes for selvvalg!');
      return;
    }

    const eventsToSave = validEvents.map(e => ({
      id: `${Date.now()}-${Math.random()}`,
      eventName: `${eventName} - Dag ${events.indexOf(e) + 1}`,
      date: e.date,
      startTime: e.startTime,
      endTime: e.endTime,
      location,
      sport: e.sport,
      slotDuration: e.slotDuration,
      shifts: e.shifts,
      assignmentMode,
      selfServiceOpenDate: assignmentMode === 'self-service' ? `${selfServiceOpenDate}T${selfServiceOpenTime}` : null,
      selfServiceStatus: assignmentMode === 'self-service' ? 'pending' : null
    }));

    const existing = JSON.parse(localStorage.getItem('dugnad_events') || '[]');
    localStorage.setItem('dugnad_events', JSON.stringify([...existing, ...eventsToSave]));

    alert(`✅ ${eventsToSave.length} arrangementer lagret!`);
    window.location.href = '/events-list';
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <button onClick={() => window.location.href = '/coordinator-dashboard'} className="btn btn-secondary" style={{ marginBottom: '16px' }}>
        ← Tilbake
      </button>

      <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>Flerdag arrangement</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Vakter genereres automatisk når du setter tid og vaktlengde
      </p>

      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <label className="input-label">Hvordan skal vakter tildeles? *</label>
          <select 
            className="input" 
            value={assignmentMode} 
            onChange={(e) => setAssignmentMode(e.target.value as any)}
          >
            <option value="auto">🤖 Automatisk tildeling</option>
            <option value="manual">✋ Manuell tildeling</option>
            <option value="self-service">👥 Selvvalg (First come, first serve)</option>
          </select>
        </div>

        {assignmentMode === 'self-service' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '16px', background: '#f0f9ff', borderRadius: 'var(--radius-md)' }}>
            <div>
              <label className="input-label">Åpner for valg (dato) *</label>
              <input
                type="date"
                className="input"
                value={selfServiceOpenDate}
                onChange={(e) => setSelfServiceOpenDate(e.target.value)}
              />
            </div>
            <div>
              <label className="input-label">Åpner for valg (tid) *</label>
              <input
                type="time"
                className="input"
                value={selfServiceOpenTime}
                onChange={(e) => setSelfServiceOpenTime(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <label className="input-label">Idrett</label>
          <select className="input" value={sport} onChange={(e) => setSport(e.target.value)}>
            <option value="football">⚽ Fotball</option>
            <option value="handball">🤾 Håndball</option>
            <option value="ishockey">🏒 Ishockey</option>
          </select>
        </div>

        <div style={{ padding: '16px', background: '#e0f2fe', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>🤖 Smart generering</div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Vakter genereres automatisk basert på tid og vaktlengde. Endre vaktlengde for å justere antall skift!
          </p>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label className="input-label">Arrangementsnavn *</label>
          <input
            type="text"
            className="input"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder="F.eks. Hjemmekamp mot Strømmen"
          />
        </div>
      </div>

      {events.map((event, index) => (
        <EventDayCard
          key={event.id}
          event={event}
          index={index}
          onUpdate={updateEvent}
          onRemove={removeDay}
          onCopy={copyDay}
          onRegenerate={regenerateShifts}
          canRemove={events.length > 1}
        />
      ))}

      <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
        <button onClick={addDay} className="btn btn-secondary" style={{ flex: 1 }}>
          ➕ Legg til nytt arrangement
        </button>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
        <button onClick={() => window.location.href = '/coordinator-dashboard'} className="btn">
          Avbryt
        </button>
        <button onClick={saveAllEvents} className="btn btn-primary" style={{ flex: 1 }}>
          💾 Lagre alle {events.length} arrangementer
        </button>
      </div>
    </div>
  );
};

const EventDayCard: React.FC<{
  event: Event;
  index: number;
  onUpdate: (id: string, field: string, value: any) => void;
  onRemove: (id: string) => void;
  onCopy: (id: string) => void;
  onRegenerate: (id: string) => void;
  canRemove: boolean;
}> = ({ event, index, onUpdate, onRemove, onCopy, onRegenerate, canRemove }) => {
  // Local state for time inputs with debouncing
  const [localStartTime, setLocalStartTime] = useState(event.startTime);
  const [localEndTime, setLocalEndTime] = useState(event.endTime);
  
  const debouncedStartTime = useDebounce(localStartTime, 500);
  const debouncedEndTime = useDebounce(localEndTime, 500);

  // Update parent when debounced values change
  useEffect(() => {
    if (debouncedStartTime !== event.startTime) {
      onUpdate(event.id, 'startTime', debouncedStartTime);
    }
  }, [debouncedStartTime]);

  useEffect(() => {
    if (debouncedEndTime !== event.endTime) {
      onUpdate(event.id, 'endTime', debouncedEndTime);
    }
  }, [debouncedEndTime]);

  // Regenerate shifts when time or duration changes
  useEffect(() => {
    if (event.slotDuration > 0) {
      onRegenerate(event.id);
    }
  }, [event.startTime, event.endTime, event.slotDuration, event.sport]);

  return (
    <div className="card" style={{ padding: '24px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Dag {index + 1}</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => onCopy(event.id)} className="btn btn-secondary">
            📋 Kopier
          </button>
          {canRemove && (
            <button onClick={() => onRemove(event.id)} className="btn" style={{ color: 'var(--danger-color)' }}>
              🗑️ Slett
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <div>
          <label className="input-label">Dato *</label>
          <input
            type="date"
            className="input"
            value={event.date}
            onChange={(e) => onUpdate(event.id, 'date', e.target.value)}
          />
        </div>
        <div>
          <label className="input-label">Start</label>
          <input
            type="time"
            className="input"
            value={localStartTime}
            onChange={(e) => setLocalStartTime(e.target.value)}
          />
        </div>
        <div>
          <label className="input-label">Slutt</label>
          <input
            type="time"
            className="input"
            value={localEndTime}
            onChange={(e) => setLocalEndTime(e.target.value)}
          />
        </div>
        <div>
          <label className="input-label">⏰ Vaktlengde</label>
          <select
            className="input"
            value={event.slotDuration}
            onChange={(e) => onUpdate(event.id, 'slotDuration', parseFloat(e.target.value))}
          >
            <option value="0" disabled>Velg vaktlengde</option>
            <option value="1.5">1,5t</option>
            <option value="2">2t</option>
            <option value="2.5">2,5t</option>
            <option value="3">3t</option>
            <option value="4">4t</option>
          </select>
        </div>
        <div>
          <label className="input-label">Sted</label>
          <input type="text" className="input" value="Stadion" readOnly />
        </div>
      </div>

      {event.slotDuration > 0 && (
        <div style={{ padding: '12px', background: '#dcfce7', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '13px' }}>
          🤖 Genererer: {Math.floor(((parseInt(event.endTime.split(':')[0]) * 60 + parseInt(event.endTime.split(':')[1])) - (parseInt(event.startTime.split(':')[0]) * 60 + parseInt(event.startTime.split(':')[1]))) / (event.slotDuration * 60))} tidsluker × {SPORT_SHIFTS[event.sport as keyof typeof SPORT_SHIFTS]?.length || 3} vakttyper = {event.shifts.length} vakter
        </div>
      )}

      <div style={{ marginTop: '16px' }}>
        <strong style={{ fontSize: '14px' }}>Vakter ({event.shifts.length})</strong>
        {event.shifts.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px', marginTop: '8px' }}>
            {event.shifts.map(shift => (
              <div key={shift.id} style={{ 
                padding: '8px 12px',
                background: 'var(--background)',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                border: '1px solid var(--border-color)'
              }}>
                {shift.name}<br/>
                <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                  {shift.startTime} - {shift.endTime}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '8px' }}>
            Velg vaktlengde for å generere vakter
          </p>
        )}
      </div>
    </div>
  );
};

