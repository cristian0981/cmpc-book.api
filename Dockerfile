# Etapa de build
FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build


# Etapa de producción
FROM node:18-alpine as production

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev --legacy-peer-deps

# Copiar lo compilado desde builder
COPY --from=builder /app/dist ./dist

# Copiar cualquier otro archivo necesario (ej. migrations, .env si lo metes)
COPY --from=builder /app/node_modules ./node_modules

# Crear directorios para uploads
RUN mkdir -p uploads/ static/

EXPOSE 5000

CMD ["npm", "run", "start:prod"]
