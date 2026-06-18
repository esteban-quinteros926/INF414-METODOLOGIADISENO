"use client";
import { useEffect, useState } from "react";

interface Pedido {
  id_pedido: string;
  destino: string;
  peso: number;
  estado: string;
}

interface Repartidor {
  id_rep: string;
  nombre: string;
  capacidad: number;
  carga_actual: number;
  disponible: boolean;
  ubicacion: string;
}

export default function AdministradorPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [repartidores, setRepartidores] = useState<Repartidor[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id_rep: "",
    nombre: "",
    capacidad: "",
  });

  const fetchData = () => {
    fetch(`/api/pedidos?t=${Date.now()}`)
      .then((res) => res.json())
      .then((data) => setPedidos(Array.isArray(data) ? data : []))
      .catch(console.error);

    fetch(`/api/repartidores?t=${Date.now()}`)
      .then((res) => res.json())
      .then((data) => setRepartidores(Array.isArray(data) ? data : []))
      .catch(console.error);
  };


  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/repartidores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, capacidad: parseFloat(formData.capacidad) }),
      });
      if (res.ok) {
        setFormData({ id_rep: "", nombre: "", capacidad: "" });
        fetchData();
      } else {
        alert("Error al registrar repartidor");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async (id: string) => {
    setDeleteTarget(null);
    await fetch(`/api/repartidores/${id}`, { method: "DELETE" });
    fetchData();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="bg-slate-800 p-6 rounded-lg shadow-sm text-white">
        <h2 className="text-2xl font-bold">Vista de Administrador</h2>
        <p className="mt-2 text-slate-300">Monitoreo global del sistema y gestión de flota de repartidores.</p>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        <section className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-emerald-500">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Alta de Repartidor</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">ID Repartidor</label>
              <input required type="text" value={formData.id_rep} onChange={e => setFormData({...formData, id_rep: e.target.value})} className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2 border" placeholder="Ej. R1"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Nombre Completo</label>
              <input required type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="mt-1 w-full rounded-md border-gray-300 shadow-sm p-2 border"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Capacidad Máxima (kg)</label>
              <input required type="number" step="0.1" value={formData.capacidad} onChange={e => setFormData({...formData, capacidad: e.target.value})} className="mt-1 w-full rounded-md border-gray-300 shadow-sm p-2 border"/>
            </div>
            <button disabled={loading} type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-md transition-colors">
              {loading ? "Registrando..." : "Registrar Conductor"}
            </button>
          </form>
        </section>

        <section className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-blue-500">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Métricas Generales</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-lg border text-center">
              <p className="text-sm text-slate-500 uppercase font-bold">Total Pedidos</p>
              <p className="text-3xl font-black text-blue-600">{pedidos.length}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border text-center">
              <p className="text-sm text-slate-500 uppercase font-bold">Total Repartidores</p>
              <p className="text-3xl font-black text-emerald-600">{repartidores.length}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border text-center">
              <p className="text-sm text-slate-500 uppercase font-bold">Pedidos Entregados</p>
              <p className="text-3xl font-black text-green-600">{pedidos.filter(p => p.estado === 'Entregado').length}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border text-center">
              <p className="text-sm text-slate-500 uppercase font-bold">En Ruta</p>
              <p className="text-3xl font-black text-amber-600">{pedidos.filter(p => p.estado === 'En ruta').length}</p>
            </div>
          </div>
        </section>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Estado de la Flota</h3>
        {repartidores.length === 0 ? (
          <p className="text-gray-500 italic">No hay repartidores registrados.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {repartidores.map((r: Repartidor) => {
              const porcentaje = (r.carga_actual / r.capacidad) * 100;
              return (
                <div key={r.id_rep} className="border border-slate-200 p-4 rounded-xl bg-gray-50">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-emerald-900">{r.nombre}</p>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${r.disponible ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {r.disponible ? 'Disponible' : 'Ocupado'}
                      </span>
                      <button onClick={() => handleDelete(r.id_rep)} className="text-xs text-red-500 hover:text-red-700 bg-red-50 px-2 py-1 rounded border border-red-100 transition-colors">🗑️ Eliminar</button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">ID: {r.id_rep}</p>
                  <div className="mt-2 text-sm text-gray-600 flex justify-between">
                    <span>Carga: {r.carga_actual} / {r.capacidad}kg</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div className={`h-2 rounded-full ${porcentaje > 90 ? 'bg-red-500' : porcentaje > 50 ? 'bg-yellow-500' : 'bg-emerald-500'}`} style={{width: `${Math.min(porcentaje, 100)}%`}}></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Confirmación */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Confirmar Eliminación</h3>
            <p className="text-slate-600 mb-6">¿Estás seguro de que quieres eliminar a este repartidor? Esta acción no se puede deshacer.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded transition-colors">Cancelar</button>
              <button onClick={() => confirmDelete(deleteTarget)} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
