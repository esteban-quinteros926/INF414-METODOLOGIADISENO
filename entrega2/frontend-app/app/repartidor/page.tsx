"use client";
import { useEffect, useState } from "react";

interface Pedido {
  id_pedido: string;
  destino: string;
  peso: number;
  estado: string;
  repartidor_asignado: string | null;
}

export default function RepartidorPage() {
  const [repartidorId, setRepartidorId] = useState("");
  const [activeRepartidor, setActiveRepartidor] = useState("");
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  const fetchPedidos = () => {
    fetch("/api/pedidos")
      .then((res) => res.json())
      .then((data) => setPedidos(Array.isArray(data) ? data : []))
      .catch(console.error);
  };

  useEffect(() => {
    fetchPedidos();
    const interval = setInterval(fetchPedidos, 3000);
    return () => clearInterval(interval);
  }, []);

  const login = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveRepartidor(repartidorId);
  };

  const cambiarEstado = async (id_pedido: string, nuevo_estado: string) => {
    try {
      await fetch(`/api/pedidos/${id_pedido}/estado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nuevo_estado, repartidor_id: activeRepartidor })
      });
      fetchPedidos();
    } catch (e) {
      console.error(e);
    }
  };

  const entregarPedido = async (id_pedido: string) => {
    try {
      await fetch(`/api/despachos/entregar/${id_pedido}`, { method: "POST" });
      fetchPedidos();
    } catch (e) {
      console.error(e);
    }
  };

  const reportarIncidencia = async (id_pedido: string) => {
    const problema = prompt("Describa el problema:");
    if (problema) {
      try {
        const id_incidencia = "INC-" + Math.floor(Math.random() * 10000);
        await fetch("/api/incidencias", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_incidencia, id_pedido, problema })
        });
        alert("Incidencia reportada correctamente.");
        cambiarEstado(id_pedido, "Intento fallido");
      } catch (e) {
        console.error(e);
      }
    }
  };

  if (!activeRepartidor) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <form onSubmit={login} className="bg-white p-8 rounded-xl shadow-md border text-center w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-6 text-slate-800">App Repartidor</h2>
          <input required type="text" placeholder="Ingresa tu ID (ej. R1)" value={repartidorId} onChange={(e) => setRepartidorId(e.target.value)} className="w-full border p-3 rounded mb-4 text-center text-lg"/>
          <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800">Iniciar Turno</button>
        </form>
      </div>
    );
  }

  const misPedidos = pedidos.filter(p => p.repartidor_asignado === activeRepartidor);

  return (
    <div className="max-w-md mx-auto bg-slate-100 min-h-[80vh] shadow-2xl rounded-3xl overflow-hidden relative border-8 border-slate-900">
      <header className="bg-slate-900 text-white p-6 rounded-b-3xl shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Mis Entregas</h2>
            <p className="text-sm text-slate-400">ID: {activeRepartidor}</p>
          </div>
          <button onClick={() => setActiveRepartidor("")} className="text-xs bg-slate-700 px-3 py-1 rounded-full">Salir</button>
        </div>
      </header>

      <div className="p-4 space-y-4 h-[calc(80vh-100px)] overflow-y-auto">
        {misPedidos.length === 0 ? (
          <div className="text-center text-slate-500 mt-10">
            <span className="text-4xl block mb-2">😴</span>
            No tienes pedidos asignados en este momento.
          </div>
        ) : (
          misPedidos.map(p => (
            <div key={p.id_pedido} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-slate-800 text-lg">{p.id_pedido}</h3>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-bold">{p.estado}</span>
              </div>
              <p className="text-sm text-slate-600 mb-4">📍 {p.destino}</p>
              
              <div className="grid grid-cols-2 gap-2 mt-4">
                {p.estado === 'Asignado' && (
                  <button onClick={() => cambiarEstado(p.id_pedido, 'En ruta')} className="col-span-2 bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600">Iniciar Ruta</button>
                )}
                {p.estado === 'En ruta' && (
                  <>
                    <button onClick={() => entregarPedido(p.id_pedido)} className="bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600">Entregado</button>
                    <button onClick={() => reportarIncidencia(p.id_pedido)} className="bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600">Reportar</button>
                  </>
                )}
                {p.estado === 'Entregado' && (
                  <div className="col-span-2 text-center text-green-600 font-bold py-2 bg-green-50 rounded-lg">Completado ✅</div>
                )}
                {p.estado === 'Intento fallido' && (
                  <div className="col-span-2 text-center text-red-600 font-bold py-2 bg-red-50 rounded-lg">Fallido ❌</div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
