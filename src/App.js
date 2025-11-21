import './App.css';
import React from 'react';
import { Routes, Route } from 'react-router-dom';

import InventarioConsolas from './components/InventarioConsolas';
import AgregarProducto from './components/AgregarProducto';
import Menu from './components/Menu';
import AgregarVenta from './components/AgregarVenta';
import ConsultarVentas from './components/ConsultarVentas';


function App() {
  return (
    <div className="App">
      
      {/* Tu header oscuro (el de la imagen) probablemente vive en App.css 
        o index.css, déjalo como está.
      */}

      {/* 4. Coloca el Menú aquí, justo debajo del header */}
      <Menu />

      <main>
        {/* 5. 'Routes' decide qué componente mostrar según la URL */}
        <Routes>
          {/* Tu página de inventario ahora es la ruta "/" */}
          <Route path="/" element={<InventarioConsolas />} />
          
          {/* Las nuevas rutas */}
          <Route path="/agregar" element={<AgregarProducto />} />
          <Route path="/ventas" element={<ConsultarVentas />} />
          <Route path="/agregar-venta" element={<AgregarVenta />} />
        </Routes>
      </main>
    </div>
  );
}
export default App;