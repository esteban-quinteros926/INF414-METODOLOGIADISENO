from abc import ABC, abstractmethod
import json
from database.db import PEDIDOS_FILE, read_lines, write_lines

# ==========================================
# 1. ENTIDADES BASE Y MÁQUINA DE ESTADOS
# ==========================================

class PedidoOperaciones:
    ESTADOS_PERMITIDOS = ["Creado", "Validado", "Pendiente de asignación", 
                          "Asignado", "En ruta", "Intento fallido", 
                          "Reprogramado", "Entregado", "Cancelado"]

    def __init__(self, id_pedido: str, destino: str, peso: float):
        self.id_pedido = id_pedido
        self.destino = destino
        self.peso = peso
        self.repartidor_asignado: str = None
        self._estado = "Validado" 

    @property
    def estado(self):
        return self._estado

    def transicionar_estado(self, nuevo_estado: str):
        if nuevo_estado not in self.ESTADOS_PERMITIDOS:
            raise ValueError(f"Estado {nuevo_estado} no existe.")
        if self._estado in ["Entregado", "Cancelado"]:
            raise ValueError(f"El pedido ya está {self._estado}, no puede cambiar a {nuevo_estado}.")
        if nuevo_estado == "En ruta" and not self.repartidor_asignado:
            raise ValueError("No puede pasar a 'En ruta' sin un repartidor asignado.")
        
        self._estado = nuevo_estado
        print(f"[Estado Pedido] {self.id_pedido} transiciona a: {self._estado}")

class OrdenVenta:
    def __init__(self, id_orden: str, canal: str):
        self.id_orden = id_orden
        self.canal = canal
        self.origen: str = None
        self.destino: str = None
        self.contacto: str = None
        self.peso: float = 0.0

# ==========================================
# 2. PATRONES CREACIONALES
# ==========================================

class IOrdenFactory(ABC):
    @abstractmethod
    def factory_method(self, id_orden: str) -> OrdenVenta: pass

class CreadorEcommerce(IOrdenFactory):
    def factory_method(self, id_orden: str) -> OrdenVenta:
        return OrdenVenta(id_orden, "E-Commerce")

class CreadorTiendaFisica(IOrdenFactory):
    def factory_method(self, id_orden: str) -> OrdenVenta:
        return OrdenVenta(id_orden, "Tienda Física")

class IOrdenBuilder(ABC):
    @property
    @abstractmethod
    def producto(self) -> OrdenVenta: pass
    
    @abstractmethod
    def reset(self, orden_base: OrdenVenta) -> None: pass
    
    @abstractmethod
    def set_ruta(self, origen: str, destino: str) -> 'IOrdenBuilder': pass
    
    @abstractmethod
    def set_contacto(self, contacto: str) -> 'IOrdenBuilder': pass
    
    @abstractmethod
    def set_logistica(self, peso: float) -> 'IOrdenBuilder': pass

class OrdenLogisticaBuilder(IOrdenBuilder):
    def __init__(self):
        self._orden = None

    def reset(self, orden_base: OrdenVenta) -> None:
        self._orden = orden_base

    @property
    def producto(self) -> OrdenVenta:
        return self._orden

    def set_ruta(self, origen: str, destino: str) -> 'IOrdenBuilder':
        self._orden.origen = origen
        self._orden.destino = destino
        return self

    def set_contacto(self, contacto: str) -> 'IOrdenBuilder':
        self._orden.contacto = contacto
        return self

    def set_logistica(self, peso: float) -> 'IOrdenBuilder':
        self._orden.peso = peso
        return self

# ==========================================
# 3. PATRONES ESTRUCTURALES
# ==========================================

class ITargetOperaciones(ABC):
    @abstractmethod
    def obtener_pedido_logistico(self) -> PedidoOperaciones: pass

class OrdenToPedidoAdapter(ITargetOperaciones):
    def __init__(self, orden_venta: OrdenVenta):
        self.adaptee = orden_venta
        self.validar_informacion()

    def validar_informacion(self):
        if not self.adaptee.origen or not self.adaptee.destino:
            raise ValueError("Falta dirección de origen o destino.")
        if not self.adaptee.contacto:
            raise ValueError("Falta medio de contacto.")
        if self.adaptee.peso <= 0:
            raise ValueError("Peso logístico inválido.")

    def obtener_pedido_logistico(self) -> PedidoOperaciones:
        return PedidoOperaciones(f"LOG-{self.adaptee.id_orden}", self.adaptee.destino, self.adaptee.peso)


# ==========================================
# 4. PATRONES DE ARQUITECTURA (Data Mapper y Repository)
# ==========================================

class PedidoMapper:
    @staticmethod
    def to_txt(pedido: PedidoOperaciones) -> str:
        data = {
            "id_pedido": pedido.id_pedido,
            "destino": pedido.destino,
            "peso": pedido.peso,
            "estado": pedido.estado,
            "repartidor_asignado": pedido.repartidor_asignado
        }
        return json.dumps(data)

    @staticmethod
    def to_domain(txt_line: str) -> PedidoOperaciones:
        data = json.loads(txt_line)
        pedido = PedidoOperaciones(data["id_pedido"], data["destino"], data["peso"])
        pedido._estado = data["estado"]
        pedido.repartidor_asignado = data.get("repartidor_asignado")
        return pedido

class PedidoRepository:
    def __init__(self):
        self.filepath = PEDIDOS_FILE

    def save(self, pedido: PedidoOperaciones):
        lines = read_lines(self.filepath)
        updated = False
        new_lines = []
        for line in lines:
            try:
                p = PedidoMapper.to_domain(line)
                if p.id_pedido == pedido.id_pedido:
                    new_lines.append(PedidoMapper.to_txt(pedido))
                    updated = True
                else:
                    new_lines.append(line)
            except Exception:
                new_lines.append(line)
        if not updated:
            new_lines.append(PedidoMapper.to_txt(pedido))
        write_lines(self.filepath, new_lines)

    def get_all(self):
        lines = read_lines(self.filepath)
        pedidos = []
        for line in lines:
            try:
                pedidos.append(PedidoMapper.to_domain(line))
            except Exception:
                pass
        return pedidos

    def get_by_id(self, id_pedido: str) -> PedidoOperaciones:
        pedidos = self.get_all()
        for p in pedidos:
            if p.id_pedido == id_pedido:
                return p
        return None

    def delete_all(self):
        from database.db import clear_file
        clear_file(self.filepath)

# ==========================================
# 5. SERVICE LAYER
# ==========================================

class PedidoService:
    def __init__(self):
        self.repo = PedidoRepository()

    def crear_pedido(self, data: dict) -> PedidoOperaciones:
        # 1. Factory
        if data["canal"] == "E-Commerce":
            factory = CreadorEcommerce()
        else:
            factory = CreadorTiendaFisica()
        
        orden_base = factory.factory_method(data["id_orden"])

        # 2. Builder
        builder = OrdenLogisticaBuilder()
        builder.reset(orden_base)
        builder.set_ruta(data["origen"], data["destino"]).set_contacto(data["contacto"]).set_logistica(data["peso"])
        orden_completa = builder.producto

        # 3. Adapter
        adapter = OrdenToPedidoAdapter(orden_completa)
        pedido_logistico = adapter.obtener_pedido_logistico()

        # 4. Save via Repository
        self.repo.save(pedido_logistico)
        
        # 5. Publicar evento a la Cola (Saga Pattern - Paso 1)
        import httpx
        try:
            httpx.post("http://127.0.0.1:8005/queues/asignacion_pedidos", json={
                "payload": {"id_pedido": pedido_logistico.id_pedido}
            })
            print(f"[Event Bus] Publicado PedidoCreado en cola 'asignacion_pedidos' para {pedido_logistico.id_pedido}")
        except Exception as e:
            print(f"[Event Bus] Error publicando a ms_broker: {e}")
            
        return pedido_logistico

    def obtener_todos(self):
        return self.repo.get_all()

    def obtener_por_id(self, id_pedido: str) -> PedidoOperaciones:
        return self.repo.get_by_id(id_pedido)

    def borrar_todos(self):
        self.repo.delete_all()

    def actualizar_estado(self, id_pedido: str, nuevo_estado: str, repartidor_id: str = None) -> PedidoOperaciones:
        pedido = self.repo.get_by_id(id_pedido)
        if not pedido:
            raise ValueError("Pedido no encontrado")
        
        if nuevo_estado in ["Creado", "Validado", "Pendiente de asignación", "Cancelado"]:
            pedido.repartidor_asignado = None
        elif repartidor_id:
            pedido.repartidor_asignado = repartidor_id
            
        pedido.transicionar_estado(nuevo_estado)
        self.repo.save(pedido)
        return pedido
