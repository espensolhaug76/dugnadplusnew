import React, { useState } from 'react';

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!formData.email || !formData.password || !formData.fullName) {
      alert('Vennligst fyll ut alle obligatoriske felt');
      return;
    }

    // Store user data (in real app, this would be backend call)
    localStorage.setItem('dugnad_user', JSON.stringify({
      ...formData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }));

    // Redirect to role selection
    window.location.href = '/role-selection';
  };

  const handleSocialLogin = (provider: string) => {
    alert(`${provider} pålogging kommer snart!`);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ maxWidth: '480px', width: '100%' }}>
        {/* Logo/Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: 'var(--primary-color)', marginBottom: '8px' }}>
            Dugnad+
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>Opprett en ny konto</p>
        </div>

        {/* Registration Form */}
        <div className="card" style={{ padding: '32px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Full Name */}
            <div>
              <label className="input-label">Fullt navn *</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="input"
                placeholder="Ola Nordmann"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="input-label">E-post *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input"
                placeholder="ola@example.com"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="input-label">Telefon</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input"
                placeholder="+47 123 45 678"
              />
            </div>

            {/* Password */}
            <div>
              <label className="input-label">Passord *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input"
                placeholder="Minimum 8 tegn"
                minLength={8}
                required
              />
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn btn-primary btn-large" style={{ marginTop: '8px' }}>
              Opprett konto
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '24px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
            <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>eller</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
          </div>

          {/* Social Login */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => handleSocialLogin('Google')}
              className="btn"
              style={{ background: 'white', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
            >
              <span style={{ fontSize: '20px', marginRight: '8px' }}>🔵</span>
              Fortsett med Google
            </button>

            <button
              onClick={() => handleSocialLogin('Facebook')}
              className="btn"
              style={{ background: '#1877f2', color: 'white' }}
            >
              <span style={{ fontSize: '20px', marginRight: '8px' }}>📘</span>
              Fortsett med Facebook
            </button>

            <button
              onClick={() => handleSocialLogin('Apple')}
              className="btn"
              style={{ background: 'black', color: 'white' }}
            >
              <span style={{ fontSize: '20px', marginRight: '8px' }}></span>
              Fortsett med Apple
            </button>
          </div>
        </div>

        {/* Login Link */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>
            Har du allerede en konto?{' '}
            <a href="/login" style={{ color: 'var(--primary-color)', fontWeight: '600' }}>
              Logg inn
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
