# CarlBot - Sistema de Gestión de Eventos con WhatsApp

CarlBot es un sistema completo que combina un **bot de WhatsApp** con una **plataforma web administrativa** para la gestión de eventos académicos o empresariales. Inspirado en el bot del Aeropuerto El Dorado, permite gestionar eventos, horarios, suscripciones y envío de recordatorios automáticos.

## 🚀 Características Principales

### Bot de WhatsApp
- ✅ Respuestas automáticas con menú interactivo
- ✅ Información de eventos en tiempo real
- ✅ Consulta de horarios de ponencias
- ✅ Ubicación del evento con Google Maps
- ✅ Sistema de suscripciones/desuscripciones
- ✅ Recordatorios automáticos 5 minutos antes de cada ponencia
- ✅ Notificaciones de inicio de evento

### Plataforma Web
- ✅ Panel administrativo moderno con Astro + TailwindCSS
- ✅ Autenticación segura con JWT
- ✅ CRUD completo para eventos, ponentes y horarios
- ✅ Gestión de suscriptores por evento
- ✅ Configuración del número de teléfono del bot
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Sistema de pruebas de mensajes

## 🏗️ Arquitectura

El proyecto sigue **Clean Architecture** adaptada con principios **SOLID**:

```
src/
├── domain/              # Entidades y reglas de negocio
│   ├── entities/        # Entidades del dominio
│   └── repositories/    # Interfaces de repositorios
├── application/         # Casos de uso
│   └── use-cases/       # Lógica de aplicación
└── infrastructure/      # Implementaciones técnicas
    ├── database/        # Esquemas y conexión de DB
    ├── repositories/    # Implementación de repositorios
    ├── whatsapp/        # Servicio de WhatsApp (Baileys)
    ├── api/            # API REST con Express
    └── scheduler/       # Programador de recordatorios
```

## 🛠️ Stack Tecnológico

### Backend
- **Node.js** + **TypeScript**
- **Express.js** para API REST
- **Baileys** para conexión con WhatsApp (sin APIs de pago)
- **MySQL** como base de datos
- **Drizzle ORM** para manejo de datos
- **JWT** para autenticación
- **node-cron** para recordatorios automáticos

### Frontend
- **Astro** para renderizado rápido y moderno
- **TailwindCSS** para diseño responsive
- **Lucide Icons** para iconografía
- **TypeScript** para tipado fuerte

## 📋 Requisitos Previos

- **Node.js** v18 o superior
- **MySQL** v8.0 o superior
- **WhatsApp** instalado en un dispositivo móvil
- **Git** para clonar el repositorio

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/carlbot.git
cd carlbot
```

### 2. Instalar dependencias del backend
```bash
npm install
```

### 3. Configurar base de datos
```bash
# Crear base de datos MySQL
mysql -u root -p
CREATE DATABASE carlbot;
exit

# Copiar variables de entorno
cp .env.example .env
```

### 4. Configurar variables de entorno
Edita el archivo `.env`:
```env
# Configuración del servidor
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:4321

# Configuración de base de datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=carlbot

# JWT Secret (cambiar en producción)
JWT_SECRET=carlbot-secret-key-change-in-production
```

### 5. Ejecutar migraciones de base de datos
```bash
npm run db:generate
npm run db:push
```

### 6. Instalar dependencias del frontend
```bash
cd web
npm install
cd ..
```

### 7. Iniciar el sistema

**Terminal 1 - Backend:**
```bash
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run web:dev
```

## 📱 Configuración de WhatsApp

1. Inicia el backend con `npm run dev`
2. Aparecerá un código QR en la consola
3. Abre WhatsApp en tu teléfono
4. Ve a **Dispositivos vinculados** > **Vincular dispositivo**
5. Escanea el código QR
6. ¡El bot estará conectado!

## 🌐 Acceso al Sistema

### Panel Administrativo
- **URL:** http://localhost:4321
- **Usuario:** Tu número de teléfono del bot
- **Contraseña:** `Eventos.1286`

### API REST
- **URL:** http://localhost:3000
- **Documentación:** http://localhost:3000/health

## 💬 Comandos del Bot

Los usuarios pueden interactuar con el bot enviando:

- `hola` o `menu` - Mostrar menú principal
- `1` - Ver información del evento
- `2` - Ver horario de ponencias
- `3` - Ver ubicación del evento
- `4` - Suscribirse al evento
- `5` - Desuscribirse del evento

## 📊 Base de Datos

### Tablas principales:
- `events` - Información de eventos
- `speakers` - Ponentes y sus temas
- `schedules` - Horarios de ponencias
- `subscribers` - Suscriptores por evento
- `bot_settings` - Configuración del bot

## 🔧 Scripts Disponibles

```bash
# Backend
npm run dev         # Desarrollo con hot reload
npm run build       # Compilar TypeScript
npm run start       # Ejecutar versión compilada
npm run db:generate # Generar migraciones
npm run db:push     # Aplicar migraciones
npm run db:studio   # Abrir Drizzle Studio

# Frontend
npm run web:dev     # Desarrollo del frontend
npm run web:build   # Construir frontend para producción
```

## 📈 Funcionalidades Avanzadas

### Recordatorios Automáticos
- Se ejecutan cada minuto verificando ponencias próximas
- Envío automático 5 minutos antes de cada ponencia
- Notificaciones de inicio de evento

### Dashboard Administrativo
- Estadísticas en tiempo real
- Gestión completa de eventos y horarios
- Lista de suscriptores por evento
- Estado de conexión del bot

### API REST Completa
- Autenticación JWT
- CRUD de todas las entidades
- Endpoints para estadísticas
- Manejo de errores robusto

## 🔒 Seguridad

- Autenticación por JWT con expiración
- Contraseña fija configurable
- Validación de entrada en todos los endpoints
- Middleware de seguridad con Helmet
- CORS configurado para el frontend

## 🚀 Despliegue en Producción

### Preparación
```bash
# Backend
npm run build

# Frontend
cd web
npm run build
```

### Variables de entorno de producción
```env
NODE_ENV=production
JWT_SECRET=tu-secreto-super-seguro-aqui
DB_PASSWORD=tu-password-seguro
FRONTEND_URL=https://tu-dominio.com
```

## 🤝 Contribución

1. Fork del repositorio
2. Crear rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si encuentras algún problema:

1. Revisa que MySQL esté ejecutándose
2. Verifica las variables de entorno
3. Asegúrate de que WhatsApp esté conectado
4. Revisa los logs en la consola

### Problemas Comunes

**Error de conexión a WhatsApp:**
- Verifica que el código QR se haya escaneado correctamente
- Reinicia el backend si es necesario

**Error de base de datos:**
- Verifica que MySQL esté ejecutándose
- Confirma que las credenciales en `.env` sean correctas

**Error de autenticación:**
- Usa la contraseña exacta: `Eventos.1286`
- Verifica que el número de teléfono sea el del bot conectado

## 🌟 Roadmap

- [ ] Notificaciones push web
- [ ] Exportación de datos a Excel
- [ ] Múltiples eventos simultáneos
- [ ] Integración con calendarios
- [ ] Templates de mensajes personalizables
- [ ] Métricas avanzadas y analytics

---

**Desarrollado con ❤️ para la gestión eficiente de eventos académicos y empresariales.**