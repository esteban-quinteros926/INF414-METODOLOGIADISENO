import httpx
import asyncio

class DespachoFacade:
    def __init__(self):
        self.url_pedidos = "http://localhost:8001/pedidos"
        self.url_repartidores = "http://localhost:8002/repartidores"

    async def asignar_automaticamente(self, id_pedido: str) -> dict:
        async with httpx.AsyncClient() as client:
            # Obtener pedido y repartidores concurrentemente
            req_pedido = client.get(f"{self.url_pedidos}/{id_pedido}")
            req_reps = client.get(self.url_repartidores)
            resp_pedido, resp_reps = await asyncio.gather(req_pedido, req_reps)

            if resp_pedido.status_code != 200:
                raise ValueError("Pedido no encontrado")
            pedido = resp_pedido.json()

            if resp_reps.status_code != 200:
                raise ValueError("No se pudieron obtener repartidores")
            repartidores = resp_reps.json()

            for rep in repartidores:
                if rep["disponible"] and (rep["carga_actual"] + pedido["peso"]) <= rep["capacidad"]:
                    # Asignar carga al repartidor y actualizar pedido concurrentemente
                    put_carga = client.put(f"{self.url_repartidores}/{rep['id_rep']}/carga", json={"peso": pedido["peso"]})
                    put_estado = client.put(f"{self.url_pedidos}/{id_pedido}/estado", json={"nuevo_estado": "Asignado", "repartidor_id": rep["id_rep"]})
                    await asyncio.gather(put_carga, put_estado)
                    
                    return {"status": "Asignado", "repartidor": rep["id_rep"]}
                    
            # Pendiente de asignación
            await client.put(f"{self.url_pedidos}/{id_pedido}/estado", json={"nuevo_estado": "Pendiente de asignación"})
            return {"status": "Pendiente de asignación", "repartidor": None}

    async def reasignar_pedido(self, id_pedido: str) -> dict:
        async with httpx.AsyncClient() as client:
            resp_pedido = await client.get(f"{self.url_pedidos}/{id_pedido}")
            if resp_pedido.status_code != 200:
                raise ValueError("Pedido no encontrado")
            pedido = resp_pedido.json()

            if pedido.get("repartidor_asignado"):
                # Liberar carga y volver a estado Validado concurrentemente
                put_carga = client.put(f"{self.url_repartidores}/{pedido['repartidor_asignado']}/carga", json={"peso": -pedido["peso"]})
                put_estado = client.put(f"{self.url_pedidos}/{id_pedido}/estado", json={"nuevo_estado": "Validado"})
                await asyncio.gather(put_carga, put_estado)
                
        return await self.asignar_automaticamente(id_pedido)
