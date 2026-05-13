import { NextResponse } from "next/server";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const res = await fetch(`http://localhost:8001/pedidos/${params.id}/estado`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: "Error conectando al MS de Pedidos" }, { status: 500 });
  }
}
