import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';
describe('Aplicación', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter(routes)],
    });
  });
  it('crea la aplicación con todas las rutas válidas', () => {
    expect(TestBed.createComponent(App).componentInstance).toBeTruthy();
  });
  it('incluye rutas protegidas principales', () => {
    const shell = routes.find((r) => r.path === '');
    const paths = shell?.children?.map((r) => r.path) || [];
    expect(paths).toContain('dashboard');
    expect(paths).toContain('aplicaciones/nueva');
    expect(paths).toContain('casos/:id');
    expect(paths).toContain('seguimientos');
  });
});
