# Documentación de Pruebas de Software - LimpiaTuCiudad

## 1. Introducción
Este documento detalla las pruebas realizadas al núcleo del backend de la aplicación LimpiaTuCiudad, enfocándose en los módulos de autenticación y gestión de usuarios.

## 2. Plan de Pruebas

### 2.1 Pruebas Unitarias: Módulo de Autenticación (`internal/auth`)
**Objetivo:** Validar que las funciones básicas de hashing y verificación de contraseñas funcionen correctamente antes de ser utilizadas por los servicios de nivel superior.

- **Prueba 1: `TestHashPassword`**
    - **Descripción:** Verifica que la función `HashPassword` procese la cadena de entrada sin errores.
    - **Razón:** El hashing es crítico para la seguridad de las credenciales.
    - **Expectativa:** La función debe retornar la contraseña procesada y no emitir errores.
    - **Resultado:** Exitoso.

- **Prueba 2: `TestCheckPassword`**
    - **Descripción:** Valida la comparación entre un hash guardado y una contraseña proporcionada.
    - **Razón:** Asegurar que el sistema de login no permita accesos no autorizados ni bloquee accesos correctos.
    - **Expectativa:** Retornar `true` si coinciden y `false` si son diferentes.
    - **Resultado:** Exitoso.

### 2.2 Análisis de Flujo: `AuthService`
Debido a la dependencia directa con MongoDB en la arquitectura actual, se realizó un análisis estático y de flujo para validar los siguientes casos de uso:

- **Caso: Registro de Ciudadano con Email Duplicado**
    - **Descripción:** Intento de registrar un usuario con un correo que ya existe en la base de datos.
    - **Razón:** Prevenir la creación de cuentas duplicadas para el mismo usuario.
    - **Expectativa:** El sistema debe detectar la existencia del email mediante `FindByEmail` y retornar `ErrEmailExists`.
    - **Resultado:** Validado en código (Líneas 58-61).

- **Caso: Login con Credenciales Inválidas**
    - **Descripción:** Intento de acceso con contraseña errónea.
    - **Razón:** Garantizar la seguridad del acceso a la cuenta.
    - **Expectativa:** `auth.CheckPassword` debe retornar `false`, provocando que el servicio devuelva `ErrInvalidCredentials`.
    - **Resultado:** Validado en código (Líneas 39-41).

## 3. Resultados Generales
El sistema demuestra robustez en la lógica de validación de credenciales y flujo de registro. Las pruebas unitarias del módulo de soporte (`auth`) pasaron satisfactoriamente.

Para ver el detalle técnico de la ejecución, consulte el archivo: [TEST_RESULTS.md](./TEST_RESULTS.md).