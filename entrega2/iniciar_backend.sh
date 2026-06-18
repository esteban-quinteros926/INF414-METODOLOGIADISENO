#!/bin/bash

echo "Iniciando microservicios..."

OS="$(uname -s)"
PYTHON_CMD="python3"

if [ "$OS" = "Darwin" ]; then
    echo "Sistema operativo detectado: macOS"
    echo "Abriendo servicios en nuevas ventanas de terminal usando $PYTHON_CMD..."
    
    osascript -e 'tell app "Terminal" to do script "cd \"'$PWD'/backend-app/ms_pedidos\" && '$PYTHON_CMD' -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload"'
    osascript -e 'tell app "Terminal" to do script "cd \"'$PWD'/backend-app/ms_repartidores\" && '$PYTHON_CMD' -m uvicorn main:app --host 0.0.0.0 --port 8002 --reload"'
    osascript -e 'tell app "Terminal" to do script "cd \"'$PWD'/backend-app/ms_despacho\" && '$PYTHON_CMD' -m uvicorn main:app --host 0.0.0.0 --port 8003 --reload"'
    osascript -e 'tell app "Terminal" to do script "cd \"'$PWD'/backend-app/ms_incidencias\" && '$PYTHON_CMD' -m uvicorn main:app --host 0.0.0.0 --port 8004 --reload"'
    osascript -e 'tell app "Terminal" to do script "cd \"'$PWD'/backend-app/ms_broker\" && '$PYTHON_CMD' -m uvicorn main:app --host 0.0.0.0 --port 8005 --reload"'
    
    echo "Todos los microservicios han sido iniciados en nuevas ventanas."
    echo "Puedes cerrar las nuevas ventanas para detener los servicios."

else
    echo "Sistema operativo detectado: Linux/Unix"
    echo "Iniciando servicios en segundo plano usando $PYTHON_CMD..."
    
    cd backend-app/ms_pedidos && $PYTHON_CMD -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload &
    PID_PEDIDOS=$!
    cd ../../
    
    cd backend-app/ms_repartidores && $PYTHON_CMD -m uvicorn main:app --host 0.0.0.0 --port 8002 --reload &
    PID_REPARTIDORES=$!
    cd ../../
    
    cd backend-app/ms_despacho && $PYTHON_CMD -m uvicorn main:app --host 0.0.0.0 --port 8003 --reload &
    PID_DESPACHO=$!
    cd ../../
    
    cd backend-app/ms_incidencias && $PYTHON_CMD -m uvicorn main:app --host 0.0.0.0 --port 8004 --reload &
    PID_INCIDENCIAS=$!
    cd ../../

    cd backend-app/ms_broker && $PYTHON_CMD -m uvicorn main:app --host 0.0.0.0 --port 8005 --reload &
    PID_BROKER=$!
    cd ../../

    echo "========================================================"
    echo "Todos los microservicios han sido iniciados correctamente."
    echo "PRESIONA CTRL+C PARA DETENER TODOS LOS SERVICIOS"
    echo "========================================================"
    
    # Capturar CTRL+C para matar los procesos en segundo plano
    trap "echo 'Deteniendo servicios...'; kill $PID_PEDIDOS $PID_REPARTIDORES $PID_DESPACHO $PID_INCIDENCIAS $PID_BROKER; exit" SIGINT SIGTERM
    
    # Esperar a que los procesos terminen (mantiene el script corriendo)
    wait
fi
