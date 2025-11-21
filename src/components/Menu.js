import React from 'react';
import { Link } from 'react-router-dom';

// Fíjate que ya no hay constantes de estilo aquí, usamos "className"
function Menu() {
  return (
    <nav className="menu-nav">
      <ul className="menu-lista">
        <li>
          <Link to="/" className="menu-link">Inventario</Link>
        </li>
        <li>
          <Link to="/agregar" className="menu-link">Agregar</Link>
        </li>
        <li>
          <Link to="/ventas" className="menu-link">Ventas</Link>
        </li>
        <li>
          <Link to="/agregar-venta" className="menu-link">+ Venta</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Menu;