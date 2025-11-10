import React, { useState, useEffect } from 'react';

interface Parent {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface Player {
  id: string;
  name: string;
  subgroup: string;
}

interface Family {
  id: string;
  parents: Parent[];
  players: Player[];
  verv: any[];
  pointsHistory: any[];
}

interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  peopleNeeded: number;
  assignedFamilies?: string[];
}

interface Event {
  id: string;
  eventName: string;
  date: string;
  startTime: string;
  endTime: string;
  shifts: Shift[];
}

export const ManualShiftAssignment: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [draggedFamilyId, setDraggedFamilyId] = useState<string | null>(null);
  const [dragSourceShiftId, setDragSourceShiftId] = useState<string | null>(null);
  const [workingShifts, setWorkingShifts] = useState<Shift[]>([]);

  useEffect(() => {
    const storedEvents = JSON.parse(localStorage.getItem('dugnad_events') || '[]');
    const storedFamilies = JSON.parse(localStorage.getItem('dugnad_families') || '[]');
    
    setEvents(storedEvents);
    setFamilies(storedFamilies);
    
    if (storedEvents.length > 0) {
      setSelectedEventId(storedEvents[0].id);
      setWorkingShifts(storedEvents[0].shifts || []);
    }
  }, []);

  useEffect(() => {
    const event = events.find(e => e.id === selectedEventId);
    if (event) {
      setWorkingShifts(event.shifts || []);
    }
  }, [selectedEventId, events]);

  const calculateFamilyPoints = (family: Family): { teamPoints: number; familyPoints: number } => {
    const vervPoints = family.verv?.reduce((sum: number, v: any) => sum + v.points, 0) || 0;
    const historyPoints = family.pointsHistory?.reduce((sum: number, h: any) => sum + h.points, 0) || 0;
    
    const totalPoints = vervPoints + historyPoints;
    
    return {
      teamPoints: totalPoints,
      familyPoints: totalPoints
    };
  };

  const getFamilyAssignmentCount = (familyId: string): number => {
    return workingShifts.reduce((count, shift) => {
      return count + (shift.assignedFamilies?.filter(fid => fid === familyId).length || 0);
    }, 0);
  };

  const isShiftOverlap = (shift1: Shift, shift2: Shift): boolean => {
    return shift1.startTime < shift2.endTime && shift1.endTime > shift2.startTime;
  };

  const getFamilyAssignedShifts = (familyId: string): Shift[] => {
    return workingShifts.filter(shift => 
      shift.assignedFamilies?.includes(familyId)
    );
  };

  const canAssignFamily = (familyId: string, shiftId: string): boolean => {
    const shift = workingShifts.find(s => s.id === shiftId);
    if (!shift) return false;

    if ((shift.assignedFamilies?.length || 0) >= shift.peopleNeeded) return false;

    const assignedShifts = getFamilyAssignedShifts(familyId);
    return !assignedShifts.some(s => isShiftOverlap(s, shift));
  };

  const sortedFamilies = [...families]
    .map(f => ({
      ...f,
      points: calculateFamilyPoints(f),
      shiftsNeeded: f.players?.length || 1,
      shiftsAssigned: getFamilyAssignmentCount(f.id)
    }))
    .sort((a, b) => {
      if (a.points.teamPoints !== b.points.teamPoints) {
        return a.points.teamPoints - b.points.teamPoints;
      }
      return a.points.familyPoints - b.points.familyPoints;
    });

  const handleDragStart = (familyId: string, sourceShiftId?: string) => {
    setDraggedFamilyId(familyId);
    setDragSourceShiftId(sourceShiftId || null);
  };

  const handleDragEnd = () => {
    setDraggedFamilyId(null);
    setDragSourceShiftId(null);
  };

  const handleDrop = (targetShiftId: string) => {
    if (!draggedFamilyId) return;

    // Moving from another shift - ALLOW freely, even with time overlap
    if (dragSourceShiftId && dragSourceShiftId !== targetShiftId) {
      const updatedShifts = workingShifts.map(shift => {
        if (shift.id === dragSourceShiftId) {
          // Remove from source
          return {
            ...shift,
            assignedFamilies: shift.assignedFamilies?.filter(fid => fid !== draggedFamilyId) || []
          };
        }
        if (shift.id === targetShiftId) {
          // Add to target (allow overfilling too - user can manually fix)
          return {
            ...shift,
            assignedFamilies: [...(shift.assignedFamilies || []), draggedFamilyId]
          };
        }
        return shift;
      });

      setWorkingShifts(updatedShifts);
      return;
    }

    // Adding from family list - CHECK constraints
    if (!dragSourceShiftId) {
      if (!canAssignFamily(draggedFamilyId, targetShiftId)) {
        alert('⚠️ Kan ikke tildele: Vakt er full eller overlapper med eksisterende vakt');
        return;
      }

      const updatedShifts = workingShifts.map(shift => {
        if (shift.id === targetShiftId) {
          return {
            ...shift,
            assignedFamilies: [...(shift.assignedFamilies || []), draggedFamilyId]
          };
        }
        return shift;
      });

      setWorkingShifts(updatedShifts);
    }
  };

  const handleRemoveFamily = (shiftId: string, familyId: string) => {
    const updatedShifts = workingShifts.map(shift => {
      if (shift.id === shiftId) {
        return {
          ...shift,
          assignedFamilies: shift.assignedFamilies?.filter(fid => fid !== familyId) || []
        };
      }
      return shift;
    });

    setWorkingShifts(updatedShifts);
  };

  const handleAutoAssign = () => {
    if (!confirm('Dette vil automatisk tildele familier med lavest poeng. Fortsette?')) return;

    const familiesWithNeeds = sortedFamilies.map(f => ({
      ...f,
      currentPoints: f.points.teamPoints,
      shiftsAssigned: 0
    }));

    const updatedShifts = workingShifts.map(shift => ({ 
      ...shift, 
      assignedFamilies: shift.assignedFamilies || [] 
    }));

    const familyAssignments: { [key: string]: Shift[] } = {};

    for (const shift of updatedShifts) {
      let assigned = shift.assignedFamilies.length;
      
      while (assigned < shift.peopleNeeded) {
        const availableFamily = familiesWithNeeds.find(f => {
          if (f.shiftsAssigned >= f.shiftsNeeded) return false;
          const alreadyAssigned = familyAssignments[f.id] || [];
          return !alreadyAssigned.some(s => isShiftOverlap(s, shift));
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
        
        familiesWithNeeds.sort((a, b) => a.currentPoints - b.currentPoints);
      }
    }

    setWorkingShifts(updatedShifts);
    alert(`✅ Automatisk tildeling fullført!`);
  };

  const handleSave = () => {
    const selectedEvent = events.find(e => e.id === selectedEventId);
    if (!selectedEvent) return;

    const familyAssignments: { [key: string]: Shift[] } = {};
    workingShifts.forEach(shift => {
      shift.assignedFamilies?.forEach(fid => {
        if (!familyAssignments[fid]) familyAssignments[fid] = [];
        familyAssignments[fid].push(shift);
      });
    });

    const updatedFamilies = families.map(family => {
      const assignments = familyAssignments[family.id];
      if (!assignments?.length) return family;

      const newHistory = assignments.map(shift => {
        const [startH, startM] = shift.startTime.split(':').map(Number);
        const [endH, endM] = shift.endTime.split(':').map(Number);
        const hours = ((endH * 60 + endM) - (startH * 60 + startM)) / 60;
        
        return {
          date: selectedEvent.date,
          type: 'shift',
          description: `${selectedEvent.eventName} - ${shift.name}`,
          points: Math.round(hours * 10)
        };
      });

      return {
        ...family,
        pointsHistory: [...(family.pointsHistory || []), ...newHistory]
      };
    });

    const updatedEvents = events.map(e => 
      e.id === selectedEventId ? { ...e, shifts: workingShifts } : e
    );

    localStorage.setItem('dugnad_events', JSON.stringify(updatedEvents));
    localStorage.setItem('dugnad_families', JSON.stringify(updatedFamilies));

    alert('✅ Vakter lagret!');
    window.location.href = '/events-list';
  };

  const selectedEvent = events.find(e => e.id === selectedEventId);

  return (
    <div style={{ padding: '40px', maxWidth: '1600px', margin: '0 auto' }}>
      <button 
        onClick={() => window.location.href = '/events-list'}
        className="btn btn-secondary"
        style={{ marginBottom: '16px' }}
      >
        ← Tilbake
      </button>

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
          Tildel vakter manuelt
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Dra og slipp familier til vakter, eller mellom vakter
        </p>
      </div>

      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', alignItems: 'end' }}>
          <div>
            <label className="input-label">Velg arrangement</label>
            <select
              className="input"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
            >
              {events.map(e => (
                <option key={e.id} value={e.id}>
                  {e.eventName} - {e.date}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleAutoAssign}
            className="btn btn-primary"
          >
            🤖 Automatisk tildeling
          </button>
        </div>

        {selectedEvent && (
          <div style={{ marginTop: '16px', padding: '12px', background: 'var(--background)', borderRadius: 'var(--radius-md)', fontSize: '14px' }}>
            <strong>Valgt arrangement:</strong> {selectedEvent.eventName} • {selectedEvent.date} • {selectedEvent.startTime}-{selectedEvent.endTime} • {workingShifts.length} vakter
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* LEFT: Shifts */}
        <div>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600' }}>
              Vakter ({workingShifts.length})
            </h2>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              {workingShifts.reduce((sum, s) => sum + (s.assignedFamilies?.length || 0), 0)} / {workingShifts.reduce((sum, s) => sum + s.peopleNeeded, 0)} tildelt
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {workingShifts.map(shift => {
              const assignedFamilies = (shift.assignedFamilies || []).map(fid => 
                families.find(f => f.id === fid)
              ).filter(Boolean);
              const isFull = assignedFamilies.length >= shift.peopleNeeded;
              const isOverfilled = assignedFamilies.length > shift.peopleNeeded;
              const canDrop = draggedFamilyId && (dragSourceShiftId ? true : canAssignFamily(draggedFamilyId, shift.id));

              return (
                <div
                  key={shift.id}
                  onDragOver={(e) => {
                    if (canDrop) {
                      e.preventDefault();
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleDrop(shift.id);
                  }}
                  style={{
                    padding: '16px',
                    background: canDrop ? '#dcfce7' : 'white',
                    borderRadius: 'var(--radius-md)',
                    border: canDrop ? '2px dashed var(--primary-color)' : '2px solid var(--border-color)',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                        {shift.name}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        ⏰ {shift.startTime} - {shift.endTime}
                      </div>
                    </div>
                    <div style={{
                      padding: '4px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: isOverfilled ? '#fef3c7' : isFull ? '#dcfce7' : '#fee2e2',
                      color: isOverfilled ? '#92400e' : isFull ? '#166534' : '#991b1b',
                      fontSize: '14px',
                      fontWeight: '600',
                      height: 'fit-content'
                    }}>
                      {assignedFamilies.length}/{shift.peopleNeeded}
                      {isOverfilled && ' ⚠️'}
                    </div>
                  </div>

                  {isOverfilled && (
                    <div style={{
                      padding: '8px 12px',
                      background: '#fef3c7',
                      color: '#92400e',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '13px',
                      marginBottom: '12px',
                      border: '1px solid #fbbf24'
                    }}>
                      ⚠️ For mange tildelt! Trengs {shift.peopleNeeded}, men {assignedFamilies.length} er tildelt.
                    </div>
                  )}

                  {assignedFamilies.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {assignedFamilies.map((family: any) => (
                        <div
                          key={family.id}
                          draggable
                          onDragStart={() => handleDragStart(family.id, shift.id)}
                          onDragEnd={handleDragEnd}
                          style={{
                            padding: '8px 12px',
                            background: 'white',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '14px',
                            cursor: 'grab'
                          }}
                        >
                          <span>
                            {family.players?.map((p: any) => p.name).join(', ')}
                            <span style={{ color: 'var(--text-secondary)', fontSize: '13px', marginLeft: '8px' }}>
                              ({family.parents?.[0]?.name || (typeof family.parents?.[0] === 'string' ? family.parents[0] : 'Ukjent')})
                            </span>
                          </span>
                          <button
                            onClick={() => handleRemoveFamily(shift.id, family.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--danger-color)',
                              cursor: 'pointer',
                              fontSize: '18px',
                              padding: '0 4px'
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{
                      padding: '24px',
                      textAlign: 'center',
                      color: 'var(--text-secondary)',
                      fontSize: '14px',
                      border: '2px dashed var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--background)'
                    }}>
                      Dra familier hit
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Families */}
        <div>
          <div style={{ position: 'sticky', top: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
              Familier ({families.length})
            </h2>

            <div style={{ 
              maxHeight: 'calc(100vh - 200px)', 
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              paddingRight: '8px'
            }}>
              {sortedFamilies.map((family: any) => {
                const isDragging = draggedFamilyId === family.id && !dragSourceShiftId;
                const needsMoreShifts = family.shiftsAssigned < family.shiftsNeeded;

                return (
                  <div
                    key={family.id}
                    draggable
                    onDragStart={() => handleDragStart(family.id)}
                    onDragEnd={handleDragEnd}
                    style={{
                      padding: '12px',
                      background: isDragging ? '#e0f2fe' : needsMoreShifts ? 'white' : '#f3f4f6',
                      borderRadius: 'var(--radius-md)',
                      border: needsMoreShifts ? '2px solid var(--primary-color)' : '2px solid var(--border-color)',
                      cursor: 'grab',
                      opacity: isDragging ? 0.5 : 1,
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '600' }}>
                        {family.players?.map((p: any) => p.name).join(', ')}
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--primary-color)' }}>
                        {family.points.teamPoints}p
                      </div>
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      👨‍👩‍👧 {family.parents?.[0]?.name || (typeof family.parents?.[0] === 'string' ? family.parents[0] : 'Ingen foresatte')}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: needsMoreShifts ? '#fef3c7' : '#dcfce7',
                        color: needsMoreShifts ? '#92400e' : '#166534'
                      }}>
                        {family.shiftsAssigned}/{family.shiftsNeeded} vakter
                      </span>
                      {family.verv?.length > 0 && (
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: '#e0f2fe',
                          color: '#075985'
                        }}>
                          🏆 {family.verv.length} verv
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '32px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button
          onClick={() => window.location.href = '/events-list'}
          className="btn btn-secondary"
        >
          Avbryt
        </button>
        <button
          onClick={handleSave}
          className="btn btn-primary"
          style={{ padding: '12px 32px' }}
        >
          💾 Lagre tildelinger
        </button>
      </div>
    </div>
  );
};

