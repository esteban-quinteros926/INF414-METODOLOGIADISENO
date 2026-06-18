from fastapi import FastAPI
from routers import pedidos
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="MS Pedidos")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(pedidos.router)

import asyncio
import httpx
from services.pedido_service import PedidoService

async def poll_topic():
    subscriber_id = "ms_pedidos_1"
    service = PedidoService()
    while True:
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(f"http://127.0.0.1:8005/topics/estado_pedidos/{subscriber_id}")
                if resp.status_code == 200:
                    data = resp.json()
                    for msg in data.get("messages", []):
                        # Expected payload: {"id_pedido": "...", "estado": "Asignado", "repartidor": "..."}
                        id_p = msg.get("id_pedido")
                        est = msg.get("estado")
                        rep = msg.get("repartidor")
                        if id_p and est:
                            service.actualizar_estado(id_p, est, rep)
                            print(f"[SAGA] Pedido {id_p} actualizado a {est}")
        except Exception as e:
            pass # ignore connection errors in background
        await asyncio.sleep(3)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(poll_topic())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
