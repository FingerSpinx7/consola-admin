import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; 
import DetalleModal from './DetalleModal';

function InventarioConsolas() {
  const [consolas, setConsolas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConsola, setSelectedConsola] = useState(null);

  useEffect(() => {
    fetchConsolas();
  }, []);

  async function fetchConsolas() {
    setLoading(true);

    const { data, error } = await supabase
      .from('consolas')
      .select(`
        *, 
        fotos (id, url_foto),
        ventas(*)`)
      .order('id', { ascending: false });

      if (error) {
        console.error(error);
      } else {
        // 2. ORDENAMIENTO INTELIGENTE EN JAVASCRIPT
        const consolasOrdenadas = data.sort((a, b) => {
          // --- Lógica para el producto A ---
          // ¿Tiene venta? Si sí, usamos fecha de venta. Si no, fecha de adquisición.
          const ventaA = a.ventas && a.ventas.length > 0 ? a.ventas[0] : null;
          const fechaUltimaActividadA = ventaA ? ventaA.fecha_venta : a.fecha_adquisicion;
  
          // --- Lógica para el producto B ---
          const ventaB = b.ventas && b.ventas.length > 0 ? b.ventas[0] : null;
          const fechaUltimaActividadB = ventaB ? ventaB.fecha_venta : b.fecha_adquisicion;
  
          // --- Comparación ---
          // Si la fecha A es mayor (más reciente) que B, A va primero (-1)
          if (fechaUltimaActividadA > fechaUltimaActividadB) return -1;
          if (fechaUltimaActividadA < fechaUltimaActividadB) return 1;
  
          // EMPATE: Si las fechas son iguales (ej. dos movimientos hoy),
          // desempatamos usando el ID más alto (el último creado va primero)
          return b.id - a.id;
        });
  
        setConsolas(consolasOrdenadas);
      }
      
      setLoading(false);
  }

  //Manejador de UPDATES
  const handleUpdateSuccess = () => {
    fetchConsolas(); // Recarga la lista para ver los cambios
    setSelectedConsola(null); // Cierra el modal
  };
  //Funcion para abrir el modal
  const handleCardClick = (consola) => {
    setSelectedConsola(consola);
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setSelectedConsola(null);
  };

  if (loading) return <div style={{padding:'20px', textAlign:'center'}}>Cargando...</div>;

  return (
    <div>
      <h2 style={{ textAlign: 'center', margin: '10px 0' }}>Inventario</h2>
      
      {/* AQUÍ APLICAMOS LA GRILLA DE 2 COLUMNAS */}
      <div className="inventario-grid">
        
        {consolas.map((consola) => (
          <div key={consola.id} className="consola-card"
          onClick={() => handleCardClick(consola)} //Al dar clic, selecciona
          style={{ cursor: 'pointer' }} // Pa que cambie la manita
          >
            
            {/* Imagen */}
            {consola.fotos && consola.fotos.length > 0 ? (
              <img 
                src={consola.fotos[0].url_foto} 
                alt={consola.nombre}
                className="card-imagen"
              />
            ) : (
              <div className="card-imagen" style={{background: '#eee', display:'flex', alignItems:'center', justifyContent:'center'}}>
                Sin foto
              </div>
            )}
            
            {/* Datos */}
            <h3 style={{fontSize: '1rem', margin: '5px 0'}}>{consola.nombre}</h3>
            <p className="card-texto">Cost: ${consola.costo_adquisicion}</p>
            
            <p className="card-texto">
              {/* CORRECCIÓN AQUÍ: Comparamos el texto explícitamente */}
              {String(consola.estado).toLowerCase() === 'true' ? 
                <b style={{ color: 'green' }}>Disponible</b> : 
                <b style={{ color: 'red' }}>Vendido</b>
              }
            </p>

          </div>
        ))}
      </div>

      {/*Renderizar modal si hay una consola seleccionada*/}
      {selectedConsola && (
        <DetalleModal 
          consola={selectedConsola} 
          onClose={handleCloseModal} 
          //Funcion UPDATE
          onUpdate={handleUpdateSuccess}
        />
      )}
    </div>
  );
}

export default InventarioConsolas;