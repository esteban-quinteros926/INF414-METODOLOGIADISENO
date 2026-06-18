import httpx
import asyncio

class DespachoFacade:
    def __init__(self):
        self.url_pedidos = "http://127.0.0.1:8001/pedidos"
        self.url_repartidores = "http://127.0.0.1:8002/repartidores"
        self.procesando_pedidos = set()

    async def asignar_automaticamente(self, id_pedido: str, excluir_repartidor: str = None, es_reasignacion: bool = False) -> dict:
        if id_pedido in self.procesando_pedidos:
            return {"status": "El pedido ya está siendo procesado", "repartidor": None}
            
        self.procesando_pedidos.add(id_pedido)
        try:
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

                # Si no es reasignación, y el pedido ya está asignado o en un estado final, rechazar
                if not es_reasignacion and pedido.get("estado") not in ["Creado", "Validado", "Pendiente de asignación"]:
                    return {"status": "El pedido ya está asignado o en un estado final", "repartidor": pedido.get("repartidor_asignado")}

                for rep in repartidores:
                    # Excluir explícitamente al repartidor anterior en caso de reasignación
                    if excluir_repartidor and rep["id_rep"] == excluir_repartidor:
                        continue
                    
                    if rep["disponible"] and (rep["carga_actual"] + pedido["peso"]) <= rep["capacidad"]:
                        # Asignar carga al repartidor
                        resp = await client.put(f"{self.url_repartidores}/{rep['id_rep']}/carga", json={"peso": pedido["peso"]})
                        if resp.status_code != 200:
                            continue # Si no se pudo actualizar la carga, intentamos con el siguiente
                        
                        # Actualizar estado del pedido de forma sincrónica
                        resp_estado = await client.put(f"{self.url_pedidos}/{id_pedido}/estado", json={
                            "nuevo_estado": "Asignado",
                            "repartidor_id": rep["id_rep"]
                        })
                        if resp_estado.status_code != 200:
                            print(f"[Error] No se pudo actualizar el estado del pedido {id_pedido} a Asignado con {rep['id_rep']}")
                        
                        # Publicar éxito en Tópico (Saga Pattern - Paso 2 Exitoso)
                        await client.post("http://127.0.0.1:8005/topics/estado_pedidos", json={
                            "payload": {
                                "id_pedido": id_pedido,
                                "estado": "Asignado",
                                "repartidor": rep["id_rep"]
                            }
                        })
                        print(f"[Event Bus] Publicado AsignacionExitosa en tópico 'estado_pedidos' para {id_pedido}")
                        return {"status": "Procesando Asignación", "repartidor": rep["id_rep"]}
                        
                # Actualizar estado a Pendiente de asignación de forma sincrónica si falla
                resp_estado = await client.put(f"{self.url_pedidos}/{id_pedido}/estado", json={
                    "nuevo_estado": "Pendiente de asignación",
                    "repartidor_id": None
                })
                if resp_estado.status_code != 200:
                    print(f"[Error] No se pudo actualizar el estado del pedido {id_pedido} a Pendiente de asignación")

                # Pendiente de asignación - Publicar fallo en Tópico (Saga Pattern - Paso 2 Fallido / Compensación)
                await client.post("http://127.0.0.1:8005/topics/estado_pedidos", json={
                    "payload": {
                        "id_pedido": id_pedido,
                        "estado": "Pendiente de asignación",
                        "repartidor": None
                    }
                })
                print(f"[Event Bus] Publicado AsignacionFallida en tópico 'estado_pedidos' para {id_pedido}")
                return {"status": "Pendiente de asignación", "repartidor": None}
        finally:
            self.procesando_pedidos.remove(id_pedido)

    async def reasignar_pedido(self, id_pedido: str) -> dict:
        repartidor_anterior = None
        async with httpx.AsyncClient() as client:
            resp_pedido = await client.get(f"{self.url_pedidos}/{id_pedido}")
            if resp_pedido.status_code != 200:
                raise ValueError("Pedido no encontrado")
            pedido = resp_pedido.json()

            repartidor_anterior = pedido.get("repartidor_asignado")
            if repartidor_anterior:
                # Liberar carga del repartidor anterior
                res_carga = await client.put(f"{self.url_repartidores}/{repartidor_anterior}/carga", json={"peso": -pedido["peso"]})
                if res_carga.status_code != 200:
                    print(f"[Warn] No se pudo liberar la carga para {repartidor_anterior}")
                
        return await self.asignar_automaticamente(id_pedido, excluir_repartidor=repartidor_anterior, es_reasignacion=True)

    async def entregar_pedido(self, id_pedido: str) -> dict:
        async with httpx.AsyncClient() as client:
            resp_pedido = await client.get(f"{self.url_pedidos}/{id_pedido}")
            if resp_pedido.status_code != 200:
                raise ValueError("Pedido no encontrado")
            pedido = resp_pedido.json()

            if pedido.get("estado") in ["Entregado", "Cancelado"]:
                return {"status": f"El pedido ya está {pedido.get('estado')}", "repartidor": pedido.get("repartidor_asignado")}

            if not pedido.get("repartidor_asignado"):
                raise ValueError("El pedido no tiene un repartidor asignado")

            # Liberar carga y actualizar estado a Entregado concurrentemente
            put_carga = client.put(f"{self.url_repartidores}/{pedido['repartidor_asignado']}/carga", json={"peso": -pedido["peso"]})
            put_estado = client.put(f"{self.url_pedidos}/{id_pedido}/estado", json={"nuevo_estado": "Entregado"})
            await asyncio.gather(put_carga, put_estado)
            
            return {"status": "Entregado", "repartidor": pedido["repartidor_asignado"]}
