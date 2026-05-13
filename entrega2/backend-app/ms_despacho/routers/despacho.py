from fastapi import APIRouter, HTTPException
from services.despacho_service import DespachoFacade

router = APIRouter(prefix="/despachos", tags=["Despacho"])
facade = DespachoFacade()

@router.post("/asignar-automatico/{id_pedido}")
async def asignar_automaticamente(id_pedido: str):
    try:
        return await facade.asignar_automaticamente(id_pedido)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/reasignar/{id_pedido}")
async def reasignar_pedido(id_pedido: str):
    try:
        return await facade.reasignar_pedido(id_pedido)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
