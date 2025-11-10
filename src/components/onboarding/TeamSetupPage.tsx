import React, { useState } from 'react';

export const TeamSetupPage: React.FC = () => {
  const [formData, setFormData] = useState({
    sport: 'football',
    gender: 'gutter',
    birthYear: new Date().getFullYear() - 10,
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Generate team name
    const teamName = `${formData.gender === 'gutter' ? 'Gutter' : formData.gender === 'jenter' ? 'Jenter' : 'Mixed'} ${formData.birthYear}`;

    // Get club data
    const storedClub = localStorage.getItem('dugnad_club');
    const club = storedClub ? JSON.parse(storedClub) : null;

    if (!club) {
      alert('Klubbinformasjon mangler');
      return;
    }

    // Save team data
    const team = {
      id: Date.now().toString(),
      clubId: club.id,
      sport: formData.sport,
      gender: formData.gender,
      birthYear: parseInt(formData.birthYear.toString()),
      name: teamName,
      createdAt: new Date().toISOString(),
    };

    // Store teams array
    const existingTeams = localStorage.getItem('dugnad_teams');
    const teams = existingTeams ? JSON.parse(existingTeams) : [];
    teams.push(team);
    localStorage.setItem('dugnad_teams', JSON.stringify(teams));

    // Store current team as active
    localStorage.setItem('dugnad_current_team', JSON.stringify(team));

    // Redirect to dashboard
    window.location.href = '/coordinator-dashboard';
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - i);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', padding: '20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '60px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px' }}>
            Opprett ditt første lag
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>
            Du kan legge til flere lag senere
          </p>
        </div>

        {/* Form Card */}
        <div className="card" style={{ padding: '32px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Sport */}
            <div>
              <label className="input-label">Idrett</label>
              <select name="sport" value={formData.sport} onChange={handleChange} className="input">
                <option value="football">⚽ Fotball</option>
                <option value="handball">🤾 Håndball</option>
                <option value="ishockey">🏒 Ishockey</option>
                <option value="volleyball">🏐 Volleyball</option>
                <option value="basketball">🏀 Basketball</option>
                <option value="other">Annet</option>
              </select>
            </div>

            {/* Gender */}
            <div>
              <label className="input-label">Kjønn</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="input">
                <option value="gutter">Gutter</option>
                <option value="jenter">Jenter</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>

            {/* Birth Year */}
            <div>
              <label className="input-label">Fødselsår</label>
              <select name="birthYear" value={formData.birthYear} onChange={handleChange} className="input">
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Team Name Preview */}
            <div
              style={{
                padding: '16px',
                background: 'var(--background)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
              }}
            >
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Lagnavn:</p>
              <p style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)' }}>
                {formData.gender === 'gutter' ? 'Gutter' : formData.gender === 'jenter' ? 'Jenter' : 'Mixed'}{' '}
                {formData.birthYear}
              </p>
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn btn-primary btn-large" style={{ marginTop: '8px' }}>
              Fullfør og gå til dashboard
            </button>
          </form>
        </div>

        {/* Progress Indicator */}
        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Steg 2 av 2
          </p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '12px' }}>
            <div style={{ width: '40px', height: '4px', background: 'var(--primary-color)', borderRadius: '2px' }} />
            <div style={{ width: '40px', height: '4px', background: 'var(--primary-color)', borderRadius: '2px' }} />
          </div>
        </div>
      </div>
    </div>
  );
};
