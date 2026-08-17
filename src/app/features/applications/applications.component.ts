import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApplicationsService } from '../../core/services/api.services';
import { Application } from '../../core/models/api.models';
import { AuthService } from '../../core/auth/auth.service';
@Component({
  standalone: true,
  imports: [DatePipe, RouterLink],
  template: `<div class="page-head">
      <div>
        <span class="eyebrow">INSTRUMENTOS IPBAM-20 E IPBIM-C20</span>
        <h1>Aplicaciones</h1>
        <p>Consulta formularios recibidos y su estado operativo.</p>
      </div>
      <a routerLink="/formulario" class="primary button">＋ Abrir formulario público</a>
    </div>
    <section class="panel">
      <div class="filter-row">
        <input placeholder="Buscar por identificador" aria-label="Buscar" /><select
          aria-label="Estado"
        >
          <option>Todos los estados</option>
          <option>Completa</option>
          <option>Incompleta</option>
        </select>
      </div>
      @if (loading()) {
        <div class="state-card">Cargando aplicaciones…</div>
      } @else if (error()) {
        <div class="state-card error">{{ error() }}</div>
      } @else if (!items().length) {
        <div class="state-card">
          <div class="state-icon">▤</div>
          <h2>Aún no hay aplicaciones</h2>
          <p>Cuando se reciban formularios aparecerán aquí.</p>
        </div>
      } @else {
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Identificador</th>
                <th>Adolescente</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Perfil operativo</th>
                <th>Alerta</th>
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
                    <a
                      class="link-button"
                      [routerLink]="['/adolescentes', a.adolescente.id, 'historial']"
                      >Ver historial</a
                    >
                  </td>
                  <td>{{ a.adolescente.codigo }}</td>
                  <td>{{ a.fechaEnvio | date: 'dd MMM yyyy, HH:mm' }}</td>
                  <td>
                    <span class="badge info">{{
                      a.estado === 'RECIBIDA_COMPLETA' ? 'Completa' : 'Incompleta'
                    }}</span>
                  </td>
                  <td>{{ a.resultado?.perfilOperativo || 'Sin clasificación' }}</td>
                  <td>
                    <span class="badge" [class.warning]="a.resultado?.safetyAlert">{{
                      a.resultado?.safetyAlert ? 'Requiere revisión' : 'Sin alerta'
                    }}</span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>`,
})
export class ApplicationsComponent {
  private api = inject(ApplicationsService);
  auth = inject(AuthService);
  items = signal<Application[]>([]);
  loading = signal(true);
  error = signal('');
  constructor() {
    this.api.list().subscribe({
      next: (r) => {
        this.items.set(r.applications);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No fue posible cargar las aplicaciones.');
        this.loading.set(false);
      },
    });
  }
}
