import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { runInInjectionContext } from '@angular/core';
import { authGuard } from './auth.guard';
import { roleGuard } from './role.guard';
import { AuthService } from '../auth/auth.service';
describe('Guards', () => {
  const auth = {
    token: null as string | null,
    user: () => ({ rol: 'ADMIN' }),
    hasRole: (r: string[]) => r.includes('ADMIN'),
  };
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
    }),
  );
  it('AuthGuard bloquea sin token', () => {
    auth.token = null;
    const result = runInInjectionContext(TestBed.inject(EnvironmentInjector), () =>
      authGuard({} as never, {} as never),
    );
    expect(result).not.toBe(true);
  });
  it('RoleGuard permite rol autorizado', () => {
    const result = runInInjectionContext(TestBed.inject(EnvironmentInjector), () =>
      roleGuard({ data: { roles: ['ADMIN'] } } as never, {} as never),
    );
    expect(result).toBe(true);
  });
});
import { EnvironmentInjector } from '@angular/core';
