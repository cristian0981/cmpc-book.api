# Usar Node.js 18 como imagen base
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias con --legacy-peer-deps para resolver conflictos
RUN npm ci --legacy-peer-deps --omit=dev

# Copiar código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# Exponer puerto
EXPOSE 5000

# Crear directorios para uploads
RUN mkdir -p uploads/books static/books

# Comando para iniciar la aplicación
CMD ["npm", "run", "start:prod"]