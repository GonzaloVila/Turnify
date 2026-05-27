import { useState, useContext, useEffect } from 'react';
import { NegocioContext } from '../context/NegocioContext';
import { negocioService } from '../services/negocio.service';
import LoadingSpinner from '../components/shared/LoadingSpinner';

export default function Configuracion() {
  const { negocio, isLoading, actualizarNegocio } = useContext(NegocioContext);
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', descripcion: '', direccion: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (negocio) {
      setForm({
        nombre: negocio.nombre || '',
        email: negocio.email || '',
        telefono: negocio.telefono || '',
        descripcion: negocio.descripcion || '',
        direccion: negocio.direccion || '',
      });
    }
  }, [negocio]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const updated = await negocioService.actualizar(negocio.id, form);
      actualizarNegocio(updated);
      setMsg('Datos guardados correctamente.');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="page">
      <h1 className="page-title">Configuración del negocio</h1>

      <div className="card" style={{ maxWidth: 600 }}>
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label>Nombre del negocio</label>
            <input value={form.nombre} onChange={set('nombre')} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={set('email')} required />
          </div>
          <div className="form-group">
            <label>Teléfono</label>
            <input value={form.telefono} onChange={set('telefono')} />
          </div>
          <div className="form-group">
            <label>Dirección</label>
            <input value={form.direccion} onChange={set('direccion')} />
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <textarea value={form.descripcion} onChange={set('descripcion')} rows={3} />
          </div>
          {msg && <p className={msg.includes('Error') ? 'form-error' : 'form-success'}>{msg}</p>}
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </div>
  );
}
