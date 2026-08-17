import { KeyValuePipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { EscalationReport } from '../../core/models/api.models';
import { EscalationsService } from '../../core/services/api.services';

@Component({
  standalone: true,
  imports: [KeyValuePipe, DatePipe],
  template: `
    <div class="page-head">
      <div>
        <span class="eyebrow">CONTROL OPERATIVO</span>
        <h1>Escalamientos</h1>
        <p>Simula vencimientos o ejecuta la generación idempotente de notificaciones.</p>
      </div>
      <div class="actions">
        <button class="secondary" (click)="run(false)">Simular</button
        ><button (click)="run(true)">Evaluar ahora</button>
      </div>
    </div>
    @if (loading()) {
      <section class="state-card">Evaluando reglas configuradas…</section>
    } @else if (error()) {
      <section class="state-card error">{{ error() }}</section>
    } @else if (report(); as result) {
      <section class="detail-card">
        <h2>{{ result.metadata.persistido ? 'Evaluación ejecutada' : 'Simulación' }}</h2>
        <p>Fecha: {{ result.metadata.evaluadoAt | date: 'dd/MM/yyyy HH:mm' }}</p>
        <div class="stats-grid">
          @for (entry of result.resumen | keyvalue; track entry.key) {
            <article class="stat">
              <span>{{ entry.key }}</span
              ><strong>{{ entry.value }}</strong>
            </article>
          }
        </div>
      </section>
    }
  `,
})
export class EscalationsComponent {
  private api = inject(EscalationsService);
  loading = signal(false);
  error = signal('');
  report = signal<EscalationReport | null>(null);
  run(persist: boolean) {
    this.loading.set(true);
    this.error.set('');
    const request = persist ? this.api.evaluate() : this.api.simulate();
    request.subscribe({
      next: (r) => {
        this.report.set(r);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('El backend no permitió evaluar los escalamientos.');
        this.loading.set(false);
      },
    });
  }
}
