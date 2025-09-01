# CMPC Bookstore API

API RESTful para el sistema de librería CMPC con NestJS, PostgreSQL y autenticación JWT.

## 📋 Requisitos Previos

- Node.js v18+
- PostgreSQL v12+ (o Docker)
- npm v8+
- Git

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone https://github.com/cristian0981/cmpc-book.api.git
cd cmpc-book.api
```

### 2. Instalar Dependencias

```bash
npm install --legacy-peer-deps
```

### 3. Configuración de Base de Datos

####  Base de Datos con Docker (Recomendado para desarrollo)

```bash
# Levantar solo la base de datos
npm run db:up

# Para detener la base de datos
npm run db:down
```



### 4. Configurar Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

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

### 6. Ejecutar la Aplicación

```bash
# Desarrollo
npm run start:dev


# Producción
npm run build
npm run start:prod
```

### 7. Verificar Instalación

- **API:** http://localhost:5000
- **Documentación Swagger:** http://localhost:5000/api/docs

## 🐳 Despliegue con Docker Completo

### Requisitos
- Docker v20.10+
- Docker Compose v2.0+

### Configuración

1. **Configurar `.env`** (usar la misma configuración de arriba)

2. **Ejecutar contenedores:**
```bash
npm run dev:full
```

```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run start:dev          # Iniciar en modo desarrollo
npm run start:debug        # Iniciar con debugger


```

## 📚 Características

- ✅ **CRUD Completo:** Libros, autores, géneros, editoriales
- ✅ **Autenticación JWT:** Con refresh tokens y roles
- ✅ **Exportación CSV:** Con paginación optimizada
- ✅ **Filtrado Avanzado:** Búsqueda, ordenamiento y paginación
- ✅ **Subida de Archivos:** Imágenes con validación
- ✅ **Soft Delete:** Eliminación lógica de registros
- ✅ **Documentación Swagger:** API completamente documentada
- ✅ **Testing Completo:** Unitarios e integración (80%+ cobertura)
- ✅ **Validación DTOs:** Validación robusta de datos
- ✅ **Manejo de Errores:** Sistema centralizado de errores
- ✅ **Guards y Decoradores:** Seguridad por roles
- ✅ **Interceptores:** Transformación de respuestas

## 🔐 Autenticación

### Endpoints de Autenticación

- `POST /auth/register` - Registro de usuarios
- `POST /auth/login` - Inicio de sesión
- `POST /auth/logout` - Cerrar sesión


## 📊 API Endpoints

### Libros
- `GET /api/books` - Listar libros (con filtros)
- `GET /api/books/:id` - Obtener libro por ID
- `POST /api/books` - Crear libro
- `PATCH /api/books/:id` - Actualizar libro
- `DELETE /api/books/:id` - Eliminar libro
- `GET /api/books/export/csv` - Exportar a CSV
- `GET /api/books/available` - Libros disponibles

### Autores
- `GET /api/authors` - Listar autores
- `GET /api/authors/:id` - Obtener autor por ID
- `POST /api/authors` - Crear autor
- `PATCH /api/authors/:id` - Actualizar autor
- `DELETE /api/authors/:id` - Eliminar autor

### Géneros
- `GET /api/genres` - Listar géneros
- `GET /api/genres/:id` - Obtener género por ID
- `POST /api/genres` - Crear género
- `PATCH /api/genres/:id` - Actualizar género
- `DELETE /api/genres/:id` - Eliminar género

### Editoriales
- `GET /api/editorials` - Listar editoriales
- `GET /api/editorials/:id` - Obtener editorial por ID
- `POST /api/editorials` - Crear editorial
- `PATCH /api/editorials/:id` - Actualizar editorial
- `DELETE /api/editorials/:id` - Eliminar editorial

### Archivos
- `POST /api/files/upload` - Subir archivo
- `GET /files/:filename` - Obtener archivo

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm run test

# Tests con cobertura
npm run test:cov

```


#### Aplicación Local
- Verificar que PostgreSQL esté ejecutándose
- Revisar variables de entorno en `.env`
- Comprobar que los puertos no estén ocupados
- Verificar permisos de directorios `uploads` y `static`

#### Errores de Autenticación
- Verificar que `JWT_SECRET` esté configurado
- Comprobar que las cookies estén habilitadas
- Revisar configuración de CORS
