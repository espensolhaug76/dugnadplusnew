import React, { useState } from 'react';
import * as XLSX from 'xlsx';

interface ParsedPlayer {
  name: string;
  birthDate: string;
  subgroup: string;
  address: string;
  postalCode: string;
  city: string;
  parents: string[];
  familyId: string;
}

export const ImportFamilies: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedPlayer[]>([]);
  const [importing, setImporting] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    const reader = new FileReader();

    reader.onload = (event) => {
      const data = event.target?.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      const players: ParsedPlayer[] = jsonData.map((row: any) => {
        // Find which subgroup the player belongs to
        let subgroup = '';
        if (row['KIL BLÅ']) subgroup = 'KIL BLÅ';
        else if (row['KIL BRUN']) subgroup = 'KIL BRUN';
        else if (row['KIL HVIT']) subgroup = 'KIL HVIT';
        else if (row['KIL ORANSJE']) subgroup = 'KIL ORANSJE';
        else if (row['KIL RØD']) subgroup = 'KIL RØD';

        // Collect all parent names
        const parents = [
          row["Parent 1's name"],
          row["Parent 2's name"],
          row["Parent 3's name"],
          row["Parent 4's name"]
        ].filter(p => p && p.trim());

        // Create a family ID from address or first parent name
        const familyId = `family_${(row['Street address'] || parents[0] || '').replace(/\s/g, '_')}_${Date.now()}`;

        return {
          name: row["Child's name"] || '',
          birthDate: row['Date of birth'] || '',
          subgroup,
          address: row['Street address'] || '',
          postalCode: row['Postal Code'] || '',
          city: row['City'] || '',
          parents,
          familyId
        };
      });

      setParsedData(players.filter(p => p.name)); // Filter out empty rows
    };

    reader.readAsBinaryString(uploadedFile);
  };

  const handleImport = () => {
    setImporting(true);

    // Create families and players
    const families: any = {};
    
    parsedData.forEach(player => {
      // Group by family
      if (!families[player.familyId]) {
        families[player.familyId] = {
          id: player.familyId,
          address: player.address,
          postalCode: player.postalCode,
          city: player.city,
          parents: player.parents,
          players: [],
          registrationToken: `reg_${Math.random().toString(36).substring(7)}`,
          status: 'pending' // pending, completed
        };
      }
      
      families[player.familyId].players.push({
        id: `player_${Date.now()}_${Math.random()}`,
        name: player.name,
        birthDate: player.birthDate,
        subgroup: player.subgroup
      });
    });

    // Save to localStorage
    const familiesArray = Object.values(families);
    localStorage.setItem('dugnad_families', JSON.stringify(familiesArray));

    // Also save players separately for easy access
    const allPlayers = familiesArray.flatMap((f: any) => 
      f.players.map((p: any) => ({ ...p, familyId: f.id }))
    );
    localStorage.setItem('dugnad_players', JSON.stringify(allPlayers));

    alert(`✅ Importert ${allPlayers.length} spillere fra ${familiesArray.length} familier!`);
    window.location.href = '/manage-families';
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

      <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
        Importer familier fra Spond
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Last opp Excel-fil fra Spond for å importere spillere og familier
      </p>

      <div className="card" style={{ padding: '32px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
          📁 Last opp Spond Excel-fil
        </h3>
        
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          style={{
            padding: '12px',
            border: '2px dashed var(--border-color)',
            borderRadius: 'var(--radius-md)',
            width: '100%',
            cursor: 'pointer'
          }}
        />

        {file && (
          <p style={{ marginTop: '12px', color: 'var(--success-color)', fontSize: '14px' }}>
            ✓ Fil valgt: {file.name}
          </p>
        )}
      </div>

      {parsedData.length > 0 && (
        <>
          <div className="card" style={{ padding: '32px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
              📊 Forhåndsvisning ({parsedData.length} spillere)
            </h3>

            <div style={{ marginBottom: '16px', display: 'flex', gap: '24px' }}>
              <div>
                <strong>KIL BLÅ:</strong> {parsedData.filter(p => p.subgroup === 'KIL BLÅ').length}
              </div>
              <div>
                <strong>KIL BRUN:</strong> {parsedData.filter(p => p.subgroup === 'KIL BRUN').length}
              </div>
              <div>
                <strong>KIL HVIT:</strong> {parsedData.filter(p => p.subgroup === 'KIL HVIT').length}
              </div>
              <div>
                <strong>KIL ORANSJE:</strong> {parsedData.filter(p => p.subgroup === 'KIL ORANSJE').length}
              </div>
              <div>
                <strong>KIL RØD:</strong> {parsedData.filter(p => p.subgroup === 'KIL RØD').length}
              </div>
            </div>

            <div style={{ maxHeight: '400px', overflow: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: 'var(--background)', position: 'sticky', top: 0 }}>
                  <tr>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>Navn</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>Fødselsdato</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>Lag</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>Foresatte</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.map((player, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>{player.name}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>{player.birthDate}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>{player.subgroup}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>{player.parents.join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button
            onClick={handleImport}
            className="btn btn-primary"
            style={{ width: '100%', padding: '16px', fontSize: '18px' }}
            disabled={importing}
          >
            {importing ? 'Importerer...' : '✨ Importer alle familier'}
          </button>
        </>
      )}
    </div>
  );
};
