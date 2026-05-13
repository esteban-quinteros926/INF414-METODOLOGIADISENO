from fastapi import APIRouter, HTTPException
from schemas.incidencia import IncidenciaCreate, IncidenciaResponse, ResolverUpdate
from services.incidencia_service import IncidenciaService

router = APIRouter(prefix="/incidencias", tags=["Incidencias"])
service = IncidenciaService()

@router.post("", response_model=IncidenciaResponse)
def registrar_incidencia(inc: IncidenciaCreate):
    try:
        r = service.crear_incidencia(inc.id_incidencia, inc.id_pedido, inc.problema)
        return r.__dict__
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("", response_model=list[IncidenciaResponse])
def listar_incidencias():
    rs = service.obtener_todos()
    return [r.__dict__ for r in rs]

@router.get("/{id}", response_model=IncidenciaResponse)
def consultar_incidencia(id: str):
    r = service.obtener_por_id(id)
    if not r:
        raise HTTPException(status_code=404, detail="Incidencia no encontrada")
    return r.__dict__

@router.put("/{id}/gestionar", response_model=IncidenciaResponse)
def gestionar_incidencia(id: str):
    try:
        r = service.gestionar_incidencia(id)
        return r.__dict__
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{id}/resolver", response_model=IncidenciaResponse)
def resolver_incidencia(id: str, payload: ResolverUpdate):
    try:
        r = service.resolver_incidencia(id, payload.resolucion)
        return r.__dict__
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("")
def borrar_todas_incidencias():
    try:
        service.borrar_todos()
        return {"message": "Todas las incidencias eliminadas"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
