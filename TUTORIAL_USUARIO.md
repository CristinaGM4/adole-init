# Tutorial de uso — Bienestar Infantil y Adolescente

## 1. Propósito de la plataforma

La plataforma permite recibir formularios de bienestar de niños, niñas y adolescentes y apoyar la gestión institucional de aplicaciones, alertas, casos, remisiones y seguimientos.

Incluye dos áreas independientes:

1. **Formulario público:** no requiere iniciar sesión.
2. **Panel institucional:** requiere una cuenta autorizada.

La plataforma no genera diagnósticos. Los perfiles y señales que aparecen en el panel son resultados operativos y deben ser interpretados por personal autorizado.

---

## 2. Acceso a la aplicación

Utilice el enlace correspondiente según el tipo de usuario:

- **Formulario público:** [https://adole-init.vercel.app/formulario](https://adole-init.vercel.app/formulario)
- **Panel institucional:** [https://adole-init.vercel.app/login](https://adole-init.vercel.app/login)

---

## 3. Formulario público

El formulario público no solicita una cuenta ni contraseña.

### Paso 1: seleccionar la población

En **¿Qué formulario desea diligenciar?**, seleccione:

- **Adolescentes:** entre 11 y 19 años. Responde el adolescente mediante IPBAM-20.
- **Niños:** entre 5 y 10 años. Responde la madre, el padre o una persona cuidadora mediante IPBIM-C20.

La edad debe corresponder con la población seleccionada.

### Paso 2: información inicial

Complete:

- Código o identificador del participante.
- Edad.
- Institución educativa.
- Lugar de aplicación.
- Relación de la persona cuidadora, cuando se seleccione el formulario infantil.

El código debe utilizarse de forma consistente durante todo el proceso. No se recomienda escribir el nombre completo del participante.

### Paso 3: consentimiento y asentimiento

Lea completamente los textos institucionales.

- En el formulario infantil, la madre, el padre o cuidador registra el consentimiento.
- El niño, niña o adolescente registra su decisión de participar mediante el asentimiento.
- Para participantes de 5 a 7 años, la explicación debe realizarse con acompañamiento adulto.

Si se selecciona **No acepto** o **No quiero participar**, el formulario termina y no solicita respuestas de bienestar.

El permiso para continuar tiene una duración limitada. Si vence, la aplicación solicitará reiniciar desde el consentimiento.

### Paso 4: datos sociodemográficos y contexto

Complete la información breve solicitada:

- Sexo registrado al nacer.
- Escolarización y grado.
- Comuna o corregimiento.
- Personas con quienes vive.
- Persona que responde.

Luego complete la sección independiente de afectaciones relacionadas con el temblor:

- Lesiones físicas.
- Familiares heridos.
- Salida temporal de la vivienda.
- Daños en la vivienda.
- Necesidades o servicios afectados.
- Cambio temporal de residencia, escuela o cuidador.

La pregunta sobre tipos de lesión aparece únicamente cuando se informó una lesión. En las preguntas de selección múltiple, **Ninguna** no puede combinarse con otras alternativas.

Esta información no se suma a los puntajes de bienestar ni determina automáticamente un perfil de salud mental.

### Paso 5: instrumento de bienestar

El instrumento contiene 20 preguntas distribuidas en seis bloques. La parte superior indica el bloque actual y el avance.

Utilice:

- **Anterior:** volver al bloque previo.
- **Continuar:** validar el bloque y avanzar.
- **Enviar:** registrar el formulario.

En IPBAM-20:

- P1 a P6 admiten valores entre 0 y 3.
- P7 a P20 admiten valores entre 0 y 4.

En IPBIM-C20, las opciones se presentan conforme al instrumento infantil. La plataforma no calcula ni muestra resultados durante el diligenciamiento.

### Paso 6: confirmación

Después de un envío exitoso aparece:

> Tu formulario fue recibido correctamente.

La pantalla pública no muestra puntajes, diagnósticos, perfiles operativos ni alertas técnicas.

### Errores frecuentes del formulario

- **Instituciones vacías:** compruebe su conexión a internet y recargue la página.
- **Permiso vencido:** reinicie desde el consentimiento.
- **Los datos no coinciden con el consentimiento:** revise código, institución y tipo de informante.
- **Consentimiento ya utilizado:** inicie una aplicación nueva.
- **Demasiados intentos:** espere unos minutos antes de volver a enviar.

---

## 4. Ingreso al panel institucional

Seleccione **Ingreso institucional** e ingrese:

- Correo institucional.
- Contraseña asignada.

Al ingresar, la aplicación valida la cuenta y consulta el usuario, rol e institución.

Roles actualmente habilitados:

- **ADMIN:** administración y operación general.
- **Secretaría de Educación:** operación institucional según los permisos asignados.

La sesión se conserva únicamente durante la sesión del navegador. Al cerrar sesión deberá ingresar nuevamente.

---

## 5. Dashboard

La pantalla **Inicio** consulta información real de:

- Dashboard poblacional.
- Dashboard de seguridad.
- Dashboard de rutas.

Utilice los filtros superiores para consultar:

- Fecha inicial.
- Fecha final.
- Institución.
- Agrupación por día, semana o mes.

Pulse **Aplicar filtros** para actualizar todos los indicadores. Pulse **Limpiar** para volver al alcance general.

El dashboard muestra:

- Participantes evaluados.
- Alertas pendientes y sin responsable.
- Rutas abiertas.
- Casos vencidos y cerrados.
- Evolución temporal.
- Formularios completos e incompletos.
- Aplicaciones IPBAM-20 e IPBIM-C20.
- Distribución por edad, perfil e institución.
- Indicadores de seguridad, remisiones y seguimiento.

Los datos son agregados y no incluyen respuestas individuales del instrumento.

---

## 6. Aplicaciones

La sección **Aplicaciones** presenta los formularios recibidos.

Puede filtrar mediante:

- Código o identificador.
- Población: adolescentes o niños.
- Estado: completa o incompleta.

La tabla muestra:

- Identificador de la aplicación.
- Código del participante.
- Instrumento.
- Fecha.
- Estado.
- Perfil operativo.
- Estado de seguridad o alerta.

**Perfil operativo y alerta son resultados independientes.** Una aplicación puede tener un perfil operativo y, al mismo tiempo, requerir revisión por seguridad.

El botón **Abrir formulario público** lleva al flujo público en una nueva aplicación.

---

## 7. Alertas

La sección **Alertas y casos** contiene señales que requieren responsable y valoración humana.

El filtro permite seleccionar:

- Todos los estados.
- Sin responsable.
- Pendiente de valoración.
- En valoración.
- Resuelta.

Cuando una alerta no tiene responsable y el usuario cuenta con autorización, aparece **Asumir alerta**. Después de asumirla, la plataforma actualiza el responsable, el estado y la fecha.

Seleccione **Ver caso** para continuar la gestión. La bandeja no expone respuestas sensibles ni sustituye una valoración profesional.

---

## 8. Casos

La sección **Casos** es la bandeja principal de gestión. Permite consultar el estado, institución, participante, perfil, alerta, responsable y próxima acción.

Al abrir un caso se visualizan:

- Cabecera operativa.
- Estado actual.
- Responsable.
- Próxima acción.
- Línea de tiempo con eventos registrados.
- Acciones permitidas según estado y rol.

Según el estado del caso y los permisos del usuario, se pueden presentar acciones como:

- Asumir o asignar responsable.
- Registrar valoración de seguridad.
- Registrar una acción.
- Crear una remisión.
- Confirmar recepción.
- Programar o registrar un seguimiento.
- Abrir una ruta de protección.
- Cerrar el caso.

No todos los casos muestran todas las acciones. La disponibilidad depende del estado real y de los permisos.

Si aparece un conflicto o una transición no permitida, actualice la página y revise el estado vigente del caso.

---

## 9. Valoración de seguridad

La valoración es una acción humana independiente de las respuestas críticas del cuestionario.

Complete únicamente información confirmada durante la valoración profesional. El sistema no rellena automáticamente estos campos con P5 o P6.

Al guardar:

- La plataforma valida los permisos y el estado del caso.
- El caso y la alerta se actualizan.
- El evento queda registrado en la trazabilidad.

---

## 10. Remisiones y rutas de protección

### Remisiones

Dentro del caso puede registrar el servicio receptor, contacto y fecha. Cuando corresponda, utilice **Confirmar recepción**.

Una remisión no cierra automáticamente el caso. La atención debe continuar hasta cumplir los criterios institucionales de cierre.

### Rutas de protección

Las rutas de protección aparecen en una sección independiente. No deben confundirse con la ruta de salud mental. Ambas pueden permanecer abiertas simultáneamente.

---

## 11. Seguimientos

La sección **Seguimientos** destaca primero los seguimientos vencidos y luego los demás registros.

Revise:

- Caso y participante.
- Institución.
- Responsable.
- Fecha programada.
- Estado.

Los seguimientos vencidos requieren priorización operativa. Registrar una remisión no elimina la necesidad de seguimiento.

---

## 12. Notificaciones

La sección **Notificaciones** reúne avisos operativos de la plataforma. Abra el recurso relacionado para continuar la gestión.

Las notificaciones no deben incluir respuestas clínicas completas ni sustituir la consulta del caso.

---

## 13. Directorio

El **Directorio** contiene servicios disponibles para orientación y remisión.

La información puede incluir:

- Nombre y tipo de servicio.
- Uso principal.
- Contacto.
- Territorio.
- Estado y última actualización.

Las actualizaciones del directorio deben realizarse mediante las funciones administrativas disponibles.

---

## 14. Administración

La sección **Administración** reúne:

- Usuarios.
- Instituciones.
- Consentimientos.
- Escalamientos.
- Directorio.
- Auditoría.

### Usuarios

Permite crear o actualizar usuarios conforme al rol actual. Secretaría no puede crear ni modificar cuentas ADMIN cuando no tenga ese permiso.

### Instituciones

Permite consultar, crear y actualizar instituciones. Solo las instituciones activas deben aparecer en el formulario público.

### Consentimientos

Permite consultar la decisión, versión institucional, tipo de informante y trazabilidad. No presenta respuestas clínicas.

### Auditoría

Registra fecha, usuario, acción, entidad e identificador. Se utiliza para trazabilidad operativa y no debe exponer información clínica innecesaria.

---

## 15. Cierre de sesión y privacidad

Para finalizar, pulse **Salir** en la parte superior.

Buenas prácticas:

- No compartir credenciales.
- No compartir claves, enlaces de acceso ni información de la sesión.
- No usar nombres completos cuando un código institucional sea suficiente.
- No tomar capturas que incluyan información sensible.
- Cerrar sesión en equipos compartidos.
- Consultar casos únicamente dentro del alcance institucional autorizado.

---

## 16. Recorrido recomendado para una demostración

1. Abrir el formulario público.
2. Seleccionar adolescentes o niños.
3. Completar identificación, consentimiento y asentimiento.
4. Completar datos sociodemográficos y afectaciones del temblor.
5. Responder el instrumento y enviarlo.
6. Iniciar sesión en el panel institucional.
7. Confirmar la aplicación en **Aplicaciones**.
8. Revisar el dashboard.
9. Si se generó una alerta, abrir **Alertas**.
10. Asumir la alerta y entrar al caso.
11. Registrar la valoración correspondiente.
12. Gestionar remisión, ruta de protección o seguimiento según corresponda.
13. Verificar la línea de tiempo y auditoría.
14. Cerrar el caso únicamente cuando la plataforma habilite la acción.
