# Manual de Usuario: Instalación, Descarga y Despliegue
## Plataforma "LimpiaTuCiudad"

Este manual técnico está destinado a administradores de sistemas, desarrolladores o usuarios que deseen instalar, ejecutar localmente o alojar la plataforma **LimpiaTuCiudad** en un servidor de producción.

---

## 1. Arquitectura y Tecnologías
La plataforma se divide en tres componentes principales:
1.  **Frontend:** Aplicación de cliente desarrollada en **React 18** (compilada con **Vite** y estilizada mediante **Tailwind CSS**).
2.  **Backend:** API REST robusta desarrollada en **Go** utilizando el enrutador **Chi**.
3.  **Base de Datos:** Base de datos NoSQL **MongoDB 6.0** para el almacenamiento y georreferenciación de los reportes.

---

## 2. Requisitos Previos del Sistema
Antes de comenzar, asegúrese de tener instalados los siguientes componentes en su PC o servidor:

*   **Git:** Para clonar y descargar el código del repositorio (versión 2.0+).
*   **Docker Desktop & Docker Compose (Recomendado):** Para ejecutar toda la infraestructura de manera rápida sin instalar lenguajes o bases de datos localmente.
*   **Node.js & npm (Solo para ejecución local sin Docker):** Versión LTS (Node 18 o superior).
*   **Go (Solo para ejecución local sin Docker):** Versión 1.20 o superior.
*   **MongoDB (Solo para ejecución local sin Docker):** Versión 6.0 o superior.

---

## 3. Descarga de la Aplicación

Existen dos métodos principales para obtener el código de la aplicación:

### Método A: Clonar usando Git (Recomendado)
Abra una terminal en su sistema y ejecute el siguiente comando para clonar el repositorio:
```bash
git clone https://github.com/ShadowRo0t/LimpiaTuCiudad.git
```
Una vez clonado, acceda a la carpeta raíz del proyecto:
```bash
cd LimpiaTuCiudad
```

### Método B: Descargar en formato ZIP
1.  Acceda al repositorio en la plataforma de control de versiones.
2.  Haga clic en el botón **Code** y seleccione **Download ZIP**.
3.  Descomprima el archivo `.zip` en la carpeta de su PC donde desee conservar la aplicación.
4.  Abra una consola de comandos (PowerShell, Command Prompt o Terminal de Linux) y navegue hasta dicha carpeta.

---

## 4. Instalación y Ejecución Local (Desarrollo)

Si desea ejecutar la aplicación en su PC local de forma directa sin usar Docker, siga estos pasos:

### 4.1 Preparación de la Base de Datos
Asegúrese de tener un servicio de MongoDB corriendo localmente en el puerto `27017` (puerto por defecto) sin autenticación configurada, o cree una base de datos en MongoDB Atlas y guarde la cadena de conexión (URI).

### 4.2 Configuración del Backend (Go)
1.  Navegue a la carpeta del backend:
    ```bash
    cd backend
    ```
2.  Instale las dependencias de Go:
    ```bash
    go mod tidy
    ```
3.  Inicie el backend:
    ```bash
    go run cmd/api/main.go
    ```
    El servidor backend se levantará e iniciará la API REST en `http://localhost:3000`.

### 4.3 Configuración del Frontend (React + Vite)
1.  Abra otra ventana de terminal en la raíz del proyecto.
2.  Navegue a la carpeta del frontend:
    ```bash
    cd frontend
    ```
3.  Instale las dependencias de Node.js:
    ```bash
    npm install
    ```
4.  Inicie el servidor de desarrollo de Vite:
    ```bash
    npm run dev
    ```
    *Nota: Por configuración predeterminada, Vite intentará abrir el puerto `3000`. Como el Backend de Go ya está ocupando dicho puerto, Vite le preguntará si desea usar el siguiente puerto libre (normalmente el `3001`). Presione `y` (Sí).*
    *La interfaz web de desarrollo se abrirá automáticamente en su navegador en `http://localhost:3001` (o el puerto asignado).*

---

## 5. Ejecución con Docker (Método Recomendado y Rápido)

La plataforma incluye una configuración de orquestación de contenedores mediante `docker-compose.yml`. Esta es la forma más rápida y recomendada de tener la aplicación funcionando en su PC o en un servidor con un solo comando.

### 5.1 Comandos Básicos de Docker Compose
Ejecute estos comandos desde la raíz del proyecto (donde se encuentra `docker-compose.yml`):

*   **Levantar e iniciar los servicios por primera vez (o reconstruirlos):**
    ```bash
    docker-compose up --build
    ```
*   **Ejecutar en segundo plano (Modo Detached):**
    Recomendado para dejar la aplicación corriendo en su PC o servidor liberando la consola.
    ```bash
    docker-compose up -d --build
    ```
*   **Verificar el estado de los contenedores:**
    ```bash
    docker-compose ps
    ```
*   **Monitorear los registros (logs) en tiempo real:**
    ```bash
    docker-compose logs -f
    ```
*   **Detener la aplicación:**
    ```bash
    docker-compose down
    ```
*   **Detener la aplicación y eliminar datos persistidos (Limpieza completa):**
    ```bash
    docker-compose down -v
    ```

### 5.2 Puertos y Acceso en Docker
Cuando use Docker Compose, los puertos están preconfigurados para no entrar en conflicto:
*   **Frontend (Cliente):** Accesible a través de [http://localhost:80](http://localhost:80) (o simplemente `http://localhost`).
*   **Backend (API REST):** Accesible en [http://localhost:3000](http://localhost:3000).
*   **MongoDB (Base de Datos):** Expuesta localmente en el puerto `27017`.

---

## 6. Alojamiento en un Servidor de Producción

Para desplegar de forma permanente **LimpiaTuCiudad** en un servidor en la nube (VPS en AWS, DigitalOcean, Linode, Google Cloud, Azure, etc.) bajo un sistema operativo basado en Linux (como Ubuntu Server), siga las siguientes directrices:

### 6.1 Configuración de Variables de Entorno
En entornos de producción, es fundamental proteger las claves y credenciales del sistema. Modifique la sección del servicio `backend` en el archivo `docker-compose.yml` o use un archivo `.env` en la raíz del servidor:

```yaml
backend:
  environment:
    - ENV=production
    - HTTP_ADDR=:3000
    - MONGO_URI=mongodb://database:27017 # Nombre del contenedor db en la red de docker
    - MONGO_DB=limpiatuciudad
    - JWT_SECRET=UN_SECRETO_SEGURO_Y_LARGO_DE_PRODUCCION # Reemplace esto con una clave criptográfica
```

### 6.2 Persistencia de Datos
El archivo `docker-compose.yml` ya cuenta con un volumen Docker llamado `mongo-data` asociado a la ruta `/data/db` de MongoDB. Esto garantiza que aunque los contenedores se actualicen, se apaguen o se reinicien, la información de los reportes y usuarios **no se perderá**.

### 6.3 Configuración de Proxy Inverso (Nginx y SSL/HTTPS)
Por motivos de seguridad, nunca se debe exponer el backend o frontend directamente a producción sin encriptación HTTPS. Se recomienda colocar un servidor **Nginx** como Proxy Inverso en la máquina anfitriona (host):

1.  Instale Nginx en su servidor:
    ```bash
    sudo apt update
    sudo apt install nginx
    ```
2.  Configure Nginx para redirigir el tráfico a los contenedores:
    Cree un archivo de configuración en `/etc/nginx/sites-available/limpiatuciudad` con la siguiente estructura:
    ```nginx
    server {
        listen 80;
        server_name tu-dominio.com; # Su dominio web

        # Redirección al Frontend de Docker
        location / {
            proxy_pass http://localhost:80;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        # Redirección a la API Backend de Docker
        location /api {
            proxy_pass http://localhost:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
    }
    ```
3.  Active el sitio y reinicie Nginx:
    ```bash
    sudo ln -s /etc/nginx/sites-available/limpiatuciudad /etc/nginx/sites-enabled/
    sudo systemctl restart nginx
    ```
4.  Instale **Certbot** y obtenga un certificado SSL gratuito de Let's Encrypt para forzar HTTPS seguro:
    ```bash
    sudo apt install certbot python3-certbot-nginx
    sudo certbot --nginx -d tu-dominio.com
    ```

Con esta configuración, la aplicación estará disponible de forma profesional y segura para todos los ciudadanos y el personal municipal en `https://tu-dominio.com`.
