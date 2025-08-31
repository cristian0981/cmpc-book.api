# CMPC Bookstore API

API RESTful para el sistema de librería CMPC con NestJS, PostgreSQL y autenticación JWT.

## 🚀 Despliegue Local

### Requisitos
- Node.js v18+
- PostgreSQL v12+
- npm v8+

### Configuración

1. **Instalar dependencias:**
```bash
npm install --legacy-peer-deps
```

2. **Configurar PostgreSQL:**
```bash
# Con Docker
docker run --name bookstore_db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=cmpc_bookstore -p 5436:5432 -d postgres:17.6
```

3. **Crear archivo `.env`:**
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=cmpc_bookstore_jwt_secret_key_2024
JWT_REFRESH_SECRET=cmpc_bookstore_refresh_secret_key_2024
DB_HOST=localhost
DB_PORT=5436
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=cmpc_bookstore
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
HOST_API=http://localhost:5000
FILES_API=http://localhost:5000/files
CORS_ORIGIN=http://localhost:3000
PORT_DB=5436
```

4. **Crear directorios:**
```bash
mkdir uploads\
mkdir static\
```

5. **Ejecutar aplicación:**
```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

6. **Verificar:**
- API: http://localhost:5000
- Swagger: http://localhost:5000/api/docs

## 🐳 Despliegue con Docker

### Requisitos
- Docker v20.10+
- Docker Compose v2.0+

### Configuración

1. **Configurar `.env`** (usar la misma configuración de arriba)

2. **Ejecutar contenedores:**
```bash
docker-compose up --build -d
```

3. **Comandos útiles:**
```bash
# Ver logs
docker-compose logs -f

# Verificar estado
docker-compose ps

# Detener
docker-compose down

# Probar API
curl http://localhost:5000/api/books
```

## 🔧 Testing

```bash
# Tests unitarios
npm run test

# Cobertura
npm run test:cov


## 📚 Características

- ✅ CRUD completo (libros, autores, géneros, editoriales)
- ✅ Autenticación JWT con refresh tokens
- ✅ Exportación CSV con paginación
- ✅ Filtrado, búsqueda y ordenamiento
- ✅ Subida de imágenes
- ✅ Soft delete
- ✅ Documentación Swagger
- ✅ Testing unitario (80%+ cobertura)
- ✅ Validación con DTOs
- ✅ Manejo de errores centralizado

## 🛠️ Troubleshooting

**Docker:**
```bash
# Limpiar y reiniciar
docker-compose down -v
docker system prune -f
docker-compose up --build -d

# Verificar conectividad
docker-compose exec api ping db
```

**Local:**
- Verificar que PostgreSQL esté ejecutándose
- Revisar variables de entorno en `.env`
- Comprobar puertos disponibles

## 📄 Documentación API

Swagger disponible en: **http://localhost:5000/api/docs**