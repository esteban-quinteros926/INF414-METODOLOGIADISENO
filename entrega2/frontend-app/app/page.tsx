"use client";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center animate-fade-in px-4">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">
          Bienvenido a <span className="text-blue-600">UV Protect Logistics</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Sistema centralizado de logística de última milla. Por favor seleccione su perfil de acceso para continuar.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
        <Link href="/administrador" className="group block h-full">
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-500 transition-all duration-300 h-full flex flex-col">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
              👑
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">Administrador</h3>
            <p className="text-slate-600 flex-1">Monitoreo global de métricas del sistema y alta de nuevos conductores en la flota.</p>
            <span className="text-emerald-600 font-bold mt-6 inline-flex items-center gap-2 group-hover:gap-3 transition-all">Acceder <span>→</span></span>
          </div>
        </Link>

        <Link href="/operador" className="group block h-full">
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-500 transition-all duration-300 h-full flex flex-col">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
              🎧
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">Operador</h3>
            <p className="text-slate-600 flex-1">Creación de pedidos, seguimiento, auto-asignación, reasignaciones y resolución de incidencias.</p>
            <span className="text-blue-600 font-bold mt-6 inline-flex items-center gap-2 group-hover:gap-3 transition-all">Acceder <span>→</span></span>
          </div>
        </Link>

        <Link href="/repartidor" className="group block h-full">
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-orange-500 transition-all duration-300 h-full flex flex-col">
            <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
              🚚
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">Repartidor</h3>
            <p className="text-slate-600 flex-1">Vista móvil para actualizar el estado de los pedidos y reportar incidencias en ruta.</p>
            <span className="text-orange-600 font-bold mt-6 inline-flex items-center gap-2 group-hover:gap-3 transition-all">Acceder <span>→</span></span>
          </div>
        </Link>

        <Link href="/integraciones" className="group block h-full">
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-purple-500 transition-all duration-300 h-full flex flex-col">
            <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
              🔌
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">Integraciones</h3>
            <p className="text-slate-600 flex-1">Portal B2B de simulación para inyectar pedidos vía webhook y rastrear órdenes externamente.</p>
            <span className="text-purple-600 font-bold mt-6 inline-flex items-center gap-2 group-hover:gap-3 transition-all">Acceder <span>→</span></span>
          </div>
        </Link>
      </div>
    </div>
  );
}
