# Etapa de build
FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./

# Instala TODAS las dependencias (incluye devDependencies para compilar)
RUN npm install --legacy-peer-deps

COPY . .

# Compila la aplicación
RUN npm run build


# Etapa de producción
FROM node:18-alpine as production

WORKDIR /app

COPY package*.json ./

# Instala solo dependencias de producción
RUN npm install --omit=dev --legacy-peer-deps


# Crear directorios para uploads
RUN mkdir -p uploads/ static/

EXPOSE 5000

CMD ["npm", "run", "start:prod"]
