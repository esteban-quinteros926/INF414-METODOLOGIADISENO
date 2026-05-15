# UV Protect - Guía de Ejecución

Este proyecto consiste en un sistema de logística de última milla desarrollado con una arquitectura de microservicios en el backend (FastAPI/Python) y una interfaz de usuario moderna en el frontend (Next.js/React).

A continuación, se detallan los pasos necesarios para ejecutar todo el sistema de manera local.

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado en tu sistema:
- **Python 3.8+** (Asegúrate de tener `pip` instalado)
- **Node.js 18+** (Incluye `npm`)
- **Git** (Opcional, para control de versiones)

---

## ⚙️ 1. Iniciar el Backend (Microservicios)

El backend consta de 4 microservicios que deben ejecutarse simultáneamente. 

### Instalación de dependencias
Abre una terminal en la raíz del proyecto y ejecuta el siguiente comando para instalar las librerías necesarias de Python:
```bash
pip install -r backend-app/requirements.txt
```

### Ejecución de los servicios
Hemos preparado scripts automatizados para levantar todos los servicios a la vez, dependiendo de tu sistema operativo:

**En Windows:**
Haz doble clic en el archivo `iniciar_backend.bat` o ejecútalo desde tu terminal CMD/PowerShell:
```cmd
.\iniciar_backend.bat
```
*(Esto abrirá 4 ventanas nuevas, una para cada microservicio).*

**En macOS / Linux:**
Abre una terminal, dale permisos de ejecución al script `.sh` y ejecútalo:
```bash
chmod +x iniciar_backend.sh
./iniciar_backend.sh
```
*(En macOS abrirá nuevas ventanas de terminal; en Linux ejecutará los servicios en segundo plano).*

### Puertos utilizados
Si la ejecución fue exitosa, los servicios estarán corriendo en los siguientes puertos locales:
- **MS Pedidos:** `http://localhost:8001`
- **MS Repartidores:** `http://localhost:8002`
- **MS Despacho:** `http://localhost:8003`
- **MS Incidencias:** `http://localhost:8004`

---

## 🌐 2. Iniciar el Frontend (Interfaz de Usuario)

La interfaz gráfica es una aplicación separada que se conecta a las APIs de los microservicios.

### Instalación de dependencias
Abre una **nueva pestaña o ventana** de tu terminal y navega a la carpeta del frontend:
```bash
cd frontend-app
```
Instala los paquetes de Node.js ejecutando:
```bash
npm install
```

### Ejecución del entorno de desarrollo
Una vez instaladas las dependencias, inicia el servidor de desarrollo de Next.js:
```bash
npm run dev
```

### Acceder a la aplicación
Abre tu navegador web favorito y dirígete a:
**[http://localhost:3000](http://localhost:3000)**

Desde allí podrás acceder a los diferentes perfiles del sistema (Administrador, Operador, Repartidor).

---

## 🛑 Detener la aplicación

- **Frontend:** Ve a la terminal donde ejecutaste `npm run dev` y presiona `CTRL + C`.
- **Backend (Windows):** Cierra las 4 ventanas de línea de comandos que se abrieron automáticamente.
- **Backend (macOS):** Cierra las 4 pestañas o ventanas de terminal generadas.
- **Backend (Linux):** Ve a la terminal donde ejecutaste el script `./iniciar_backend.sh` y presiona `CTRL + C`. Todos los procesos en segundo plano se detendrán automáticamente.
