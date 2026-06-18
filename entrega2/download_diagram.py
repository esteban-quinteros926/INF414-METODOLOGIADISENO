import urllib.request

mermaid_code = """
flowchart TD
    classDef client fill:#f9f,stroke:#333,stroke-width:2px;
    classDef service fill:#bbf,stroke:#333,stroke-width:2px;
    classDef broker fill:#fbf,stroke:#333,stroke-width:2px;
    classDef db_nosql fill:#dfd,stroke:#333,stroke-width:2px,stroke-dasharray: 5 5;
    classDef db_sql fill:#ddf,stroke:#333,stroke-width:2px;
    
    Client["💻 Cliente Frontend / App"]:::client

    subgraph "Microservicios (Python / FastAPI)"
        Pedidos["📦 MS Pedidos (Puerto 8001)\\n(Bounded Context: Ventas)"]:::service
        Repartidores["🚚 MS Repartidores (Puerto 8002)\\n(Bounded Context: Operaciones)"]:::service
        Despacho["⚙️ MS Despacho (Puerto 8003)\\n(Bounded Context: Operaciones)"]:::service
        Incidencias["⚠️ MS Incidencias (Puerto 8004)\\n(Bounded Context: Soporte)"]:::service
    end

    subgraph "Message Broker (Simulado - Puerto 8005)"
        Broker["🔄 MS Broker (Event Bus)"]:::broker
        Cola["📥 Cola (Queue)\\nasignacion_pedidos"]
        Topico["📢 Tópico (Pub/Sub)\\nestado_pedidos"]
        Broker --- Cola
        Broker --- Topico
    end

    subgraph "Capa de Persistencia (Archivos .txt simulados)"
        DB_Pedidos[("📄 DB Pedidos\\n(Simula NoSQL Documental)\\nConsistencia Eventual")]:::db_nosql
        DB_Repartidores[("🗄️ DB Repartidores\\n(Simula SQL Relacional)\\nConsistencia Fuerte ACID")]:::db_sql
        DB_Incidencias[("📄 DB Incidencias\\n(Simula NoSQL)")]:::db_nosql
    end

    Client -- "REST / HTTP" --> Pedidos
    Client -- "REST / HTTP" --> Incidencias
    Client -- "REST / HTTP" --> Repartidores

    Pedidos -- "File I/O" --> DB_Pedidos
    Repartidores -- "File I/O" --> DB_Repartidores
    Incidencias -- "File I/O" --> DB_Incidencias

    Pedidos -- "1. POST (Publica PedidoCreado)" --> Cola
    Cola -- "2. GET (Polling / Consumidor único)" --> Despacho
    
    Despacho -- "3. PUT (Reserva capacidad)" --> Repartidores
    
    Despacho -- "4. POST (Publica Éxito/Fallo)" --> Topico
    Topico -- "5. GET (Polling Fan-out)" --> Pedidos
    Topico -- "5. GET (Polling Fan-out)" --> Incidencias
"""

try:
    req = urllib.request.Request(
        'https://kroki.io/mermaid/png',
        data=mermaid_code.encode('utf-8'),
        headers={'Content-Type': 'text/plain', 'User-Agent': 'Mozilla/5.0'}
    )
    with urllib.request.urlopen(req) as response:
        with open(r'C:\Users\sebas\.gemini\antigravity\brain\af1004b7-609f-4b8c-81c6-bfbf97ea1472\diagrama.png', 'wb') as f:
            f.write(response.read())
    print("Success")
except Exception as e:
    print(f"Error: {e}")
