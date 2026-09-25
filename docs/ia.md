# Uso de Inteligencia Artificial

El uso de herramientas de Inteligencia Artificial fue fundamental para acelerar la etapa de scaffolding inicial del proyecto, aunque requirió de constante revisión y criterio técnico para asegurar que la arquitectura y la configuración cumplieran con los estándares empresariales esperados.

## 1. Herramientas de IA utilizadas
- **Modelo:** Google Gemini / DeepMind Antigravity (asistente de código integrado).
- **Uso:** Generación de código base (NestJS, Angular), escritura inicial de Dockerfiles, y codificación del esquema en Prisma basado estrictamente en el diseño de base de datos proveído por el desarrollador.

## 2. Prompts y Casos de Uso
- **Scaffolding Inicial:** *"Necesito un monorepo con NestJS en el backend y Angular 18 en el frontend. Codifica en Prisma este modelo relacional que he diseñado con las entidades: User, Flight, Seat, Reservation, Ticket, Payment."*
- **Configuración Nginx:** *"Configura Nginx como API Gateway para servir la SPA de Angular en la raíz y redirigir todo el tráfico que empiece con `/api/` hacia el servicio del backend en el puerto 3000."*
- **Health Checks:** *"Genera un endpoint de healthcheck en el backend que valide la conexión tanto a PostgreSQL como a Redis, manejando los errores de forma segura sin romper el event loop."*
- **Reserva en Tiempo Real:** *"Implementa un sistema de bloqueo distribuido de sillas con Redis que evite la colisión de asientos mientras un usuario realiza el pago, usando Server-Sent Events (SSE) para actualizar el mapa de sillas al instante."*
- **Seguridad y Encriptación (PCI DSS):** *"Genera un servicio de criptografía usando Node `crypto` que exponga una llave pública RSA al frontend para encriptar los datos de la tarjeta de crédito, y los desencripte de forma segura en el backend antes de procesar la transacción."*

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

5. **Arquitectura de Eventos en Tiempo Real (SSE):**
   - *Error de la IA:* La IA propuso instanciar un `EventSource` independiente dentro de cada servicio de Angular que requería datos en tiempo real. Esto generaba múltiples conexiones `keep-alive` paralelas hacia el backend, saturando innecesariamente la red y duplicando eventos. Además, la serialización nativa de NestJS al usar decoradores `@Sse()` envolvía los objetos con capas redundantes de JSON.
   - *Corrección Técnica:* Se diseñó un patrón Singleton (`SseService`) que actúa como un **Event Bus** global en Angular. La conexión se abre una única vez en el arranque de la aplicación (`app.component.ts`), y los componentes se suscriben filtrando los eventos mediante RxJS (`Subject` y `filter`). En el frontend se implementó la lógica para desempacar de forma segura los múltiples envoltorios (`data.data`) generados por la conversión automática de NestJS, garantizando la correcta emisión de eventos tipados.

6. **Desacoplamiento y Orquestación de Componentes en Angular:**
   - *Error de la IA:* Inicialmente, la IA tendía a agrupar la lógica de búsqueda, filtros y listado de resultados en componentes monolíticos grandes o con dependencias acopladas directamente.
   - *Corrección Técnica:* Se intervino el código de forma manual para orquestar una arquitectura modular. Se desacoplaron las vistas en componentes independientes y reutilizables (`FlightSearchComponent`, `FlightSearchResultsComponent`), centralizando el estado de la búsqueda en el contenedor principal y utilizando señales/observables para la comunicación limpia entre componentes.

7. **Lógica Distribuida de Reservas y Sincronización de Estados:**
   - *Error de la IA:* La IA originalmente creó múltiples estados redundantes (`OCCUPIED`, `SOLD`, `RESERVED`) desconectados entre el frontend y el backend. Además, el bloqueo temporal en Redis no se liberaba automáticamente si el usuario cerraba la ventana a mitad del pago o el temporizador expiraba, secuestrando la silla temporalmente.
   - *Corrección Técnica:* Se unificaron los estados bajo un único Single Source of Truth (`RESERVED` como estado de compra final) en Prisma y los enums de todo el stack. Adicionalmente, se implementó una lógica de liberación temprana (`unlockSeat`) que suelta la llave en Redis y dispara eventos SSE de desbloqueo al instante en cuanto el componente de checkout es destruido sin éxito de pago, garantizando alta concurrencia.

8. **Encriptación de Datos Sensibles (Simulación PCI DSS):**
   - *Error de la IA:* Inicialmente, la IA propuso enviar los datos de la tarjeta de crédito (PAN, CVV, Fecha) en texto plano a través del payload JSON del request HTTP, lo cual vulnera los estándares de seguridad básicos.
   - *Corrección Técnica:* Se implementó un flujo de cifrado asimétrico estricto. El backend genera en memoria un par de llaves RSA (`CryptoService`) al inicializarse y expone la llave pública. El frontend de Angular descarga esta llave y utiliza la Web Crypto API nativa (`window.crypto.subtle`) para encriptar la tarjeta localmente en el navegador. El backend recibe el payload cifrado, lo procesa en memoria y ofusca el número (`**** **** **** 1234`) antes de cualquier persistencia o log, asegurando que los datos crudos jamás sean interceptados ni almacenados.

## 4. Decisiones Finales de Refactorización y Arquitectura Avanzada

1. **Dashboard y Métricas Híbridas (DB + Redis):**
   - *El Reto:* Mostrar métricas en tiempo real de los vuelos requería no solo contar las sillas reservadas en la base de datos (PostgreSQL), sino también las sillas que están siendo bloqueadas temporalmente en el flujo de compra (Redis).
   - *Solución Técnica:* Se implementó un endpoint `GET /metrics` que realiza una consulta combinada: trae el estado total de la DB y lee on-the-fly las llaves vivas en Redis (`flight:*:seat:*:lock`), consolidando la data de "Libres", "Bloqueados" y "Reservados" antes de enviarla al cliente, lo cual actualiza el Dashboard de Angular dinámicamente mediante SSE.

2. **Limpieza de Controladores y Single Responsibility:**
   - *El Reto:* La IA originalmente inyectó demasiada lógica condicional y lanzamiento de excepciones (`NotFoundException`) directamente en la capa de controladores (`flights.controller.ts`).
   - *Corrección Técnica:* Se impuso un refactor estricto moviendo toda la lógica de validación, manejo de *locks*, y excepciones a la capa de servicios (`flights.service.ts`). Los controladores quedaron exclusivamente como enrutadores limpios, mejorando la mantenibilidad y la testeabilidad.

3. **Pruebas Unitarias con Vitest vs Jest:**
   - *Decisión Técnica:* Se decidió prescindir de **Jest** en favor de **Vitest** para la suite de pruebas unitarias. Esto debido a que el backend de Node/NestJS fue configurado estrictamente bajo el estándar **ECMAScript Modules (ESM)** nativo (`type: module`). Mientras que Jest sufre problemas históricos y requiere complejas configuraciones de Babel/ts-jest para soportar ESM de forma correcta, Vitest lo soporta de forma nativa *out-of-the-box*, compilando TypeScript a través de ESBuild entre 10 y 100 veces más rápido con la misma API asíncrona.

4. **Reutilización Estratégica de Vistas (Angular):**
   - *Decisión Técnica:* Para implementar la búsqueda de reservas por código (`GET /reservation/:code`), se evitó la creación redundante propensa a duplicación de código. Se inyectó el payload de la búsqueda directamente a través del estado de la historia de enrutamiento (`history.state`) hacia el componente existente de confirmación (`BookingConfirmationComponent`), ahorrando tiempo, reduciendo el bundle de Angular y simplificando la UI.

## 5. Impacto
El uso de la IA aportó el mayor valor en la reducción de tiempo (aproximadamente un ahorro del **40% al 50%** del tiempo total en las primeras horas) al encargarse del "boilerplate" pesado: generar los módulos, controladores, servicios y la sintaxis inicial de los Dockerfiles. Sin embargo, quedó demostrado que para la capa de **orquestación de redes, despliegue en Alpine, manejo seguro de errores y afinamiento de dependencias**, el criterio arquitectónico humano es absolutamente indispensable.
