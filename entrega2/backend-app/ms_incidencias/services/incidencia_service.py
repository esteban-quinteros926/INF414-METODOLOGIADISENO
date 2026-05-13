import json
from abc import ABC, abstractmethod
from database.db import INCIDENCIAS_FILE, read_lines, write_lines

class IIncidencia(ABC):
    @abstractmethod
    def gestionar(self): pass
    
    @abstractmethod
    def resolver(self, resolucion: str): pass

class ReclamoBase(IIncidencia):
    def __init__(self, id_incidencia: str, id_pedido: str, problema: str, estado="Abierta", resolucion=None):
        self.id_incidencia = id_incidencia
        self.id_pedido = id_pedido
        self.problema = problema
        self.estado = estado
        self.resolucion = resolucion

    def gestionar(self):
        self.estado = "En análisis"

    def resolver(self, resolucion: str):
        self.resolucion = resolucion
        self.estado = "Resuelta"

class BaseDecorator(IIncidencia):
    def __init__(self, componente: IIncidencia):
        self._componente = componente

    def gestionar(self):
        self._componente.gestionar()

    def resolver(self, resolucion: str):
        self._componente.resolver(resolucion)

class CompensacionDecorator(BaseDecorator):
    def resolver(self, resolucion: str):
        super().resolver(resolucion)
        # Acción Automática
        print("[Postventa] Acción Automática: Emitiendo cupón de compensación al cliente.")

class IncidenciaMapper:
    @staticmethod
    def to_txt(inc: ReclamoBase) -> str:
        return json.dumps({
            "id_incidencia": inc.id_incidencia,
            "id_pedido": inc.id_pedido,
            "problema": inc.problema,
            "estado": inc.estado,
            "resolucion": inc.resolucion
        })

    @staticmethod
    def to_domain(txt: str) -> ReclamoBase:
        data = json.loads(txt)
        return ReclamoBase(
            data["id_incidencia"],
            data["id_pedido"],
            data["problema"],
            data["estado"],
            data["resolucion"]
        )

class IncidenciaRepository:
    def __init__(self):
        self.filepath = INCIDENCIAS_FILE

    def save(self, inc: ReclamoBase):
        lines = read_lines(self.filepath)
        new_lines = []
        updated = False
        for line in lines:
            try:
                i = IncidenciaMapper.to_domain(line)
                if i.id_incidencia == inc.id_incidencia:
                    new_lines.append(IncidenciaMapper.to_txt(inc))
                    updated = True
                else:
                    new_lines.append(line)
            except Exception:
                new_lines.append(line)
        if not updated:
            new_lines.append(IncidenciaMapper.to_txt(inc))
        write_lines(self.filepath, new_lines)

    def get_by_id(self, id_incidencia: str) -> ReclamoBase:
        lines = read_lines(self.filepath)
        for line in lines:
            try:
                i = IncidenciaMapper.to_domain(line)
                if i.id_incidencia == id_incidencia:
                    return i
            except:
                pass
        return None

    def get_all(self):
        lines = read_lines(self.filepath)
        return [IncidenciaMapper.to_domain(line) for line in lines if line.strip()]

    def delete_all(self):
        from database.db import clear_file
        clear_file(self.filepath)

class IncidenciaService:
    def __init__(self):
        self.repo = IncidenciaRepository()

    def crear_incidencia(self, id_incidencia: str, id_pedido: str, problema: str) -> ReclamoBase:
        if self.repo.get_by_id(id_incidencia):
            raise ValueError("Incidencia ya existe")
        inc = ReclamoBase(id_incidencia, id_pedido, problema)
        self.repo.save(inc)
        return inc

    def obtener_por_id(self, id_incidencia: str) -> ReclamoBase:
        return self.repo.get_by_id(id_incidencia)

    def obtener_todos(self):
        return self.repo.get_all()

    def borrar_todos(self):
        self.repo.delete_all()

    def gestionar_incidencia(self, id_incidencia: str) -> ReclamoBase:
        inc = self.repo.get_by_id(id_incidencia)
        if not inc:
            raise ValueError("Incidencia no encontrada")
        inc.gestionar()
        self.repo.save(inc)
        return inc

    def resolver_incidencia(self, id_incidencia: str, resolucion: str) -> ReclamoBase:
        inc = self.repo.get_by_id(id_incidencia)
        if not inc:
            raise ValueError("Incidencia no encontrada")
        
        # Aplicamos el Decorator para la resolución
        decorator = CompensacionDecorator(inc)
        decorator.resolver(resolucion)
        
        # Guardamos el estado base (que fue modificado a través del decorator)
        self.repo.save(inc)
        return inc
