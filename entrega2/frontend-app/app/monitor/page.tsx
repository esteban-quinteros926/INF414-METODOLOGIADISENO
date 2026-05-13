"use client";
import { useEffect, useState } from "react";

interface Pedido {
  id_pedido: string;
  destino: string;
  peso: number;
  estado: string;
  repartidor_asignado: string | null;
}

export default function MonitorPedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  const fetchPedidos = () => {
    fetch("/api/pedidos")
      .then((res) => res.json())
      .then((data) => setPedidos(Array.isArray(data) ? data : []))
      .catch(console.error);
  };

  useEffect(() => {
    fetchPedidos();
    // Refresco instantáneo cada 1 segundo (Tiempo real)
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

  return (
    <div className="space-y-8 animate-fade-in p-6">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-8 text-white shadow-xl">
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <span className="relative flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
          </span>
          Monitor en Tiempo Real
        </h2>
        <p className="text-slate-300">Vista dedicada exclusivamente al seguimiento de los estados de los pedidos de la flota.</p>
      </div>

      <div className="space-y-4">
        {pedidos.length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-12 text-center text-slate-500 flex flex-col items-center justify-center">
            <span className="text-4xl mb-4">📦</span>
            <p className="text-lg">No hay pedidos actualmente registrados en el sistema.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pedidos.map((p) => {
              const colores = getEstadoColores(p.estado);
              return (
                <div key={p.id_pedido} className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm hover:shadow-lg transition-all relative overflow-hidden group flex flex-col h-full">
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${colores.bar} transition-colors duration-500`}></div>
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-bold text-xl text-slate-800 pl-2">{p.id_pedido}</h4>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${colores.badge} transition-colors duration-500 shadow-sm`}>
                      {p.estado}
                    </span>
                  </div>
                  
                  <div className="pl-2 flex-grow space-y-2">
                    <p className="text-sm text-slate-600 flex items-center gap-2">
                      <span className="text-slate-400">📍</span> 
                      <span className="font-medium text-slate-800 break-all">{p.destino}</span>
                    </p>
                    <p className="text-sm text-slate-600 flex items-center gap-2">
                      <span className="text-slate-400">⚖️</span> 
                      <span className="font-medium text-slate-800">{p.peso} kg</span>
                    </p>
                  </div>

                  {p.repartidor_asignado && (
                    <div className="pl-2 mt-4 pt-4 border-t border-slate-100">
                      <p className="text-sm text-blue-700 font-medium bg-blue-50 border border-blue-100 px-3 py-2 rounded-lg inline-flex items-center gap-2 w-full">
                        <span className="text-lg">🚚</span>
                        <span className="truncate">{p.repartidor_asignado}</span>
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
