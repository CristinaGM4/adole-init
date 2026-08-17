import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AlertsService } from '../../core/services/api.services';
import { Alert } from '../../core/models/api.models';
import { AuthService } from '../../core/auth/auth.service';
@Component({
  standalone: true,
  imports: [DatePipe, RouterLink],
  template: `<div class="page-head">
      <div>
        <span class="eyebrow">ATENCIÓN PRIORITARIA</span>
        <h1>Alertas</h1>
        <p>Señales de seguridad que requieren responsable y valoración humana.</p>
      </div>
    </div>
    <div class="notice warning">
      <b>Privacidad clínica</b
      ><span
        >La bandeja muestra solo información operativa. La valoración se registra dentro del
        caso.</span
      >
    </div>
    <section class="panel">
      <div class="filter-row">
        <select aria-label="Filtrar estado">
          <option>Todos los estados</option>
          <option>Sin responsable</option>
          <option>Pendiente de valoración</option>
          <option>En valoración</option>
          <option>Resuelta</option>
        </select>
      </div>
      @if (loading()) {
        <div class="state-card">Cargando alertas…</div>
      } @else if (error()) {
        <div class="state-card error">{{ error() }}</div>
      } @else if (!items().length) {
        <div class="state-card">
          <div class="state-icon">✓</div>
          <h2>No hay alertas en esta bandeja</h2>
        </div>
      } @else {
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Alerta</th>
                <th>Caso</th>
                <th>Fecha y hora</th>
                <th>Estado</th>
                <th>Responsable</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              @for (a of items(); track a.id) {
                <tr>
                  <td>
                    <b>#{{ a.id.slice(0, 8) }}</b>
                  </td>
                  <td>
                    <a [routerLink]="['/casos', a.casoId]">#{{ a.casoId.slice(0, 8) }}</a>
                  </td>
                  <td>{{ a.generadaAt | date: 'dd MMM yyyy, HH:mm' }}</td>
                  <td>
                    <span class="badge" [class.warning]="a.estado === 'SIN_RESPONSABLE'">{{
                      label(a.estado)
                    }}</span>
                  </td>
                  <td>{{ a.responsable?.nombre || 'Sin responsable' }}</td>
                  <td>
                    @if (
                      a.estado === 'SIN_RESPONSABLE' &&
                      auth.hasRole(['ADMIN', 'SECRETARIA_EDUCACION'])
                    ) {
                      <button
                        class="small primary"
                        [disabled]="working() === a.id"
                        (click)="assume(a)"
                      >
                        {{ working() === a.id ? 'Asignando…' : 'Asumir alerta' }}
                      </button>
                    } @else {
                      <a [routerLink]="['/casos', a.casoId]">Ver caso →</a>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>`,
})
export class AlertsComponent {
  private api = inject(AlertsService);
  auth = inject(AuthService);
  items = signal<Alert[]>([]);
  loading = signal(true);
  error = signal('');
  working = signal('');
  constructor() {
    this.load();
  }
  load() {
    this.api.list().subscribe({
      next: (r) => {
        this.items.set(r.alerts);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No fue posible cargar las alertas.');
        this.loading.set(false);
      },
    });
  }
  label(s: string) {
    return (
      (
        {
          SIN_RESPONSABLE: 'Sin responsable',
          PENDIENTE_VALORACION: 'Pendiente de valoración',
          EN_VALORACION: 'En valoración',
          RESUELTA: 'Resuelta',
        } as Record<string, string>
      )[s] || s
    );
  }
  assume(a: Alert) {
    this.working.set(a.id);
    this.api.assume(a.id).subscribe({
      next: () => {
        this.working.set('');
        this.load();
      },
      error: () => {
        this.working.set('');
        this.error.set('La alerta cambió o ya fue asumida. Actualizamos la bandeja.');
        this.load();
      },
    });
  }
}
