import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApplicationsService } from '../../core/services/api.services';
import { Application } from '../../core/models/api.models';
import { AuthService } from '../../core/auth/auth.service';
import { operationalProfileLabel } from '../../shared/utils/operational-profile.helper';
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
    <div class="notice info" role="note">
      <span
        ><b>Perfil y seguridad son resultados independientes.</b><br />Una alerta siempre requiere
        revisión aunque exista un perfil operativo.</span
      >
    </div>
    <section class="panel">
      <div class="filter-row">
        <input
          placeholder="Buscar por código o identificador"
          aria-label="Buscar"
          [value]="search()"
          (input)="setSearch($event)"
        />
        <select aria-label="Población" [value]="population()" (change)="setPopulation($event)">
          <option value="TODOS">Todas las poblaciones</option>
          <option value="ADOLESCENTE">Adolescentes · IPBAM-20</option>
          <option value="INFANTIL_CUIDADOR">Niños · IPBIM-C20</option>
        </select>
        <select aria-label="Estado" [value]="statusFilter()" (change)="setStatus($event)">
          <option value="TODOS">Todos los estados</option>
          <option value="RECIBIDA_COMPLETA">Completa</option>
          <option value="RECIBIDA_INCOMPLETA">Incompleta</option>
        </select>
      </div>
      @if (loading()) {
        <div class="state-card">Cargando aplicaciones…</div>
      } @else if (error()) {
        <div class="state-card error">{{ error() }}</div>
      } @else if (!visibleItems().length) {
        <div class="state-card">
          <div class="state-icon">▤</div>
          <h2>No encontramos aplicaciones</h2>
          <p>Prueba cambiando la población, el estado o el texto de búsqueda.</p>
        </div>
      } @else {
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Identificador</th>
                <th>Participante</th>
                <th>Instrumento</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Perfil operativo</th>
                <th>Seguridad / alerta</th>
              </tr>
            </thead>
            <tbody>
              @for (a of visibleItems(); track a.id) {
                <tr>
                  <td>
                    <b>#{{ a.id.slice(0, 8) }}</b>
                  </td>
                  <td>{{ a.adolescente.codigo }}</td>
                  <td>
                    <span class="badge info">{{ instrumentLabel(a) }}</span>
                  </td>
                  <td>{{ a.fechaEnvio | date: 'dd MMM yyyy, HH:mm' }}</td>
                  <td>
                    <span class="badge info">{{
                      a.estado === 'RECIBIDA_COMPLETA' ? 'Completa' : 'Incompleta'
                    }}</span>
                  </td>
                  <td>
                    <span class="profile-label">{{ profileLabel(a) }}</span>
                  </td>
                  <td>
                    <span [class]="alertClass(a)">{{ alertLabel(a) }}</span>
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
  search = signal('');
  population = signal<'TODOS' | 'ADOLESCENTE' | 'INFANTIL_CUIDADOR'>('TODOS');
  statusFilter = signal<'TODOS' | Application['estado']>('TODOS');
  visibleItems = computed(() => {
    const query = this.search().trim().toLocaleLowerCase('es');
    return this.items().filter((application) => {
      const matchesPopulation =
        this.population() === 'TODOS' || application.tipoInstrumento === this.population();
      const matchesStatus =
        this.statusFilter() === 'TODOS' || application.estado === this.statusFilter();
      const matchesSearch =
        !query ||
        application.id.toLocaleLowerCase('es').includes(query) ||
        application.adolescente.codigo.toLocaleLowerCase('es').includes(query);
      return matchesPopulation && matchesStatus && matchesSearch;
    });
  });
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
  setSearch(event: Event) {
    this.search.set((event.target as HTMLInputElement).value);
  }
  setPopulation(event: Event) {
    this.population.set(
      (event.target as HTMLSelectElement).value as 'TODOS' | 'ADOLESCENTE' | 'INFANTIL_CUIDADOR',
    );
  }
  setStatus(event: Event) {
    this.statusFilter.set(
      (event.target as HTMLSelectElement).value as 'TODOS' | Application['estado'],
    );
  }
  profile(application: Application) {
    return application.tipoInstrumento === 'INFANTIL_CUIDADOR'
      ? application.resultadoInfantil?.perfilOperativo
      : application.resultado?.perfilOperativo;
  }
  profileLabel(application: Application) {
    return operationalProfileLabel(this.profile(application));
  }
  instrumentLabel(application: Application) {
    return application.tipoInstrumento === 'INFANTIL_CUIDADOR' ? 'IPBIM-C20' : 'IPBAM-20';
  }
  hasAlert(application: Application) {
    return (
      !!application.alerta ||
      !!application.resultado?.safetyAlert ||
      !!application.resultadoInfantil?.safetyAlert ||
      application.resultadoInfantil?.seguridadEstado === 'NO_ACLARADA'
    );
  }
  alertLabel(application: Application) {
    if (application.alerta?.estado === 'SIN_RESPONSABLE') return 'Sin responsable';
    if (application.alerta?.estado === 'PENDIENTE_VALORACION') return 'Pendiente de valoración';
    if (application.alerta?.estado === 'EN_VALORACION') return 'En valoración';
    if (application.alerta?.estado === 'RESUELTA') return 'Resuelta';
    if (application.resultadoInfantil?.seguridadEstado === 'NO_ACLARADA')
      return 'Seguridad no aclarada';
    return this.hasAlert(application) ? 'Requiere revisión' : 'Sin alerta';
  }
  alertClass(application: Application) {
    if (application.alerta?.estado === 'RESUELTA') return 'badge success';
    return this.hasAlert(application) ? 'badge warning' : 'badge';
  }
}
