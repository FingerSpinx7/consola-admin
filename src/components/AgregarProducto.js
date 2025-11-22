import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

function AgregarProducto() {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [costo, setCosto] = useState('');
  
  // --- NUEVOS CAMPOS ---
  const [gastosAdq, setGastosAdq] = useState(''); // Gastos extra al comprar (pasaje, envío)
  const [proveedor, setProveedor] = useState(''); // Quién nos la vendió
  // --------------------

  const [fecha, setFecha] = useState('');
  const [fotos, setFotos] = useState([]); 
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  
  const handleFileChange = (e) => {
    setFotos(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    if (fotos.length === 0) {
      setError('Debes subir al menos una foto.');
      setCargando(false);
      return;
    }

    try {
      // Insertamos con los NUEVOS DATOS
      const { data: consolaData, error: consolaError } = await supabase
        .from('consolas')
        .insert({
          nombre: nombre,
          descripcion: descripcion,
          costo_adquisicion: parseFloat(costo),
          // Guardamos lo nuevo:
          gastos_extra_adquisicion: parseFloat(gastosAdq) || 0,
          proveedor: proveedor,
          fecha_adquisicion: fecha,
        })
        .select()
        .single();

      if (consolaError) throw consolaError;

      const nuevaConsolaId = consolaData.id;

      // Subida de fotos (esto sigue igual)
      const promesasDeSubida = fotos.map(async (file) => {
        const filePath = `public/${nuevaConsolaId}-${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('fotos-consolas')
          .upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage
          .from('fotos-consolas')
          .getPublicUrl(filePath);
        return urlData.publicUrl;
      });

      const urlsFotos = await Promise.all(promesasDeSubida);

      const fotosParaInsertar = urlsFotos.map((url, index) => ({
        consola_id: nuevaConsolaId,
        url_foto: url,
        orden: index + 1,
      }));

      const { error: fotosError } = await supabase
        .from('fotos')
        .insert(fotosParaInsertar);
      
      if (fotosError) throw fotosError;

      setCargando(false);
      alert('¡Consola agregada con éxito!');
      navigate('/'); 

    } catch (error) {
      console.error('Error:', error);
      setError(`Error: ${error.message}`);
      setCargando(false);
    }
  };

  // Estilos (puedes reutilizar tus clases CSS si prefieres)
  const inputStyle = { marginBottom: '15px', padding: '10px', width: '100%', boxSizing: 'border-box' };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center' }}>Agregar Nuevo Producto</h2>
      <form onSubmit={handleSubmit}>
        
        <label>Nombre:</label>
        <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} style={inputStyle} required />

        <label>Proveedor :</label>
        <input type="text" value={proveedor} onChange={(e) => setProveedor(e.target.value)} style={inputStyle} placeholder="Ej. Marketplace, Juan Pérez" />

        <label>Costo de la Consola:</label>
        <input type="number" step="0.01" value={costo} onChange={(e) => setCosto(e.target.value)} style={inputStyle} required />

        <label>Gastos Extra al Comprar (Uber, Envío):</label>
        <input type="number" step="0.01" value={gastosAdq} onChange={(e) => setGastosAdq(e.target.value)} style={inputStyle} placeholder="0.00" />

        <label>Descripción:</label>
        <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} style={inputStyle} />

        <label>Fecha de Adquisición:</label>
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} style={inputStyle} required />

        <label>Fotos:</label>
        <input type="file" accept="image/*" multiple onChange={handleFileChange} style={inputStyle} required />

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" style={{ width: '100%', padding: '10px', background: '#007bff', color: 'white', border: 'none' }} disabled={cargando}>
          {cargando ? 'Guardando...' : 'Agregar Producto'}
        </button>
      </form>
    </div>
  );
}

export default AgregarProducto;