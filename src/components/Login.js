// src/components/Login.js
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import logoEmpresa from '../assets/logo_empresa.png';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
 
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Magia de Supabase: Iniciar sesión
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setError('Error: Correo o contraseña incorrectos');
      setLoading(false);
    } else {
      // Si todo sale bien, Supabase actualiza la sesión automáticamente
      // y App.js detectará el cambio y mostrará el menú.
      // No necesitamos hacer redirect manual aquí necesariamente.
    }
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#f4f4f4',
    padding: '20px'
  };

  const formStyle = {
    background: 'white',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    margin: '10px 0',
    borderRadius: '4px',
    border: '1px solid #ddd',
    boxSizing: 'border-box'
  };

  return (
    <div style={containerStyle}>
      <div style={formStyle}>
        {/* Logo opcional */}
        <img src={logoEmpresa} alt="Logo" style={{ width: '80px', marginBottom: '20px' }} />
        
        <h2>Iniciar Sesión</h2>
        <p style={{ color: '#666', fontSize: '14px' }}>Sistema de Administración</p>
        
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            required
          />
          
          {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}

          <button 
            type="submit" 
            style={{ 
              width: '100%', 
              padding: '12px', 
              background: '#333', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer',
              marginTop: '10px',
              fontWeight: 'bold'
            }}
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;