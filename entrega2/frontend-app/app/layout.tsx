import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "UV Protect - Logistics Dashboard",
  description: "Sistema de gestión de envíos logísticos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <nav className="bg-slate-900 text-white p-4 shadow-md">
          <div className="container mx-auto flex gap-4 items-center">
            <h1 className="font-bold text-xl mr-8 text-blue-400">UV Protect</h1>
            <Link href="/" className="hover:text-blue-300 transition-colors">Inicio</Link>
            <Link href="/administrador" className="hover:text-blue-300 transition-colors">Administrador</Link>
            <Link href="/operador" className="hover:text-blue-300 transition-colors">Operador</Link>
            <Link href="/repartidor" className="hover:text-blue-300 transition-colors">Repartidor</Link>
            <Link href="/integraciones" className="hover:text-blue-300 transition-colors">Integraciones</Link>
          </div>
        </nav>
        <main className="container mx-auto p-4">
          {children}
        </main>
      </body>
    </html>
  );
}
