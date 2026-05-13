import { NextResponse } from "next/server";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const res = await fetch(`http://localhost:8004/incidencias/${params.id}/gestionar`, {
      method: "PUT",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: "Error conectando al MS de Incidencias" }, { status: 500 });
  }
}
