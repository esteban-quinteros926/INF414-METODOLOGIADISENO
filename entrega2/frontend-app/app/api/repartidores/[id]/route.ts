import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const res = await fetch(`http://localhost:8002/repartidores/${params.id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: "Error conectando al MS de Repartidores" }, { status: 500 });
  }
}
