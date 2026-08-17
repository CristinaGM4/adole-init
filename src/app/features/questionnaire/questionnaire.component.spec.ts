import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { QuestionnaireComponent } from './questionnaire.component';
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
      .expectOne((r) => r.url.endsWith('/instituciones'))
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
      .expectOne((r) => r.url.endsWith('/instituciones'))
      .flush({ institutions: [] });
    f.componentInstance.meta.patchValue({ edad: 20 });
    expect(f.componentInstance.meta.controls.edad.invalid).toBe(true);
  });
  it('P5 y P6 usan rango 0–3 y son requeridas para avanzar', () => {
    const f = TestBed.createComponent(QuestionnaireComponent);
    TestBed.inject(HttpTestingController)
      .expectOne((r) => r.url.endsWith('/instituciones'))
      .flush({ institutions: [] });
    f.componentInstance.step.set(2);
    expect(f.componentInstance.values(5)).toEqual([0, 1, 2, 3]);
    expect(f.componentInstance.validStep()).toBe(false);
    f.componentInstance.answer(5, 0);
    f.componentInstance.answer(6, 0);
    expect(f.componentInstance.validStep()).toBe(true);
  });
  it('exige autorización del cuidador y asentimiento cuando es menor de edad', () => {
    const f = TestBed.createComponent(QuestionnaireComponent);
    TestBed.inject(HttpTestingController)
      .expectOne((r) => r.url.endsWith('/instituciones'))
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
    http.expectOne((r) => r.url.endsWith('/instituciones')).flush({ institutions: [] });
    f.componentInstance.consent.patchValue({ caregiver: 'NO', adolescent: 'NO' });
    f.componentInstance.decline();
    expect(f.componentInstance.declined()).toBe(true);
    expect(f.componentInstance.answers()).toEqual({});
    http.expectNone((r) => r.url.endsWith('/aplicaciones'));
  });
});
