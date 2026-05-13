"use client";
import { useEffect, useState } from "react";

interface Pedido {
  id_pedido: string;
  destino: string;
  peso: number;
  estado: string;
  repartidor_asignado: string | null;
}

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id_orden: "",
    canal: "E-Commerce",
    origen: "",
    destino: "",
    contacto: "",
    peso: "",
  });

  const fetchPedidos = () => {
    fetch("/api/pedidos")
      .then((res) => res.json())
      .then((data) => setPedidos(Array.isArray(data) ? data : []))
      .catch(console.error);
  };

  useEffect(() => {
    fetchPedidos();
    // Refresco instantáneo cada 1 segundo para cumplir con requerimiento operacional
    const intervalId = setInterval(fetchPedidos, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const getEstadoColores = (estado: string) => {
    switch (estado) {
      case 'Creado': return { bar: 'bg-gray-400', badge: 'bg-gray-100 text-gray-700 border-gray-300' };
      case 'Validado': return { bar: 'bg-sky-400', badge: 'bg-sky-100 text-sky-700 border-sky-300' };
      case 'Pendiente de asignación': return { bar: 'bg-amber-400', badge: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'Asignado': return { bar: 'bg-indigo-400', badge: 'bg-indigo-100 text-indigo-700 border-indigo-300' };
      case 'En ruta': return { bar: 'bg-blue-500', badge: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'Intento fallido': return { bar: 'bg-orange-500', badge: 'bg-orange-100 text-orange-800 border-orange-300' };
      case 'Reprogramado': return { bar: 'bg-purple-400', badge: 'bg-purple-100 text-purple-800 border-purple-300' };
      case 'Entregado': return { bar: 'bg-green-500', badge: 'bg-green-100 text-green-800 border-green-300' };
      case 'Cancelado': return { bar: 'bg-red-500', badge: 'bg-red-100 text-red-800 border-red-300' };
      default: return { bar: 'bg-slate-400', badge: 'bg-slate-100 text-slate-700 border-slate-300' };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
        fetchPedidos();
      } else {
        alert("Error al crear el pedido");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 text-white shadow-xl">
        <h2 className="text-3xl font-bold mb-2">Gestión de Pedidos</h2>
        <p className="text-blue-100">Crea nuevos pedidos y monitorea la flota logística.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white/50 backdrop-blur-md border border-white/20 p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-slate-800">Crear Orden</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">ID de Orden</label>
              <input required type="text" value={formData.id_orden} onChange={e => setFormData({...formData, id_orden: e.target.value})} className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" placeholder="Ej. EXT-991"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Canal</label>
              <select value={formData.canal} onChange={e => setFormData({...formData, canal: e.target.value})} className="mt-1 w-full rounded-md border-gray-300 shadow-sm p-2 border">
                <option value="E-Commerce">E-Commerce</option>
                <option value="Tienda Física">Tienda Física</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Origen</label>
              <input required type="text" value={formData.origen} onChange={e => setFormData({...formData, origen: e.target.value})} className="mt-1 w-full rounded-md border-gray-300 shadow-sm p-2 border"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Destino</label>
              <input required type="text" value={formData.destino} onChange={e => setFormData({...formData, destino: e.target.value})} className="mt-1 w-full rounded-md border-gray-300 shadow-sm p-2 border"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Contacto</label>
              <input required type="text" value={formData.contacto} onChange={e => setFormData({...formData, contacto: e.target.value})} className="mt-1 w-full rounded-md border-gray-300 shadow-sm p-2 border"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Peso (kg)</label>
              <input required type="number" step="0.1" value={formData.peso} onChange={e => setFormData({...formData, peso: e.target.value})} className="mt-1 w-full rounded-md border-gray-300 shadow-sm p-2 border"/>
            </div>
            <button disabled={loading} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors">
              {loading ? "Creando..." : "Registrar Pedido"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-bold text-slate-800">Pedidos Registrados</h3>
          {pedidos.length === 0 ? (
            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-500">
              No hay pedidos logísticos registrados.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pedidos.map((p) => {
                const colores = getEstadoColores(p.estado);
                return (
                  <div key={p.id_pedido} className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${colores.bar} transition-colors duration-500`}></div>
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-bold text-lg text-slate-800 pl-2">{p.id_pedido}</h4>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${colores.badge} transition-colors duration-500`}>
                        {p.estado}
                      </span>
                    </div>
                    
                    <div className="pl-2">
                      <p className="text-sm text-slate-600 mb-1">📍 Destino: <span className="font-medium text-slate-800">{p.destino}</span></p>
                      <p className="text-sm text-slate-600 mb-1">⚖️ Peso: <span className="font-medium text-slate-800">{p.peso} kg</span></p>
                      {p.repartidor_asignado && (
                        <p className="text-sm text-blue-600 font-medium mt-3 bg-blue-50/50 border border-blue-100 p-2 rounded-lg inline-flex items-center gap-2">
                          <span>🚚</span> Repartidor: {p.repartidor_asignado}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}