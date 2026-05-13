"use client";
import { useState } from "react";

export default function IntegracionesPage() {
  const [apiKey] = useState("uvp_" + Math.random().toString(36).substring(2, 15));
  const [trackingId, setTrackingId] = useState("");
  const [trackingResult, setTrackingResult] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    id_orden: "", canal: "E-Commerce", origen: "", destino: "", contacto: "", peso: "",
  });
  const [createResult, setCreateResult] = useState<any>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify({ ...formData, peso: parseFloat(formData.peso) }),
      });
      const data = await res.json();
      setCreateResult({ status: res.status, data });
    } catch (e: any) {
      setCreateResult({ error: e.message });
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // In a real scenario we might have an endpoint /api/pedidos/[id]
      // For now, let's just fetch all and filter to simulate tracking.
      const res = await fetch("/api/pedidos");
      const data = await res.json();
      const pedido = data.find((p: any) => p.id_pedido === trackingId);
      if (pedido) {
        setTrackingResult(pedido);
      } else {
        setTrackingResult({ error: "Pedido no encontrado" });
      }
    } catch (e: any) {
      setTrackingResult({ error: e.message });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="bg-slate-900 p-8 rounded-lg shadow-sm text-white border-b-4 border-purple-500">
        <h2 className="text-3xl font-bold">Portal de Integradores B2B</h2>
        <p className="mt-2 text-slate-400">Simulador de consumo de API y Webhooks para clientes externos.</p>
        <div className="mt-4 inline-flex items-center bg-slate-800 px-4 py-2 rounded border border-slate-700">
          <span className="text-sm font-mono text-slate-400 mr-4">API KEY:</span>
          <code className="text-purple-400 font-bold">{apiKey}</code>
        </div>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        <section className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><span className="text-purple-500">POST</span> /api/v1/pedidos</h3>
          <p className="text-sm text-slate-500 mb-6">Endpoint para inyectar órdenes desde un e-commerce externo.</p>
          
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-mono text-slate-500">id_orden</label><input required value={formData.id_orden} onChange={e=>setFormData({...formData, id_orden: e.target.value})} className="mt-1 w-full rounded border p-2 text-sm font-mono" placeholder="EXT-1001"/></div>
              <div><label className="block text-xs font-mono text-slate-500">origen</label><input required value={formData.origen} onChange={e=>setFormData({...formData, origen: e.target.value})} className="mt-1 w-full rounded border p-2 text-sm font-mono" placeholder="Bodega Central"/></div>
              <div><label className="block text-xs font-mono text-slate-500">destino</label><input required value={formData.destino} onChange={e=>setFormData({...formData, destino: e.target.value})} className="mt-1 w-full rounded border p-2 text-sm font-mono" placeholder="Av Principal 123"/></div>
              <div><label className="block text-xs font-mono text-slate-500">contacto</label><input required value={formData.contacto} onChange={e=>setFormData({...formData, contacto: e.target.value})} className="mt-1 w-full rounded border p-2 text-sm font-mono" placeholder="user@mail.com"/></div>
              <div><label className="block text-xs font-mono text-slate-500">peso</label><input required type="number" step="0.1" value={formData.peso} onChange={e=>setFormData({...formData, peso: e.target.value})} className="mt-1 w-full rounded border p-2 text-sm font-mono" placeholder="1.5"/></div>
            </div>
            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded transition-colors">
              Enviar Petición POST
            </button>
          </form>

          {createResult && (
            <div className="mt-6 bg-slate-900 p-4 rounded-lg">
              <p className="text-xs text-slate-400 mb-2">Respuesta (Status: {createResult.status}):</p>
              <pre className="text-green-400 text-xs overflow-x-auto">
                {JSON.stringify(createResult.data || createResult, null, 2)}
              </pre>
            </div>
          )}
        </section>

        <section className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><span className="text-blue-500">GET</span> /api/v1/pedidos/:id/track</h3>
          <p className="text-sm text-slate-500 mb-6">Consulta el estado en tiempo real de una orden.</p>
          
          <form onSubmit={handleTrack} className="space-y-4 flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-xs font-mono text-slate-500">id_pedido</label>
              <input required value={trackingId} onChange={e=>setTrackingId(e.target.value)} className="mt-1 w-full rounded border p-2 text-sm font-mono" placeholder="Ej. EXT-1001"/>
            </div>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition-colors h-[42px]">
              Consultar
            </button>
          </form>

          {trackingResult && (
            <div className="mt-6">
              {trackingResult.error ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
                  {trackingResult.error}
                </div>
              ) : (
                <div className="bg-slate-50 border p-6 rounded-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-blue-100 text-blue-800 px-4 py-1 rounded-bl-lg font-bold text-sm">
                    {trackingResult.estado}
                  </div>
                  <h4 className="font-mono font-bold text-lg">{trackingResult.id_pedido}</h4>
                  <p className="text-sm text-slate-600 mt-2">📍 {trackingResult.destino}</p>
                  <p className="text-sm text-slate-600">⚖️ {trackingResult.peso} kg</p>
                  {trackingResult.repartidor_asignado && (
                    <p className="text-sm text-slate-600 mt-2 border-t pt-2">🚚 Repartidor Asignado: <span className="font-medium">{trackingResult.repartidor_asignado}</span></p>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
