import json
from threading import Lock
from database.db import REPARTIDORES_FILE, read_lines, write_lines

class Repartidor:
    def __init__(self, id_rep: str, nombre: str, capacidad: float):
        self.id_rep = id_rep
        self.nombre = nombre
        self.capacidad = capacidad
        self.carga_actual = 0.0
        self.disponible = True
        self.ubicacion = "Base Central"

class RepartidorMapper:
    @staticmethod
    def to_txt(rep: Repartidor) -> str:
        return json.dumps(rep.__dict__)

    @staticmethod
    def to_domain(txt: str) -> Repartidor:
        data = json.loads(txt)
        rep = Repartidor(data["id_rep"], data["nombre"], data["capacidad"])
        rep.carga_actual = data["carga_actual"]
        rep.disponible = data["disponible"]
        rep.ubicacion = data["ubicacion"]
        return rep

class RepartidorRepository:
    def __init__(self):
        self.filepath = REPARTIDORES_FILE

    def save(self, rep: Repartidor):
        lines = read_lines(self.filepath)
        new_lines = []
        updated = False
        for line in lines:
            try:
                r = RepartidorMapper.to_domain(line)
                if r.id_rep == rep.id_rep:
                    new_lines.append(RepartidorMapper.to_txt(rep))
                    updated = True
                else:
                    new_lines.append(line)
            except Exception:
                new_lines.append(line)
        if not updated:
            new_lines.append(RepartidorMapper.to_txt(rep))
        write_lines(self.filepath, new_lines)

    def get_all(self):
        return [RepartidorMapper.to_domain(line) for line in read_lines(self.filepath)]

    def get_by_id(self, id_rep: str):
        for rep in self.get_all():
            if rep.id_rep == id_rep:
                return rep
        return None

    def delete(self, id_rep: str) -> bool:
        lines = read_lines(self.filepath)
        new_lines = []
        deleted = False
        for line in lines:
            try:
                r = RepartidorMapper.to_domain(line)
                if r.id_rep == id_rep:
                    deleted = True
                else:
                    new_lines.append(line)
            except Exception:
                new_lines.append(line)
        if deleted:
            write_lines(self.filepath, new_lines)
        return deleted

# Singleton Pattern
class SingletonMeta(type):
    _instances = {}
    _lock: Lock = Lock()
    def __call__(cls, *args, **kwargs):
        with cls._lock:
            if cls not in cls._instances:
                instance = super().__call__(*args, **kwargs)
                cls._instances[cls] = instance
        return cls._instances[cls]

class GestorRepartidores(metaclass=SingletonMeta):
    def __init__(self):
        self.repo = RepartidorRepository()

    def registrar_repartidor(self, id_rep: str, nombre: str, capacidad: float) -> Repartidor:
        if self.repo.get_by_id(id_rep):
            raise ValueError("Repartidor ya existe")
        rep = Repartidor(id_rep, nombre, capacidad)
        self.repo.save(rep)
        return rep

    def obtener_todos(self):
        return self.repo.get_all()

    def eliminar_repartidor(self, id_rep: str) -> bool:
        return self.repo.delete(id_rep)

    def actualizar_ubicacion(self, id_rep: str, ubicacion_gps: str) -> Repartidor:
        rep = self.repo.get_by_id(id_rep)
        if not rep:
            raise ValueError("Repartidor no encontrado")
        rep.ubicacion = ubicacion_gps
        self.repo.save(rep)
        return rep

    def actualizar_carga(self, id_rep: str, peso: float) -> Repartidor:
        rep = self.repo.get_by_id(id_rep)
        if not rep:
            raise ValueError("Repartidor no encontrado")
        if rep.carga_actual + peso > rep.capacidad:
            raise ValueError("Excede la capacidad del repartidor")
        rep.carga_actual = max(0.0, rep.carga_actual + peso)
        self.repo.save(rep)
        return rep
