import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { NotificationRecord } from '../../core/models/api.models';
import { NotificationsService } from '../../core/services/api.services';

@Component({
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="page-head">
      <div>
        <span class="eyebrow">OPERACIÓN</span>
        <h1>Notificaciones</h1>
        <p>Avisos internos generados por eventos y vencimientos.</p>
      </div>
      <button class="secondary" (click)="load()">Actualizar</button>
    </div>
    @if (message()) {
      <section class="state-card">{{ message() }}</section>
    }
    @if (loading()) {
      <section class="state-card">Cargando notificaciones…</section>
    } @else if (error()) {
      <section class="state-card error">{{ error() }}</section>
    } @else if (!items().length) {
      <section class="state-card">No hay notificaciones.</section>
    } @else {
      <section class="table-card">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Notificación</th>
                <th>Destinatario</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              @for (item of items(); track item.id) {
                <tr>
                  <td>{{ item.createdAt | date: 'dd/MM/yyyy HH:mm' }}</td>
                  <td>{{ item.tipo }}</td>
                  <td>
                    <b>{{ item.titulo }}</b
                    ><br /><small>{{ item.mensaje }}</small>
                  </td>
                  <td>{{ item.destinatario?.nombre || '—' }}</td>
                  <td>
                    <span class="badge">{{ item.estado }}</span>
                  </td>
                  <td>
                    <button
                      class="link-button"
                      [disabled]="item.estado === 'ENVIADA'"
                      (click)="retry(item.id)"
                    >
                      Reintentar
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>
    }
  `,
})
export class NotificationsComponent {
  private api = inject(NotificationsService);
  loading = signal(true);
  error = signal('');
  message = signal('');
  items = signal<NotificationRecord[]>([]);
  constructor() {
    this.load();
  }
  load() {
    this.loading.set(true);
    this.api.list().subscribe({
      next: (r) => {
        this.items.set(r.notifications);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No fue posible consultar las notificaciones.');
        this.loading.set(false);
      },
    });
  }
  retry(id: string) {
    this.api.retry(id).subscribe({
      next: (r) => {
        this.message.set(
          r.outcome === 'SENT'
            ? 'Notificación reenviada.'
            : 'La notificación no necesitaba reenvío.',
        );
        this.load();
      },
      error: () => this.message.set('No fue posible reintentar la notificación.'),
    });
  }
}
