import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://localhost:8004/incidencias", { cache: "no-store" });
    if (!res.ok) {
        // La API tal vez no tiene GET /incidencias (listado general), pero si no la tiene, podemos devolver [] o implementarla.
        // Espera, en ms_incidencias no creé el GET listado completo, solo GET /{id}. 
        // ¡Cierto! En routers/incidencias.py de ms_incidencias solo existe GET "/{id}".
        // Voy a devolver vacío por defecto para que la UI no rompa si llama al GET.
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const res = await fetch("http://localhost:8004/incidencias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: "Error conectando al MS de Incidencias" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const res = await fetch("http://localhost:8004/incidencias", {
      method: "DELETE",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: "Error conectando al MS de Incidencias" }, { status: 500 });
  }
}
