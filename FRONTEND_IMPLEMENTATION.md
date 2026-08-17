# Implementación frontend

## Alcance

Aplicación Angular 21 standalone para adolescentes de 11 a 19 años y personal institucional autorizado. Implementa captura IPBAM-20, autenticación, indicadores agregados, aplicaciones, alertas, casos, línea de tiempo, remisiones/seguimientos/protección consultados dentro del caso, directorio y administración básica. No implementa backend, cuidadores, ni IPBIM-C20.

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

| Ruta | Acceso |
|---|---|
| `/login` | Pública |
| `/dashboard` | Sesión válida |
| `/aplicaciones` | ADMIN, SECRETARIA_SALUD, RESPONSABLE_INSTITUCIONAL |
| `/aplicaciones/nueva` | ADMIN, RESPONSABLE_INSTITUCIONAL |
| `/alertas`, `/casos`, `/casos/:id`, `/seguimientos`, `/directorio` | Sesión válida; el backend aplica alcance nominal |
| `/administracion`, `/administracion/usuarios`, `/administracion/instituciones`, `/auditoria` | ADMIN |

## Servicios y endpoints

- `AuthService`: `POST /auth/login`, `GET /auth/me`.
- `ApplicationsService`: `GET/POST /aplicaciones`, `GET /aplicaciones/:id`.
- `CasesService`: `GET /casos`, `GET /casos/:id`, responsable, transiciones y acciones.
- `AlertsService`: `GET /alertas`, `POST /alertas/:id/asumir`.
- `SafetyAssessmentService`: `POST /alertas/:id/valoracion`.
- `ReferralsService`: rutas de remisión y confirmación.
- `FollowUpsService`: rutas de seguimiento y `GET /seguimientos/vencidos`.
- `ProtectionRoutesService`: rutas paralelas de protección.
- `DashboardService`: tres dashboards agregados.
- `DirectoryService`, `UsersService`, `InstitutionsService`: administración contratada.

## Roles, guards y errores

Se usan exactamente `ADMIN`, `SECRETARIA_SALUD`, `RESPONSABLE_INSTITUCIONAL` y `PROFESIONAL_SEGURIDAD`. `AuthGuard` exige token de sesión; `RoleGuard` protege capacidades declaradas. Un 401 termina la sesión; 403 dirige o presenta falta de permiso sin borrar token. Las operaciones 409/422 no mutan estado optimista y deben refrescar el recurso.

## Estados

`CaseStatus` reproduce los 16 valores de `components.schemas.CasoEstado`. `case-status.helper.ts` centraliza etiqueta y estilo. Alertas usan los cuatro estados encontrados en la validación backend: `SIN_RESPONSABLE`, `PENDIENTE_VALORACION`, `EN_VALORACION`, `RESUELTA`.

## Cuestionario y privacidad

Antes de cualquier pregunta clínica se presenta consentimiento informado y asentimiento. Para menores de 18 años se exige tanto autorización de padre/madre/cuidador como asentimiento del adolescente; para participantes de 18 o 19 años se exige consentimiento propio. Si se rechaza, el flujo finaliza y no ejecuta `POST /aplicaciones`. Las 20 preguntas son literales del anexo. P1–P6 permiten 0–3 y P7–P20 permiten 0–4. P5/P6 son obligatorias en su paso; no se calcula gravedad clínica. El payload incluye código, edad, institución, lugar, versión, inicio y respuestas. Tras el envío solo se muestra una confirmación neutral, nunca resultado técnico.

## Decisiones de interfaz

Paleta verde institucional, fondo claro, sidebar sobrio, tarjetas y tablas con prioridad ámbar/roja reservada a vencimientos y estados críticos. El cuestionario es mobile-first, en seis pasos, con controles táctiles, foco visible y textos accesibles.

## Limitaciones e inconsistencias documentadas

1. El adjunto se llama `bienestar-backend-etapa13.zip`, OpenAPI declara versión 0.13.0 y el README afirma etapa 14. La implementación se ciñe al OpenAPI 0.13.0 adjunto y usa el ZIP solo para precisar envoltorios de respuesta.
2. Muchos `GET` del OpenAPI usan `additionalProperties: true`; las interfaces de lectura se derivaron de los `select/include` del backend etapa 13 sin crear endpoints.
3. El OpenAPI permite `Answer.valor` hasta 4 en general, mientras el backend valida correctamente P1–P6 hasta 3. El formulario aplica la regla más estricta documentada.
4. El rol ADOLESCENTE descrito funcionalmente no existe en el enum de autenticación. Por tanto, el backend exige que ADMIN o RESPONSABLE_INSTITUCIONAL envíen aplicaciones; no se inventó un acceso público adolescente.
5. No hay endpoint contractual para preguntar “acciones permitidas” por recurso. La UI limita por rol/estado conocido y el backend mantiene la autorización definitiva.
6. El contrato no incluye eliminación de usuarios, instituciones o servicios. La administración permite crear, actualizar y activar/desactivar usando únicamente `POST` y `PATCH`; no se simuló borrado.
7. OpenAPI no define un endpoint ni campos en `ApplicationInput` para persistir la decisión de consentimiento/asentimiento o registrar un rechazo. El frontend aplica la barrera obligatoria en la sesión y garantiza que un rechazo no envíe respuestas clínicas, pero no simula una constancia persistente. El backend deberá ampliar el contrato si la política institucional exige conservar esa evidencia.

## Conexión

El desarrollo usa `/api` y `proxy.conf.json`, que redirige a `https://inst-adolescente.onrender.com`. En Vercel, `environment.production.ts` conserva `/api` y `vercel.json` realiza el rewrite hacia Render para evitar dependencia de CORS entre navegadores. Después ejecute `npm install`, `npm start`; para entrega, `npm run build` y `npm test -- --watch=false`.

## Validación de entrega

- Dependencias instaladas: 482 paquetes, 0 vulnerabilidades reportadas.
- TypeScript de aplicación y pruebas: sin errores.
- Pruebas Angular/Vitest: 5 archivos, 16 pruebas aprobadas. Incluyen login, guards, JWT, 401, 403, 409, 422, IPBAM-20, consentimiento/asentimiento y compilación de todas las rutas/componentes.
- El build de producción fue ejecutado con Node 24, 25 y 22. En este equipo, el binario nativo de `esbuild` terminó con `exit 134` y un deadlock interno después de la compilación, sin emitir un diagnóstico Angular. El mismo compilador completó el bundle integral de pruebas correctamente. Se recomienda repetir `npm run build` en Node 22 LTS sobre un entorno limpio; no se ocultó ni convirtió este fallo de infraestructura en un resultado exitoso.
