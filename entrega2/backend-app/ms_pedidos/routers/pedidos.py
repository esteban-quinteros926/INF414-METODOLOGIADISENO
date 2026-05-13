from fastapi import APIRouter, HTTPException
from schemas.pedido import PedidoCreate, PedidoResponse, EstadoUpdate
from services.pedido_service import PedidoService

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])
service = PedidoService()

@router.post("", response_model=PedidoResponse)
def crear_pedido(pedido: PedidoCreate):
    try:
        resultado = service.crear_pedido(pedido.dict())
        return {
            "id_pedido": resultado.id_pedido,
            "destino": resultado.destino,
            "peso": resultado.peso,
            "estado": resultado.estado,
            "repartidor_asignado": resultado.repartidor_asignado
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("", response_model=list[PedidoResponse])
def listar_pedidos():
    pedidos = service.obtener_todos()
    return [{
        "id_pedido": p.id_pedido,
        "destino": p.destino,
        "peso": p.peso,
        "estado": p.estado,
        "repartidor_asignado": p.repartidor_asignado
    } for p in pedidos]

@router.get("/{id}", response_model=PedidoResponse)
def consultar_pedido(id: str):
    pedido = service.obtener_por_id(id)
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    return {
        "id_pedido": pedido.id_pedido,
        "destino": pedido.destino,
        "peso": pedido.peso,
        "estado": pedido.estado,
        "repartidor_asignado": pedido.repartidor_asignado
    }

@router.put("/{id}/estado", response_model=PedidoResponse)
def transicionar_estado(id: str, update: EstadoUpdate):
    try:
        pedido = service.actualizar_estado(id, update.nuevo_estado, update.repartidor_id)
        return {
            "id_pedido": pedido.id_pedido,
            "destino": pedido.destino,
            "peso": pedido.peso,
            "estado": pedido.estado,
            "repartidor_asignado": pedido.repartidor_asignado
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("")
def borrar_todos_pedidos():
    try:
        service.borrar_todos()
        return {"message": "Todos los pedidos eliminados"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
