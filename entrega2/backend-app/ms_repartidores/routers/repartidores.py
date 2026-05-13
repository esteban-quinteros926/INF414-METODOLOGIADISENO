from fastapi import APIRouter, HTTPException
from schemas.repartidor import RepartidorCreate, RepartidorResponse, UbicacionUpdate, CargaUpdate
from services.repartidor_service import GestorRepartidores

router = APIRouter(prefix="/repartidores", tags=["Repartidores"])
gestor = GestorRepartidores()

@router.post("", response_model=RepartidorResponse)
def registrar_repartidor(rep: RepartidorCreate):
    try:
        r = gestor.registrar_repartidor(rep.id_rep, rep.nombre, rep.capacidad)
        return r.__dict__
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("", response_model=list[RepartidorResponse])
def listar_repartidores():
    return [r.__dict__ for r in gestor.obtener_todos()]

@router.put("/{id}/ubicacion", response_model=RepartidorResponse)
def actualizar_ubicacion(id: str, ubicacion: UbicacionUpdate):
    try:
        r = gestor.actualizar_ubicacion(id, ubicacion.ubicacion_gps)
        return r.__dict__
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{id}/carga", response_model=RepartidorResponse)
def actualizar_carga(id: str, carga: CargaUpdate):
    try:
        r = gestor.actualizar_carga(id, carga.peso)
        return r.__dict__
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{id}")
def eliminar_repartidor(id: str):
    exito = gestor.eliminar_repartidor(id)
    if not exito:
        raise HTTPException(status_code=404, detail="Repartidor no encontrado")
    return {"message": "Repartidor eliminado"}
