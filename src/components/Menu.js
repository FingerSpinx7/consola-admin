import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Menu.css'; 
import { MdInventory, MdAddCircle, MdAttachMoney, MdShoppingCart } from 'react-icons/md';
import { Offcanvas, Nav } from 'react-bootstrap'; 

function Menu() {
  const [isOpen, setIsOpen] = useState(false);

  // Usamos el estado 'isOpen' para el prop 'show' de Offcanvas
  const handleClose = () => setIsOpen(false);
  const handleShow = () => setIsOpen(true);

  return (
    <>
      {/* 1. Botón Hamburguesa (Ahora solo llama a handleShow) */}
      <button 
        className="menu-toggle" // Puedes mantener la clase para los estilos de la hamburguesa
        onClick={handleShow}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* 2. Offcanvas de React Bootstrap */}
      <Offcanvas 
        show={isOpen} // Controlado por el estado
        onHide={handleClose} // Lo que pasa al cerrar (escape, click en overlay)
        placement="start" // Aparece desde la izquierda
        className="bg-dark text-white"
        // Opcional: Si quieres mantener el botón de cerrar de Bootstrap (por defecto es true)
        // closeButton={false} 
      >
        
        {/* Encabezado del Offcanvas (Aquí estaba tu .menu-header) */}
        <Offcanvas.Header closeButton data-bs-theme="dark">
          <Offcanvas.Title><h2>Menú</h2></Offcanvas.Title>
        </Offcanvas.Header>
        
        {/* Contenido del Sidebar */}
        <Offcanvas.Body>
          {/* Nav de Bootstrap para la estructura de la lista */}
          <Nav className="flex-column menu-lista"> 
            
            <Nav.Link as={Link} to="/" className="menu-link" onClick={handleClose}>
              <span className="menu-icon"><MdInventory /></span>
              Inventario
            </Nav.Link>
            
            <Nav.Link as={Link} to="/agregar" className="menu-link" onClick={handleClose}>
              <span className="menu-icon"><MdAddCircle /></span>
              Agregar Producto
            </Nav.Link>
            
            <Nav.Link as={Link} to="/ventas" className="menu-link" onClick={handleClose}>
              <span className="menu-icon"><MdAttachMoney/></span>
              Ventas
            </Nav.Link>
            
            <Nav.Link as={Link} to="/agregar-venta" className="menu-link" onClick={handleClose}>
              <span className="menu-icon"> <MdShoppingCart/> </span>
              Nueva Venta
            </Nav.Link>

          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default Menu;