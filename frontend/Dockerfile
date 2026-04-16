# ==========================================
# ETAPA 1: Construcción (Builder)
# ==========================================
# Usamos una imagen de Node ligera (alpine)
FROM node:20-alpine AS builder

# Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos solo los archivos de dependencias primero 
# (Esto ayuda a que Docker use su caché y construya más rápido si no hay paquetes nuevos)
COPY package.json package-lock.json* ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto del código del proyecto
COPY . .

# Compilamos el proyecto de Vite (esto generará la carpeta /dist)
RUN npm run build

# ==========================================
# ETAPA 2: Producción (Servidor Web)
# ==========================================
# Usamos Nginx, un servidor web súper rápido y ligero
FROM nginx:alpine

# Copiamos SOLO la carpeta /dist de la Etapa 1 hacia la carpeta que Nginx usa para mostrar webs
COPY --from=builder /app/dist /usr/share/nginx/html

# (Opcional pero recomendado para Vite/React Router)
# Si usas React Router, necesitas decirle a Nginx que redirija el tráfico al index.html
# Si no usas router aún, puedes dejar esta línea, no hace daño.
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Exponemos el puerto 80 (el puerto web por defecto)
EXPOSE 80

# Iniciamos Nginx
CMD ["nginx", "-g", "daemon off;"]