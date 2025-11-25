// src/components/DetalleModal.js
import React from 'react';

function DetalleModal({ consola, onClose }) {
  if (!consola) return null;

  // Extraemos la venta (si existe). Supabase devuelve un array.
  const venta = consola.ventas && consola.ventas.length > 0 ? consola.ventas[0] : null;

  // --- ESTILOS DEL MODAL ---
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Fondo oscuro transparente
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000 // Para que quede encima de todo
  };

  const modalStyle = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto', // Scroll si es muy largo
    position: 'relative',
    boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
  };

  const closeBtnStyle = {
    position: 'absolute',
    top: '10px',
    right: '15px',
    background: 'transparent',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    fontWeight: 'bold'
  };

  const sectionStyle = {
    borderBottom: '1px solid #eee',
    paddingBottom: '10px',
    marginBottom: '10px'
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      {/* stopPropagation evita que al dar clic en el cuadro blanco se cierre */}
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        
        <button style={closeBtnStyle} onClick={onClose}>X</button>

        <h2 style={{ marginTop: 0, color: '#333' }}>{consola.nombre}</h2>

        {/* FOTO GRANDE */}
        {consola.fotos && consola.fotos.length > 0 && (
          <div style={{ textAlign: 'center', marginBottom: '15px' }}>
            <img 
              src={consola.fotos[0].url_foto} 
              alt={consola.nombre} 
              style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '4px' }}
            />
          </div>
        )}

        {/* DATOS GENERALES */}
        <div style={sectionStyle}>
          <p><strong>Estado:</strong> {consola.estado ? <span style={{color:'green'}}>Disponible</span> : <span style={{color:'red'}}>Vendido</span>}</p>
          <p><strong>Descripción:</strong> {consola.descripcion || 'Sin descripción'}</p>
          <p><strong>Proveedor:</strong> {consola.proveedor || 'No especificado'}</p>
          <p><strong>Fecha Adquisición:</strong> {consola.fecha_adquisicion}</p>
        </div>

        {/* DATOS FINANCIEROS (COSTOS) */}
        <div style={sectionStyle}>
          <h4 style={{margin: '5px 0'}}>💰 Costos</h4>
          <p>Costos Consola: ${consola.costo_adquisicion}</p>
          <p>Gastos Extra (Compra): ${consola.gastos_extra_adquisicion}</p>
          <p style={{color: '#666', fontSize: '0.9em'}}>
            Total Inversión: ${(consola.costo_adquisicion + consola.gastos_extra_adquisicion).toFixed(2)}
          </p>
        </div>

        {/* DATOS DE VENTA (SOLO SI SE VENDIÓ) */}
        {venta && (
          <div style={{ ...sectionStyle, backgroundColor: '#f9fbfd', padding: '10px', borderRadius: '5px' }}>
            <h4 style={{margin: '5px 0', color: '#007bff'}}>🤝 Información de Venta</h4>
            <p><strong>Cliente:</strong> {venta.nombre_cliente}</p>
            <p><strong>Fecha Venta:</strong> {venta.fecha_venta}</p>
            <p><strong>Precio Venta Final:</strong> ${venta.precio_venta}</p>
            <p>Gastos de Venta (Envío/Comisión): ${venta.gastos_extra}</p>
            <hr />
            <p style={{ fontSize: '1.2em', fontWeight: 'bold' }}>
              Ganancia Neta: <span style={{ color: venta.ganancia_bruta > 0 ? 'green' : 'red' }}>
                ${venta.ganancia_bruta}
              </span>
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

export default DetalleModal;