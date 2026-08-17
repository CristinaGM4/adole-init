# Implementación frontend

## Alcance

Aplicación Angular 21 standalone para niños de 5 a 10 años, adolescentes de 11 a 19 años y personal institucional autorizado. El alcance fue ampliado por solicitud posterior para incorporar IPBIM-C20 respondido por cuidadores. Implementa ambos flujos públicos con consentimiento persistido y token temporal, autenticación, indicadores agregados, aplicaciones, alertas, casos, línea de tiempo, remisiones, seguimientos, protección, notificaciones, historial longitudinal, directorio y administración.

## Arquitectura

- `core/auth`: sesión JWT y usuario actual.
- `core/guards`: protección de sesión y roles.
- `core/interceptors`: token y tratamiento global de 401.
- `core/models`: interfaces y enums estrictos.
- `core/services`: clientes HTTP por dominio.
- `layout`: navegación institucional responsive.
- `features`: pantallas por capacidad.
- `shared/utils`: presentación central de estados del caso.

## Rutas

| Ruta                                                                                  | Acceso                                           |
| ------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `/formulario`                                                                         | Pública, sin inicio de sesión                    |
| `/login`                                                                              | Pública                                          |
| `/dashboard`                                                                          | Sesión válida                                    |
| `/aplicaciones`                                                                       | ADMIN, SECRETARIA_EDUCACION                      |
| `/aplicaciones/nueva`                                                                 | Redirige al formulario público                   |
| `/alertas`, `/casos`, `/casos/:id`, `/seguimientos`, `/notificaciones`, `/directorio` | Sesión válida; el backend aplica alcance nominal |
| `/adolescentes/:id/historial`                                                         | ADMIN, SECRETARIA_EDUCACION                      |
| `/administracion/*`, `/auditoria`                                                     | ADMIN, SECRETARIA_EDUCACION según OpenAPI        |

## Servicios y endpoints

- `AuthService`: `POST /auth/login`, `GET /auth/me`.
- `PublicFormsService`: instituciones, consentimiento y aplicación en `/public/*`.
- `ApplicationsService`: consulta interna de aplicaciones.
- `CasesService`: `GET /casos`, `GET /casos/:id`, responsable, transiciones y acciones.
- `AlertsService`: `GET /alertas`, `POST /alertas/:id/asumir`.
- `SafetyAssessmentService`: `POST /alertas/:id/valoracion`.
- `ReferralsService`: rutas de remisión y confirmación.
- `FollowUpsService`: rutas de seguimiento, vencidos y cancelación.
- `ProtectionRoutesService`: rutas paralelas de protección.
- `DashboardService`: tres dashboards agregados.
- `ConsentsService`, `NotificationsService`, `EscalationsService` y `AdolescentsService`: trazabilidad y operación de etapa 30.
- `DirectoryService`, `UsersService`, `InstitutionsService` y `AuditService`: administración contratada.

## Roles, guards y errores

Se usan exactamente `ADMIN` y `SECRETARIA_EDUCACION`, definidos por OpenAPI 0.30. `AuthGuard` exige token de sesión; `RoleGuard` protege capacidades declaradas. Un 401 interno termina la sesión; un 401 del envío público reinicia el permiso temporal sin afectar la sesión administrativa. Un 403 presenta falta de autorización sin borrar el JWT, excepto `ROLE_DISABLED`. Las operaciones 409/422 no mutan estado optimista.

## Estados

`CaseStatus` reproduce los 16 valores de `components.schemas.CasoEstado`. `case-status.helper.ts` centraliza etiqueta y estilo. Alertas usan los cuatro estados encontrados en la validación backend: `SIN_RESPONSABLE`, `PENDIENTE_VALORACION`, `EN_VALORACION`, `RESUELTA`.

## Cuestionario y privacidad

El flujo público obtiene instituciones de `GET /public/institutions`, registra la versión `CONSENT-MANIZALES-1.0` y, cuando corresponde, `ASSENT-MANIZALES-1.0` en `POST /public/consents`; solo continúa si `formAllowed=true`. `consent.id` y `submissionToken` permanecen exclusivamente en memoria. Después del consentimiento se captura `contextoSociodemografico` con la versión gestionada por servidor `SOCIODEMOGRAFICO-TEMBLOR-MANIZALES-1.0`; este bloque se envía separado de `application` y de `respuestas`. Implementa grado condicional, tipos de lesión condicionales y categorías múltiples exclusivas. La selección visible separa IPBIM-C20 (5–10, informante CUIDADOR, relación obligatoria, P1–P20 en 0–3 y valor 9 únicamente en P5/P6) de IPBAM-20 (11–19, informante ADOLESCENTE, P1–P6 en 0–3 y P7–P20 en 0–4). El frontend no calcula puntajes, perfiles ni alertas. Tras 201 solo muestra “Tu formulario fue recibido correctamente”.

## Decisiones de interfaz

Paleta verde institucional, fondo claro, sidebar sobrio, tarjetas y tablas con prioridad ámbar/roja reservada a vencimientos y estados críticos. El cuestionario es mobile-first, en seis pasos, con controles táctiles, foco visible y textos accesibles.

## Limitaciones e inconsistencias documentadas

1. La integración actual se ciñe a `openapi (1).yaml`, versión 0.30.0. Muchos `GET` usan respuestas genéricas; las interfaces de lectura se contrastaron con los `select/include` del repositorio backend sin crear endpoints.
2. **Inconsistencia crítica del backend:** el OpenAPI y la guía declaran únicamente `ADMIN` y `SECRETARIA_EDUCACION`, pero el código publicado en el repositorio aún contiene autorizaciones con `SECRETARIA_SALUD`, `RESPONSABLE_INSTITUCIONAL` y `PROFESIONAL_SEGURIDAD` en rutas como consentimientos, notificaciones, escalamientos, criterios de cierre y cancelación de seguimientos. El frontend respeta OpenAPI; estas rutas pueden responder 403 a Secretaría hasta que el backend unifique sus guards.
3. El OpenAPI permite `Answer.valor` hasta 4 en general, mientras el backend valida correctamente P1–P6 hasta 3. El formulario aplica la regla más estricta documentada.
4. IPBIM-C20 se incorporó después de una ampliación explícita del alcance. Sus resultados y escalas permanecen separados de IPBAM-20.
5. No hay endpoint contractual de “acciones permitidas”. La interfaz limita por rol y estado conocido; el backend conserva la autorización definitiva.
6. El contrato no incluye eliminación de usuarios, instituciones o servicios; no se simuló borrado.
7. La integración de Microsoft Forms requiere `FORMS_INTEGRATION_API_KEY`; deliberadamente no se incluyó en Angular porque es un secreto exclusivo de integraciones servidor a servidor.
8. El contrato sociodemográfico incorporado en el commit backend `1867f3d` exige `personaInformante` con valores exclusivamente de cuidador, incluso para el flujo adolescente autoadministrado; no incluye `ADOLESCENTE`. El frontend presenta exactamente las opciones contractuales. Conviene que backend confirme si debe ampliar ese enum para representar correctamente al adolescente que responde.
9. La especificación IPBIM-C20 indica en CP-I01 que una aplicación compatible con perfil 1 y P5=1 debe conservar `BIENESTAR_PRESERVADO` y añadir una alerta activa. El motor `IPBIM-RULES-1.0` exige `!safety.requiresReview` para perfil 1 y, con idénticos dominios más P5=1, devuelve `RECURSOS_MODERADOS` + alerta. Esto no afecta la creación de la alerta, pero sí modifica el perfil por la señal de seguridad y contradice la regla de independencia perfil/alerta del documento. Debe corregirse en backend; el frontend no recalcula ni reemplaza su resultado.

## Conexión

El desarrollo usa `/api` y `proxy.conf.json`, que redirige a `https://inst-adolescente.onrender.com`. En Vercel, `environment.production.ts` conserva `/api` y `vercel.json` realiza el rewrite hacia Render para evitar dependencia de CORS entre navegadores. Después ejecute `npm install`, `npm start`; para entrega, `npm run build` y `npm test -- --watch=false`.

## Validación de entrega

- Dependencias instaladas: 482 paquetes, 0 vulnerabilidades reportadas.
- TypeScript de aplicación y pruebas: sin errores.
- Pruebas Angular/Vitest: 5 archivos, 21 pruebas aprobadas. Incluyen login, guards, JWT, 401, 403, 409, 422, IPBAM-20, IPBIM-C20, consentimiento/asentimiento, reglas sociodemográficas y compilación de todas las rutas/componentes.
- El build de producción fue ejecutado con Node 24, 25 y 22. En este equipo, el binario nativo de `esbuild` terminó con `exit 134` y un deadlock interno después de la compilación, sin emitir un diagnóstico Angular. El mismo compilador completó el bundle integral de pruebas correctamente. Se recomienda repetir `npm run build` en Node 22 LTS sobre un entorno limpio; no se ocultó ni convirtió este fallo de infraestructura en un resultado exitoso.
