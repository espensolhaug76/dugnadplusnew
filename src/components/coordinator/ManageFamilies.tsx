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
  birthDate: string;
  subgroup: string;
}

interface Verv {
  id: string;
  role: string;
  points: number;
}

interface Family {
  id: string;
  address: string;
  postalCode: string;
  city: string;
  parents: Parent[];
  players: Player[];
  registrationToken: string;
  status: string;
  verv: Verv[];
  totalPoints: number;
  pointsHistory: Array<{
    date: string;
    type: string;
    description: string;
    points: number;
  }>;
  preferredShifts?: string[];
  restrictedShifts?: string[];
}

const VERV_TYPES = [
  { value: 'trener', label: 'Trener', defaultPoints: 200 },
  { value: 'dugnadsansvarlig', label: 'Dugnadsansvarlig', defaultPoints: 200 },
  { value: 'lagleder', label: 'Lagleder', defaultPoints: 200 },
  { value: 'andre', label: 'Andre verv', defaultPoints: 200 }
];

const SUBGROUPS = ['KIL BLÅ', 'KIL BRUN', 'KIL HVIT', 'KIL ORANSJE', 'KIL RØD'];

const SHIFT_TYPES = [
  'Kioskvakt',
  'Billettsalg',
  'Fair play/kampvert',
  'Sekretæriat',
  'Speaker',
  'Dommer',
  'Annet'
];

export const ManageFamilies: React.FC = () => {
  const [families, setFamilies] = useState<Family[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [editingPlayer, setEditingPlayer] = useState<{ familyId: string; playerId: string } | null>(null);
  const [tempPlayerName, setTempPlayerName] = useState('');
  const [tempPlayerSubgroup, setTempPlayerSubgroup] = useState('');
  const [addingVerv, setAddingVerv] = useState<string | null>(null);
  const [newVerv, setNewVerv] = useState({ role: 'trener', points: 200, customRole: '' });
  const [addingFamily, setAddingFamily] = useState(false);
  const [addingPlayer, setAddingPlayer] = useState<string | null>(null);
  const [movePlayerMode, setMovePlayerMode] = useState<{ familyId: string; playerId: string } | null>(null);
  const [editingPreferences, setEditingPreferences] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('dugnad_families');
    if (stored) {
      const parsed = JSON.parse(stored);
      const converted = parsed.map((f: any) => ({
        ...f,
        parents: f.parents.map((p: any) => ({
          id: p.id || `parent_${Date.now()}_${Math.random()}`,
          name: typeof p === 'string' ? p : p.name,
          email: typeof p === 'object' ? p.email : '',
          phone: typeof p === 'object' ? p.phone : ''
        })),
        players: f.players.map((pl: any) => ({
          ...pl,
          id: pl.id || `player_${Date.now()}_${Math.random()}`
        })),
        verv: f.verv || [],
        totalPoints: f.totalPoints || 0,
        pointsHistory: f.pointsHistory || []
      }));
      setFamilies(converted);
      localStorage.setItem('dugnad_families', JSON.stringify(converted));
    }
  }, []);

  const saveToStorage = (updatedFamilies: Family[]) => {
    setFamilies(updatedFamilies);
    localStorage.setItem('dugnad_families', JSON.stringify(updatedFamilies));
    
    const allPlayers = updatedFamilies.flatMap(f => 
      f.players.map(p => ({ ...p, familyId: f.id }))
    );
    localStorage.setItem('dugnad_players', JSON.stringify(allPlayers));
  };

  const calculateFamilyPoints = (family: Family): number => {
    const vervPoints = family.verv.reduce((sum, v) => sum + v.points, 0);
    const historyPoints = family.pointsHistory.reduce((sum, h) => sum + h.points, 0);
    return vervPoints + historyPoints;
  };

  const filteredFamilies = families.filter(f => {
    if (filter === 'all') return true;
    return f.status === filter;
  }).sort((a, b) => {
    const pointsA = calculateFamilyPoints(a);
    const pointsB = calculateFamilyPoints(b);
    return pointsA - pointsB;
  });

  // Parent operations
  const updateParentContact = (familyId: string, parentId: string, field: 'email' | 'phone' | 'name', value: string) => {
    const updated = families.map(f => {
      if (f.id === familyId) {
        const newParents = f.parents.map(p => 
          p.id === parentId ? { ...p, [field]: value } : p
        );
        return { ...f, parents: newParents };
      }
      return f;
    });
    saveToStorage(updated);
  };

  const addParent = (familyId: string) => {
    const updated = families.map(f => {
      if (f.id === familyId) {
        const newParent: Parent = {
          id: `parent_${Date.now()}_${Math.random()}`,
          name: '',
          email: '',
          phone: ''
        };
        return { ...f, parents: [...f.parents, newParent] };
      }
      return f;
    });
    saveToStorage(updated);
  };

  const deleteParent = (familyId: string, parentId: string) => {
    const family = families.find(f => f.id === familyId);
    if (family && family.parents.length <= 1) {
      alert('⚠️ Kan ikke slette siste foresatt!');
      return;
    }
    
    if (confirm('Er du sikker på at du vil slette denne foresatte?')) {
      const updated = families.map(f => {
        if (f.id === familyId) {
          return { ...f, parents: f.parents.filter(p => p.id !== parentId) };
        }
        return f;
      });
      saveToStorage(updated);
    }
  };

  // Player operations
  const startEditPlayer = (familyId: string, playerId: string, currentName: string, currentSubgroup: string) => {
    setEditingPlayer({ familyId, playerId });
    setTempPlayerName(currentName);
    setTempPlayerSubgroup(currentSubgroup);
  };

  const savePlayer = () => {
    if (!editingPlayer) return;
    
    const updated = families.map(f => {
      if (f.id === editingPlayer.familyId) {
        const newPlayers = f.players.map(p =>
          p.id === editingPlayer.playerId 
            ? { ...p, name: tempPlayerName, subgroup: tempPlayerSubgroup } 
            : p
        );
        return { ...f, players: newPlayers };
      }
      return f;
    });
    saveToStorage(updated);
    setEditingPlayer(null);
    setTempPlayerName('');
    setTempPlayerSubgroup('');
  };

  const cancelEditPlayer = () => {
    setEditingPlayer(null);
    setTempPlayerName('');
    setTempPlayerSubgroup('');
  };

  const addPlayerToFamily = (familyId: string, playerName: string, subgroup: string, birthDate: string) => {
    const updated = families.map(f => {
      if (f.id === familyId) {
        const newPlayer: Player = {
          id: `player_${Date.now()}_${Math.random()}`,
          name: playerName,
          birthDate: birthDate,
          subgroup: subgroup
        };
        return { ...f, players: [...f.players, newPlayer] };
      }
      return f;
    });
    saveToStorage(updated);
    setAddingPlayer(null);
  };

  const deletePlayer = (familyId: string, playerId: string) => {
    if (confirm('Er du sikker på at du vil slette denne spilleren?')) {
      const updated = families.map(f => {
        if (f.id === familyId) {
          return { ...f, players: f.players.filter(p => p.id !== playerId) };
        }
        return f;
      });
      saveToStorage(updated);
    }
  };

  const movePlayer = (fromFamilyId: string, playerId: string, toFamilyId: string) => {
    const fromFamily = families.find(f => f.id === fromFamilyId);
    const player = fromFamily?.players.find(p => p.id === playerId);
    
    if (!player) return;

    const updated = families.map(f => {
      if (f.id === fromFamilyId) {
        return { ...f, players: f.players.filter(p => p.id !== playerId) };
      }
      if (f.id === toFamilyId) {
        return { ...f, players: [...f.players, player] };
      }
      return f;
    });

    saveToStorage(updated);
    setMovePlayerMode(null);
    alert(`✅ ${player.name} flyttet til ny familie!`);
  };

  // Family operations
  const addNewFamily = () => {
    const newFamily: Family = {
      id: `family_${Date.now()}`,
      address: '',
      postalCode: '',
      city: '',
      parents: [{ id: `parent_${Date.now()}`, name: '', email: '', phone: '' }],
      players: [],
      registrationToken: `token_${Date.now()}`,
      status: 'completed',
      verv: [],
      totalPoints: 0,
      pointsHistory: []
    };
    saveToStorage([newFamily, ...families]);
    setAddingFamily(false);
    alert('✅ Tom familie opprettet! Du kan nå flytte spillere hit eller legge til nye.');
  };

  const createFamilyForPlayer = (fromFamilyId: string, playerId: string) => {
    const fromFamily = families.find(f => f.id === fromFamilyId);
    const player = fromFamily?.players.find(p => p.id === playerId);
    
    if (!player) return;

    const newFamily: Family = {
      id: `family_${Date.now()}`,
      address: '',
      postalCode: '',
      city: '',
      parents: [{ id: `parent_${Date.now()}`, name: '', email: '', phone: '' }],
      players: [player],
      registrationToken: `token_${Date.now()}`,
      status: 'completed',
      verv: [],
      totalPoints: 0,
      pointsHistory: []
    };

    const updated = families.map(f => {
      if (f.id === fromFamilyId) {
        return { ...f, players: f.players.filter(p => p.id !== playerId) };
      }
      return f;
    });

    saveToStorage([newFamily, ...updated]);
    setMovePlayerMode(null);
    alert(`✅ ${player.name} flyttet til ny familie!`);
  };

  const deleteFamily = (familyId: string) => {
    if (confirm('Er du sikker på at du vil slette denne familien?')) {
      const updated = families.filter(f => f.id !== familyId);
      saveToStorage(updated);
    }
  };

  const updateFamilyAddress = (familyId: string, field: 'address' | 'postalCode' | 'city', value: string) => {
    const updated = families.map(f => 
      f.id === familyId ? { ...f, [field]: value } : f
    );
    saveToStorage(updated);
  };

  // Verv operations
  const startAddVerv = (familyId: string) => {
    setAddingVerv(familyId);
    setNewVerv({ role: 'trener', points: 200, customRole: '' });
  };

  const addVervToFamily = (familyId: string) => {
    const roleLabel = newVerv.role === 'andre' 
      ? newVerv.customRole 
      : VERV_TYPES.find(v => v.value === newVerv.role)?.label || '';

    if (!roleLabel.trim()) {
      alert('⚠️ Vennligst fyll inn verv-navn');
      return;
    }

    const vervToAdd: Verv = {
      id: `verv_${Date.now()}_${Math.random()}`,
      role: roleLabel,
      points: newVerv.points
    };

    const updated = families.map(f => {
      if (f.id === familyId) {
        return { 
          ...f, 
          verv: [...f.verv, vervToAdd],
          totalPoints: calculateFamilyPoints({ ...f, verv: [...f.verv, vervToAdd] })
        };
      }
      return f;
    });
    
    saveToStorage(updated);
    setAddingVerv(null);
  };

  const deleteVerv = (familyId: string, vervId: string) => {
    if (confirm('Er du sikker på at du vil slette dette vervet?')) {
      const updated = families.map(f => {
        if (f.id === familyId) {
          const newVerv = f.verv.filter(v => v.id !== vervId);
          return { 
            ...f, 
            verv: newVerv,
            totalPoints: calculateFamilyPoints({ ...f, verv: newVerv })
          };
        }
        return f;
      });
      saveToStorage(updated);
    }
  };

  const togglePreferredShift = (familyId: string, shiftType: string) => {
    const updated = families.map(f => {
      if (f.id === familyId) {
        const current = f.preferredShifts || [];
        const newPreferred = current.includes(shiftType)
          ? current.filter(s => s !== shiftType)
          : [...current, shiftType];
        return { ...f, preferredShifts: newPreferred };
      }
      return f;
    });
    saveToStorage(updated);
  };

  const toggleRestrictedShift = (familyId: string, shiftType: string) => {
    const updated = families.map(f => {
      if (f.id === familyId) {
        const current = f.restrictedShifts || [];
        const newRestricted = current.includes(shiftType)
          ? current.filter(s => s !== shiftType)
          : [...current, shiftType];
        return { ...f, restrictedShifts: newRestricted };
      }
      return f;
    });
    saveToStorage(updated);
  };

  const sendLink = (family: Family, parentId: string) => {
    const parent = family.parents.find(p => p.id === parentId);
    if (!parent || (!parent.email && !parent.phone)) {
      alert('⚠️ Legg til e-post eller telefon først!');
      return;
    }

    const link = `${window.location.origin}/family-registration/${family.registrationToken}`;
    const playerNames = family.players.map(p => p.name).join(', ');
    
    const message = `Hei ${parent.name}!\n\nVelkommen til Dugnad+ for ${playerNames}.\n\nRegistrer din familie her: ${link}\n\nMvh Kongsvinger IL`;

    navigator.clipboard.writeText(message);
    alert(`📋 Melding kopiert!\n\nSend til ${parent.email || parent.phone} via Spond eller SMS.`);
  };

  const sendAllLinks = () => {
    const pending = families.filter(f => 
      f.status === 'pending' && f.parents.some(p => p.email || p.phone)
    );
    
    if (pending.length === 0) {
      alert('⚠️ Ingen familier med kontaktinformasjon!');
      return;
    }

    const messages = pending.map(f => {
      const link = `${window.location.origin}/family-registration/${f.registrationToken}`;
      const playerNames = f.players.map(p => p.name).join(', ');
      const contactParent = f.parents.find(p => p.email || p.phone);
      return `${contactParent?.name} (${contactParent?.email || contactParent?.phone}):\n${playerNames}\n${link}`;
    }).join('\n\n---\n\n');

    navigator.clipboard.writeText(messages);
    alert(`📋 ${pending.length} invitasjoner kopiert!`);
  };

  const pendingCount = families.filter(f => f.status === 'pending').length;
  const completedCount = families.filter(f => f.status === 'completed').length;

  return (
    <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
      <button 
        onClick={() => window.location.href = '/coordinator-dashboard'}
        className="btn btn-secondary"
        style={{ marginBottom: '16px' }}
      >
        ← Tilbake
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
            Administrer familier
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {families.length} familier • {families.reduce((sum, f) => sum + f.players.length, 0)} spillere • Sortert etter poeng (lavest først)
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setAddingFamily(true)}
            className="btn btn-secondary"
          >
            ➕ Ny familie
          </button>
          <button
            onClick={() => window.location.href = '/import-families'}
            className="btn btn-secondary"
          >
            📁 Importer fra Excel
          </button>
          {pendingCount > 0 && (
            <button
              onClick={sendAllLinks}
              className="btn btn-primary"
            >
              📧 Inviter alle
            </button>
          )}
        </div>
      </div>

      {addingFamily && (
        <div className="card" style={{ padding: '24px', marginBottom: '16px', background: '#f0f9ff' }}>
          <h3 style={{ marginBottom: '16px' }}>➕ Opprett ny familie</h3>
          <p style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
            En ny tom familie vil bli opprettet. Du kan deretter legge til foresatte og spillere.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={addNewFamily} className="btn btn-primary">
              ✓ Opprett familie
            </button>
            <button onClick={() => setAddingFamily(false)} className="btn btn-secondary">
              Avbryt
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)' }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            padding: '12px 24px',
            background: 'none',
            border: 'none',
            borderBottom: filter === 'all' ? '2px solid var(--primary-color)' : '2px solid transparent',
            color: filter === 'all' ? 'var(--primary-color)' : 'var(--text-secondary)',
            fontWeight: filter === 'all' ? '600' : '400',
            cursor: 'pointer'
          }}
        >
          Alle ({families.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          style={{
            padding: '12px 24px',
            background: 'none',
            border: 'none',
            borderBottom: filter === 'pending' ? '2px solid var(--primary-color)' : '2px solid transparent',
            color: filter === 'pending' ? 'var(--primary-color)' : 'var(--text-secondary)',
            fontWeight: filter === 'pending' ? '600' : '400',
            cursor: 'pointer'
          }}
        >
          Venter ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('completed')}
          style={{
            padding: '12px 24px',
            background: 'none',
            border: 'none',
            borderBottom: filter === 'completed' ? '2px solid var(--primary-color)' : '2px solid transparent',
            color: filter === 'completed' ? 'var(--primary-color)' : 'var(--text-secondary)',
            fontWeight: filter === 'completed' ? '600' : '400',
            cursor: 'pointer'
          }}
        >
          Fullført ({completedCount})
        </button>
      </div>

      {filteredFamilies.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredFamilies.map((family) => {
            const playerNames = family.players.map(p => p.name).join(', ') || 'Ingen spillere';
            const familyPoints = calculateFamilyPoints(family);
            const hasMultipleKids = family.players.length > 1;

            return (
              <div key={family.id} className="card" style={{ padding: '24px', border: '2px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '600' }}>
                        {playerNames}
                      </h3>
                      <div style={{ 
                        padding: '4px 12px', 
                        background: familyPoints === 0 ? '#fee2e2' : '#dcfce7',
                        color: familyPoints === 0 ? '#991b1b' : '#166534',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        {familyPoints} poeng
                      </div>
                      {hasMultipleKids && (
                        <div style={{ 
                          padding: '4px 12px', 
                          background: '#fef3c7',
                          color: '#92400e',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '13px'
                        }}>
                          👥 {family.players.length} barn = {family.players.length} vakter
                        </div>
                      )}
                      {family.status === 'completed' && <span style={{ color: 'var(--success-color)' }}>✓</span>}
                      {family.status === 'pending' && <span style={{ color: 'var(--warning-color)' }}>⏳</span>}
                    </div>
                    
                    {/* Editable address */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '8px', marginTop: '8px' }}>
                      <input
                        type="text"
                        className="input"
                        value={family.address}
                        onChange={(e) => updateFamilyAddress(family.id, 'address', e.target.value)}
                        placeholder="📍 Adresse"
                        style={{ fontSize: '13px', padding: '4px 8px' }}
                      />
                      <input
                        type="text"
                        className="input"
                        value={family.postalCode}
                        onChange={(e) => updateFamilyAddress(family.id, 'postalCode', e.target.value)}
                        placeholder="Postnr"
                        style={{ fontSize: '13px', padding: '4px 8px' }}
                      />
                      <input
                        type="text"
                        className="input"
                        value={family.city}
                        onChange={(e) => updateFamilyAddress(family.id, 'city', e.target.value)}
                        placeholder="Sted"
                        style={{ fontSize: '13px', padding: '4px 8px' }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => deleteFamily(family.id)}
                    className="btn"
                    style={{ 
                      padding: '8px 16px',
                      background: 'white',
                      border: '1px solid var(--danger-color)',
                      color: 'var(--danger-color)'
                    }}
                  >
                    🗑️ Slett familie
                  </button>
                </div>

                {/* Verv Section */}
                <div style={{ marginBottom: '16px', padding: '16px', background: '#f0f9ff', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <strong style={{ fontSize: '14px' }}>
                      🏆 Verv og ansvar ({family.verv.length}):
                    </strong>
                    <button
                      onClick={() => startAddVerv(family.id)}
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '14px' }}
                    >
                      ➕ Legg til verv
                    </button>
                  </div>

                  {addingVerv === family.id && (
                    <div style={{ padding: '12px', background: 'white', borderRadius: 'var(--radius-md)', marginBottom: '12px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px auto', gap: '8px', alignItems: 'end' }}>
                        <div>
                          <label className="input-label" style={{ fontSize: '12px' }}>Verv</label>
                          <select
                            className="input"
                            value={newVerv.role}
                            onChange={(e) => setNewVerv({ ...newVerv, role: e.target.value, points: VERV_TYPES.find(v => v.value === e.target.value)?.defaultPoints || 200 })}
                            style={{ fontSize: '14px', padding: '8px' }}
                          >
                            {VERV_TYPES.map(v => (
                              <option key={v.value} value={v.value}>{v.label}</option>
                            ))}
                          </select>
                        </div>
                        {newVerv.role === 'andre' && (
                          <div>
                            <label className="input-label" style={{ fontSize: '12px' }}>Spesifiser verv</label>
                            <input
                              type="text"
                              className="input"
                              value={newVerv.customRole}
                              onChange={(e) => setNewVerv({ ...newVerv, customRole: e.target.value })}
                              placeholder="F.eks. Kasserer"
                              style={{ fontSize: '14px', padding: '8px' }}
                            />
                          </div>
                        )}
                        <div>
                          <label className="input-label" style={{ fontSize: '12px' }}>Poeng</label>
                          <input
                            type="number"
                            className="input"
                            value={newVerv.points}
                            onChange={(e) => setNewVerv({ ...newVerv, points: parseInt(e.target.value) })}
                            style={{ fontSize: '14px', padding: '8px' }}
                          />
                        </div>
                        <button onClick={() => addVervToFamily(family.id)} className="btn btn-primary" style={{ padding: '8px 12px' }}>
                          ✓ Legg til
                        </button>
                        <button onClick={() => setAddingVerv(null)} className="btn btn-secondary" style={{ padding: '8px 12px' }}>
                          ✗
                        </button>
                      </div>
                    </div>
                  )}

                  {family.verv.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {family.verv.map(v => (
                        <div key={v.id} style={{ 
                          padding: '8px 12px',
                          background: 'white',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-color)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '14px'
                        }}>
                          <span><strong>{v.role}</strong> ({v.points} poeng)</span>
                          <button
                            onClick={() => deleteVerv(family.id, v.id)}
                            style={{ 
                              background: 'none',
                              border: 'none',
                              color: 'var(--danger-color)',
                              cursor: 'pointer',
                              fontSize: '16px',
                              padding: '0 4px'
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
                      Ingen verv registrert. Familier med verv får 200 poeng bonus.
                    </p>
                  )}
                </div>

                {/* Parents Section */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <strong style={{ fontSize: '14px' }}>
                      Foresatte ({family.parents.length}):
                    </strong>
                    <button
                      onClick={() => addParent(family.id)}
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '14px' }}
                    >
                      ➕ Legg til foresatt
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {family.parents.map((parent) => (
                      <div key={parent.id} style={{ 
                        padding: '16px',
                        background: 'var(--background)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)'
                      }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 1fr auto auto', gap: '12px', alignItems: 'center' }}>
                          <input
                            type="text"
                            className="input"
                            value={parent.name}
                            onChange={(e) => updateParentContact(family.id, parent.id, 'name', e.target.value)}
                            placeholder="Navn"
                            style={{ fontSize: '14px', padding: '8px', fontWeight: '600' }}
                          />
                          <input
                            type="email"
                            className="input"
                            value={parent.email || ''}
                            onChange={(e) => updateParentContact(family.id, parent.id, 'email', e.target.value)}
                            placeholder="✉️ E-post"
                            style={{ fontSize: '14px', padding: '8px' }}
                          />
                          <input
                            type="tel"
                            className="input"
                            value={parent.phone || ''}
                            onChange={(e) => updateParentContact(family.id, parent.id, 'phone', e.target.value)}
                            placeholder="📱 Telefon"
                            style={{ fontSize: '14px', padding: '8px' }}
                          />
                          {family.status === 'pending' && (parent.email || parent.phone) && (
                            <button
                              onClick={() => sendLink(family, parent.id)}
                              className="btn btn-primary"
                              style={{ padding: '8px 16px', fontSize: '14px', whiteSpace: 'nowrap' }}
                            >
                              📧 Send link
                            </button>
                          )}
                          <button
                            onClick={() => deleteParent(family.id, parent.id)}
                            className="btn"
                            style={{ 
                              padding: '8px',
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

                {/* Players Section */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <strong style={{ fontSize: '14px' }}>
                      Spillere ({family.players.length}):
                    </strong>
                    <button
                      onClick={() => setAddingPlayer(family.id)}
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '14px' }}
                    >
                      ➕ Legg til spiller
                    </button>
                  </div>

                  {addingPlayer === family.id && (
                    <div style={{ padding: '12px', background: '#f0f9ff', borderRadius: 'var(--radius-md)', marginBottom: '12px' }}>
                      <AddPlayerForm
                        onSave={(name, subgroup, birthDate) => addPlayerToFamily(family.id, name, subgroup, birthDate)}
                        onCancel={() => setAddingPlayer(null)}
                      />
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '8px' }}>
                    {family.players.map((player) => {
                      const isEditing = editingPlayer?.familyId === family.id && editingPlayer?.playerId === player.id;
                      const isMoving = movePlayerMode?.familyId === family.id && movePlayerMode?.playerId === player.id;
                      
                      return (
                        <div key={player.id} style={{ 
                          padding: '12px',
                          background: 'white',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '14px',
                          border: '1px solid var(--border-color)'
                        }}>
                          {isEditing ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <input
                                type="text"
                                className="input"
                                value={tempPlayerName}
                                onChange={(e) => setTempPlayerName(e.target.value)}
                                placeholder="Navn"
                                style={{ fontSize: '14px', padding: '6px' }}
                                autoFocus
                              />
                              <select
                                className="input"
                                value={tempPlayerSubgroup}
                                onChange={(e) => setTempPlayerSubgroup(e.target.value)}
                                style={{ fontSize: '14px', padding: '6px' }}
                              >
                                {SUBGROUPS.map(sg => (
                                  <option key={sg} value={sg}>{sg}</option>
                                ))}
                              </select>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={savePlayer} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px', flex: 1 }}>
                                  ✓ Lagre
                                </button>
                                <button onClick={cancelEditPlayer} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', flex: 1 }}>
                                  ✗ Avbryt
                                </button>
                              </div>
                            </div>
                          ) : isMoving ? (
                            <div>
                              <p style={{ fontSize: '13px', marginBottom: '8px', fontWeight: '600' }}>Flytt {player.name}:</p>
                              
                              <button 
                                onClick={() => createFamilyForPlayer(family.id, player.id)}
                                className="btn btn-primary" 
                                style={{ padding: '8px 12px', fontSize: '13px', width: '100%', marginBottom: '8px' }}
                              >
                                ➕ Opprett ny familie for {player.name}
                              </button>

                              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginBottom: '8px' }}>
                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Eller flytt til eksisterende familie:</p>
                                <select
                                  className="input"
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      movePlayer(family.id, player.id, e.target.value);
                                    }
                                  }}
                                  style={{ fontSize: '13px' }}
                                >
                                  <option value="">Velg familie...</option>
                                  {families.filter(f => f.id !== family.id).map(f => (
                                    <option key={f.id} value={f.id}>
                                      {f.players.map(p => p.name).join(', ') || 'Tom familie'}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <button onClick={() => setMovePlayerMode(null)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', width: '100%' }}>
                                Avbryt
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span>{player.name} • {player.subgroup}</span>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button
                                  onClick={() => startEditPlayer(family.id, player.id, player.name, player.subgroup)}
                                  className="btn btn-secondary"
                                  style={{ padding: '4px 8px', fontSize: '12px' }}
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => setMovePlayerMode({ familyId: family.id, playerId: player.id })}
                                  className="btn btn-secondary"
                                  style={{ padding: '4px 8px', fontSize: '12px' }}
                                  title="Flytt til annen familie"
                                >
                                  ↔️
                                </button>
                                <button
                                  onClick={() => deletePlayer(family.id, player.id)}
                                  className="btn"
                                  style={{ 
                                    padding: '4px 8px',
                                    fontSize: '12px',
                                    background: 'white',
                                    border: '1px solid var(--danger-color)',
                                    color: 'var(--danger-color)'
                                  }}
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Shift Preferences Section */}
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <strong style={{ fontSize: '14px' }}>⭐ Vaktpreferanser:</strong>
                    <button
                      onClick={() => setEditingPreferences(editingPreferences === family.id ? null : family.id)}
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '14px' }}
                    >
                      {editingPreferences === family.id ? '✓ Ferdig' : '✏️ Rediger'}
                    </button>
                  </div>

                  {editingPreferences === family.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--success-color)' }}>
                          👍 Foretrekker disse vaktene:
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {SHIFT_TYPES.map(shiftType => {
                            const isPreferred = family.preferredShifts?.includes(shiftType);
                            return (
                              <button
                                key={shiftType}
                                onClick={() => togglePreferredShift(family.id, shiftType)}
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: 'var(--radius-md)',
                                  border: '1px solid var(--border-color)',
                                  background: isPreferred ? '#dcfce7' : 'white',
                                  color: isPreferred ? '#166534' : 'var(--text-secondary)',
                                  cursor: 'pointer',
                                  fontSize: '13px',
                                  fontWeight: isPreferred ? '600' : '400'
                                }}
                              >
                                {isPreferred ? '✓ ' : ''}{shiftType}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--danger-color)' }}>
                          🚫 Kan ikke jobbe disse vaktene:
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {SHIFT_TYPES.map(shiftType => {
                            const isRestricted = family.restrictedShifts?.includes(shiftType);
                            return (
                              <button
                                key={shiftType}
                                onClick={() => toggleRestrictedShift(family.id, shiftType)}
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: 'var(--radius-md)',
                                  border: '1px solid var(--border-color)',
                                  background: isRestricted ? '#fee2e2' : 'white',
                                  color: isRestricted ? '#991b1b' : 'var(--text-secondary)',
                                  cursor: 'pointer',
                                  fontSize: '13px',
                                  fontWeight: isRestricted ? '600' : '400'
                                }}
                              >
                                {isRestricted ? '✗ ' : ''}{shiftType}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {(family.preferredShifts?.length ?? 0) > 0 && (
                        <div style={{ marginBottom: '4px' }}>
                          <span style={{ color: 'var(--success-color)' }}>👍 Foretrekker:</span> {(family.preferredShifts ?? []).join(', ')}
                        </div>
                      )}
                      {(family.restrictedShifts?.length ?? 0) > 0 && (
                        <div>
                          <span style={{ color: 'var(--danger-color)' }}>🚫 Kan ikke:</span> {(family.restrictedShifts ?? []).join(', ')}
                        </div>
                      )}
                      {!family.preferredShifts?.length && !family.restrictedShifts?.length && (
                        <span>Ingen preferanser satt. Klikk "Rediger" for å legge til.</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
            {filter === 'all' ? 'Ingen familier ennå' : `Ingen ${filter === 'pending' ? 'ventende' : 'fullførte'} familier`}
          </p>
          {filter === 'all' && (
            <button 
              onClick={() => window.location.href = '/import-families'}
              className="btn btn-primary"
            >
              📁 Importer fra Excel
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const AddPlayerForm: React.FC<{
  onSave: (name: string, subgroup: string, birthDate: string) => void;
  onCancel: () => void;
}> = ({ onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [subgroup, setSubgroup] = useState('KIL BLÅ');
  const [birthDate, setBirthDate] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      alert('⚠️ Navn er påkrevd');
      return;
    }
    onSave(name, subgroup, birthDate);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '8px', alignItems: 'end' }}>
      <div>
        <label className="input-label" style={{ fontSize: '12px' }}>Navn</label>
        <input
          type="text"
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Spillernavn"
          style={{ fontSize: '14px', padding: '8px' }}
          autoFocus
        />
      </div>
      <div>
        <label className="input-label" style={{ fontSize: '12px' }}>Lag</label>
        <select
          className="input"
          value={subgroup}
          onChange={(e) => setSubgroup(e.target.value)}
          style={{ fontSize: '14px', padding: '8px' }}
        >
          {SUBGROUPS.map(sg => (
            <option key={sg} value={sg}>{sg}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="input-label" style={{ fontSize: '12px' }}>Fødselsdato</label>
        <input
          type="date"
          className="input"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          style={{ fontSize: '14px', padding: '8px' }}
        />
      </div>
      <div style={{ display: 'flex', gap: '4px' }}>
        <button onClick={handleSave} className="btn btn-primary" style={{ padding: '8px 12px', fontSize: '14px' }}>
          ✓
        </button>
        <button onClick={onCancel} className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '14px' }}>
          ✗
        </button>
      </div>
    </div>
  );
};



