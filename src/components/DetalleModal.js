import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

function DetalleModal({ consola, onClose, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Extraemos la venta (si existe)
  const venta = consola.ventas && consola.ventas.length > 0 ? consola.ventas[0] : null;

  // --- ESTADO DEL FORMULARIO ---
  // Cargamos datos de la CONSOLA y de la VENTA (si existe)
  const [formData, setFormData] = useState({
    // Datos Consola
    nombre: consola.nombre,
    descripcion: consola.descripcion || '',
    proveedor: consola.proveedor || '',
    costo_adquisicion: consola.costo_adquisicion,
    gastos_extra_adquisicion: consola.gastos_extra_adquisicion || 0,
    fecha_adquisicion: consola.fecha_adquisicion,
    
    // Datos Venta (Si no hay venta, los dejamos vacíos o en 0)
    nombre_cliente: venta ? venta.nombre_cliente : '',
    precio_venta: venta ? venta.precio_venta : 0,
    gastos_extra_venta: venta ? venta.gastos_extra : 0,
    detalles_venta: venta ? venta.detalles_venta : ''
  });

  const [newPhotos, setNewPhotos] = useState([]);

  if (!consola) return null;

  // --- MANEJADORES ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNewPhotoChange = (e) => {
    setNewPhotos(Array.from(e.target.files));
  };

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm("¿Seguro que quieres borrar esta foto?")) return;
    try {
      const { error } = await supabase.from('fotos').delete().eq('id', photoId);
      if (error) throw error;
      alert("Foto eliminada. Se reflejará al guardar o recargar.");
      onUpdate(); 
    } catch (err) {
      alert("Error al borrar foto: " + err.message);
    }
  };

  // --- GUARDAR CAMBIOS ---
  const handleSave = async () => {
    setLoading(true);
    try {
      // Conversión de números
      const nuevoCosto = parseFloat(formData.costo_adquisicion);
      const nuevosGastosAdq = parseFloat(formData.gastos_extra_adquisicion);
      
      // 1. Actualizar tabla CONSOLAS
      const { error: updateConsolaError } = await supabase
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

      if (updateConsolaError) throw updateConsolaError;

      // 2. Si hay venta, actualizar tabla VENTAS y Recalcular Ganancia
      if (venta) {
        const nuevoPrecioVenta = parseFloat(formData.precio_venta);
        const nuevosGastosVenta = parseFloat(formData.gastos_extra_venta);

        // Fórmula Maestra: Ganancia = Venta - (Costo + GastosAdq + GastosVenta)
        const nuevaGanancia = nuevoPrecioVenta - (nuevoCosto + nuevosGastosAdq + nuevosGastosVenta);
        
        const { error: updateVentaError } = await supabase
          .from('ventas')
          .update({
            nombre_cliente: formData.nombre_cliente,
            precio_venta: nuevoPrecioVenta,
            gastos_extra: nuevosGastosVenta,
            detalles_venta: formData.detalles_venta, // Actualizamos la nota
            ganancia_bruta: nuevaGanancia // Guardamos la nueva ganancia
          })
          .eq('id', venta.id);

        if (updateVentaError) throw updateVentaError;
      }

      // 3. Subir nuevas fotos
      if (newPhotos.length > 0) {
        const promesas = newPhotos.map(async (file) => {
          const filePath = `public/${consola.id}-${Date.now()}-${file.name}`;
          await supabase.storage.from('fotos-consolas').upload(filePath, file);
          const { data } = supabase.storage.from('fotos-consolas').getPublicUrl(filePath);
          return data.publicUrl;
        });
        const urls = await Promise.all(promesas);
        const fotosInsert = urls.map(url => ({
          consola_id: consola.id, url_foto: url, orden: 99
        }));
        await supabase.from('fotos').insert(fotosInsert);
      }

      alert("¡Cambios guardados correctamente!");
      onUpdate(); 

    } catch (error) {
      console.error(error);
      alert("Error al guardar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- ESTILOS ---
  const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' };
  const modalStyle = { background: 'white', padding: '20px', borderRadius: '8px', maxWidth: '500px', width: '90%', maxHeight: '90vh', overflowY: 'auto' };
  const inputStyle = { width: '100%', padding: '8px', marginBottom: '10px', boxSizing:'border-box', border:'1px solid #ccc', borderRadius:'4px' };
  const labelStyle = { fontWeight: 'bold', display: 'block', marginTop: '10px', fontSize:'0.9em' };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        
        {/* CABECERA */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px'}}>
          <h2 style={{margin:0}}>{isEditing ? '✏️ Editando' : '📄 Detalles'}</h2>
          <div>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} style={{marginRight:'10px', padding:'5px 10px', background:'#ffc107', border:'none', borderRadius:'4px', cursor:'pointer'}}>Editar</button>
            )}
            <button onClick={onClose} style={{background:'transparent', border:'none', fontSize:'20px', cursor:'pointer'}}>✖</button>
          </div>
        </div>

        {/* --- MODO LECTURA --- */}
        {!isEditing ? (
          <>
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
                <p><strong>Cliente:</strong> {venta.nombre_cliente}</p>
                <p><strong>Notas:</strong> {venta.detalles_venta || 'Sin notas'}</p>
                <p>Se vendió en: ${venta.precio_venta}</p>
                <p>Gastos de Venta: ${venta.gastos_extra}</p>
                <hr style={{margin:'5px 0', border:'0', borderTop:'1px solid #ccc'}}/>
                <p>Ganancia Real: <b style={{color: venta.ganancia_bruta > 0 ? 'green':'red'}}>${venta.ganancia_bruta}</b></p>
              </div>
            )}
          </>
        ) : (
          /* --- MODO EDICIÓN --- */
          <>
            <h4 style={{borderBottom:'1px solid #ddd'}}>📦 Datos del Producto</h4>
            <label style={labelStyle}>Nombre:</label>
            <input name="nombre" value={formData.nombre} onChange={handleChange} style={inputStyle} />
            
            <label style={labelStyle}>Descripción:</label>
            <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} style={inputStyle} />
            
            <label style={labelStyle}>Proveedor:</label>
            <input name="proveedor" value={formData.proveedor} onChange={handleChange} style={inputStyle} />
            
            <label style={labelStyle}>Fecha Adquisición:</label>
            <input type="date" name="fecha_adquisicion" value={formData.fecha_adquisicion} onChange={handleChange} style={inputStyle} />

            <div style={{background:'#fff3cd', padding:'10px', borderRadius:'5px', marginTop:'10px'}}>
               <strong>💰 Costos de Compra</strong>
               <div style={{display:'flex', gap:'10px'}}>
                 <div style={{flex:1}}>
                    <label style={labelStyle}>Costo Consola:</label>
                    <input type="number" step="0.01" name="costo_adquisicion" value={formData.costo_adquisicion} onChange={handleChange} style={inputStyle} />
                 </div>
                 <div style={{flex:1}}>
                    <label style={labelStyle}>Gastos Extra:</label>
                    <input type="number" step="0.01" name="gastos_extra_adquisicion" value={formData.gastos_extra_adquisicion} onChange={handleChange} style={inputStyle} />
                 </div>
               </div>
            </div>

            {/* SECCIÓN DE EDICIÓN DE VENTA (SOLO SI YA SE VENDIÓ) */}
            {venta && (
              <div style={{background:'#d1ecf1', padding:'10px', borderRadius:'5px', marginTop:'15px'}}>
                <strong>🤝 Datos de Venta (Editables)</strong>
                
                <label style={labelStyle}>Cliente:</label>
                <input name="nombre_cliente" value={formData.nombre_cliente} onChange={handleChange} style={inputStyle} />

                <div style={{display:'flex', gap:'10px'}}>
                  <div style={{flex:1}}>
                    <label style={labelStyle}>Precio Venta:</label>
                    <input type="number" step="0.01" name="precio_venta" value={formData.precio_venta} onChange={handleChange} style={inputStyle} />
                  </div>
                  <div style={{flex:1}}>
                    <label style={labelStyle}>Gastos Venta:</label>
                    <input type="number" step="0.01" name="gastos_extra_venta" value={formData.gastos_extra_venta} onChange={handleChange} style={inputStyle} />
                  </div>
                </div>

                <label style={labelStyle}>Notas de Venta:</label>
                <textarea name="detalles_venta" value={formData.detalles_venta} onChange={handleChange} style={inputStyle} />
              </div>
            )}

            <label style={labelStyle}>Fotos:</label>
            <div style={{marginBottom:'10px'}}>
              {consola.fotos?.map(f => (
                <div key={f.id} style={{display:'inline-block', position:'relative', margin:'5px'}}>
                  <img src={f.url_foto} alt="mini" style={{height:'80px', opacity: 0.7}} />
                  <button onClick={() => handleDeletePhoto(f.id)} style={{position:'absolute', top:0, right:0, background:'red', color:'white', border:'none', fontSize:'13px'}}>X</button>
                </div>
              ))}
            </div>
            <input type="file" multiple accept="image/*" onChange={handleNewPhotoChange} style={inputStyle} />

            <div style={{marginTop:'20px', display:'flex', gap:'10px'}}>
              <button onClick={handleSave} disabled={loading} style={{flex:1, padding:'10px', background:'#28a745', color:'white', border:'none', borderRadius:'4px', cursor:'pointer'}}>
                {loading ? 'Guardando...' : 'Guardar Todo'}
              </button>
              <button onClick={() => setIsEditing(false)} disabled={loading} style={{flex:1, padding:'10px', background:'#6c757d', color:'white', border:'none', borderRadius:'4px', cursor:'pointer'}}>
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