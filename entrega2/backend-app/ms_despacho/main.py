from fastapi import FastAPI
from routers import despacho
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="MS Despacho")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(despacho.router)

import asyncio
import httpx
from services.despacho_service import DespachoFacade

async def poll_queue():
    facade = DespachoFacade()
    while True:
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get("http://127.0.0.1:8005/queues/asignacion_pedidos")
                if resp.status_code == 200:
                    data = resp.json()
                    msg = data.get("message")
                    if msg and "id_pedido" in msg:
                        id_p = msg["id_pedido"]
                        print(f"[SAGA] Consumido PedidoCreado para {id_p}, procesando asignación...")
                        await facade.asignar_automaticamente(id_p)
        except Exception as e:
            import traceback
            traceback.print_exc()
        await asyncio.sleep(2)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(poll_queue())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
