import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

function AgregarVenta() {
  const navigate = useNavigate();

  // Estado nuevo: Cliente
  const [nombreCliente, setNombreCliente] = useState('');
  
  const [consolasDisponibles, setConsolasDisponibles] = useState([]);
  const [selectedConsolaId, setSelectedConsolaId] = useState('');
  const [precioVenta, setPrecioVenta] = useState('');
  const [gastosVenta, setGastosVenta] = useState(''); // Gastos al vender (envío al cliente)
  const [fechaVenta, setFechaVenta] = useState('');
  const [detalles, setDetalles] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    async function fetchConsolasDisponibles() {
      // AHORA TAMBIÉN TRAEMOS 'gastos_extra_adquisicion' DE LA DB
      const { data, error } = await supabase
        .from('consolas')
        .select('id, nombre, costo_adquisicion, gastos_extra_adquisicion') 
        .eq('estado', true); 

      if (error) console.error(error);
      else setConsolasDisponibles(data);
    }
    fetchConsolasDisponibles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!selectedConsolaId) {
      setError('Debes seleccionar una consola.');
      return;
    }

    setCargando(true);

    try {
      const consolaVendida = consolasDisponibles.find(
        (c) => c.id === parseInt(selectedConsolaId)
      );

      // --- CÁLCULO DE GANANCIA ACTUALIZADO ---
      const costoOriginal = consolaVendida.costo_adquisicion || 0;
      const gastosDeCompra = consolaVendida.gastos_extra_adquisicion || 0; // Uber, pasaje
      const gastosDeVenta = parseFloat(gastosVenta) || 0; // Envío, comisiones
      const precioFinal = parseFloat(precioVenta);

      // Ganancia = PrecioVenta - (CostoOriginal + GastosCompra + GastosVenta)
      const ganancia = precioFinal - (costoOriginal + gastosDeCompra + gastosDeVenta);

      const { error: ventaError } = await supabase
        .from('ventas')
        .insert({
          consola_id: consolaVendida.id,
          precio_venta: precioFinal,
          gastos_extra: gastosDeVenta, // Aquí guardamos solo los gastos de la venta
          fecha_venta: fechaVenta,
          detalles_venta: detalles,
          nombre_cliente: nombreCliente, // Guardamos el cliente
          ganancia_bruta: ganancia, 
        });

      if (ventaError) throw ventaError;

      const { error: updateError } = await supabase
        .from('consolas')
        .update({ estado: false })
        .eq('id', consolaVendida.id);

      if (updateError) throw updateError;

      setCargando(false);
      alert('¡Venta registrada con éxito!');
      navigate('/ventas'); 

    } catch (error) {
      console.error('Error:', error);
      setError(`Error: ${error.message}`);
      setCargando(false);
    }
  };

  const inputStyle = { marginBottom: '15px', padding: '10px', width: '100%', boxSizing: 'border-box' };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center' }}>Registrar Nueva Venta</h2>
      <form onSubmit={handleSubmit}>
        
        <label>Consola a Vender:</label>
        <select value={selectedConsolaId} onChange={(e) => setSelectedConsolaId(e.target.value)} style={inputStyle} required>
          <option value="">-- Selecciona --</option>
          {consolasDisponibles.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre} (Costo Base: ${c.costo_adquisicion})
            </option>
          ))}
        </select>

        <label>Nombre del Cliente:</label>
        <input type="text" value={nombreCliente} onChange={(e) => setNombreCliente(e.target.value)} style={inputStyle} required />

        <label>Precio de Venta Final:</label>
        <input type="number" step="0.01" value={precioVenta} onChange={(e) => setPrecioVenta(e.target.value)} style={inputStyle} required />
        
        <label>Gastos de Cierre (Envío, Comisión):</label>
        <input type="number" step="0.01" value={gastosVenta} onChange={(e) => setGastosVenta(e.target.value)} style={inputStyle} placeholder="0.00" />

        <label>Fecha de Venta:</label>
        <input type="date" value={fechaVenta} onChange={(e) => setFechaVenta(e.target.value)} style={inputStyle} required />

        <label>Detalles / Notas:</label>
        <textarea value={detalles} onChange={(e) => setDetalles(e.target.value)} style={inputStyle} />
        
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" style={{ width: '100%', padding: '10px', background: '#28a745', color: 'white', border: 'none' }} disabled={cargando}>
          {cargando ? 'Registrando...' : 'Registrar Venta'}
        </button>
      </form>
    </div>
  );
}

export default AgregarVenta;