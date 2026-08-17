import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdolescentHistory } from '../../core/models/api.models';
import { AdolescentsService } from '../../core/services/api.services';

@Component({
  standalone: true,
  imports: [DatePipe, RouterLink],
  template: `
    <div class="page-head">
      <div>
        <a routerLink="/aplicaciones">← Aplicaciones</a
        ><span class="eyebrow">HISTORIAL LONGITUDINAL</span>
        <h1>Trayectoria del adolescente</h1>
        <p>Vista nominal restringida y auditada por el backend.</p>
      </div>
    </div>
    @if (loading()) {
      <section class="state-card">Cargando historial…</section>
    } @else if (error()) {
      <section class="state-card error">{{ error() }}</section>
    } @else if (history(); as data) {
      <section class="detail-card">
        <h2>Código {{ data.adolescent.codigo }}</h2>
        <p>{{ data.metadata.totalAplicaciones }} aplicaciones registradas</p>
      </section>
      <section class="timeline-card">
        <div class="timeline">
          @for (app of data.applications; track app.id) {
            <article>
              <span></span>
              <div>
                <small>{{ app.fechaEnvio | date: 'dd/MM/yyyy HH:mm' }}</small>
                <h3>{{ app.estado }}</h3>
                <p>
                  Instrumento registrado. Los resultados clínicos no se exponen fuera del panel
                  autorizado.
                </p>
              </div>
            </article>
          }
        </div>
      </section>
    }
  `,
})
export class AdolescentHistoryComponent {
  private api = inject(AdolescentsService);
  private route = inject(ActivatedRoute);
  loading = signal(true);
  error = signal('');
  history = signal<AdolescentHistory | null>(null);
  constructor() {
    this.api.history(this.route.snapshot.paramMap.get('id') || '').subscribe({
      next: (r) => {
        this.history.set(r);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No fue posible consultar este historial.');
        this.loading.set(false);
      },
    });
  }
}
