# Manual de Uso por Roles
## Plataforma "LimpiaTuCiudad"

Este documento es una guía práctica detallada del funcionamiento de la plataforma **LimpiaTuCiudad** desde la perspectiva de cada uno de sus tres actores principales: el **Ciudadano**, la **Municipalidad** y las **Cuadrillas (Escuadrones)**.

---

## 1. Introducción y Actores del Sistema

**LimpiaTuCiudad** es un ecosistema colaborativo para reportar e intervenir sobre problemas en el espacio público (baches, basura acumulada, luminarias rotas, etc.). Para lograrlo, el sistema distingue tres roles:

1.  **Ciudadano:** Genera los reportes urbanos georreferenciados, sube fotos del problema y realiza el seguimiento de la solución.
2.  **Municipalidad (Administración):** Recibe, prioriza, filtra y asigna los reportes a las cuadrillas especializadas según zona y tipo de incidente. Supervisa las estadísticas globales del municipio.
3.  **Cuadrilla/Escuadrón:** Recibe las tareas asignadas, visualiza las rutas de trabajo y reporta la finalización de los trabajos subiendo fotos de la evidencia.

---

## 2. Acceso al Sistema (Autenticación)

### 2.1 Registro de Ciudadanos
Cualquier vecino puede registrarse de forma gratuita para reportar incidentes:
1.  En la pantalla principal, presione **Crear Cuenta** (o acceda a `/register`).
2.  Complete los siguientes campos:
    *   **Nombre completo:** Su nombre y apellido.
    *   **Email:** Una dirección de correo válida (se utiliza para iniciar sesión).
    *   **Teléfono (opcional):** Teléfono de contacto para aclaraciones sobre reportes.
    *   **Contraseña:** Clave de acceso (mínimo 6 caracteres).
    *   **Confirmar contraseña:** Debe coincidir exactamente con la contraseña anterior.
3.  Presione **Crear Cuenta**. El sistema lo registrará e iniciará sesión automáticamente, redirigiéndolo a su panel de ciudadano.

### 2.2 Inicio de Sesión
1.  Ingrese su **Email** y **Contraseña** en el formulario de inicio de sesión (`/login`).
2.  Presione **Iniciar Sesión**.
3.  El sistema detectará su tipo de usuario y lo redirigirá a su interfaz correspondiente.

### 2.3 Credenciales de Demostración (Demos)
Para realizar pruebas rápidas y demostraciones de todas las interfaces, utilice las siguientes cuentas de prueba integradas:

*   **Ciudadano de Prueba:**
    *   *Email:* `juan@email.com`
    *   *Contraseña:* `123456`
*   **Administrador Municipal:**
    *   *Email:* `admin@municipalidad.gob`
    *   *Contraseña:* `admin123`
*   **Cuadrilla de Trabajo (Zona Norte):**
    *   *Email:* `cuadrilla.norte@servicios.gob`
    *   *Contraseña:* `cuadrilla123`

---

## 3. Guía del Ciudadano

Una vez dentro de la sección de **Ciudadano** (`/ciudadano`), dispondrá de un panel intuitivo con accesos directos y notificaciones en tiempo real.

### 3.1 Creación de un Nuevo Reporte
Para reportar un problema en la vía pública:
1.  Haga clic en el botón **Nuevo Reporte** desde su panel.
2.  **Seleccione el Tipo de Incidente:** Elija una de las categorías predefinidas (🛣️ Bache, 💡 Luminaria apagada, 🗑️ Acumulación de basura, 🌳 Árbol caído/Poda, 🕳️ Alcantarilla obstruida, 🚶 Vereda rota, 🚦 Señalización dañada, 🐛 Plagas, 💧 Pérdida de agua u 📋 Otro).
3.  **Descripción:** Detalle el incidente (ej. *"Bache profundo en el carril central que puede romper llantas y desestabilizar motos"*).
4.  **Ubicación (Georreferenciación):**
    *   **Usar mi ubicación:** Hace uso del GPS de su dispositivo móvil o PC para capturar las coordenadas automáticas exactas.
    *   **Seleccionar en mapa:** Abre un mapa interactivo para que pueda colocar un marcador manualmente sobre el lugar preciso del incidente.
    *   **Dirección o Referencia:** Ingrese la dirección aproximada (ej. *"Av. Rivadavia 4500, frente al local de electrodomésticos"*).
5.  **Subir Fotos (Opcional, Máx. 5):** Cargue fotos del problema desde su cámara o galería para que la municipalidad pueda verificarlo.
6.  **Validación de Duplicados:** Si el sistema detecta que otro ciudadano ya reportó un problema de la misma categoría en un radio cercano, le mostrará una advertencia para evitar reportes repetidos. Puede optar por cancelar su reporte para sumarse al seguimiento del existente.
7.  Haga clic en **Enviar Reporte**.

### 3.2 Mis Reportes y Seguimiento de Estado
En la sección **Mis Reportes**, verá todos sus reportes registrados con su respectivo estado en tiempo real:
*   **Pendiente (Gris/Amarillo):** El reporte ha sido recibido y está a la espera de revisión por el personal de la municipalidad.
*   **En Proceso (Azul):** La municipalidad ha revisado el caso, asignado una prioridad y enviado una cuadrilla específica para resolverlo.
*   **Resuelto (Verde):** La cuadrilla de reparación asistió al lugar, solucionó el problema y subió evidencia fotográfica del trabajo realizado.
*   **Rechazado/Duplicado (Rojo):** El reporte fue catalogado como duplicado de otro anterior o desestimado.

### 3.3 Notificaciones
Cuando la municipalidad priorice, asigne o la cuadrilla resuelva uno de sus reportes, recibirá notificaciones automáticas dentro de la campana de notificaciones de la plataforma para mantenerse siempre al tanto del progreso.

---

## 4. Guía del Administrador Municipal

La interfaz municipal (`/municipalidad`) está diseñada para computadoras de escritorio y tablets, ofreciendo una vista panorámica de la gestión de la ciudad.

### 4.1 Dashboard y KPIs
Al ingresar, el administrador tiene una vista rápida con indicadores clave de rendimiento (KPIs):
*   Total de reportes registrados.
*   Cantidad de reportes Pendientes, En Proceso, Resueltos y Duplicados.
*   **Tiempo promedio de resolución (en días):** Métrica fundamental para medir la eficiencia de los servicios públicos.
*   Gráficos circulares e histogramas que muestran la distribución por categorías e incidencias más comunes.

### 4.2 Bandeja de Gestión de Reportes
En la sección **Gestión de Reportes**, el administrador puede visualizar una tabla interactiva con todos los casos creados:
1.  **Filtros Avanzados:** Filtre reportes por Estado, Nivel de Prioridad, y Categoría de incidente.
2.  **Barra de Búsqueda:** Busque palabras clave, direcciones o el ID único del reporte.
3.  **Botón "Gestionar":** Al hacer clic, se abre una ventana modal con el detalle completo del reporte, fotos y mapa.

### 4.3 Acciones Administrativas sobre un Reporte
Desde la ventana modal de gestión, el administrador puede:
*   **Cambiar la Prioridad:** Reasignar el nivel de prioridad (Baja, Media, Alta o Crítica) que el sistema calcula automáticamente.
*   **Marcar como Duplicado:** Desestima el reporte marcándolo como duplicado (el estado pasará a rechazado para no generar tareas repetidas).
*   **Asignar una Cuadrilla:**
    *   El sistema muestra las cuadrillas disponibles en el municipio.
    *   Detalla el nombre de la cuadrilla, su **Zona** de cobertura asignada y su **Especialidad** (ej. *Especialidad: Bacheo*).
    *   Haga clic sobre la cuadrilla más idónea para asignarla. El reporte cambiará de estado automáticamente a **"En Proceso"**.

### 4.4 Analítica y Mapa de Calor
En la pestaña **Analítica**, el administrador puede interactuar con un mapa que muestra las zonas rojas o de mayor acumulación de incidentes (Mapa de Calor). Esto permite planificar tareas preventivas en los barrios más afectados.
Adicionalmente, se cuenta con la funcionalidad de **Exportación** (botones en el panel superior) que permite descargar los datos en formato **Excel** o **PDF** para generar informes externos.

---

## 5. Guía de la Cuadrilla de Trabajo

La interfaz de la cuadrilla (`/cuadrilla`) está diseñada bajo el enfoque **Mobile-First**, ideal para los operarios de calle que acceden a través de sus teléfonos móviles.

### 5.1 Bandeja de Tareas y Rutas
Al iniciar sesión, la cuadrilla visualizará:
*   Un mapa de la zona con las tareas asignadas representadas por pines geográficos.
*   Un listado ordenado de tareas pendientes de ejecución, estructuradas de forma óptima para minimizar los tiempos de viaje.

### 5.2 Detalle de Tarea
Al presionar una tarea, el operario accede al expediente del reporte que incluye:
*   Tipo de incidente, categoría y nivel de prioridad.
*   Descripción redactada por el ciudadano y fotos originales del incidente.
*   Dirección y mapa interactivo con la ubicación exacta para guiar la navegación del vehículo de la cuadrilla.

### 5.3 Completar Tarea y Subir Evidencia
Una vez finalizado el trabajo de reparación en el sitio:
1.  Desplácese a la sección **Completar Tarea**.
2.  **Notas de Finalización:** Ingrese notas adicionales sobre el trabajo realizado (ej. *"Bache tapado con mezcla asfáltica en frío, se utilizaron 3 bolsas"*).
3.  **Fotos de Evidencia (Obligatorio):** Presione el botón de la cámara para tomar una o varias fotos del trabajo terminado (o cárguelas desde la galería).
4.  Presione **Marcar como Completado**.
5.  El reporte pasará al estado **Resuelto**, se guardará la fecha/hora de finalización, se notificará al ciudadano y la tarea desaparecerá de la lista de pendientes de la cuadrilla.

### 5.4 Funcionamiento sin Conexión (Offline-First)
Dado que las cuadrillas trabajan en la vía pública donde la cobertura de red (datos móviles) puede ser inestable o nula:
*   **LimpiaTuCiudad** almacena localmente en el dispositivo la lista de tareas asignadas para que puedan ser visualizadas sin internet.
*   Si el operario completa una tarea y no cuenta con conexión, la acción de finalización se almacena temporalmente de forma local en la cola de **Acciones Pendientes**.
*   Tan pronto como el dispositivo detecte una conexión a internet estable, el sistema sincronizará automáticamente la información con el servidor, resolviendo el reporte de manera transparente sin pérdida de datos.
