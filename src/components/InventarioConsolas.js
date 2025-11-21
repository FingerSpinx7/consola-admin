import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; 

function InventarioConsolas() {
  const [consolas, setConsolas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConsolas();
  }, []);

  async function fetchConsolas() {
    setLoading(true);
    const { data, error } = await supabase
      .from('consolas')
      .select(`*, fotos (id, url_foto)`)
      .order('id', { ascending: false });

    if (error) console.error(error);
    else setConsolas(data);
    
    setLoading(false);
  }

  if (loading) return <div style={{padding:'20px', textAlign:'center'}}>Cargando...</div>;

  return (
    <div>
      <h2 style={{ textAlign: 'center', margin: '10px 0' }}>Inventario</h2>
      
      {/* AQUÍ APLICAMOS LA GRILLA DE 2 COLUMNAS */}
      <div className="inventario-grid">
        
        {consolas.map((consola) => (
          <div key={consola.id} className="consola-card">
            
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
              {consola.estado ? 
                <b style={{ color: 'green' }}>Disponible</b> : 
                <b style={{ color: 'red' }}>Vendido</b>
              }
            </p>

          </div>
        ))}
      </div>
    </div>
  );
}

export default InventarioConsolas;