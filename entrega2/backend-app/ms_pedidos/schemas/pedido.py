from pydantic import BaseModel
from typing import Optional

class PedidoCreate(BaseModel):
    id_orden: str
    canal: str # "E-Commerce" o "Tienda Física"
    origen: str
    destino: str
    contacto: str
    peso: float

class PedidoResponse(BaseModel):
    id_pedido: str
    destino: str
    peso: float
    estado: str
    repartidor_asignado: Optional[str] = None

class EstadoUpdate(BaseModel):
    nuevo_estado: str
    repartidor_id: Optional[str] = None
