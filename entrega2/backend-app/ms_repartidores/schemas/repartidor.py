from pydantic import BaseModel

class RepartidorCreate(BaseModel):
    id_rep: str
    nombre: str
    capacidad: float

class RepartidorResponse(BaseModel):
    id_rep: str
    nombre: str
    capacidad: float
    carga_actual: float
    disponible: bool
    ubicacion: str

class UbicacionUpdate(BaseModel):
    ubicacion_gps: str

class CargaUpdate(BaseModel):
    peso: float
