import './App.css';
import React, { useState, useEffect} from 'react';
import { Routes, Route } from 'react-router-dom';
import { supabase } from './supabaseClient';


import InventarioConsolas from './components/InventarioConsolas';
import AgregarProducto from './components/AgregarProducto';
import Menu from './components/Menu';
import AgregarVenta from './components/AgregarVenta';
import ConsultarVentas from './components/ConsultarVentas';
import logoEmpresa from './assets/logo_empresa.png';
import Login from './components/Login';

function App() {
  // Estado para guardar la sesión
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // A. Verificar si ya hay una sesión activa al cargar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // B. Escuchar cambios (login o logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Función para cerrar sesión
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // MIENTRAS CARGA (revisando si existe usuario), mostramos algo simple
  if (loading) {
    return <div style={{textAlign:'center', marginTop:'50px'}}>Cargando sistema...</div>;
  }

  // SI NO HAY SESIÓN, MOSTRAMOS SOLO EL LOGIN
  if (!session) {
    return <Login />;
  }

  // SI HAY SESIÓN, MOSTRAMOS LA APP COMPLETA
  return (
    <div className="App">
      <header style={{ textAlign: 'center', padding: '20px', backgroundColor: '#282c34', position: 'relative' }}>
        <img src={logoEmpresa} alt="Logo" style={{ width: '60px', marginBottom: '5px' }} />
        <h1 style={{ color: 'white', margin: 0, fontSize: '1.2rem' }}>Nombre de la Empresa</h1>
        
        {/* Botón de Salir (Pequeño, esquina derecha) */}
        <button 
          onClick={handleLogout}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'transparent',
            border: '1px solid white',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Salir
        </button>
      </header>

      <Menu />
      
      <main>
        <Routes>
          <Route path="/" element={<InventarioConsolas />} />
          <Route path="/agregar" element={<AgregarProducto />} />
          <Route path="/ventas" element={<ConsultarVentas />} />
          <Route path="/agregar-venta" element={<AgregarVenta />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;