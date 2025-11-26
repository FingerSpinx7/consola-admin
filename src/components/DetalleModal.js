import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

function DetalleModal({ consola, onClose, onUpdate }) {
  // Estado para saber si estamos editando o solo viendo
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estados del Formulario (se llenan con los datos actuales)
  const [formData, setFormData] = useState({
    nombre: consola.nombre,
    descripcion: consola.descripcion || '',
    proveedor: consola.proveedor || '',
    costo_adquisicion: consola.costo_adquisicion,
    gastos_extra_adquisicion: consola.gastos_extra_adquisicion || 0,
    fecha_adquisicion: consola.fecha_adquisicion
  });

  // Estado para fotos nuevas
  const [newPhotos, setNewPhotos] = useState([]);

  // Si no hay consola, no mostramos nada
  if (!consola) return null;

  const venta = consola.ventas && consola.ventas.length > 0 ? consola.ventas[0] : null;

  // --- MANEJADORES DE CAMBIOS ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNewPhotoChange = (e) => {
    setNewPhotos(Array.from(e.target.files));
  };

  // --- BORRAR FOTO EXISTENTE ---
  const handleDeletePhoto = async (photoId, photoUrl) => {
    if (!window.confirm("¿Seguro que quieres borrar esta foto?")) return;
    
    try {
      // 1. Borrar de la base de datos
      const { error } = await supabase.from('fotos').delete().eq('id', photoId);
      if (error) throw error;

      // 2. Intentar borrar del Storage (Opcional, requiere extraer el path)
      // Por simplicidad, hoy solo borramos el registro de la DB para que ya no salga.
      
      alert("Foto eliminada. Se reflejará al cerrar y abrir.");
      // Forzamos una actualización rápida visual ocultando esa foto (opcional)
      // O mejor, cerramos y recargamos:
      onUpdate(); 
    } catch (err) {
      alert("Error al borrar foto: " + err.message);
    }
  };

  // --- GUARDAR CAMBIOS (EL CEREBRO) ---
  const handleSave = async () => {
    setLoading(true);
    try {
      const nuevoCosto = parseFloat(formData.costo_adquisicion);
      const nuevosGastosAdq = parseFloat(formData.gastos_extra_adquisicion);

      // 1. Actualizar datos básicos de la CONSOLA
      const { error: updateError } = await supabase
        .from('consolas')
        .update({
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          proveedor: formData.proveedor,
          costo_adquisicion: nuevoCosto,
          gastos_extra_adquisicion: nuevosGastosAdq,
          fecha_adquisicion: formData.fecha_adquisicion
        })
        .eq('id', consola.id);

      if (updateError) throw updateError;

      // 2. Si está vendida, RECALCULAR GANANCIA en VENTAS
      if (!consola.estado && venta) {
        // Fórmula: Ganancia = PrecioVenta - (NuevoCosto + NuevosGastosAdq + GastosVenta)
        const nuevaGanancia = venta.precio_venta - (nuevoCosto + nuevosGastosAdq + venta.gastos_extra);
        
        await supabase
          .from('ventas')
          .update({ ganancia_bruta: nuevaGanancia })
          .eq('id', venta.id);
      }

      // 3. Subir NUEVAS FOTOS (si hay)
      if (newPhotos.length > 0) {
        const promesas = newPhotos.map(async (file) => {
          const filePath = `public/${consola.id}-${Date.now()}-${file.name}`;
          await supabase.storage.from('fotos-consolas').upload(filePath, file);
          const { data } = supabase.storage.from('fotos-consolas').getPublicUrl(filePath);
          return data.publicUrl;
        });

        const urls = await Promise.all(promesas);
        
        // Insertar en tabla fotos
        const fotosInsert = urls.map(url => ({
          consola_id: consola.id,
          url_foto: url,
          orden: 99 // Ponemos orden alto para que salgan al final
        }));

        await supabase.from('fotos').insert(fotosInsert);
      }

      alert("¡Cambios guardados correctamente!");
      onUpdate(); // Cierra el modal y refresca la lista principal

    } catch (error) {
      console.error(error);
      alert("Error al guardar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- ESTILOS ---
  const overlayStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000,
    display: 'flex', justifyContent: 'center', alignItems: 'center'
  };
  const modalStyle = {
    background: 'white', padding: '20px', borderRadius: '8px',
    maxWidth: '500px', width: '90%', maxHeight: '90vh', overflowY: 'auto',
    position: 'relative'
  };
  const inputStyle = { width: '100%', padding: '8px', marginBottom: '10px', boxSizing:'border-box' };
  const labelStyle = { fontWeight: 'bold', display: 'block', marginTop: '10px' };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        
        {/* CABECERA CON BOTONES */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px'}}>
          <h2 style={{margin:0}}>{isEditing ? 'Editar Producto' : 'Detalles'}</h2>
          <div>
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                style={{marginRight:'10px', padding:'5px 10px', background:'#ffc107', border:'none', borderRadius:'4px', cursor:'pointer'}}
              >
                ✏️ Editar
              </button>
            )}
            <button onClick={onClose} style={{background:'transparent', border:'none', fontSize:'20px', cursor:'pointer'}}>✖</button>
          </div>
        </div>

        {/* --- MODO LECTURA (VER) --- */}
        {!isEditing ? (
          <>
            {/* Galería Simple */}
            <div style={{display:'flex', gap:'5px', overflowX:'auto', marginBottom:'15px'}}>
              {consola.fotos?.map(f => (
                <img key={f.id} src={f.url_foto} alt="foto" style={{height:'200px', borderRadius:'4px'}} />
              ))}
            </div>

            <p><strong>Nombre:</strong> {consola.nombre}</p>
            <p><strong>Descripción:</strong> {consola.descripcion}</p>
            <p><strong>Proveedor:</strong> {consola.proveedor}</p>
            <p><strong>Fecha Adq:</strong> {consola.fecha_adquisicion}</p>
            <hr/>
            <p><strong>Costo Adquisición:</strong> ${consola.costo_adquisicion}</p>
            <p><strong>Gastos Extra (Compra):</strong> ${consola.gastos_extra_adquisicion}</p>
            
            {venta && (
              <div style={{background:'#f0f8ff', padding:'10px', borderRadius:'5px', marginTop:'10px'}}>
                <h4 style={{margin:'0 0 5px 0'}}>Detalles de Venta</h4>
                <p>Cliente: {venta.nombre_cliente}</p>
                <p>Se vendió en: ${venta.precio_venta}</p>
                <p>Ganancia Real: <b style={{color: venta.ganancia_bruta > 0 ? 'green':'red'}}>${venta.ganancia_bruta}</b></p>
              </div>
            )}
          </>
        ) : (
          /* --- MODO EDICIÓN (EDITAR) --- */
          <>
            <label style={labelStyle}>Nombre:</label>
            <input name="nombre" value={formData.nombre} onChange={handleChange} style={inputStyle} />

            <label style={labelStyle}>Descripción:</label>
            <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} style={inputStyle} />

            <label style={labelStyle}>Proveedor:</label>
            <input name="proveedor" value={formData.proveedor} onChange={handleChange} style={inputStyle} />

            <label style={labelStyle}>Fecha Adquisición:</label>
            <input type="date" name="fecha_adquisicion" value={formData.fecha_adquisicion} onChange={handleChange} style={inputStyle} />

            <div style={{background:'#fff3cd', padding:'10px', borderRadius:'5px', margin:'10px 0'}}>
              <small>⚠️ Si cambias los costos en un producto vendido, la ganancia se recalculará.</small>
              <label style={labelStyle}>Costo Consola ($):</label>
              <input type="number" step="0.01" name="costo_adquisicion" value={formData.costo_adquisicion} onChange={handleChange} style={inputStyle} />

              <label style={labelStyle}>Gastos Extra Compra ($):</label>
              <input type="number" step="0.01" name="gastos_extra_adquisicion" value={formData.gastos_extra_adquisicion} onChange={handleChange} style={inputStyle} />
            </div>

            <label style={labelStyle}>Gestionar Fotos:</label>
            <div style={{marginBottom:'10px'}}>
              {consola.fotos?.map(f => (
                <div key={f.id} style={{display:'inline-block', position:'relative', margin:'5px'}}>
                  <img src={f.url_foto} alt="mini" style={{height:'60px', opacity: 0.6}} />
                  <button 
                    onClick={() => handleDeletePhoto(f.id, f.url_foto)}
                    style={{position:'absolute', top:0, right:0, background:'red', color:'white', border:'none', cursor:'pointer', fontSize:'10px'}}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
            
            <label>Agregar Nuevas Fotos:</label>
            <input type="file" multiple accept="image/*" onChange={handleNewPhotoChange} style={inputStyle} />

            <div style={{marginTop:'20px', display:'flex', gap:'10px'}}>
              <button 
                onClick={handleSave} 
                disabled={loading}
                style={{flex:1, padding:'10px', background:'#28a745', color:'white', border:'none', borderRadius:'4px', cursor:'pointer'}}
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              
              <button 
                onClick={() => setIsEditing(false)} 
                disabled={loading}
                style={{flex:1, padding:'10px', background:'#6c757d', color:'white', border:'none', borderRadius:'4px', cursor:'pointer'}}
              >
                Cancelar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default DetalleModal;