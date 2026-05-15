# Análisis de Arquitectura, Patrones de Diseño y Principios SOLID

Este documento presenta el análisis detallado del proyecto de logística y despachos, identificando los patrones arquitectónicos, patrones de diseño implementados (verificando su estructura según Refactoring Guru), y la aplicación de los principios SOLID.

---

## 1. Patrones Arquitectónicos Utilizados

### Arquitectura de Microservicios
El sistema está dividido en servicios pequeños y autónomos que se comunican entre sí.
- **Evidencia**: Se observan directorios independientes para `ms_pedidos`, `ms_repartidores`, `ms_despacho` y `ms_incidencias`, junto con un `frontend-app`.
- **Comunicación**: Se utiliza HTTP/REST asíncrono para la comunicación entre ellos (ej. `DespachoFacade` haciendo peticiones con `httpx`).

### Arquitectura en Capas (N-Tier) / Controller-Service-Repository
Dentro de cada microservicio, el código se organiza en capas separadas para mantener las responsabilidades divididas.
- **Routers (`routers/`)**: Actúan como controladores, exponiendo los endpoints (ej. FastAPI).
- **Servicios (`services/`)**: Contienen la lógica de negocio pura.
- **Datos (`database/`, `schemas/`)**: Manejan el acceso a datos y la definición de estructuras.

### Service Layer Pattern
Este patrón arquitectónico se encuentra implementado a la perfección a través de las clases en las carpetas `services/` (ej. `PedidoService`).
- **Orquestación**: La capa de servicios coordina las operaciones complejas (ej. `crear_pedido` orquesta el uso de Factory, Builder, Adapter y Repository en un solo flujo de trabajo).
- **Frontera Estricta (Boundary)**: Aísla la capa web (FastAPI en `routers/`) de la capa de datos. Los controladores jamás interactúan directamente con el Repositorio.
- **Encapsulamiento de Reglas**: Todas las reglas de negocio y validaciones (ej. verificar si un pedido puede transicionar a un nuevo estado antes de guardarlo) se definen y gestionan exclusivamente en esta capa.

### Data Mapper y Repository Pattern
Se separa la lógica de dominio de los detalles de persistencia (en este caso, archivos `.txt`).
- **Data Mapper**: Transforma objetos de dominio en texto plano y viceversa (ej. `PedidoMapper`, `RepartidorMapper`).
- **Repository**: Proporciona una interfaz similar a una colección para acceder a los datos persistidos (ej. `PedidoRepository`, `IncidenciaRepository`).

---

## 2. Patrones de Diseño (Validación según Refactoring Guru)

### Patrones Creacionales

#### Factory Method
- **Ubicación**: `ms_pedidos/services/pedido_service.py`
- **Refactoring Guru**: Define una interfaz para crear un objeto, pero deja que las subclases decidan qué clase instanciar.
- **Estructura en el código**: `IOrdenFactory` es el Creador abstracto. `CreadorEcommerce` y `CreadorTiendaFisica` son los creadores concretos que instancian `OrdenVenta`.
- **Validación**: **Sí, sigue la estructura.** Permite extender el sistema agregando nuevos canales de venta sin modificar el código cliente.
```python
class IOrdenFactory(ABC):
    @abstractmethod
    def factory_method(self, id_orden: str) -> OrdenVenta: pass

class CreadorEcommerce(IOrdenFactory):
    def factory_method(self, id_orden: str) -> OrdenVenta:
        return OrdenVenta(id_orden, "E-Commerce")
```

#### Builder
- **Ubicación**: `ms_pedidos/services/pedido_service.py`
- **Refactoring Guru**: Permite construir objetos complejos paso a paso. Separa la construcción de su representación.
- **Estructura en el código**: `IOrdenBuilder` define los pasos. `OrdenLogisticaBuilder` implementa la construcción de la orden.
- **Validación**: **Sí, sigue la estructura.** Aunque el servicio asume el rol de Director, el patrón central de construcción por pasos (ej. `.set_ruta().set_contacto()`) es exacto.
```python
class OrdenLogisticaBuilder(IOrdenBuilder):
    def set_ruta(self, origen: str, destino: str) -> 'IOrdenBuilder':
        self._orden.origen = origen
        self._orden.destino = destino
        return self
```

#### Singleton
- **Ubicación**: `ms_repartidores/services/repartidor_service.py`
- **Refactoring Guru**: Garantiza que una clase tenga una única instancia y proporciona un punto de acceso global.
- **Estructura en el código**: Utiliza una metaclase `SingletonMeta` con un `Lock` para garantizar seguridad en hilos (Thread-safe).
- **Validación**: **Sí, sigue la estructura.** Es la implementación más recomendada y robusta en Python para Singleton.
```python
class SingletonMeta(type):
    _instances = {}
    _lock: Lock = Lock()
    def __call__(cls, *args, **kwargs):
        with cls._lock:
            if cls not in cls._instances:
                instance = super().__call__(*args, **kwargs)
                cls._instances[cls] = instance
        return cls._instances[cls]

class GestorRepartidores(metaclass=SingletonMeta): ...
```

### Patrones Estructurales

#### Adapter
- **Ubicación**: `ms_pedidos/services/pedido_service.py`
- **Refactoring Guru**: Permite la colaboración entre objetos con interfaces incompatibles.
- **Estructura en el código**: `OrdenToPedidoAdapter` toma un objeto `OrdenVenta` (incompatible directamente con la logística) y lo adapta a `PedidoOperaciones` a través de `ITargetOperaciones`.
- **Validación**: **Sí, sigue la estructura (Object Adapter).**
```python
class OrdenToPedidoAdapter(ITargetOperaciones):
    def __init__(self, orden_venta: OrdenVenta):
        self.adaptee = orden_venta

    def obtener_pedido_logistico(self) -> PedidoOperaciones:
        return PedidoOperaciones(f"LOG-{self.adaptee.id_orden}", self.adaptee.destino, self.adaptee.peso)
```

#### Facade
- **Ubicación**: `ms_despacho/services/despacho_service.py`
- **Refactoring Guru**: Proporciona una interfaz simplificada a un sistema complejo de clases o frameworks.
- **Estructura en el código**: `DespachoFacade` simplifica la compleja orquestación asíncrona de obtener pedidos, evaluar repartidores disponibles y actualizar estados en múltiples microservicios.
- **Validación**: **Sí, sigue la estructura.** El cliente final solo llama a `asignar_automaticamente` y la Facade maneja toda la complejidad HTTP y asincronía subyacente.
```python
class DespachoFacade:
    async def asignar_automaticamente(self, id_pedido: str) -> dict:
        # Orquestación de llamadas a ms_pedidos y ms_repartidores
        # y lógica de asignación...
```

#### Decorator
- **Ubicación**: `ms_incidencias/services/incidencia_service.py`
- **Refactoring Guru**: Permite añadir funcionalidades a objetos colocando estos objetos dentro de objetos encapsuladores especiales que contienen los comportamientos.
- **Estructura en el código**: `IIncidencia` (Componente Base), `ReclamoBase` (Componente Concreto), `BaseDecorator` (Decorador Base), `CompensacionDecorator` (Decorador Concreto).
- **Validación**: **Sí, sigue la estructura rigurosamente.** Añade la funcionalidad de "emitir cupón de compensación" dinámicamente al resolver una incidencia.
```python
class BaseDecorator(IIncidencia):
    def __init__(self, componente: IIncidencia):
        self._componente = componente
    # ...

class CompensacionDecorator(BaseDecorator):
    def resolver(self, resolucion: str):
        super().resolver(resolucion) # Llama al original
        print("Acción Automática: Emitiendo cupón...") # Añade comportamiento
```

---

## 3. Cumplimiento de Principios SOLID

El proyecto muestra un fuerte apego a los principios de diseño SOLID:

### S - Single Responsibility Principle (Principio de Responsabilidad Única)
Cada clase debe tener una sola razón para cambiar.
- **¿Se cumple?** **Sí.**
- **Dónde**: 
  - `PedidoMapper`: Solo se encarga de transformar objetos a texto y viceversa.
  - `PedidoRepository`: Solo se encarga de la lectura/escritura en el archivo `pedidos.txt`.
  - `PedidoService`: Solo orquesta la lógica de negocio, delegando el guardado al repositorio y la creación a los Factory/Builders.

### O - Open/Closed Principle (Principio de Abierto/Cerrado)
Las entidades deben estar abiertas para su extensión, pero cerradas para su modificación.
- **¿Se cumple?** **Sí.**
- **Dónde**: En el patrón **Decorator** de `ms_incidencias`. Si el día de mañana se quiere agregar una acción automática que envíe un SMS de disculpas, se puede crear un `SMSDecorator` que extienda de `BaseDecorator` sin necesidad de modificar el código original de `ReclamoBase`.
- **Dónde**: En el patrón **Factory Method** de `ms_pedidos`. Si aparece un nuevo canal de venta "Venta Telefónica", se crea `CreadorVentaTelefonica` implementando `IOrdenFactory` sin tocar las fábricas existentes.

### L - Liskov Substitution Principle (Principio de Sustitución de Liskov)
Las clases derivadas deben poder sustituir a sus clases base sin alterar el correcto funcionamiento del programa.
- **¿Se cumple?** **Sí.**
- **Dónde**: En el patrón **Decorator**. `BaseDecorator` y `CompensacionDecorator` implementan `IIncidencia`. En `IncidenciaService`, cuando se crea un `CompensacionDecorator(inc)`, este objeto se comporta exactamente como la interfaz `IIncidencia` espera (tiene `gestionar()` y `resolver()`), por lo que puede sustituir a un `ReclamoBase` sin romper el código cliente.

### I - Interface Segregation Principle (Principio de Segregación de Interfaces)
Los clientes no deben ser forzados a depender de interfaces que no utilizan.
- **¿Se cumple?** **Sí.**
- **Dónde**: El sistema utiliza clases abstractas pequeñas y altamente cohesivas. Por ejemplo, `IOrdenFactory` solo expone `factory_method`. No obliga a las fábricas a implementar métodos que no necesitan. Del mismo modo, `ITargetOperaciones` solo exige `obtener_pedido_logistico()`.

### D - Dependency Inversion Principle (Principio de Inversión de Dependencias)
Los módulos de alto nivel no deben depender de los módulos de bajo nivel. Ambos deben depender de abstracciones.
- **¿Se cumple?** **Sí.**
- **Dónde**: En `ms_pedidos/services/pedido_service.py`, la lógica de alto nivel para crear un pedido utiliza las abstracciones `IOrdenFactory`, `IOrdenBuilder` e `ITargetOperaciones` en lugar de instanciar clases concretas directamente de forma monolítica. Esto desacopla la construcción y adaptación de los objetos de su flujo de ejecución principal.
