import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PublicFormsService } from '../../core/services/api.services';
import {
  NecesidadServicio,
  PublicConsentInput,
  PublicInstitution,
  SociodemographicContextInput,
  TipoConviviente,
  TipoLesion,
} from '../../core/models/api.models';
import { HttpErrorResponse } from '@angular/common/http';
type Q = { n: number; text: string };
const adolescentBlocks = [
  {
    title: 'Síntomas emocionales',
    hint: 'Pensando en las últimas dos semanas',
    qs: [
      [1, 'Me he sentido triste, decaído/a o sin esperanza.'],
      [2, 'He tenido dificultad para dormir o he dormido mucho más de lo habitual.'],
      [3, 'Me he sentido cansado/a o con poca energía.'],
      [4, 'He comido mucho menos o mucho más de lo habitual.'],
    ],
  },
  {
    title: 'Seguridad',
    hint: 'Responde con honestidad. Si necesitas apoyo, una persona autorizada hablará contigo de manera privada.',
    qs: [
      [5, 'He pensado que preferiría estar muerto/a, no despertar o dejar de existir.'],
      [6, 'He pensado en hacerme daño o quitarme la vida.'],
    ],
  },
  {
    title: 'Satisfacción con la vida',
    hint: 'Indica cuánto estás de acuerdo',
    qs: [
      [7, 'En general, estoy satisfecho/a con mi vida.'],
      [8, 'Las condiciones principales de mi vida son buenas para mí.'],
      [9, 'Siento que estoy logrando cosas que son importantes para mí.'],
    ],
  },
  {
    title: 'Afrontamiento',
    hint: 'Indica cuánto te describe',
    qs: [
      [10, 'Cuando atravieso una dificultad, puedo encontrar fuerzas para seguir.'],
      [11, 'Aunque algo salga mal, puedo mantenerme enfocado/a en metas importantes.'],
      [12, 'Puedo enfrentar desafíos difíciles sin sentir que todo está perdido.'],
      [13, 'Cuando tengo un problema complicado, generalmente encuentro una forma de afrontarlo.'],
    ],
  },
  {
    title: 'Recursos familiares',
    hint: 'Indica cuánto estás de acuerdo',
    qs: [
      [14, 'Tengo al menos una persona adulta cuidadora que me escucha cuando necesito hablar.'],
      [15, 'En casa siento que se interesan por lo que me pasa.'],
      [
        16,
        'Puedo contarle a una persona adulta cuidadora un problema importante sin sentir que me van a ridiculizar o ignorar.',
      ],
      [
        17,
        'En casa existen reglas o límites que entiendo y que suelen aplicarse de manera razonable.',
      ],
      [
        18,
        'Cuando tengo un problema serio, cuento con el apoyo de al menos una persona adulta cuidadora.',
      ],
    ],
  },
  {
    title: 'Contexto',
    hint: 'Tu experiencia del lugar donde vives',
    qs: [
      [
        19,
        'Los cambios o el deterioro del lugar donde vivo me producen tristeza, preocupación o malestar.',
      ],
      [
        20,
        'Siento que el lugar donde vivo ya no se siente igual para mí por los cambios que ha tenido.',
      ],
    ],
  },
] as const;
const childBlocks = [
  {
    title: 'Dificultades emocionales y funcionamiento',
    hint: 'Pensando en las últimas dos semanas',
    qs: [
      [1, 'Ha estado triste, irritable o ha llorado más de lo habitual.'],
      [2, 'Ha mostrado miedo, preocupación o nerviosismo que le cuesta controlar.'],
      [3, 'Ha tenido cambios importantes en el sueño, el apetito o la energía.'],
      [
        4,
        'Sus dificultades emocionales o de comportamiento han interferido con asistir o aprender en la escuela, jugar o relacionarse con otras personas.',
      ],
    ],
  },
  {
    title: 'Seguridad',
    hint: 'Si no conoce la respuesta, puede seleccionar “No sé”. La valoración posterior siempre es humana.',
    qs: [
      [
        5,
        'Ha dicho o comunicado que quisiera morir, desaparecer, no despertar o dejar de existir.',
      ],
      [
        6,
        'Se ha lastimado a propósito, ha intentado hacerse daño o ha realizado una conducta deliberada que le hizo pensar que su vida podía estar en peligro.',
      ],
    ],
  },
  {
    title: 'Recursos del niño',
    hint: 'Pensando en las últimas dos semanas',
    qs: [
      [7, 'Disfruta del juego, las actividades, la escuela o las cosas que normalmente le gustan.'],
      [
        8,
        'Cuando algo sale mal, logra calmarse y volver a intentarlo con el apoyo apropiado para su edad.',
      ],
      [9, 'Busca o acepta ayuda de una persona adulta de confianza cuando algo le preocupa.'],
      [
        10,
        'Mantiene al menos una relación positiva con otros niños, hermanos u otras personas significativas.',
      ],
    ],
  },
  {
    title: 'Recursos familiares y de cuidado',
    hint: 'Responda con honestidad pensando en la vida cotidiana',
    qs: [
      [11, 'En casa logramos mantener reglas y consecuencias claras y relativamente consistentes.'],
      [
        12,
        'Cuando mi hijo/a se porta mal, termino gritando, amenazando o usando formas de corrección que pueden asustarlo/a o humillarlo/a.',
      ],
      [
        13,
        'Reconozco y animo a mi hijo/a cuando hace algo bien o intenta resolver una dificultad.',
      ],
      [
        14,
        'Mi hijo/a puede acercarse a mí o a otra persona cuidadora cuando necesita consuelo, ayuda o hablar.',
      ],
    ],
  },
  {
    title: 'Ajuste y apoyo familiar',
    hint: 'Pensando en las últimas dos semanas',
    qs: [
      [
        15,
        'Me he sentido tan sobrecargado/a, triste, ansioso/a o irritado/a que me cuesta responder con calma a las necesidades de mi hijo/a.',
      ],
      [
        16,
        'Los adultos responsables logramos coordinarnos para tomar decisiones importantes sobre su cuidado.',
      ],
      [
        17,
        'Las tensiones, discusiones o críticas entre adultos en casa afectan el bienestar de mi hijo/a.',
      ],
      [
        18,
        'Cuento con al menos otra persona o recurso de apoyo cuando necesito ayuda para cuidar o acompañar a mi hijo/a.',
      ],
    ],
  },
  {
    title: 'Contexto',
    hint: 'Cambios recientes en su entorno',
    qs: [
      [
        19,
        'Los cambios o problemas del lugar donde vive o estudia le producen miedo, tristeza o preocupación.',
      ],
      [
        20,
        'Cambios importantes recientes en la familia, la vivienda, la escuela o la comunidad han afectado su bienestar.',
      ],
    ],
  },
] as const;
@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `@if (declined()) {
      <section class="thanks declined-screen">
        <div>✓</div>
        <span class="eyebrow">DECISIÓN REGISTRADA EN ESTA SESIÓN</span>
        <h1>El formulario ha finalizado.</h1>
        <p>Respetamos tu decisión de no participar.</p>
        <p>No se enviaron respuestas del instrumento al servidor.</p>
        <small>Ya puedes cerrar esta ventana.</small>
      </section>
    } @else if (sent()) {
      <section class="thanks">
        <div>✓</div>
        <span class="eyebrow">RESPUESTAS RECIBIDAS</span>
        <h1>Tu formulario fue recibido correctamente.</h1>
        <p>Gracias por participar.</p>
        <small>Ya puedes cerrar esta ventana.</small>
      </section>
    } @else {
      <div class="questionnaire">
        <div class="q-top">
          <span class="logo mini"><b>M</b></span>
          <div>
            <b>Bienestar Infantil y Adolescente</b>
            <small>Secretaría de Salud · Manizales</small>
          </div>
          <span>Sesión segura</span>
        </div>
        @if (contextStage()) {
          <section class="intro context-card">
            <span class="eyebrow"
              >DATOS SOCIODEMOGRÁFICOS · SOCIODEMOGRAFICO-TEMBLOR-MANIZALES-1.0</span
            >
            <h1>Información breve del participante y su contexto</h1>
            <p>
              Estos datos se almacenan separados de las respuestas de bienestar. No se suman ni
              determinan por sí solos un perfil de salud mental.
            </p>
            <form [formGroup]="context" (ngSubmit)="continueFromContext()">
              <div class="context-section">
                <h2>Datos sociodemográficos</h2>
                <div class="form-grid">
                  <label
                    >Edad<input type="number" [value]="meta.controls.edad.value" disabled
                  /></label>
                  <label
                    >Sexo registrado al nacer<select formControlName="sexoRegistradoNacimiento">
                      <option value="">Selecciona…</option>
                      <option value="FEMENINO">Femenino</option>
                      <option value="MASCULINO">Masculino</option>
                      <option value="INTERSEXUAL">Intersexual</option>
                      <option value="PREFIERE_NO_RESPONDER">Prefiero no responder</option>
                    </select></label
                  >
                  <label
                    >Institución educativa<input [value]="selectedInstitutionName()" disabled
                  /></label>
                  <label
                    >Escolarización<select
                      formControlName="escolarizacion"
                      (change)="schoolingChanged()"
                    >
                      <option value="ESCOLARIZADO">Se encuentra escolarizado</option>
                      <option value="NO_ESCOLARIZADO">
                        No se encuentra escolarizado actualmente
                      </option>
                    </select></label
                  >
                  @if (context.controls.escolarizacion.value === 'ESCOLARIZADO') {
                    <label
                      >Grado actual<select formControlName="grado">
                        <option value="">Selecciona…</option>
                        <option value="TRANSICION">Transición</option>
                        @for (grade of grades; track grade.value) {
                          <option [value]="grade.value">{{ grade.label }}</option>
                        }
                        <option value="COMPLEMENTARIO">Complementario</option>
                      </select></label
                    >
                  }
                  <label
                    >Comuna o corregimiento donde vive<input formControlName="comunaCorregimiento"
                  /></label>
                  <label
                    >Persona que responde<select formControlName="personaInformante">
                      <option value="">Selecciona…</option>
                      <option value="MADRE">Madre</option>
                      <option value="PADRE">Padre</option>
                      <option value="ABUELO_ABUELA">Abuelo o abuela</option>
                      <option value="OTRO_FAMILIAR">Otro familiar</option>
                      <option value="OTRO_CUIDADOR">Otro cuidador</option>
                    </select></label
                  >
                </div>
                <fieldset class="multi-field">
                  <legend>¿Con quién vive actualmente?</legend>
                  <div class="check-grid">
                    @for (option of convivenciaOptions; track option.value) {
                      <label
                        ><input
                          type="checkbox"
                          [checked]="convivencia().includes(option.value)"
                          (change)="toggleConvivencia(option.value)"
                        />{{ option.label }}</label
                      >
                    }
                  </div>
                </fieldset>
              </div>
              <div class="context-section">
                <h2>Afectaciones físicas y materiales relacionadas con el temblor</h2>
                <p>
                  Esta información permanece separada de las preguntas de bienestar psicológico.
                </p>
                <label
                  >¿Sufrió alguna lesión física durante o después del temblor?<select
                    formControlName="lesionFisica"
                    (change)="injuryChanged()"
                  >
                    <option value="">Selecciona…</option>
                    <option value="NO">No</option>
                    <option value="LEVE_SIN_ATENCION_MEDICA">Sí, leve y sin atención médica</option>
                    <option value="NECESITO_ATENCION_MEDICA">Sí, necesitó atención médica</option>
                    <option value="NECESITO_HOSPITALIZACION">Sí, necesitó hospitalización</option>
                    <option value="NO_SEGURO">No estoy seguro/a</option>
                  </select></label
                >
                @if (injuryReported()) {
                  <fieldset class="multi-field">
                    <legend>¿Qué tipo de afectación tuvo?</legend>
                    <div class="check-grid">
                      @for (option of lesionOptions; track option.value) {
                        <label
                          ><input
                            type="checkbox"
                            [checked]="tiposLesion().includes(option.value)"
                            (change)="toggleInjury(option.value)"
                          />{{ option.label }}</label
                        >
                      }
                    </div>
                  </fieldset>
                }
                <div class="form-grid">
                  <label
                    >¿Alguna persona con la que vive resultó herida?<select
                      formControlName="familiaresHeridos"
                    >
                      <option value="">Selecciona…</option>
                      <option value="NO">No</option>
                      <option value="SI">Sí</option>
                      <option value="NO_SE">No sé</option>
                    </select></label
                  >
                  <label
                    >¿La familia tuvo que salir temporalmente de su vivienda?<select
                      formControlName="salidaVivienda"
                    >
                      <option value="">Selecciona…</option>
                      <option value="NO">No</option>
                      <option value="ALGUNAS_HORAS">Sí, por algunas horas</option>
                      <option value="UNO_O_MAS_DIAS">Sí, por uno o más días</option>
                      <option value="AUN_NO_HA_REGRESADO">Aún no ha podido regresar</option>
                    </select></label
                  >
                  <label
                    >¿La vivienda presentó daños?<select formControlName="danosVivienda">
                      <option value="">Selecciona…</option>
                      <option value="NO">No</option>
                      <option value="DANOS_LEVES">Daños leves</option>
                      <option value="DIFICULTA_VIVIR_NORMALMENTE">
                        Dificultan vivir normalmente allí
                      </option>
                      <option value="GRAVE_NO_HABITABLE">Daños graves o no habitable</option>
                      <option value="NO_SE">No sé</option>
                    </select></label
                  >
                  <label
                    >¿Cambió temporalmente de residencia, escuela o cuidador?<select
                      formControlName="cambioResidenciaEscuelaCuidador"
                    >
                      <option value="">Selecciona…</option>
                      <option value="NO">No</option>
                      <option value="SI">Sí</option>
                      <option value="NO_SEGURO">No estoy seguro/a</option>
                    </select></label
                  >
                </div>
                <fieldset class="multi-field">
                  <legend>¿El hogar ha tenido dificultades con servicios o necesidades?</legend>
                  <div class="check-grid">
                    @for (option of serviceOptions; track option.value) {
                      <label
                        ><input
                          type="checkbox"
                          [checked]="necesidadesServicios().includes(option.value)"
                          (change)="toggleService(option.value)"
                        />{{ option.label }}</label
                      >
                    }
                  </div>
                </fieldset>
              </div>
              @if (contextError()) {
                <div class="error" role="alert">{{ contextError() }}</div>
              }
              <div class="q-actions">
                <button class="primary" [disabled]="!contextValid()">
                  Continuar al instrumento →
                </button>
              </div>
            </form>
          </section>
        } @else if (step() === 0) {
          @if (!consentStage()) {
            <section class="intro">
              <span class="eyebrow">ANTES DE COMENZAR</span>
              <h1>¿Qué formulario desea diligenciar?</h1>
              <p class="instrument-label">
                {{
                  isChild()
                    ? 'IPBIM-C20 · Versión para cuidadores'
                    : 'IPBAM-20 · Versión para adolescentes'
                }}
              </p>
              <div class="audience-selector" role="group" aria-label="Tipo de formulario">
                <button
                  type="button"
                  [class.selected]="audience() === 'ADOLESCENTE'"
                  (click)="selectAudience('ADOLESCENTE')"
                >
                  <b>Adolescentes</b><small>11 a 19 años · responde el adolescente</small>
                </button>
                <button
                  type="button"
                  [class.selected]="audience() === 'CUIDADOR'"
                  (click)="selectAudience('CUIDADOR')"
                >
                  <b>Niños</b><small>5 a 10 años · responde madre, padre o cuidador</small>
                </button>
              </div>
              <h2>
                {{
                  isChild()
                    ? 'Queremos conocer cómo se encuentra el niño o la niña'
                    : 'Queremos saber cómo te has sentido'
                }}
              </h2>
              <p>
                {{
                  isChild()
                    ? 'Estas preguntas no producen un diagnóstico y deben ser respondidas por una persona adulta que conozca su vida cotidiana. Este formulario no es un servicio de emergencias.'
                    : 'No hay respuestas buenas o malas. Responde pensando en tu experiencia real. Tus respuestas son confidenciales, excepto cuando indiquen que tu vida o tus derechos pueden estar en riesgo.'
                }}
              </p>
              <form [formGroup]="meta">
                <div class="form-grid">
                  <label
                    >{{ isChild() ? 'Código del niño o niña' : 'Código o identificador'
                    }}<input formControlName="codigoAdolescente" /></label
                  ><label
                    >{{ isChild() ? 'Edad del niño o niña' : 'Edad'
                    }}<input type="number" formControlName="edad"
                  /></label>
                  @if (isChild()) {
                    <label
                      >Relación del cuidador<select formControlName="relacionCuidador">
                        <option value="">Selecciona…</option>
                        <option value="MADRE">Madre</option>
                        <option value="PADRE">Padre</option>
                        <option value="ABUELO_A">Abuelo/a</option>
                        <option value="OTRO_FAMILIAR">Otro familiar</option>
                        <option value="CUIDADOR_NO_FAMILIAR">Cuidador no familiar</option>
                        <option value="OTRO">Otro</option>
                      </select></label
                    >
                  }
                  <label
                    >Institución<select
                      formControlName="institucionId"
                      [attr.aria-busy]="institutionsLoading()"
                    >
                      <option value="">
                        {{ institutionsLoading() ? 'Cargando instituciones…' : 'Selecciona…' }}
                      </option>
                      @for (i of institutions(); track i.id) {
                        <option [value]="i.id">{{ i.nombre }}</option>
                      }
                    </select></label
                  ><label
                    >Lugar de aplicación<select formControlName="lugarAplicacion">
                      <option value="FORMULARIO_PUBLICO">Formulario público</option>
                    </select></label
                  >
                </div>
                @if (institutionsError()) {
                  <div class="error" role="alert">
                    {{ institutionsError() }}
                    <button type="button" class="text-button" (click)="loadInstitutions()">
                      Reintentar
                    </button>
                  </div>
                } @else if (!institutionsLoading() && institutions().length === 0) {
                  <div class="notice warning" role="status">
                    <span
                      ><b>No hay instituciones registradas.</b><br />Antes de aplicar el
                      cuestionario, registra al menos una institución activa.</span
                    ><a class="secondary button small" href="/administracion/instituciones"
                      >Registrar institución</a
                    >
                  </div>
                }
                <button
                  class="primary"
                  type="button"
                  [disabled]="meta.invalid"
                  (click)="openConsent()"
                >
                  Continuar al consentimiento <span>→</span>
                </button>
              </form>
            </section>
          } @else {
            <section class="intro consent-card">
              <button
                class="text-button back-consent"
                type="button"
                (click)="consentStage.set(false)"
              >
                ← Volver a los datos iniciales
              </button>
              <span class="eyebrow">CONSENTIMIENTO Y ASENTIMIENTO</span>
              <h1>
                {{
                  isChild()
                    ? 'Su participación como cuidador es voluntaria'
                    : 'Tu participación es voluntaria'
                }}
              </h1>
              <div class="consent-versions" aria-label="Versiones institucionales">
                <span>CONSENT-MANIZALES-1.0</span>
                <span>ASSENT-MANIZALES-1.0</span>
              </div>
              <div class="consent-summary">
                @if (isChild()) {
                  <h2>Consentimiento informado para padre, madre o cuidador</h2>
                  <p>
                    La Secretaría de Salud de Manizales realiza un seguimiento del bienestar de
                    niños, niñas y adolescentes con el propósito de identificar necesidades de apoyo
                    y orientar oportunamente las rutas de atención disponibles.
                  </p>
                  <p>
                    Su participación consiste en responder un formulario breve sobre el bienestar,
                    comportamiento, relaciones familiares y situaciones recientes que puedan estar
                    afectando al niño, niña o adolescente. El diligenciamiento toma aproximadamente
                    5 a 7 minutos.
                  </p>
                  <p>
                    La participación es voluntaria. Puede dejar de responder en cualquier momento.
                    La información será tratada de forma confidencial y se utilizará para el
                    seguimiento en salud y para análisis poblacionales y programáticos autorizados.
                  </p>
                  <p>
                    Este formulario no realiza diagnósticos. Si alguna respuesta indica una posible
                    situación que pueda poner en riesgo la seguridad, la vida o los derechos del
                    niño, niña o adolescente, el equipo responsable podrá contactar a la familia y
                    activar las rutas de salud o protección correspondientes.
                  </p>
                  <p>
                    Al seleccionar “Sí, acepto”, confirmo que he leído y comprendido esta
                    información y autorizo la participación del niño, niña o adolescente a mi cargo
                    y el tratamiento de la información suministrada para los fines descritos.
                  </p>
                } @else {
                  <p>
                    La Secretaría de Salud de Manizales realiza un seguimiento del bienestar para
                    identificar necesidades de apoyo y orientar oportunamente las rutas de atención.
                  </p>
                  <p>
                    Responder toma aproximadamente 5 a 7 minutos. Este formulario no realiza
                    diagnósticos. La información será tratada de forma confidencial y se utilizará
                    para seguimiento en salud y análisis poblacionales autorizados.
                  </p>
                  <p>
                    Si alguna respuesta indica una posible situación que pueda poner en riesgo tu
                    seguridad, vida o derechos, el equipo responsable podrá buscar apoyo y activar
                    las rutas de salud o protección correspondientes.
                  </p>
                }
              </div>

              <form [formGroup]="consent">
                @if (isChild()) {
                  <fieldset class="consent-fieldset">
                    <legend>
                      ¿Acepta participar y autoriza el uso de la información para estos fines?
                    </legend>
                    <label class="consent-option"
                      ><input type="radio" formControlName="caregiver" value="YES" /><span
                        ><b>Sí, acepto</b
                        ><small
                          >Autorizo la participación y el tratamiento de la información para los
                          fines descritos.</small
                        ></span
                      ></label
                    ><label class="consent-option"
                      ><input
                        type="radio"
                        formControlName="caregiver"
                        value="NO"
                        (change)="decline()"
                      /><span
                        ><b>No acepto</b
                        ><small>El proceso finalizará sin mostrar las preguntas.</small></span
                      ></label
                    >
                  </fieldset>
                  <fieldset class="consent-fieldset">
                    <legend>Asentimiento para el niño o niña</legend>
                    <p>
                      Queremos hacerte unas preguntas para conocer cómo te has sentido y saber si
                      hay algo en lo que podamos ayudarte.
                    </p>
                    <p>
                      No hay respuestas buenas o malas. Puedes responder lo que realmente piensas o
                      sientes.
                    </p>
                    <p>
                      Participar es tu decisión. Si hay alguna pregunta que no entiendes, puedes
                      pedir ayuda. Si tus respuestas muestran que tú o alguien más puede estar en
                      peligro o necesita ayuda importante, una persona adulta del equipo podrá
                      hablar contigo y buscar apoyo.
                    </p>
                    @if (requiresAssistedAssent()) {
                      <div class="notice warning" role="note">
                        <span
                          ><b>Explicación acompañada requerida.</b><br />Para niños y niñas de 5 a 7
                          años, una persona adulta responsable debe explicar esta información.
                          Elegir una opción en pantalla no demuestra por sí sola que se comprendió
                          suficientemente el asentimiento.</span
                        >
                      </div>
                    }
                    <p><b>¿Quieres participar?</b></p>
                    <label class="consent-option"
                      ><input type="radio" formControlName="adolescent" value="YES" /><span
                        ><b>Sí, quiero participar</b
                        ><small>He comprendido la explicación y deseo continuar.</small></span
                      ></label
                    >
                    <label class="consent-option"
                      ><input
                        type="radio"
                        formControlName="adolescent"
                        value="NO"
                        (change)="decline()"
                      /><span
                        ><b>No quiero participar</b
                        ><small
                          >El formulario finalizará sin solicitar ni conservar respuestas
                          clínicas.</small
                        ></span
                      ></label
                    >
                  </fieldset>
                } @else if (isMinor()) {
                  <fieldset class="consent-fieldset">
                    <legend>Autorización del padre, madre o cuidador</legend>
                    <p>
                      Al seleccionar “Sí, acepto”, la persona adulta confirma que ha leído y
                      comprendido esta información y autoriza la participación del adolescente y el
                      tratamiento de la información para los fines descritos.
                    </p>
                    <label class="consent-option"
                      ><input type="radio" formControlName="caregiver" value="YES" />
                      <span
                        ><b>Sí, acepto</b
                        ><small
                          >Autorizo la participación y el uso de la información para estos
                          fines.</small
                        ></span
                      ></label
                    >
                    <label class="consent-option"
                      ><input type="radio" formControlName="caregiver" value="NO" />
                      <span
                        ><b>No acepto</b
                        ><small
                          >El instrumento finalizará sin enviar respuestas clínicas.</small
                        ></span
                      ></label
                    >
                  </fieldset>
                }

                @if (!isChild()) {
                  <fieldset class="consent-fieldset">
                    <legend>
                      {{
                        isMinor()
                          ? 'Asentimiento del adolescente'
                          : 'Consentimiento de la persona participante'
                      }}
                    </legend>
                    <p>
                      Queremos hacerte unas preguntas para conocer cómo te has sentido. No hay
                      respuestas buenas o malas. Participar es tu decisión. Tus respuestas no serán
                      compartidas de manera general con compañeros, docentes u otras familias.
                    </p>
                    <label class="consent-option"
                      ><input type="radio" formControlName="adolescent" value="YES" />
                      <span
                        ><b>Sí, quiero participar</b
                        ><small>He comprendido la información y deseo continuar.</small></span
                      ></label
                    >
                    <label class="consent-option"
                      ><input type="radio" formControlName="adolescent" value="NO" />
                      <span
                        ><b>No quiero participar</b
                        ><small
                          >El instrumento finalizará sin enviar respuestas clínicas.</small
                        ></span
                      ></label
                    >
                  </fieldset>
                }

                <div class="q-actions consent-actions">
                  <button
                    class="secondary"
                    type="button"
                    [disabled]="loading()"
                    (click)="decline()"
                  >
                    No participar
                  </button>
                  <button
                    class="primary"
                    type="button"
                    [disabled]="!canConsent() || loading()"
                    (click)="acceptConsent()"
                  >
                    {{ loading() ? 'Registrando decisión…' : 'Aceptar y comenzar →' }}
                  </button>
                </div>
                @if (error()) {
                  <div class="error" role="alert">{{ error() }}</div>
                }
              </form>
            </section>
          }
        } @else {
          <div class="progress">
            <span>Paso {{ step() }} de 6</span>
            <div><i [style.width.%]="(step() / 6) * 100"></i></div>
            <small>{{ answered() }} de 20 respondidas</small>
          </div>
          <section class="q-card">
            <span class="eyebrow">BLOQUE {{ step() }}</span>
            <h1>{{ block().title }}</h1>
            <p>{{ block().hint }}</p>
            @for (q of questions(); track q.n) {
              <fieldset>
                <legend>
                  <b>{{ q.n }}</b
                  >{{ q.text }}
                </legend>
                <div class="choices">
                  @for (v of values(q.n); track v) {
                    <label [class.selected]="answers()[q.n] === v"
                      ><input
                        type="radio"
                        [name]="'p' + q.n"
                        [value]="v"
                        [checked]="answers()[q.n] === v"
                        (change)="answer(q.n, v)"
                      /><strong>{{ v }}</strong
                      ><small>{{ label(q.n, v) }}</small></label
                    >
                  }
                </div>
                @if ((q.n === 5 || q.n === 6) && answers()[q.n] === undefined) {
                  <small class="required">Esta respuesta es necesaria para continuar.</small>
                }
              </fieldset>
            }
          </section>
          @if (error()) {
            <div class="error" role="alert">{{ error() }}</div>
          }
          <div class="q-actions">
            <button class="secondary" (click)="back()">← Anterior</button
            ><button class="primary" [disabled]="!validStep() || loading()" (click)="next()">
              {{ step() === 6 ? (loading() ? 'Enviando…' : 'Enviar respuestas') : 'Continuar →' }}
            </button>
          </div>
        }
      </div>
    }`,
})
export class QuestionnaireComponent {
  private fb = inject(FormBuilder);
  private publicApi = inject(PublicFormsService);
  step = signal(0);
  audience = signal<'ADOLESCENTE' | 'CUIDADOR'>('ADOLESCENTE');
  consentStage = signal(false);
  contextStage = signal(false);
  declined = signal(false);
  answers = signal<Record<number, number>>({});
  institutions = signal<PublicInstitution[]>([]);
  institutionsLoading = signal(true);
  institutionsError = signal('');
  loading = signal(false);
  sent = signal(false);
  error = signal('');
  private consentId = signal<string | null>(null);
  private submissionToken = signal<string | null>(null);
  started = new Date().toISOString();
  meta = this.fb.nonNullable.group({
    codigoAdolescente: ['', Validators.required],
    edad: [14, [Validators.required, Validators.min(11), Validators.max(19)]],
    relacionCuidador: [''],
    institucionId: ['', Validators.required],
    lugarAplicacion: ['FORMULARIO_PUBLICO', Validators.required],
  });
  consent = this.fb.nonNullable.group({ caregiver: [''], adolescent: ['', Validators.required] });
  context = this.fb.nonNullable.group({
    sexoRegistradoNacimiento: ['', Validators.required],
    escolarizacion: ['ESCOLARIZADO', Validators.required],
    grado: ['', Validators.required],
    comunaCorregimiento: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(120)],
    ],
    personaInformante: ['', Validators.required],
    lesionFisica: ['', Validators.required],
    familiaresHeridos: ['', Validators.required],
    salidaVivienda: ['', Validators.required],
    danosVivienda: ['', Validators.required],
    cambioResidenciaEscuelaCuidador: ['', Validators.required],
  });
  convivencia = signal<TipoConviviente[]>([]);
  tiposLesion = signal<TipoLesion[]>([]);
  necesidadesServicios = signal<NecesidadServicio[]>([]);
  contextError = signal('');
  grades = Array.from({ length: 11 }, (_, index) => ({
    value: `GRADO_${index + 1}`,
    label: `${index + 1}.º`,
  }));
  convivenciaOptions: { value: TipoConviviente; label: string }[] = [
    { value: 'MADRE', label: 'Madre' },
    { value: 'PADRE', label: 'Padre' },
    { value: 'HERMANOS_HERMANAS', label: 'Hermanos o hermanas' },
    { value: 'ABUELOS_ABUELAS', label: 'Abuelos o abuelas' },
    { value: 'OTROS_FAMILIARES', label: 'Otros familiares' },
    { value: 'FAMILIA_ACOGIDA_OTRO_CUIDADOR', label: 'Familia de acogida u otro cuidador' },
    { value: 'OTRA_SITUACION', label: 'Otra situación' },
  ];
  lesionOptions: { value: TipoLesion; label: string }[] = [
    { value: 'GOLPE_CONTUSION', label: 'Golpe o contusión' },
    { value: 'HERIDA_CORTADURA', label: 'Herida o cortadura' },
    { value: 'CAIDA', label: 'Caída' },
    { value: 'FRACTURA_LESION_IMPORTANTE', label: 'Fractura o lesión importante' },
    {
      value: 'DIFICULTAD_RESPIRATORIA_DESCOMPENSACION',
      label: 'Dificultad respiratoria o descompensación',
    },
    { value: 'OTRA', label: 'Otra' },
    { value: 'PREFIERE_NO_RESPONDER', label: 'Prefiero no responder' },
  ];
  serviceOptions: { value: NecesidadServicio; label: string }[] = [
    { value: 'AGUA', label: 'Agua' },
    { value: 'ENERGIA', label: 'Energía' },
    { value: 'ALIMENTACION', label: 'Alimentación' },
    { value: 'MEDICAMENTOS', label: 'Medicamentos' },
    { value: 'TRANSPORTE', label: 'Transporte' },
    { value: 'ACCESO_SERVICIOS_SALUD', label: 'Acceso a servicios de salud' },
    { value: 'NINGUNA', label: 'Ninguna' },
    { value: 'OTRA', label: 'Otra' },
  ];
  constructor() {
    this.loadInstitutions();
  }
  selectedInstitutionName() {
    return (
      this.institutions().find((item) => item.id === this.meta.controls.institucionId.value)
        ?.nombre || ''
    );
  }
  schoolingChanged() {
    const grade = this.context.controls.grado;
    if (this.context.controls.escolarizacion.value === 'NO_ESCOLARIZADO') {
      grade.setValue('');
      grade.clearValidators();
    } else grade.setValidators([Validators.required]);
    grade.updateValueAndValidity();
  }
  injuryReported() {
    return [
      'LEVE_SIN_ATENCION_MEDICA',
      'NECESITO_ATENCION_MEDICA',
      'NECESITO_HOSPITALIZACION',
    ].includes(this.context.controls.lesionFisica.value);
  }
  injuryChanged() {
    if (!this.injuryReported()) this.tiposLesion.set([]);
  }
  toggleConvivencia(value: TipoConviviente) {
    this.convivencia.update((items) =>
      items.includes(value) ? items.filter((item) => item !== value) : [...items, value],
    );
  }
  toggleInjury(value: TipoLesion) {
    this.tiposLesion.update((items) => {
      if (items.includes(value)) return items.filter((item) => item !== value);
      if (value === 'PREFIERE_NO_RESPONDER') return [value];
      return [...items.filter((item) => item !== 'PREFIERE_NO_RESPONDER'), value];
    });
  }
  toggleService(value: NecesidadServicio) {
    this.necesidadesServicios.update((items) => {
      if (items.includes(value)) return items.filter((item) => item !== value);
      if (value === 'NINGUNA') return [value];
      return [...items.filter((item) => item !== 'NINGUNA'), value];
    });
  }
  contextValid() {
    return (
      this.context.valid &&
      this.convivencia().length > 0 &&
      this.necesidadesServicios().length > 0 &&
      (!this.injuryReported() || this.tiposLesion().length > 0)
    );
  }
  continueFromContext() {
    if (!this.contextValid()) {
      this.context.markAllAsTouched();
      this.contextError.set(
        'Completa los campos obligatorios y selecciona al menos una opción en cada grupo.',
      );
      return;
    }
    this.contextError.set('');
    this.contextStage.set(false);
    this.step.set(1);
    scrollTo({ top: 0, behavior: 'smooth' });
  }
  private contextPayload(): SociodemographicContextInput {
    const value = this.context.getRawValue();
    return {
      sexoRegistradoNacimiento:
        value.sexoRegistradoNacimiento as SociodemographicContextInput['sexoRegistradoNacimiento'],
      escolarizacion: value.escolarizacion as SociodemographicContextInput['escolarizacion'],
      grado:
        value.escolarizacion === 'ESCOLARIZADO'
          ? (value.grado as SociodemographicContextInput['grado'])
          : null,
      comunaCorregimiento: value.comunaCorregimiento.trim(),
      convivencia: this.convivencia(),
      personaInformante:
        value.personaInformante as SociodemographicContextInput['personaInformante'],
      lesionFisica: value.lesionFisica as SociodemographicContextInput['lesionFisica'],
      tiposLesion: this.tiposLesion(),
      familiaresHeridos:
        value.familiaresHeridos as SociodemographicContextInput['familiaresHeridos'],
      salidaVivienda: value.salidaVivienda as SociodemographicContextInput['salidaVivienda'],
      danosVivienda: value.danosVivienda as SociodemographicContextInput['danosVivienda'],
      necesidadesServicios: this.necesidadesServicios(),
      cambioResidenciaEscuelaCuidador:
        value.cambioResidenciaEscuelaCuidador as SociodemographicContextInput['cambioResidenciaEscuelaCuidador'],
    };
  }
  loadInstitutions() {
    this.institutionsLoading.set(true);
    this.institutionsError.set('');
    this.publicApi.institutions().subscribe({
      next: (r) => {
        this.institutions.set(r.institutions);
        this.institutionsLoading.set(false);
      },
      error: (e: HttpErrorResponse) => {
        this.institutionsLoading.set(false);
        this.institutionsError.set(
          e.status === 429
            ? 'Hay demasiados intentos. Espera un momento y vuelve a intentar.'
            : 'No fue posible cargar las instituciones.',
        );
      },
    });
  }
  block() {
    return (this.isChild() ? childBlocks : adolescentBlocks)[this.step() - 1];
  }
  isChild() {
    return this.audience() === 'CUIDADOR';
  }
  selectAudience(audience: 'ADOLESCENTE' | 'CUIDADOR') {
    this.audience.set(audience);
    this.answers.set({});
    const age = this.meta.controls.edad;
    const relationship = this.meta.controls.relacionCuidador;
    if (audience === 'CUIDADOR') {
      age.setValue(8);
      age.setValidators([Validators.required, Validators.min(5), Validators.max(10)]);
      relationship.setValidators([Validators.required]);
    } else {
      age.setValue(14);
      age.setValidators([Validators.required, Validators.min(11), Validators.max(19)]);
      relationship.clearValidators();
      relationship.setValue('');
    }
    age.updateValueAndValidity();
    relationship.updateValueAndValidity();
  }
  isMinor() {
    return this.meta.controls.edad.value < 18;
  }
  requiresAssistedAssent() {
    const age = this.meta.controls.edad.value;
    return this.isChild() && age >= 5 && age <= 7;
  }
  openConsent() {
    if (this.meta.invalid) {
      this.meta.markAllAsTouched();
      return;
    }
    this.consent.reset({ caregiver: '', adolescent: '' });
    this.consentStage.set(true);
    scrollTo({ top: 0, behavior: 'smooth' });
  }
  canConsent() {
    const value = this.consent.getRawValue();
    if (this.isChild()) return value.caregiver === 'YES' && value.adolescent === 'YES';
    return value.adolescent === 'YES' && (!this.isMinor() || value.caregiver === 'YES');
  }
  acceptConsent() {
    if (!this.canConsent()) return;
    this.registerConsent('ACEPTADO');
  }
  decline() {
    this.registerConsent('RECHAZADO');
  }
  private consentPayload(decision: 'ACEPTADO' | 'RECHAZADO'): PublicConsentInput {
    const meta = this.meta.getRawValue();
    const choices = this.consent.getRawValue();
    const childAssent =
      choices.adolescent === 'NO'
        ? 'RECHAZADO'
        : choices.adolescent === 'YES' && decision === 'ACEPTADO'
          ? 'ACEPTADO'
          : 'NO_APLICA';
    return {
      institucionId: meta.institucionId,
      codigoParticipante: meta.codigoAdolescente,
      tipoInformante: this.audience(),
      ...(this.isChild() ? { relacionCuidador: meta.relacionCuidador } : {}),
      decision: this.isChild() && choices.caregiver !== 'YES' ? 'RECHAZADO' : decision,
      versionTexto: 'CONSENT-MANIZALES-1.0',
      asentimiento: this.isChild() ? childAssent : decision,
      versionTextoAsentimiento:
        this.isChild() && childAssent === 'NO_APLICA' ? null : 'ASSENT-MANIZALES-1.0',
    };
  }
  private registerConsent(decision: 'ACEPTADO' | 'RECHAZADO') {
    this.loading.set(true);
    this.error.set('');
    this.publicApi.consent(this.consentPayload(decision)).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (decision === 'RECHAZADO' || !response.formAllowed) {
          this.answers.set({});
          this.declined.set(true);
          return;
        }
        if (!response.submissionToken) {
          this.error.set(
            'El servidor no entregó el permiso temporal. Vuelve a iniciar el proceso.',
          );
          return;
        }
        this.consentId.set(response.consent.id);
        this.submissionToken.set(response.submissionToken);
        this.started = new Date().toISOString();
        this.contextStage.set(true);
        scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (e: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(
          e.status === 429
            ? 'Hay demasiados intentos. Espera un momento.'
            : e.error?.error?.message || 'No fue posible registrar la decisión.',
        );
      },
    });
  }
  questions(): Q[] {
    return this.block().qs.map(([n, text]) => ({ n, text }));
  }
  values(n: number) {
    if (this.isChild()) return n === 5 || n === 6 ? [0, 1, 2, 3, 9] : [0, 1, 2, 3];
    return Array.from({ length: n <= 6 ? 4 : 5 }, (_, i) => i);
  }
  label(n: number, v: number) {
    if (this.isChild()) {
      if ((n === 5 || n === 6) && v === 9) return 'No sé / no puedo responder';
      return n === 5 || n === 6
        ? ['No', 'Sí, una vez', 'Sí, más de una vez', 'Sí, actualmente o repetidamente'][v]
        : ['Nunca', 'Algunos días', 'Muchos días', 'Casi todos los días'][v];
    }
    if (n <= 6) return ['Nunca', 'Una o dos veces', 'Varias veces', 'Con frecuencia'][v];
    return [
      'Nada / totalmente en desacuerdo',
      'Poco / en desacuerdo',
      'Algo / neutral',
      'Bastante / de acuerdo',
      'Mucho / totalmente de acuerdo',
    ][v];
  }
  answer(n: number, v: number) {
    this.answers.update((a) => ({ ...a, [n]: v }));
  }
  answered() {
    return Object.keys(this.answers()).length;
  }
  validStep() {
    return this.questions().every((q) => this.answers()[q.n] !== undefined);
  }
  back() {
    this.step.update((s) => Math.max(0, s - 1));
  }
  next() {
    if (!this.validStep()) return;
    if (this.step() < 6) {
      this.step.update((s) => s + 1);
      scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const m = this.meta.getRawValue();
    const submissionToken = this.submissionToken();
    const consentimientoId = this.consentId();
    if (!submissionToken || !consentimientoId) {
      this.restartPublicFlow(
        'El permiso temporal no está disponible. Registra nuevamente el consentimiento.',
      );
      return;
    }
    this.loading.set(true);
    this.publicApi
      .submit(
        submissionToken,
        {
          codigoAdolescente: m.codigoAdolescente,
          edad: m.edad,
          institucionId: m.institucionId,
          lugarAplicacion: m.lugarAplicacion,
          consentimientoId,
          versionInstrumento: this.isChild() ? 'IPBIM-C20-1.0' : 'IPBAM-20-1.0',
          fechaInicio: this.started,
          respuestas: Object.entries(this.answers()).map(([pregunta, valor]) => ({
            pregunta: +pregunta,
            valor,
          })),
        },
        this.contextPayload(),
      )
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.sent.set(true);
        },
        error: (e: HttpErrorResponse) => {
          this.loading.set(false);
          const code = e.error?.error?.code;
          if (e.status === 401 && code === 'PUBLIC_SUBMISSION_TOKEN_INVALID')
            this.restartPublicFlow('El permiso venció. Registra nuevamente el consentimiento.');
          else if (e.status === 403)
            this.error.set('Los datos no coinciden con el consentimiento. Reinicia el formulario.');
          else if (e.status === 409)
            this.error.set('Este consentimiento ya fue utilizado. No se permite un segundo envío.');
          else if (e.status === 429)
            this.error.set('Hay demasiados intentos. Espera un momento antes de volver a enviar.');
          else
            this.error.set(
              e.error?.error?.message ||
                'No fue posible enviar las respuestas. No se guardaron cambios.',
            );
        },
      });
  }
  private restartPublicFlow(message: string) {
    this.loading.set(false);
    this.submissionToken.set(null);
    this.consentId.set(null);
    this.answers.set({});
    this.step.set(0);
    this.consentStage.set(true);
    this.error.set(message);
  }
}
