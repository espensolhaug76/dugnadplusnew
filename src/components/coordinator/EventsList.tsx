import React, { useState, useEffect } from 'react';

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

export const EventsList: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('dugnad_events');
    if (stored) {
      setEvents(JSON.parse(stored));
    }
  }, []);

  const handleDelete = (eventId: string) => {
    if (confirm('Er du sikker på at du vil slette dette arrangementet?')) {
      const updated = events.filter(e => e.id !== eventId);
      setEvents(updated);
      localStorage.setItem('dugnad_events', JSON.stringify(updated));
    }
  };

  const handleEdit = (eventId: string) => {
    setEditingEventId(eventId);
  };

  const handleCancelEdit = () => {
    setEditingEventId(null);
  };

  const handleSaveEdit = (updatedEvent: any) => {
    const updated = events.map(e => e.id === updatedEvent.id ? updatedEvent : e);
    setEvents(updated);
    localStorage.setItem('dugnad_events', JSON.stringify(updated));
    setEditingEventId(null);
  };

  const handleUpdateEvent = (eventId: string, field: string, value: any) => {
    setEvents(prevEvents => prevEvents.map(e => {
      if (e.id === eventId) {
        return { ...e, [field]: value };
      }
      return e;
    }));
  };

  const generateSmartShifts = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    const sport = event.sport || 'football';
    const slotDuration = event.slotDuration || 2;

    const [startH, startM] = event.startTime.split(':').map(Number);
    const [endH, endM] = event.endTime.split(':').map(Number);
    const totalMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    const slotMinutes = slotDuration * 60;
    const numSlots = Math.floor(totalMinutes / slotMinutes);

    const shifts: any[] = [];
    const sportShifts = SPORT_SHIFTS[sport as keyof typeof SPORT_SHIFTS];

    for (let i = 0; i < numSlots; i++) {
      const slotStart = startH * 60 + startM + i * slotMinutes;
      const slotEnd = slotStart + slotMinutes;
      const slotStartTime = `${String(Math.floor(slotStart / 60)).padStart(2, '0')}:${String(slotStart % 60).padStart(2, '0')}`;
      const slotEndTime = `${String(Math.floor(slotEnd / 60)).padStart(2, '0')}:${String(slotEnd % 60).padStart(2, '0')}`;

      sportShifts.forEach(shift => {
        shifts.push({
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

    handleUpdateEvent(eventId, 'shifts', shifts);
  };

  const handleAddShift = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    const newShift = {
      id: Date.now().toString(),
      name: '',
      startTime: event.startTime,
      endTime: event.endTime,
      peopleNeeded: 1,
      assignedPeople: 0,
      assignedFamilies: [],
      status: 'open'
    };

    const updatedShifts = [...(event.shifts || []), newShift];
    handleUpdateEvent(eventId, 'shifts', updatedShifts);
  };

  const handleUpdateShift = (eventId: string, shiftId: string, field: string, value: any) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    const updatedShifts = event.shifts.map((shift: any) =>
      shift.id === shiftId ? { ...shift, [field]: value } : shift
    );

    handleUpdateEvent(eventId, 'shifts', updatedShifts);
  };

  const handleDeleteShift = (eventId: string, shiftId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    const updatedShifts = event.shifts.filter((shift: any) => shift.id !== shiftId);
    handleUpdateEvent(eventId, 'shifts', updatedShifts);
  };

  const handleAutoAssign = (eventId: string) => {
    if (!confirm('Vil du tildele vakter automatisk basert på poengsystemet?')) return;
    
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    const families = JSON.parse(localStorage.getItem('dugnad_families') || '[]');
    
    const calculateFamilyPoints = (f: any) => {
      const vervPoints = f.verv?.reduce((sum: number, v: any) => sum + v.points, 0) || 0;
      const historyPoints = f.pointsHistory?.reduce((sum: number, h: any) => sum + h.points, 0) || 0;
      return vervPoints + historyPoints;
    };

    const familiesWithNeeds = families.map((f: any) => ({
      ...f,
      currentPoints: calculateFamilyPoints(f),
      shiftsNeeded: f.players?.length || 1,
      shiftsAssigned: 0
    })).sort((a: any, b: any) => a.currentPoints - b.currentPoints);

    const updatedShifts = event.shifts.map((shift: any) => ({ 
      ...shift, 
      assignedFamilies: shift.assignedFamilies || [] 
    }));
    const familyAssignments: any = {};

    for (const shift of updatedShifts) {
      let assigned = shift.assignedFamilies.length;
      
      while (assigned < shift.peopleNeeded) {
        const availableFamily = familiesWithNeeds.find((f: any) => {
          if (f.shiftsAssigned >= f.shiftsNeeded) return false;
          const alreadyAssigned = familyAssignments[f.id] || [];
          const hasOverlap = alreadyAssigned.some((s: any) => 
            shift.startTime < s.endTime && shift.endTime > s.startTime
          );
          return !hasOverlap;
        });

        if (!availableFamily) break;

        shift.assignedFamilies.push(availableFamily.id);
        if (!familyAssignments[availableFamily.id]) {
          familyAssignments[availableFamily.id] = [];
        }
        familyAssignments[availableFamily.id].push(shift);
        availableFamily.shiftsAssigned++;
        assigned++;

        const [startH, startM] = shift.startTime.split(':').map(Number);
        const [endH, endM] = shift.endTime.split(':').map(Number);
        const hours = ((endH * 60 + endM) - (startH * 60 + startM)) / 60;
        availableFamily.currentPoints += Math.round(hours * 10);
        
        familiesWithNeeds.sort((a: any, b: any) => a.currentPoints - b.currentPoints);
      }

      shift.assignedPeople = assigned;
    }

    const updatedFamilies = families.map((family: any) => {
      const assignments = familyAssignments[family.id];
      if (!assignments?.length) return family;

      const newHistory = assignments.map((shift: any) => {
        const [startH, startM] = shift.startTime.split(':').map(Number);
        const [endH, endM] = shift.endTime.split(':').map(Number);
        const hours = ((endH * 60 + endM) - (startH * 60 + startM)) / 60;
        
        return {
          date: event.date,
          type: 'shift',
          description: `${event.eventName} - ${shift.name}`,
          points: Math.round(hours * 10)
        };
      });

      return {
        ...family,
        pointsHistory: [...(family.pointsHistory || []), ...newHistory]
      };
    });

    const allEvents = JSON.parse(localStorage.getItem('dugnad_events') || '[]');
    const updatedEvents = allEvents.map((e: any) => 
      e.id === eventId ? { ...e, shifts: updatedShifts } : e
    );

    localStorage.setItem('dugnad_events', JSON.stringify(updatedEvents));
    localStorage.setItem('dugnad_families', JSON.stringify(updatedFamilies));

    const totalAssigned = updatedShifts.reduce((sum: number, s: any) => sum + s.assignedFamilies.length, 0);
    alert(`✅ ${totalAssigned} vakter tildelt!`);
    window.location.reload();
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <button
        onClick={() => window.location.href = '/coordinator-dashboard'}
        className="btn btn-secondary"
        style={{ marginBottom: '16px' }}
      >
        ← Tilbake
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
          Mine arrangementer ({events.length})
        </h1>
      </div>

      {events.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {events.map((event: any) => {
            const isEditing = editingEventId === event.id;

            return (
              <div key={event.id}>
                <div className="card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
                        {event.eventName}
                      </h3>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        📅 {event.date}
                      </p>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        ⏰ {event.startTime} - {event.endTime}
                      </p>
                      <p style={{ color: 'var(--text-secondary)' }}>
                        👥 {event.shifts?.length || 0} vakter
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleEdit(event.id)}
                        className="btn btn-secondary"
                        style={{ padding: '8px 16px' }}
                      >
                        ✏️ Rediger
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="btn"
                        style={{
                          padding: '8px 16px',
                          background: 'white',
                          border: '1px solid var(--danger-color)',
                          color: 'var(--danger-color)'
                        }}
                      >
                        🗑️ Slett
                      </button>
                    </div>
                  </div>

                  {!isEditing && event.shifts && event.shifts.length > 0 && (
                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                        <button
                          onClick={() => handleAutoAssign(event.id)}
                          className="btn btn-primary"
                          style={{ padding: '12px 24px', fontSize: '14px', flex: 1 }}
                        >
                          🤖 Automatisk
                        </button>
                        <button
                          onClick={() => window.location.href = `/manual-shift-assignment?event=${event.id}`}
                          className="btn btn-secondary"
                          style={{ padding: '12px 24px', fontSize: '14px', flex: 1 }}
                        >
                          ✋ Manuell tildeling
                        </button>
                      </div>

                      <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
                        Vakter ({event.shifts.length}):
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {event.shifts.map((shift: any) => {
                          const families = JSON.parse(localStorage.getItem('dugnad_families') || '[]');
                          const assignedFamilies = (shift.assignedFamilies || [])
                            .map((fid: string) => families.find((f: any) => f.id === fid))
                            .filter(Boolean);

                          return (
                            <div key={shift.id} style={{ 
                              padding: '12px',
                              background: 'var(--background)',
                              borderRadius: 'var(--radius-md)',
                              border: '1px solid var(--border-color)'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <strong style={{ fontSize: '14px' }}>{shift.name}</strong>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                    ⏰ {shift.startTime} - {shift.endTime}
                                  </span>
                                  <span style={{ 
                                    fontSize: '13px',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    background: assignedFamilies.length >= shift.peopleNeeded ? '#dcfce7' : '#fee2e2',
                                    color: assignedFamilies.length >= shift.peopleNeeded ? '#166534' : '#991b1b',
                                    fontWeight: '600'
                                  }}>
                                    {assignedFamilies.length}/{shift.peopleNeeded}
                                  </span>
                                </div>
                              </div>
                              {assignedFamilies.length > 0 && (
                                <div style={{ fontSize: '13px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                                  <strong>Tildelt:</strong>
                                  {assignedFamilies.map((f: any, idx: number) => (
                                    <div key={idx} style={{ marginTop: '4px', paddingLeft: '8px' }}>
                                      • {f.players?.map((p: any) => p.name).join(', ')} ({f.parents?.[0]?.name || f.parents?.[0]})
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div className="card" style={{ padding: '32px', marginTop: '8px', background: '#f0f9ff', border: '2px solid var(--primary-color)' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px', color: 'var(--primary-color)' }}>
                      ✏️ Rediger: {event.eventName}
                    </h3>

                    <div style={{ marginBottom: '24px' }}>
                      <label className="input-label">Arrangementsnavn</label>
                      <input
                        type="text"
                        className="input"
                        value={event.eventName}
                        onChange={(e) => handleUpdateEvent(event.id, 'eventName', e.target.value)}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                      <div>
                        <label className="input-label">Dato</label>
                        <input
                          type="date"
                          className="input"
                          value={event.date}
                          onChange={(e) => handleUpdateEvent(event.id, 'date', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="input-label">Starttid</label>
                        <input
                          type="time"
                          className="input"
                          value={event.startTime}
                          onChange={(e) => handleUpdateEvent(event.id, 'startTime', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="input-label">Sluttid</label>
                        <input
                          type="time"
                          className="input"
                          value={event.endTime}
                          onChange={(e) => handleUpdateEvent(event.id, 'endTime', e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '24px', padding: '20px', background: 'white', borderRadius: 'var(--radius-md)' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                        🤖 Smart oppsett
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <div>
                          <label className="input-label">Idrett</label>
                          <select
                            className="input"
                            value={event.sport || 'football'}
                            onChange={(e) => handleUpdateEvent(event.id, 'sport', e.target.value)}
                          >
                            <option value="football">⚽ Fotball</option>
                            <option value="handball">🤾 Håndball</option>
                            <option value="ishockey">🏒 Ishockey</option>
                          </select>
                        </div>
                        <div>
                          <label className="input-label">Vaktlengde</label>
                          <select
                            className="input"
                            value={event.slotDuration || 2}
                            onChange={(e) => handleUpdateEvent(event.id, 'slotDuration', parseFloat(e.target.value))}
                          >
                            {DURATION_OPTIONS.map(dur => (
                              <option key={dur} value={dur}>{dur} timer</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <button
                        onClick={() => generateSmartShifts(event.id)}
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                      >
                        ✨ Generer vakter automatisk
                      </button>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: '600' }}>
                          Vakter ({event.shifts?.length || 0})
                        </h4>
                        <button
                          onClick={() => handleAddShift(event.id)}
                          className="btn btn-secondary"
                          style={{ padding: '8px 16px' }}
                        >
                          ➕ Legg til vakt
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {event.shifts?.map((shift: any) => (
                          <div key={shift.id} style={{
                            padding: '16px',
                            background: 'white',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-color)'
                          }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
                              <div>
                                <label className="input-label">Vaktnavn</label>
                                <input
                                  type="text"
                                  className="input"
                                  value={shift.name}
                                  onChange={(e) => handleUpdateShift(event.id, shift.id, 'name', e.target.value)}
                                  placeholder="F.eks. Kioskvakt"
                                />
                              </div>
                              <div>
                                <label className="input-label">Start</label>
                                <input
                                  type="time"
                                  className="input"
                                  value={shift.startTime}
                                  onChange={(e) => handleUpdateShift(event.id, shift.id, 'startTime', e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="input-label">Slutt</label>
                                <input
                                  type="time"
                                  className="input"
                                  value={shift.endTime}
                                  onChange={(e) => handleUpdateShift(event.id, shift.id, 'endTime', e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="input-label">Antall</label>
                                <input
                                  type="number"
                                  className="input"
                                  value={shift.peopleNeeded}
                                  onChange={(e) => handleUpdateShift(event.id, shift.id, 'peopleNeeded', parseInt(e.target.value))}
                                  min="1"
                                />
                              </div>
                              <button
                                onClick={() => handleDeleteShift(event.id, shift.id)}
                                className="btn"
                                style={{
                                  padding: '10px',
                                  background: 'white',
                                  border: '1px solid var(--danger-color)',
                                  color: 'var(--danger-color)'
                                }}
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                      <button onClick={handleCancelEdit} className="btn btn-secondary">
                        Avbryt
                      </button>
                      <button onClick={() => handleSaveEdit(event)} className="btn btn-primary">
                        💾 Lagre endringer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Ingen arrangementer ennå</p>
          <button
            onClick={() => window.location.href = '/create-event'}
            className="btn btn-primary"
          >
            Opprett ditt første arrangement
          </button>
        </div>
      )}
    </div>
  );
};


