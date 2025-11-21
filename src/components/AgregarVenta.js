// src/components/AgregarVenta.js

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

function AgregarVenta() {
  const navigate = useNavigate();

  // Estados para el formulario
  const [consolasDisponibles, setConsolasDisponibles] = useState([]);
  const [selectedConsolaId, setSelectedConsolaId] = useState('');
  const [precioVenta, setPrecioVenta] = useState('');
  const [gastosExtra, setGastosExtra] = useState('');
  const [fechaVenta, setFechaVenta] = useState('');
  const [detalles, setDetalles] = useState('');
  
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  // --- PASO 1: Cargar consolas disponibles al iniciar ---
  useEffect(() => {
    async function fetchConsolasDisponibles() {
      const { data, error } = await supabase
        .from('consolas')
        .select('id, nombre, costo_adquisicion')
        // ¡Esta es la clave! Solo traer las que están disponibles
        .eq('estado', true); 

      if (error) {
        console.error('Error al cargar consolas:', error);
        setError('No se pudieron cargar las consolas disponibles.');
      } else {
        setConsolasDisponibles(data);
      }
    }
    
    fetchConsolasDisponibles();
  }, []); // El array vacío [] asegura que se ejecute solo una vez

  // --- PASO 2: Manejar el envío del formulario ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!selectedConsolaId) {
      setError('Debes seleccionar una consola.');
      return;
    }

    setCargando(true);

    try {
      // Encontrar la consola seleccionada para obtener su costo
      const consolaVendida = consolasDisponibles.find(
        (c) => c.id === parseInt(selectedConsolaId)
      );

      if (!consolaVendida) {
        throw new Error('Consola no encontrada.');
      }

      const costoAdquisicion = consolaVendida.costo_adquisicion;
      // Usamos || 0 por si el campo 'gastosExtra' está vacío
      const gastos = parseFloat(gastosExtra) || 0; 
      const precio = parseFloat(precioVenta);

      // Cálculo de la ganancia (usando tu columna ganancia_bruta)
      // Ganancia = Precio de Venta - (Costo de Adquisición + Gastos Extra)
      const ganancia = precio - (costoAdquisicion + gastos);

      // --- Tarea A: Insertar en la tabla 'ventas' ---
      const { error: ventaError } = await supabase
        .from('ventas')
        .insert({
          consola_id: consolaVendida.id,
          precio_venta: precio,
          gastos_extra: gastos,
          fecha_venta: fechaVenta,
          detalles_venta: detalles,
          ganancia_bruta: ganancia, // Guardamos la ganancia calculada
        });

      if (ventaError) throw ventaError;

      // --- Tarea B: Actualizar la consola a 'Vendida' ---
      const { error: updateError } = await supabase
        .from('consolas')
        .update({ estado: false }) // false = Vendido
        .eq('id', consolaVendida.id);

      if (updateError) throw updateError;

      // --- PASO 3: Éxito ---
      setCargando(false);
      alert('¡Venta registrada con éxito!');
      // Redirigir a la lista de ventas (que haremos después)
      navigate('/ventas'); 

    } catch (error) {
      console.error('Error al registrar la venta:', error);
      setError(`Error: ${error.message}`);
      setCargando(false);
    }
  };
  
  // Estilos (similares al formulario anterior)
  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '500px',
    margin: '20px auto',
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px'
  };

  const inputStyle = {
    marginBottom: '15px',
    padding: '10px',
    fontSize: '16px',
    borderRadius: '4px',
    border: '1px solid #ccc'
  };

  const buttonStyle = {
    padding: '12px',
    fontSize: '16px',
    backgroundColor: '#28a745', // Verde para Venta
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  };

  return (
    <div>
      <h2 style={{ textAlign: 'center' }}>Registrar Nueva Venta</h2>
      <form onSubmit={handleSubmit} style={formStyle}>
        
        <label>Consola a Vender:</label>
        <select
          value={selectedConsolaId}
          onChange={(e) => setSelectedConsolaId(e.target.value)}
          style={inputStyle}
          required
        >
          <option value="">-- Selecciona una consola --</option>
          {consolasDisponibles.map((consola) => (
            <option key={consola.id} value={consola.id}>
              {consola.nombre} (Costo: ${consola.costo_adquisicion})
            </option>
          ))}
        </select>

        <label>Precio de Venta (ej. 2000.00):</label>
        <input
          type="number"
          step="0.01"
          value={precioVenta}
          onChange={(e) => setPrecioVenta(e.target.value)}
          style={inputStyle}
          required
        />
        
        <label>Gastos Extra (Envío, comisiones, etc.):</label>
        <input
          type="number"
          step="0.01"
          value={gastosExtra}
          onChange={(e) => setGastosExtra(e.target.value)}
          style={inputStyle}
        />

        <label>Fecha de Venta:</label>
        <input
          type="date"
          value={fechaVenta}
          onChange={(e) => setFechaVenta(e.target.value)}
          style={inputStyle}
          required
        />

        <label>Detalles de la Venta (Opcional):</label>
        <textarea
          value={detalles}
          onChange={(e) => setDetalles(e.target.value)}
          style={inputStyle}
        />
        
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" style={buttonStyle} disabled={cargando}>
          {cargando ? 'Guardando Venta...' : 'Registrar Venta'}
        </button>
      </form>
    </div>
  );
}

export default AgregarVenta;