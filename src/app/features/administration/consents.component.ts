import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ConsentsService } from '../../core/services/api.services';
import { ConsentRecord } from '../../core/models/api.models';

@Component({
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="page-head">
      <div>
        <span class="eyebrow">TRAZABILIDAD</span>
        <h1>Consentimientos</h1>
        <p>Decisiones registradas y versiones institucionales utilizadas.</p>
      </div>
      <button class="secondary" (click)="load()">Actualizar</button>
    </div>
    @if (loading()) {
      <section class="state-card">Cargando consentimientos…</section>
    } @else if (error()) {
      <section class="state-card error">{{ error() }}</section>
    } @else if (!items().length) {
      <section class="state-card">No hay consentimientos registrados.</section>
    } @else {
      <section class="table-card">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Participante</th>
                <th>Decisión</th>
                <th>Asentimiento</th>
                <th>Versión</th>
                <th>Origen</th>
              </tr>
            </thead>
            <tbody>
              @for (item of items(); track item.id) {
                <tr>
                  <td>{{ item.fechaDecision | date: 'dd/MM/yyyy HH:mm' }}</td>
                  <td>{{ item.codigoParticipante }}</td>
                  <td>
                    <span class="badge" [class.critical]="item.decision === 'RECHAZADO'">{{
                      item.decision
                    }}</span>
                  </td>
                  <td>{{ item.asentimiento || 'No aplica' }}</td>
                  <td>{{ item.versionTexto }}</td>
                  <td>{{ item.origen }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>
    }
  `,
})
export class ConsentsComponent {
  private api = inject(ConsentsService);
  loading = signal(true);
  error = signal('');
  items = signal<ConsentRecord[]>([]);
  constructor() {
    this.load();
  }
  load() {
    this.loading.set(true);
    this.error.set('');
    this.api.list().subscribe({
      next: (r) => {
        this.items.set(r.consents);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No fue posible consultar los consentimientos.');
        this.loading.set(false);
      },
    });
  }
}
