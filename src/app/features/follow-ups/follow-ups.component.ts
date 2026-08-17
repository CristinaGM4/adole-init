import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FollowUpsService } from '../../core/services/api.services';
import { FollowUp } from '../../core/models/api.models';
@Component({
  standalone: true,
  imports: [DatePipe, RouterLink],
  template: `<div class="page-head">
      <div>
        <span class="eyebrow">CONTINUIDAD DEL CUIDADO</span>
        <h1>Seguimientos</h1>
        <p>Acciones programadas que mantienen activa la continuidad de cada ruta.</p>
      </div>
    </div>
    <section class="overdue">
      <header>
        <div>
          <span>◷</span>
          <div>
            <h2>Seguimientos vencidos</h2>
            <p>Requieren revisión prioritaria del responsable.</p>
          </div>
        </div>
        <b>{{ items().length }}</b>
      </header>
      @if (loading()) {
        <div class="state-card">Consultando vencimientos…</div>
      } @else if (error()) {
        <div class="state-card error">{{ error() }}</div>
      } @else if (!items().length) {
        <div class="state-card">
          <h3>Todo está al día</h3>
          <p>No hay seguimientos vencidos en tu alcance.</p>
        </div>
      } @else {
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Caso</th>
                <th>Adolescente</th>
                <th>Institución</th>
                <th>Responsable</th>
                <th>Fecha programada</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              @for (f of items(); track f.id) {
                <tr>
                  <td>
                    <a [routerLink]="['/casos', f.casoId]">#{{ f.casoId.slice(0, 8) }}</a>
                  </td>
                  <td>{{ f.caso?.adolescente?.codigo || '—' }}</td>
                  <td>{{ f.caso?.institucion?.nombre || '—' }}</td>
                  <td>{{ f.responsable.nombre }}</td>
                  <td>{{ f.fechaProgramada | date: 'dd MMM yyyy, HH:mm' }}</td>
                  <td><span class="badge critical">Vencido</span></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>`,
})
export class FollowUpsComponent {
  private api = inject(FollowUpsService);
  items = signal<FollowUp[]>([]);
  loading = signal(true);
  error = signal('');
  constructor() {
    this.api.overdue().subscribe({
      next: (r) => {
        this.items.set(r.followups);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No fue posible consultar los seguimientos vencidos.');
        this.loading.set(false);
      },
    });
  }
}
