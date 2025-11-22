import './App.css';
import React from 'react';
import { Routes, Route } from 'react-router-dom';

import InventarioConsolas from './components/InventarioConsolas';
import AgregarProducto from './components/AgregarProducto';
import Menu from './components/Menu';
import AgregarVenta from './components/AgregarVenta';
import ConsultarVentas from './components/ConsultarVentas';
import logoEmpresa from './assets/logo_empresa.png';


function App() {
  return (
    <div className="App">
      {/* HEADER PERSONALIZADO */}
      <header style={{ textAlign: 'center', padding: '20px', backgroundColor: '#282c34' }}>

        {/* Y el nombre de la empresa abajo o al lado */}
        <h1 style={{ color: 'white', margin: 0, fontSize: '1.5rem' }}>
          Respawn Tech
        </h1>
        

        {/* Aquí va la imagen del logo */}
        <img 
          src={logoEmpresa} 
          alt="Logo Empresa" 
          style={{ width: '100px', marginTop: '10px' }} // Ajusta el tamaño (width) a tu gusto
        />
        
        
      </header>

      <Menu />
      
      <main>
        {/* ... tus rutas siguen igual ... */}
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