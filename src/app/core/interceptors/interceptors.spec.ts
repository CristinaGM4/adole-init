import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { authInterceptor } from './auth.interceptor';
import { errorInterceptor } from './error.interceptor';
@Component({ template: '' })
class EmptyComponent {}
describe('Interceptores HTTP', () => {
  let http: HttpClient;
  let control: HttpTestingController;
  let auth: AuthService;
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'login', component: EmptyComponent }]),
        provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    control = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
  });
  afterEach(() => control.verify());
  it('agrega Authorization Bearer sin registrar el token', () => {
    sessionStorage.setItem('bienestar_session_token', 'secreto');
    http.get('/recurso').subscribe();
    expect(control.expectOne('/recurso').request.headers.get('Authorization')).toBe(
      'Bearer secreto',
    );
  });
  it('401 cierra la sesión', () => {
    sessionStorage.setItem('bienestar_session_token', 'secreto');
    http.get('/recurso').subscribe({ error: () => expect(auth.token).toBeNull() });
    control
      .expectOne('/recurso')
      .flush(
        { error: { code: 'UNAUTHORIZED', message: 'Sesión vencida' } },
        { status: 401, statusText: 'Unauthorized' },
      );
  });
  it.each([403, 409, 422])('%s conserva la sesión y propaga el error de negocio', (status) => {
    sessionStorage.setItem('bienestar_session_token', 'secreto');
    http.get('/recurso').subscribe({
      error: (e) => {
        expect(e.status).toBe(status);
        expect(auth.token).toBe('secreto');
      },
    });
    control
      .expectOne('/recurso')
      .flush(
        { error: { code: 'BUSINESS_ERROR', message: 'Operación no permitida' } },
        { status, statusText: 'Error' },
      );
  });
});
