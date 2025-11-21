// src/components/AgregarProducto.js

import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
// 1. Importar 'useNavigate' para redirigir al usuario
import { useNavigate } from 'react-router-dom';

function AgregarProducto() {
  // Hook para redirigir
  const navigate = useNavigate();

  // Estados para cada campo del formulario
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [costo, setCosto] = useState('');
  const [fecha, setFecha] = useState('');
  const [fotos, setFotos] = useState([]); // Para guardar los archivos de las fotos
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  
  // Manejador para la subida de archivos
  const handleFileChange = (e) => {
    // e.target.files es una lista de archivos
    setFotos(Array.from(e.target.files));
  };

  // Manejador del envío del formulario
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
      // --- PASO 1: Insertar la consola en la tabla 'consolas' ---
      // (Dejamos el estado 'true' por defecto como en tu tabla)
      const { data: consolaData, error: consolaError } = await supabase
        .from('consolas')
        .insert({
          nombre: nombre,
          descripcion: descripcion,
          costo_adquisicion: parseFloat(costo),
          fecha_adquisicion: fecha,
        })
        .select() // .select() nos devuelve el objeto que acabamos de crear
        .single(); // .single() nos asegura que solo es un objeto

      if (consolaError) throw consolaError;

      const nuevaConsolaId = consolaData.id;

      // --- PASO 2: Subir las fotos a Supabase Storage ---
      const promesasDeSubida = fotos.map(async (file) => {
        // Creamos un nombre de archivo único para evitar colisiones
        const filePath = `public/${nuevaConsolaId}-${Date.now()}-${file.name}`;
        
        const { error: uploadError } = await supabase.storage
          .from('fotos-consolas') // El nombre de tu bucket
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // --- PASO 3: Obtener la URL pública de la foto subida ---
        const { data: urlData } = supabase.storage
          .from('fotos-consolas')
          .getPublicUrl(filePath);
        
        return urlData.publicUrl;
      });

      // Esperamos a que todas las fotos se suban
      const urlsFotos = await Promise.all(promesasDeSubida);

      // --- PASO 4: Insertar las URLs en la tabla 'fotos' ---
      const fotosParaInsertar = urlsFotos.map((url, index) => ({
        consola_id: nuevaConsolaId,
        url_foto: url,
        orden: index + 1, // Para saber el orden de las fotos
      }));

      const { error: fotosError } = await supabase
        .from('fotos')
        .insert(fotosParaInsertar);
      
      if (fotosError) throw fotosError;

      // --- PASO 5: Éxito y redirección ---
      setCargando(false);
      alert('¡Consola agregada con éxito!');
      // Redirigir al inventario
      navigate('/'); 

    } catch (error) {
      console.error('Error al agregar producto:', error);
      setError(`Error: ${error.message}`);
      setCargando(false);
      // (Aquí faltaría lógica para borrar la consola si falló la subida de fotos,
      // pero lo mantenemos simple por ahora)
    }
  };

  // Estilos simples para el formulario (puedes moverlos a CSS)
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
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  };

  return (
    <div>
      <h2 style={{ textAlign: 'center' }}>Agregar Nuevo Producto</h2>
      <form onSubmit={handleSubmit} style={formStyle}>
        
        <label>Nombre de la Consola:</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          style={inputStyle}
          required
        />

        <label>Descripción:</label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          style={inputStyle}
        />

        <label>Costo de Adquisición (ej. 1500.50):</label>
        <input
          type="number"
          step="0.01" // Permite decimales
          value={costo}
          onChange={(e) => setCosto(e.target.value)}
          style={inputStyle}
          required
        />

        <label>Fecha de Adquisición:</label>
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          style={inputStyle}
          required
        />

        <label>Fotos (puedes seleccionar varias):</label>
        <input
          type="file"
          accept="image/*" // Solo acepta imágenes
          multiple // Permite seleccionar múltiples archivos
          onChange={handleFileChange}
          style={inputStyle}
          required
        />

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" style={buttonStyle} disabled={cargando}>
          {cargando ? 'Guardando...' : 'Agregar Producto'}
        </button>
      </form>
    </div>
  );
}

export default AgregarProducto;