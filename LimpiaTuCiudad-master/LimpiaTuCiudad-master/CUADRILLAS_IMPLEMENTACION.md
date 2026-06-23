# Gestión de Cuadrillas - Guía de Implementación

## Lo que se ha agregado

Se han implementado las **Cuadrilla Sur** y **Cuadrilla Centro** además de la existente **Cuadrilla Norte**. 

### Archivos modificados/creados:

#### Backend

1. **backend/cmd/seed/main.go** (NUEVO)
   - Script de seed para inicializar todas las cuadrillas en MongoDB
   - Crea: Cuadrilla Norte, Sur y Centro
   
2. **backend/cmd/api/main.go** (MODIFICADO)
   - Agregados endpoints para gestionar cuadrillas:
     - `GET /api/cuadrillas` - Listar todas las cuadrillas
     - `GET /api/cuadrillas/{id}` - Obtener cuadrilla por ID
   - Actualizado mensaje de la API con nuevos endpoints

3. **backend/internal/domain/repo/repo.go** (MODIFICADO)
   - Agregados métodos al `UserRepo`:
     - `FindByID()` - Buscar usuario por ID
     - `FindByRole()` - Buscar usuarios por rol

4. **backend/internal/domain/user.go** (MODIFICADO)
   - Actualizado valor de `RoleCuadrilla` de "Cuadrilla" a "cuadrilla" (minúscula)
   - Actualizado valor de `RoleMunicipalidad` de "Municipalidad" a "municipalidad" (minúscula)
   - Ahora es consistente con el frontend

---

## Cuadrillas disponibles

### 1. **Cuadrilla Norte**
- **Email:** `cuadrilla.norte@servicios.gob`
- **Contraseña:** `cuadrilla123`
- **Zona:** Norte
- **Especialidad:** Infraestructura
- **Miembros:** 4

### 2. **Cuadrilla Sur** (NUEVA)
- **Email:** `cuadrilla.sur@servicios.gob`
- **Contraseña:** `cuadrilla123`
- **Zona:** Sur
- **Especialidad:** Servicios
- **Miembros:** 3

### 3. **Cuadrilla Centro** (NUEVA)
- **Email:** `cuadrilla.centro@servicios.gob`
- **Contraseña:** `cuadrilla123`
- **Zona:** Centro
- **Especialidad:** Limpieza
- **Miembros:** 5

---

## Pasos para implementar

### 1. Compilar y ejecutar el seed script

```bash
cd backend
go run cmd/seed/main.go
```

**Salida esperada:**
```
Connected to MongoDB at mongodb://...
✅ Cuadrilla 'Cuadrilla Norte' ya existe en la base de datos
✅ Cuadrilla 'Cuadrilla Sur' creada exitosamente (ID: 507f1f77bcf86cd799439011)
✅ Cuadrilla 'Cuadrilla Centro' creada exitosamente (ID: 507f1f77bcf86cd799439012)

🎉 Seed de cuadrillas completado
```

### 2. Compilar y ejecutar el backend

```bash
go run cmd/api/main.go
```

### 3. Verificar que las cuadrillas se crearon

```bash
# En tu navegador o usando curl:
curl http://localhost:8080/api/cuadrillas
```

**Salida esperada:**
```json
[
  {
    "id": "507f1f77bcf86cd799439010",
    "name": "Cuadrilla Norte",
    "email": "cuadrilla.norte@servicios.gob",
    "role": "cuadrilla",
    "specialty": "infraestructura",
    "zone": "Norte",
    "members": 4,
    "createdAt": "2024-03-20T10:15:00Z"
  },
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "Cuadrilla Sur",
    "email": "cuadrilla.sur@servicios.gob",
    "role": "cuadrilla",
    "specialty": "servicios",
    "zone": "Sur",
    "members": 3,
    "createdAt": "2024-03-20T10:16:00Z"
  },
  {
    "id": "507f1f77bcf86cd799439012",
    "name": "Cuadrilla Centro",
    "email": "cuadrilla.centro@servicios.gob",
    "role": "cuadrilla",
    "specialty": "limpieza",
    "zone": "Centro",
    "members": 5,
    "createdAt": "2024-03-20T10:17:00Z"
  }
]
```

---

## Acceder con las nuevas cuadrillas

En el **frontend**, puedes acceder con cualquiera de las cuadrillas:

1. Abre el login
2. Selecciona credenciales de demostración (o ingresa manualmente)
3. Usa cualquiera de los emails de cuadrilla:
   - `cuadrilla.norte@servicios.gob`
   - `cuadrilla.sur@servicios.gob` 
   - `cuadrilla.centro@servicios.gob`
4. Contraseña: `cuadrilla123`

---

## Notas importantes

- El **frontend ya tiene** la lógica para manejar las 3 cuadrillas (mockData.js)
- El **backend ahora puede** gestionar cuadrillas desde MongoDB
- Los datos están **sincronizados** entre frontend y backend
- Las cuadrillas pueden recibir tareas según su zona y especialidad
- El **seed script es idempotente**: solo crea cuadrillas que no existen

---

## Cambios de consistencia

Se corrigió la inconsistencia de mayúsculas en los roles:
- **Antes:** RoleCuadrilla = "Cuadrilla" (mayúscula)
- **Después:** RoleCuadrilla = "cuadrilla" (minúscula)

Esto ahora es consistente con el frontend y los estándares de la aplicación.
