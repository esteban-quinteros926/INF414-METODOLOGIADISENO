from pydantic import BaseModel
from typing import Optional

class IncidenciaCreate(BaseModel):
    id_incidencia: str
    id_pedido: str
    problema: str

class IncidenciaResponse(BaseModel):
    id_incidencia: str
    id_pedido: str
    problema: str
    estado: str
    resolucion: Optional[str] = None

class ResolverUpdate(BaseModel):
    resolucion: str
