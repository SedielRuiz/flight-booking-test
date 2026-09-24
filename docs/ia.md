# Uso de Inteligencia Artificial

El uso de herramientas de Inteligencia Artificial fue fundamental para acelerar la etapa de scaffolding inicial del proyecto, aunque requirió de constante revisión y criterio técnico para asegurar que la arquitectura y la configuración cumplieran con los estándares empresariales esperados.

## 1. Herramientas de IA utilizadas
- **Modelo:** Google Gemini / DeepMind Antigravity (asistente de código integrado).
- **Uso:** Generación de código base (NestJS, Angular), escritura inicial de Dockerfiles, y codificación del esquema en Prisma basado estrictamente en el diseño de base de datos proveído por el desarrollador.

## 2. Prompts y Casos de Uso
- **Scaffolding Inicial:** *"Necesito un monorepo con NestJS en el backend y Angular 18 en el frontend. Codifica en Prisma este modelo relacional que he diseñado con las entidades: User, Flight, Seat, Reservation, Ticket, Payment."*
- **Configuración Nginx:** *"Configura Nginx como API Gateway para servir la SPA de Angular en la raíz y redirigir todo el tráfico que empiece con `/api/` hacia el servicio del backend en el puerto 3000."*
- **Health Checks:** *"Genera un endpoint de healthcheck en el backend que valide la conexión tanto a PostgreSQL como a Redis, manejando los errores de forma segura sin romper el event loop."*

## 3. Refactorización y Criterio Propio
A lo largo del desarrollo, la IA propuso varias soluciones subóptimas que tuvieron que ser corregidas mediante criterio técnico:

1. **Orquestación de Docker (Infraestructura Desacoplada vs Centralizada):**
   - *Error de la IA:* Inicialmente, la IA creó múltiples archivos `docker-compose.yml` dispersos en subcarpetas (`infrastructure/postgres`, `infrastructure/redis`).
   - *Corrección Técnica:* Se impuso el criterio de centralizar toda la orquestación en un único `docker-compose.yml` maestro en la raíz del proyecto y se aislaron los servicios en una red privada (`flight_network`). Se eliminaron las carpetas redundantes.
   - *Seguridad:* Se ocultó el puerto `3000` del backend hacia el host, forzando a que todo el tráfico pase exclusivamente por Nginx (expuesto en el puerto `4200` para evitar conflictos con el puerto `80` del host).

2. **Manejo de Errores Globales (Fuga de Información):**
   - *Error de la IA:* Al implementar los catch de las promesas de la base de datos y redis, la IA exponía los mensajes nativos de error al cliente (`error.message`).
   - *Corrección Técnica:* Se prohibió devolver errores crudos al usuario por motivos de seguridad. Bajo estricto criterio propio, se implementó un patrón de `GlobalExceptionFilter` robusto para estandarizar las respuestas HTTP y loguear los detalles técnicos en inglés solo en la consola interna.

3. **Incompatibilidad de Prisma en Alpine Linux (OpenSSL):**
   - *Error de la IA:* La IA generó un `Dockerfile` estándar de Node-Alpine y un `schema.prisma` por defecto. Esto provocó crashes (`P5010` y errores de librerías compartidas) al intentar correr Prisma en Alpine, ya que intentaba cargar binarios de OpenSSL 1.1 que ya no existen en Alpine 3.17+.
   - *Corrección Técnica:* Se añadió explícitamente `apk add --no-cache openssl` en el Dockerfile y se configuró estrictamente `binaryTargets = ["native", "linux-musl-openssl-3.0.x"]` en el generador de Prisma, eliminando referencias obsoletas a `linux-musl`.

4. **Resiliencia en Redis (Event Loop Blocking):**
   - *Error de la IA:* La configuración por defecto de `ioredis` sugerida por la IA dejaba colgado el hilo principal si Redis no estaba disponible, afectando los healthchecks (`curl` se quedaba pegado).
   - *Corrección Técnica:* Se configuró explícitamente `commandTimeout: 2000`, `enableOfflineQueue: false` y se agregaron listeners de eventos de error en background para evitar "Unhandled Promise Rejections".

## 4. Impacto
El uso de la IA aportó el mayor valor en la reducción de tiempo (aproximadamente un ahorro del **40% al 50%** del tiempo total en las primeras horas) al encargarse del "boilerplate" pesado: generar los módulos, controladores, servicios y la sintaxis inicial de los Dockerfiles. Sin embargo, quedó demostrado que para la capa de **orquestación de redes, despliegue en Alpine, manejo seguro de errores y afinamiento de dependencias**, el criterio arquitectónico humano es absolutamente indispensable.
