import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const res = await fetch(`http://127.0.0.1:8003/despachos/asignar-automatico/${params.id}`, {
      method: "POST",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: "Error conectando al MS de Despachos" }, { status: 500 });
  }
}

