"use client";
import { useEffect, useState } from "react";

interface Repartidor {
  id_rep: string;
  nombre: string;
  capacidad: number;
  carga_actual: number;
  disponible: boolean;
  ubicacion: string;
}

export default function RepartidoresPage() {
  const [repartidores, setRepartidores] = useState<Repartidor[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id_rep: "",
    nombre: "",
    capacidad: "",
  });

  const fetchRepartidores = () => {
    fetch("/api/repartidores")
      .then((res) => res.json())
      .then((data) => setRepartidores(Array.isArray(data) ? data : []))
      .catch(console.error);
  };

  useEffect(() => {
    fetchRepartidores();
  }, []);

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
        fetchRepartidores();
      } else {
        alert("Error al registrar repartidor");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-xl p-8 text-white shadow-xl">
        <h2 className="text-3xl font-bold mb-2">Flota de Repartidores</h2>
        <p className="text-emerald-100">Administra los conductores, su capacidad de carga y disponibilidad.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white/50 backdrop-blur-md border border-white/20 p-6 rounded-xl shadow-lg h-fit">
          <h3 className="text-xl font-bold mb-4 text-slate-800">Alta de Repartidor</h3>
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
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-bold text-slate-800">Directorio de Flota</h3>
          {repartidores.length === 0 ? (
            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-500">
              No hay repartidores registrados en la base de datos.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {repartidores.map((r) => {
                const porcentaje = (r.carga_actual / r.capacidad) * 100;
                return (
                  <div key={r.id_rep} className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className={`absolute top-0 left-0 w-1 h-full ${r.disponible ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-lg text-slate-800">{r.nombre}</h4>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${r.disponible ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {r.disponible ? 'Disponible' : 'Ocupado'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mb-3 text-xs uppercase tracking-wide">ID: {r.id_rep}</p>
                    <p className="text-sm text-slate-600 mb-1">📍 Ubicación: <span className="font-medium text-slate-800">{r.ubicacion}</span></p>
                    
                    <div className="mt-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-600 font-medium">Carga Actual</span>
                        <span className="text-slate-800 font-bold">{r.carga_actual} / {r.capacidad} kg</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className={`h-2 rounded-full ${porcentaje > 90 ? 'bg-red-500' : porcentaje > 50 ? 'bg-yellow-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(porcentaje, 100)}%` }}></div>
                      </div>
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