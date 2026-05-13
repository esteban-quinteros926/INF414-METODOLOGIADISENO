"use client";
import { useEffect, useState } from "react";

interface Pedido {
  id_pedido: string;
  destino: string;
  peso: number;
  estado: string;
  repartidor_asignado: string | null;
}

interface Incidencia {
  id_incidencia: string;
  id_pedido: string;
  problema: string;
  estado: string;
  resolucion?: string;
}

export default function OperadorPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  
  const [deletePedidosConfirm, setDeletePedidosConfirm] = useState(false);
  const [deleteIncidenciasConfirm, setDeleteIncidenciasConfirm] = useState(false);
  const [resolucionPromptTarget, setResolucionPromptTarget] = useState<string | null>(null);
  const [resolucionText, setResolucionText] = useState("");

  const [formData, setFormData] = useState({
    id_orden: "", canal: "E-Commerce", origen: "", destino: "", contacto: "", peso: "",
  });

  const fetchData = () => {
    fetch("/api/pedidos").then((res) => res.json()).then((data) => setPedidos(Array.isArray(data) ? data : []));
    fetch("/api/incidencias").then((res) => res.json()).then((data) => setIncidencias(Array.isArray(data) ? data : []));
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleCreatePedido = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, peso: parseFloat(formData.peso) }),
      });
      if (res.ok) {
        setFormData({ id_orden: "", canal: "E-Commerce", origen: "", destino: "", contacto: "", peso: "" });
        fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const autoAsignar = async (id: string) => {
    setAssigningId(id);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(p => Math.min(p + 15, 90));
    }, 50);

    await fetch(`/api/despachos/asignar-automatico/${id}`, { method: "POST" });
    
    clearInterval(interval);
    setProgress(100);
    
    setTimeout(() => {
      setAssigningId(null);
      fetchData();
    }, 300);
  };

  const reasignar = async (id: string) => {
    await fetch(`/api/despachos/reasignar/${id}`, { method: "POST" });
    fetchData();
  };

  const gestionarIncidencia = async (id: string) => {
    await fetch(`/api/incidencias/${id}/gestionar`, { method: "PUT" });
    fetchData();
  };

  const resolverIncidencia = async () => {
    if (resolucionPromptTarget && resolucionText) {
      await fetch(`/api/incidencias/${resolucionPromptTarget}/resolver`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolucion: resolucionText })
      });
      setResolucionPromptTarget(null);
      setResolucionText("");
      fetchData();
    }
  };

  const confirmarLimpiarPedidos = async () => {
    await fetch("/api/pedidos", { method: "DELETE" });
    setDeletePedidosConfirm(false);
    fetchData();
  };

  const confirmarLimpiarIncidencias = async () => {
    await fetch("/api/incidencias", { method: "DELETE" });
    setDeleteIncidenciasConfirm(false);
    fetchData();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="bg-slate-800 p-6 rounded-lg shadow-sm text-white">
        <h2 className="text-2xl font-bold">Panel de Operador</h2>
        <p className="mt-2 text-slate-300">Gestión de envíos, asignaciones manuales y resolución de incidencias.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-sm border-t-4 border-blue-500 h-fit">
          <h3 className="text-xl font-bold mb-4 text-slate-800">Crear Orden</h3>
          <form onSubmit={handleCreatePedido} className="space-y-4">
            <div><label className="block text-sm font-medium">ID Orden</label><input required value={formData.id_orden} onChange={e=>setFormData({...formData, id_orden: e.target.value})} className="mt-1 w-full rounded border p-2"/></div>
            <div><label className="block text-sm font-medium">Origen</label><input required value={formData.origen} onChange={e=>setFormData({...formData, origen: e.target.value})} className="mt-1 w-full rounded border p-2"/></div>
            <div><label className="block text-sm font-medium">Destino</label><input required value={formData.destino} onChange={e=>setFormData({...formData, destino: e.target.value})} className="mt-1 w-full rounded border p-2"/></div>
            <div><label className="block text-sm font-medium">Contacto</label><input required value={formData.contacto} onChange={e=>setFormData({...formData, contacto: e.target.value})} className="mt-1 w-full rounded border p-2"/></div>
            <div><label className="block text-sm font-medium">Peso (kg)</label><input required type="number" step="0.1" value={formData.peso} onChange={e=>setFormData({...formData, peso: e.target.value})} className="mt-1 w-full rounded border p-2"/></div>
            <button disabled={loading} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded">
              {loading ? "Creando..." : "Registrar Pedido"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-800">Gestión de Pedidos</h3>
              <button onClick={() => setDeletePedidosConfirm(true)} className="text-sm bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1 rounded border border-red-200 transition-colors">🗑️ Borrar Todos</button>
            </div>
            <div className="space-y-4">
              {pedidos.map(p => (
                <div key={p.id_pedido} className="border p-4 rounded bg-gray-50 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold">{p.id_pedido} <span className="text-xs font-normal bg-gray-200 px-2 py-1 rounded ml-2">{p.estado}</span></h4>
                    <p className="text-sm text-gray-600">Destino: {p.destino} - Peso: {p.peso}kg</p>
                    {p.repartidor_asignado && <p className="text-sm text-blue-600 mt-1">🚚 Repartidor: {p.repartidor_asignado}</p>}
                  </div>
                  <div className="flex gap-2">
                    {p.estado === 'Creado' || p.estado === 'Validado' || p.estado === 'Pendiente de asignación' ? (
                      <div className="flex flex-col items-end gap-1 w-24">
                        <button disabled={assigningId === p.id_pedido} onClick={() => autoAsignar(p.id_pedido)} className="w-full px-2 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50 transition-all">
                          {assigningId === p.id_pedido ? "Cargando..." : "Auto-Asignar"}
                        </button>
                        {assigningId === p.id_pedido && (
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1 overflow-hidden">
                            <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-75" style={{ width: `${progress}%` }}></div>
                          </div>
                        )}
                      </div>
                    ) : p.estado === 'Intento fallido' || p.estado === 'Asignado' ? (
                      <button onClick={() => reasignar(p.id_pedido)} className="px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 h-fit">Reasignar</button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-red-500">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-800">Mesa de Incidencias</h3>
              <button onClick={() => setDeleteIncidenciasConfirm(true)} className="text-sm bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1 rounded border border-red-200 transition-colors">🗑️ Borrar Todas</button>
            </div>
            {incidencias.length === 0 ? <p className="text-gray-500 italic">No hay incidencias reportadas.</p> : (
              <div className="space-y-4">
                {incidencias.map(inc => (
                  <div key={inc.id_incidencia} className="border p-4 rounded bg-red-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-red-800">Pedido: {inc.id_pedido}</h4>
                        <p className="text-sm text-red-900 mt-1">{inc.problema}</p>
                        <p className="text-xs mt-2 font-semibold">Estado: {inc.estado}</p>
                        {inc.resolucion && <p className="text-sm text-green-700 mt-1">Resolución: {inc.resolucion}</p>}
                      </div>
                      <div className="flex gap-2">
                        {inc.estado === 'Reportada' && (
                          <button onClick={() => gestionarIncidencia(inc.id_incidencia)} className="px-3 py-1 bg-amber-500 text-white rounded text-sm hover:bg-amber-600">Gestionar</button>
                        )}
                        {inc.estado !== 'Resuelta' && (
                          <button onClick={() => setResolucionPromptTarget(inc.id_incidencia)} className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600">Resolver</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Modal Limpiar Pedidos */}
      {deletePedidosConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Confirmar Eliminación</h3>
            <p className="text-slate-600 mb-6">¿Estás seguro de que quieres borrar TODOS los pedidos? Esta acción no se puede deshacer.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeletePedidosConfirm(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded transition-colors">Cancelar</button>
              <button onClick={confirmarLimpiarPedidos} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">Eliminar Todos</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Limpiar Incidencias */}
      {deleteIncidenciasConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Confirmar Eliminación</h3>
            <p className="text-slate-600 mb-6">¿Estás seguro de que quieres borrar TODAS las incidencias? Esta acción no se puede deshacer.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteIncidenciasConfirm(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded transition-colors">Cancelar</button>
              <button onClick={confirmarLimpiarIncidencias} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">Eliminar Todas</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Resolver Incidencia */}
      {resolucionPromptTarget && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Resolver Incidencia</h3>
            <p className="text-slate-600 mb-4">Ingresa la resolución para la incidencia del pedido.</p>
            <textarea 
              autoFocus
              className="w-full border rounded p-2 mb-6 shadow-sm focus:ring-green-500 focus:border-green-500 outline-none transition-all" 
              rows={3} 
              value={resolucionText} 
              onChange={e => setResolucionText(e.target.value)}
              placeholder="Ej. Se reasignó un nuevo repartidor y se entregó cupón de descuento."
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => { setResolucionPromptTarget(null); setResolucionText(""); }} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded transition-colors">Cancelar</button>
              <button onClick={resolverIncidencia} disabled={!resolucionText.trim()} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50">Guardar Resolución</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
