import React, { useState } from 'react';

export const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Simple check if user exists
    const storedUser = localStorage.getItem('dugnad_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      
      // Check role and redirect accordingly
      if (user.role === 'coordinator') {
        window.location.href = '/coordinator-dashboard';
      } else if (user.role === 'family') {
        window.location.href = '/family-dashboard';
      } else if (user.role === 'substitute') {
        window.location.href = '/substitute-marketplace';
      } else {
        // No role set yet, go to role selection
        window.location.href = '/role-selection';
      }
    } else {
      alert('Ingen bruker funnet. Vennligst registrer deg først.');
      window.location.href = '/register';
    }
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
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>Logg inn på din konto</p>
        </div>

        {/* Login Form */}
        <div className="card" style={{ padding: '32px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Email */}
            <div>
              <label className="input-label">E-post</label>
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

            {/* Password */}
            <div>
              <label className="input-label">Passord</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input"
                placeholder="Ditt passord"
                required
              />
            </div>

            {/* Forgot Password Link */}
            <div style={{ textAlign: 'right' }}>
              <a href="#" style={{ color: 'var(--primary-color)', fontSize: '14px', fontWeight: '500' }}>
                Glemt passord?
              </a>
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn btn-primary btn-large">
              Logg inn
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

        {/* Register Link */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>
            Har du ikke en konto?{' '}
            <a href="/register" style={{ color: 'var(--primary-color)', fontWeight: '600' }}>
              Registrer deg
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
