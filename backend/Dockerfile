# ==========================================
# Backend Dockerfile - Node.js + Express
# ==========================================

# Etapa 1: Construcción
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY . .

# Construir si hay script de build (opcional para TypeScript)
RUN if [ -f "tsconfig.json" ]; then npm run build; fi

# Etapa 2: Producción
FROM node:20-alpine

WORKDIR /app

# Copiar package.json e instalar solo dependencias de producción
COPY package*.json ./
RUN npm install --production

# Copiar código construido desde el builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3000

# Exponer puerto del backend
EXPOSE 3000

# Comando de inicio (ajustar según tu estructura)
CMD ["node", "src/index.js"]
