"use client";
import { useEffect, useState } from "react";

interface Incidencia {
  id_incidencia: string;
  id_pedido: string;
  problema: string;
  estado: string;
  resolucion: string | null;
}

export default function IncidenciasPage() {
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id_incidencia: "",
    id_pedido: "",
    problema: "",
  });

  const fetchIncidencias = () => {
    fetch("/api/incidencias")
      .then((res) => res.json())
      .then((data) => setIncidencias(Array.isArray(data) ? data : []))
      .catch(console.error);
  };

  useEffect(() => {
    fetchIncidencias();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/incidencias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setFormData({ id_incidencia: "", id_pedido: "", problema: "" });
        fetchIncidencias();
      } else {
        alert("Error al registrar incidencia");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleResolver = async (id: string) => {
    const resolucion = prompt("Ingrese la resolución de la incidencia:");
    if (!resolucion) return;

    try {
      const res = await fetch(`/api/incidencias/${id}/resolver`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolucion }),
      });
      if (res.ok) {
        fetchIncidencias();
      } else {
        alert("Error al resolver");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-gradient-to-r from-rose-600 to-red-800 rounded-xl p-8 text-white shadow-xl">
        <h2 className="text-3xl font-bold mb-2">Centro de Incidencias</h2>
        <p className="text-rose-100">Registra y resuelve problemas con los pedidos y entregas de forma automática.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white/50 backdrop-blur-md border border-white/20 p-6 rounded-xl shadow-lg h-fit">
          <h3 className="text-xl font-bold mb-4 text-slate-800">Apertura de Caso</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">ID de Incidencia</label>
              <input required type="text" value={formData.id_incidencia} onChange={e => setFormData({...formData, id_incidencia: e.target.value})} className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 p-2 border" placeholder="Ej. INC-001"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">ID del Pedido Afectado</label>
              <input required type="text" value={formData.id_pedido} onChange={e => setFormData({...formData, id_pedido: e.target.value})} className="mt-1 w-full rounded-md border-gray-300 shadow-sm p-2 border" placeholder="Ej. EXT-991"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Descripción del Problema</label>
              <textarea required rows={4} value={formData.problema} onChange={e => setFormData({...formData, problema: e.target.value})} className="mt-1 w-full rounded-md border-gray-300 shadow-sm p-2 border resize-none" placeholder="El paquete llegó roto..."></textarea>
            </div>
            <button disabled={loading} type="submit" className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-4 rounded-md transition-colors">
              {loading ? "Registrando..." : "Registrar Reclamo"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-bold text-slate-800">Casos Activos e Históricos</h3>
          {incidencias.length === 0 ? (
            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-500">
              Excelente, no hay incidencias registradas.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {incidencias.map((inc) => (
                <div key={inc.id_incidencia} className={`bg-white border p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group ${inc.estado === 'Resuelta' ? 'border-green-200' : 'border-rose-200'}`}>
                  <div className={`absolute top-0 left-0 w-1 h-full ${inc.estado === 'Resuelta' ? 'bg-green-500' : 'bg-rose-500'}`}></div>
                  
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="font-bold text-lg text-slate-800">{inc.id_incidencia}</h4>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${inc.estado === 'Resuelta' ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700 animate-pulse'}`}>
                          {inc.estado}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-500 mt-1">Pedido: {inc.id_pedido}</p>
                    </div>
                    {inc.estado !== 'Resuelta' && (
                      <button onClick={() => handleResolver(inc.id_incidencia)} className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors">
                        Resolver y Compensar
                      </button>
                    )}
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <p className="text-sm text-slate-700"><span className="font-semibold">Reporte:</span> {inc.problema}</p>
                    {inc.resolucion && (
                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <p className="text-sm text-green-700"><span className="font-bold">Resolución:</span> {inc.resolucion}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}