@echo off
echo Iniciando microservicios en ventanas separadas...

echo Iniciando MS Pedidos (8001)...
start "MS Pedidos (8001)" cmd /k "cd backend-app\ms_pedidos && py -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload"

echo Iniciando MS Repartidores (8002)...
start "MS Repartidores (8002)" cmd /k "cd backend-app\ms_repartidores && py -m uvicorn main:app --host 0.0.0.0 --port 8002 --reload"

echo Iniciando MS Despacho (8003)...
start "MS Despacho (8003)" cmd /k "cd backend-app\ms_despacho && py -m uvicorn main:app --host 0.0.0.0 --port 8003 --reload"

echo Iniciando MS Incidencias (8004)...
start "MS Incidencias (8004)" cmd /k "cd backend-app\ms_incidencias && py -m uvicorn main:app --host 0.0.0.0 --port 8004 --reload"

echo Todos los microservicios han sido iniciados correctamente.
echo Puedes cerrar las nuevas ventanas que se abrieron o presionar CTRL+C en ellas para detener un microservicio individualmente.
pause
