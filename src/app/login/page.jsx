'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../auth/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/dashboard';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    const ok = await login(username.trim(), password.trim());
    setLoading(false);
    if (ok) {
      router.replace(from);
    } else {
      setError('Credenciales inválidas');
    }
  };

  return (
    <main className="app">
      <section className="hero">
        <h1>Iniciar sesión</h1>
        <form onSubmit={onSubmit} style={{ maxWidth: 360, margin: '0 auto', textAlign: 'left' }}>
          <label>Usuario</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{
              width: '100%',
              padding: 10,
              borderRadius: 8,
              border: '1px solid #334155',
              background: '#0f172a',
              color: 'white',
              margin: '6px 0 12px',
            }}
          />
          <label>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: 10,
              borderRadius: 8,
              border: '1px solid #334155',
              background: '#0f172a',
              color: 'white',
              margin: '6px 0 16px',
            }}
          />
          {error ? <div style={{ color: '#f87171', marginBottom: 10 }}>{error}</div> : null}
          <button className="btn" type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Ingresando…' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  );
}
