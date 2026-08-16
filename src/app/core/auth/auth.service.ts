import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, map, Observable, of, switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Role, User } from '../models/api.models';
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private key = 'bienestar_session_token';
  user = signal<User | null>(null);
  initialized = signal(false);
  isAuthenticated = computed(() => !!this.user());
  get token() {
    return sessionStorage.getItem(this.key);
  }
  login(email: string, password: string): Observable<User> {
    return this.http
      .post<{ token: string }>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((r) => sessionStorage.setItem(this.key, r.token)),
        switchMap(() => this.loadMe()),
      );
  }
  loadMe() {
    return this.http.get<{ user: User }>(`${environment.apiUrl}/auth/me`).pipe(
      map((r) => r.user),
      tap((u) => {
        this.user.set(u);
        this.initialized.set(true);
      }),
    );
  }
  restoreSession() {
    if (!this.token) {
      this.initialized.set(true);
      return;
    }
    this.loadMe()
      .pipe(
        catchError(() => {
          this.logout(false);
          return of(null);
        }),
      )
      .subscribe();
  }
  logout(nav = true) {
    sessionStorage.removeItem(this.key);
    this.user.set(null);
    this.initialized.set(true);
    if (nav) this.router.navigate(['/login']);
  }
  hasRole(rs: Role[]) {
    const r = this.user()?.rol;
    return !!r && rs.includes(r);
  }
}
