# Resultados de Pruebas Unitarias

## Ejecución de Pruebas: `internal/auth`
- **Comando:** `go test ./internal/auth/...`
- **Resultado:** `PASS`
- **Detalle:**
    - `TestHashPassword`: PASSED
    - `TestCheckPassword`: PASSED

## Análisis de Lógica de Servicios (Simulado/Manual)
Dado que el `AuthService` depende directamente de implementaciones concretas de MongoDB (`UserRepo`), se han realizado pruebas de trazabilidad de flujo sobre el código:

1. **Login Flow**: 
   - Entrada: Email válido, Password correcto.
   - Expectativa: Generación de JWT y retorno de Usuario.
   - Resultado: Correcto (según flujo de código).
2. **Register Flow**: 
   - Entrada: Email existente.
   - Expectativa: Retorno de `ErrEmailExists`.
   - Resultado: Correcto (segmento líneas 58-61 de `auth_service.go`).
3. **Invalid Credentials**: 
   - Entrada: Password incorrecto.
   - Expectativa: Retorno de `ErrInvalidCredentials`.
   - Resultado: Correcto (segmento líneas 39-41 de `auth_service.go`).
