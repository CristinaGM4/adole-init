import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { QuestionnaireComponent } from './questionnaire.component';
import { Validators } from '@angular/forms';
describe('IPBAM-20', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [QuestionnaireComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }),
  );
  it('renderiza el inicio sin perfil técnico ni diagnóstico', () => {
    const f = TestBed.createComponent(QuestionnaireComponent);
    TestBed.inject(HttpTestingController)
      .expectOne((r) => r.url.endsWith('/public/institutions'))
      .flush({ institutions: [] });
    f.detectChanges();
    const text = f.nativeElement.textContent;
    expect(text).toContain('Queremos saber cómo te has sentido');
    expect(text).not.toContain('riesgo alto');
    expect(text).not.toContain('diagnóstico');
  });
  it('valida edad adolescente', () => {
    const f = TestBed.createComponent(QuestionnaireComponent);
    TestBed.inject(HttpTestingController)
      .expectOne((r) => r.url.endsWith('/public/institutions'))
      .flush({ institutions: [] });
    f.componentInstance.meta.patchValue({ edad: 20 });
    expect(f.componentInstance.meta.controls.edad.invalid).toBe(true);
  });
  it('P5 y P6 usan rango 0–3 y son requeridas para avanzar', () => {
    const f = TestBed.createComponent(QuestionnaireComponent);
    TestBed.inject(HttpTestingController)
      .expectOne((r) => r.url.endsWith('/public/institutions'))
      .flush({ institutions: [] });
    f.componentInstance.step.set(2);
    expect(f.componentInstance.values(5)).toEqual([0, 1, 2, 3]);
    expect(f.componentInstance.validStep()).toBe(false);
    f.componentInstance.answer(5, 0);
    f.componentInstance.answer(6, 0);
    expect(f.componentInstance.validStep()).toBe(true);
  });
  it('selecciona IPBIM-C20 para niños y admite No sé solo en P5/P6', () => {
    const f = TestBed.createComponent(QuestionnaireComponent);
    TestBed.inject(HttpTestingController)
      .expectOne((r) => r.url.endsWith('/public/institutions'))
      .flush({ institutions: [] });
    f.componentInstance.selectAudience('CUIDADOR');
    expect(f.componentInstance.meta.controls.edad.value).toBe(8);
    expect(f.componentInstance.values(5)).toEqual([0, 1, 2, 3, 9]);
    expect(f.componentInstance.values(7)).toEqual([0, 1, 2, 3]);
    f.componentInstance.meta.patchValue({ edad: 11 });
    expect(f.componentInstance.meta.controls.edad.invalid).toBe(true);
  });
  it('asigna automáticamente adolescente como persona informante en IPBAM', () => {
    const f = TestBed.createComponent(QuestionnaireComponent);
    TestBed.inject(HttpTestingController)
      .expectOne((r) => r.url.endsWith('/public/institutions'))
      .flush({ institutions: [] });
    expect(f.componentInstance.context.controls.personaInformante.value).toBe('ADOLESCENTE');
    f.componentInstance.selectAudience('CUIDADOR');
    expect(f.componentInstance.context.controls.personaInformante.value).toBe('');
    f.componentInstance.context.controls.personaInformante.setValue('MADRE');
    f.componentInstance.selectAudience('ADOLESCENTE');
    expect(f.componentInstance.context.controls.personaInformante.value).toBe('ADOLESCENTE');
  });
  it('registra consentimiento y asentimiento infantil por separado', () => {
    const f = TestBed.createComponent(QuestionnaireComponent);
    const http = TestBed.inject(HttpTestingController);
    http.expectOne((r) => r.url.endsWith('/public/institutions')).flush({ institutions: [] });
    f.componentInstance.selectAudience('CUIDADOR');
    f.componentInstance.meta.patchValue({
      institucionId: '11111111-1111-4111-8111-111111111111',
      codigoAdolescente: 'NINO-TEST',
      relacionCuidador: 'MADRE',
    });
    f.componentInstance.consent.patchValue({ caregiver: 'YES', adolescent: 'YES' });
    f.componentInstance.acceptConsent();
    const request = http.expectOne((r) => r.url.endsWith('/public/consents'));
    expect(request.request.body.tipoInformante).toBe('CUIDADOR');
    expect(request.request.body.relacionCuidador).toBe('MADRE');
    expect(request.request.body.asentimiento).toBe('ACEPTADO');
    expect(request.request.body.versionTextoAsentimiento).toBe('ASSENT-MANIZALES-1.0');
    request.flush({ consent: { id: 'consent-child' }, formAllowed: false });
  });
  it('exige explicación acompañada del asentimiento entre 5 y 7 años', () => {
    const f = TestBed.createComponent(QuestionnaireComponent);
    TestBed.inject(HttpTestingController)
      .expectOne((r) => r.url.endsWith('/public/institutions'))
      .flush({ institutions: [] });
    f.componentInstance.selectAudience('CUIDADOR');
    f.componentInstance.meta.controls.edad.setValue(6);
    expect(f.componentInstance.requiresAssistedAssent()).toBe(true);
    f.componentInstance.meta.controls.edad.setValue(8);
    expect(f.componentInstance.requiresAssistedAssent()).toBe(false);
  });
  it('aplica grado condicional y tipo de lesión condicional', () => {
    const f = TestBed.createComponent(QuestionnaireComponent);
    TestBed.inject(HttpTestingController)
      .expectOne((r) => r.url.endsWith('/public/institutions'))
      .flush({ institutions: [] });
    f.componentInstance.context.patchValue({
      escolarizacion: 'NO_ESCOLARIZADO',
      grado: 'GRADO_5',
      lesionFisica: 'NO',
    });
    f.componentInstance.schoolingChanged();
    f.componentInstance.injuryChanged();
    expect(f.componentInstance.context.controls.grado.value).toBe('');
    expect(f.componentInstance.context.controls.grado.hasValidator(Validators.required)).toBe(
      false,
    );
    expect(f.componentInstance.tiposLesion()).toEqual([]);
  });
  it('mantiene Ninguna y Prefiero no responder como opciones exclusivas', () => {
    const f = TestBed.createComponent(QuestionnaireComponent);
    TestBed.inject(HttpTestingController)
      .expectOne((r) => r.url.endsWith('/public/institutions'))
      .flush({ institutions: [] });
    f.componentInstance.toggleService('AGUA');
    f.componentInstance.toggleService('NINGUNA');
    expect(f.componentInstance.necesidadesServicios()).toEqual(['NINGUNA']);
    f.componentInstance.toggleInjury('CAIDA');
    f.componentInstance.toggleInjury('PREFIERE_NO_RESPONDER');
    expect(f.componentInstance.tiposLesion()).toEqual(['PREFIERE_NO_RESPONDER']);
  });
  it('exige autorización del cuidador y asentimiento cuando es menor de edad', () => {
    const f = TestBed.createComponent(QuestionnaireComponent);
    TestBed.inject(HttpTestingController)
      .expectOne((r) => r.url.endsWith('/public/institutions'))
      .flush({ institutions: [] });
    f.componentInstance.meta.patchValue({ edad: 14 });
    f.componentInstance.consent.patchValue({ caregiver: 'YES', adolescent: '' });
    expect(f.componentInstance.canConsent()).toBe(false);
    f.componentInstance.consent.patchValue({ adolescent: 'YES' });
    expect(f.componentInstance.canConsent()).toBe(true);
  });
  it('un rechazo finaliza sin enviar respuestas clínicas', () => {
    const f = TestBed.createComponent(QuestionnaireComponent);
    const http = TestBed.inject(HttpTestingController);
    http.expectOne((r) => r.url.endsWith('/public/institutions')).flush({ institutions: [] });
    f.componentInstance.consent.patchValue({ caregiver: 'NO', adolescent: 'NO' });
    f.componentInstance.decline();
    const consentRequest = http.expectOne((r) => r.url.endsWith('/public/consents'));
    expect(consentRequest.request.body.decision).toBe('RECHAZADO');
    consentRequest.flush({ consent: { id: 'consent-1' }, formAllowed: false });
    expect(f.componentInstance.declined()).toBe(true);
    expect(f.componentInstance.answers()).toEqual({});
    http.expectNone((r) => r.url.endsWith('/aplicaciones'));
  });
});
