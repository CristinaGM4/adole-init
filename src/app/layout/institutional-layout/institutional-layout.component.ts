import { Component, HostListener, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
@Component({
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `<div class="app-shell" [class.menu-open]="menu()">
    @if (menu()) {
      <button
        class="sidebar-backdrop"
        type="button"
        aria-label="Cerrar menú"
        (click)="closeMenu()"
      ></button>
    }
    <aside id="institutional-sidebar" [class.open]="menu()">
      <button class="sidebar-close" type="button" aria-label="Cerrar menú" (click)="closeMenu()">
        ×
      </button>
      <a class="logo" routerLink="/dashboard"
        ><b>M</b><span>Bienestar<br /><small>Adolescente</small></span></a
      >
      <nav>
        <p>MONITOREO</p>
        <a routerLink="/dashboard" routerLinkActive="active">⌂ <span>Inicio</span></a>
        @if (auth.hasRole(['ADMIN', 'SECRETARIA_SALUD', 'RESPONSABLE_INSTITUCIONAL'])) {
          <a routerLink="/aplicaciones" routerLinkActive="active">▤ <span>Aplicaciones</span></a>
        }
        <a routerLink="/alertas" routerLinkActive="active">◈ <span>Alertas y casos</span></a
        ><a routerLink="/casos" routerLinkActive="active">□ <span>Casos</span></a
        ><a routerLink="/seguimientos" routerLinkActive="active">◷ <span>Seguimientos</span></a>
        <p>RECURSOS</p>
        <a routerLink="/directorio" routerLinkActive="active">⌘ <span>Directorio</span></a>
        @if (auth.hasRole(['ADMIN'])) {
          <a routerLink="/administracion" routerLinkActive="active"
            >⚙ <span>Administración</span></a
          >
        }
      </nav>
      <div class="sidebar-foot">Salud Mental Escolar<br /><small>Manizales · 2026</small></div>
    </aside>
    <section class="workspace">
      <header>
        <button
          class="menu-btn"
          (click)="toggleMenu()"
          aria-label="Abrir menú"
          aria-controls="institutional-sidebar"
          [attr.aria-expanded]="menu()"
        >
          ☰
        </button>
        <div>
          <strong>Monitoreo de bienestar adolescente</strong
          ><small>{{ auth.user()?.institucion?.nombre || 'Alcance institucional' }}</small>
        </div>
        <div class="user">
          <span class="avatar">{{ auth.user()?.nombre?.charAt(0) || 'U' }}</span
          ><span
            ><b>{{ auth.user()?.nombre }}</b
            ><small>{{ roleLabel() }}</small></span
          ><button (click)="auth.logout()" aria-label="Cerrar sesión">Salir</button>
        </div>
      </header>
      <main class="content"><router-outlet /></main>
    </section>
  </div>`,
})
export class InstitutionalLayoutComponent {
  auth = inject(AuthService);
  private router = inject(Router);
  menu = signal(false);
  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.closeMenu());
  }
  toggleMenu() {
    this.menu.update((open) => !open);
  }
  closeMenu() {
    this.menu.set(false);
  }
  @HostListener('document:keydown.escape')
  onEscape() {
    this.closeMenu();
  }
  roleLabel() {
    return (this.auth.user()?.rol || '').replaceAll('_', ' ');
  }
}
