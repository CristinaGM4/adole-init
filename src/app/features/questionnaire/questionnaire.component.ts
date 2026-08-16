import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApplicationsService, InstitutionsService } from '../../core/services/api.services';
import { Institution } from '../../core/models/api.models';
import { HttpErrorResponse } from '@angular/common/http';
type Q = { n: number; text: string };
const blocks = [
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
@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `@if (sent()) {
      <section class="thanks">
        <div>✓</div>
        <span class="eyebrow">RESPUESTAS RECIBIDAS</span>
        <h1>Gracias por responder.</h1>
        <p>Hemos recibido tus respuestas.</p>
        <p>
          Si alguna respuesta indica que puede ser útil conversar contigo, una persona autorizada de
          la institución podrá contactarte de manera privada.
        </p>
        <small>Ya puedes cerrar esta ventana.</small>
      </section>
    } @else {
      <div class="questionnaire">
        <div class="q-top">
          <span class="logo mini"><b>M</b></span>
          <div><b>IPBAM-20</b><small>Bienestar adolescente · Manizales</small></div>
          <span>Sesión segura</span>
        </div>
        @if (step() === 0) {
          <section class="intro">
            <span class="eyebrow">ANTES DE COMENZAR</span>
            <h1>Queremos saber cómo te has sentido</h1>
            <p>
              No hay respuestas buenas o malas. Responde pensando en tu experiencia real. Tus
              respuestas son confidenciales, excepto cuando indiquen que tu vida o tus derechos
              pueden estar en riesgo.
            </p>
            <form [formGroup]="meta">
              <div class="form-grid">
                <label>Código o identificador<input formControlName="codigoAdolescente" /></label
                ><label>Edad<input type="number" formControlName="edad" /></label
                ><label
                  >Institución<select formControlName="institucionId" [attr.aria-busy]="institutionsLoading()">
                    <option value="">{{ institutionsLoading() ? 'Cargando instituciones…' : 'Selecciona…' }}</option>
                    @for (i of institutions(); track i.id) {
                      <option [value]="i.id">{{ i.nombre }}</option>
                    }
                  </select></label
                ><label
                  >Lugar de aplicación<select formControlName="lugarAplicacion">
                    <option value="INSTITUCION_EDUCATIVA">Institución educativa</option>
                    <option value="CENTRO_SALUD">Centro de salud</option>
                    <option value="COMUNIDAD">Comunidad</option>
                    <option value="OTRO">Otro</option>
                  </select></label
                >
              </div>
              @if (institutionsError()) {
                <div class="error" role="alert">{{ institutionsError() }} <button type="button" class="text-button" (click)="loadInstitutions()">Reintentar</button></div>
              } @else if (!institutionsLoading() && institutions().length === 0) {
                <div class="notice warning" role="status"><span><b>No hay instituciones registradas.</b><br>Antes de aplicar el cuestionario, registra al menos una institución activa.</span><a class="secondary button small" href="/administracion/instituciones">Registrar institución</a></div>
              }
              <button class="primary" type="button" [disabled]="meta.invalid" (click)="step.set(1)">
                Comenzar <span>→</span>
              </button>
            </form>
          </section>
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
  private apps = inject(ApplicationsService);
  step = signal(0);
  answers = signal<Record<number, number>>({});
  institutions = signal<Institution[]>([]);
  institutionsLoading = signal(true);
  institutionsError = signal('');
  loading = signal(false);
  sent = signal(false);
  error = signal('');
  started = new Date().toISOString();
  meta = this.fb.nonNullable.group({
    codigoAdolescente: ['', Validators.required],
    edad: [14, [Validators.required, Validators.min(11), Validators.max(19)]],
    institucionId: ['', Validators.required],
    lugarAplicacion: ['INSTITUCION_EDUCATIVA', Validators.required],
  });
  private institutionsApi = inject(InstitutionsService);
  constructor() { this.loadInstitutions(); }
  loadInstitutions() {
    this.institutionsLoading.set(true);
    this.institutionsError.set('');
    this.institutionsApi.list().subscribe({
      next: (r) => { this.institutions.set(r.institutions.filter((i) => i.activa)); this.institutionsLoading.set(false); },
      error: (e: HttpErrorResponse) => { this.institutionsLoading.set(false); this.institutionsError.set(e.status === 403 ? 'Tu usuario no tiene permiso para consultar instituciones.' : 'No fue posible cargar las instituciones.'); }
    });
  }
  block() {
    return blocks[this.step() - 1];
  }
  questions(): Q[] {
    return this.block().qs.map(([n, text]) => ({ n, text }));
  }
  values(n: number) {
    return Array.from({ length: n <= 6 ? 4 : 5 }, (_, i) => i);
  }
  label(n: number, v: number) {
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
    this.loading.set(true);
    const m = this.meta.getRawValue();
    this.apps
      .create({
        ...m,
        versionInstrumento: 'IPBAM-20-1.0',
        fechaInicio: this.started,
        respuestas: Object.entries(this.answers()).map(([pregunta, valor]) => ({
          pregunta: +pregunta,
          valor,
        })),
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.sent.set(true);
        },
        error: (e: HttpErrorResponse) => {
          this.loading.set(false);
          this.error.set(
            (e.error as { error?: { message?: string } })?.error?.message ||
              'No fue posible enviar las respuestas. No se guardaron cambios.',
          );
        },
      });
  }
}
