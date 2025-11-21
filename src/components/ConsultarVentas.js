// src/components/ConsultarVentas.js

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function ConsultarVentas() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Estados para el filtro de fechas
  // Por defecto, podríamos poner el primer y último día del mes actual, 
  // pero dejémoslo vacío para que el usuario elija.
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  // Cargar ventas al iniciar (opcional: cargar todas o esperar al filtro)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchVentas();
  }, []);

  async function fetchVentas() {
    setLoading(true);
    
    try {
      // Iniciamos la consulta a la tabla 'ventas'
      // Hacemos un JOIN con 'consolas' para saber el nombre del producto vendido
      let query = supabase
        .from('ventas')
        .select(`
          *,
          consolas ( nombre )
        `)
        .order('fecha_venta', { ascending: false }); // Las más recientes primero

      // --- APLICAR FILTROS DE FECHA ---
      // Si el usuario seleccionó fecha de inicio
      if (fechaInicio) {
        // 'gte' significa "Greater Than or Equal" (Mayor o igual que)
        query = query.gte('fecha_venta', fechaInicio);
      }

      // Si el usuario seleccionó fecha de fin
      if (fechaFin) {
        // 'lte' significa "Less Than or Equal" (Menor o igual que)
        query = query.lte('fecha_venta', fechaFin);
      }

      const { data, error } = await query;

      if (error) throw error;

      setVentas(data);
    } catch (error) {
      console.error('Error al consultar ventas:', error);
      alert('Error al cargar las ventas');
    } finally {
      setLoading(false);
    }
  }

  // Función para calcular la ganancia total del periodo mostrado
  const calcularTotalGanancia = () => {
    return ventas.reduce((total, venta) => total + (venta.ganancia_bruta || 0), 0);
  };

  // --- ESTILOS ---
  const containerStyle = {
    padding: '20px',
    maxWidth: '900px',
    margin: '0 auto'
  };

  const filterStyle = {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#f4f4f4',
    borderRadius: '8px',
    alignItems: 'flex-end'
  };

  const inputGroupStyle = {
    display: 'flex',
    flexDirection: 'column'
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '10px'
  };

  const thStyle = {
    backgroundColor: '#333',
    color: 'white',
    padding: '10px',
    textAlign: 'left'
  };

  const tdStyle = {
    borderBottom: '1px solid #ddd',
    padding: '10px'
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ textAlign: 'center' }}>Reporte de Ventas</h2>

      {/* --- SECCIÓN DE FILTROS --- */}
      <div style={filterStyle}>
        <div style={inputGroupStyle}>
          <label>Desde:</label>
          <input 
            type="date" 
            value={fechaInicio} 
            onChange={(e) => setFechaInicio(e.target.value)}
            style={{ padding: '5px' }}
          />
        </div>
        <div style={inputGroupStyle}>
          <label>Hasta:</label>
          <input 
            type="date" 
            value={fechaFin} 
            onChange={(e) => setFechaFin(e.target.value)}
            style={{ padding: '5px' }}
          />
        </div>
        <button 
          onClick={fetchVentas}
          style={{ 
            padding: '8px 15px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer',
            height: '35px'
          }}
        >
          Filtrar Ventas
        </button>
      </div>

      {/* --- TABLA DE RESULTADOS --- */}
      {loading ? (
        <p>Cargando datos...</p>
      ) : (
        <>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Fecha</th>
                <th style={thStyle}>Consola</th>
                <th style={thStyle}>Precio Venta</th>
                <th style={thStyle}>Gastos Extra</th>
                <th style={thStyle}>Ganancia</th>
              </tr>
            </thead>
            <tbody>
              {ventas.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                    No hay ventas registradas en este periodo.
                  </td>
                </tr>
              ) : (
                ventas.map((venta) => (
                  <tr key={venta.id}>
                    <td style={tdStyle}>{venta.fecha_venta}</td>
                    <td style={tdStyle}>
                      {/* Accedemos al nombre gracias al JOIN con consolas */}
                      {venta.consolas ? venta.consolas.nombre : 'Producto Eliminado'}
                    </td>
                    <td style={tdStyle}>${venta.precio_venta}</td>
                    <td style={tdStyle}>${venta.gastos_extra}</td>
                    <td style={{ ...tdStyle, fontWeight: 'bold', color: 'green' }}>
                      ${venta.ganancia_bruta}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* --- RESUMEN FINAL --- */}
          {ventas.length > 0 && (
            <div style={{ marginTop: '20px', textAlign: 'right', fontSize: '1.2em' }}>
              <strong>Total Ganancia en este periodo: </strong>
              <span style={{ color: 'green' }}>${calcularTotalGanancia().toFixed(2)}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ConsultarVentas;