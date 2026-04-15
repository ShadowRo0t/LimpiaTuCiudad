---
name: auth_credentials
description: Credenciales de demostración para testing de los 3 roles
type: reference
---

# Credenciales de Demostración

## Ciudadano
- Email: juan@email.com
- Password: 123456

## Municipalidad
- Email: admin@municipalidad.gob
- Password: admin123

## Cuadrilla
- Email: cuadrilla.norte@servicios.gob
- Password: cuadrilla123

**Why:** Permitir testing rápido de todas las funcionalidades sin registro manual.

**How to apply:**
- Usar estas credenciales para demostrar funcionalidades
- En producción, reemplazar con autenticación real (JWT)
- Los datos están en src/data/mockData.js
