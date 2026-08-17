import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import {
  DashboardDistribution,
  Institution,
  PopulationDashboardResponse,
  RoutesDashboardResponse,
  SecurityDashboardResponse,
} from '../../core/models/api.models';
import { DashboardService, InstitutionsService } from '../../core/services/api.services';
import { operationalProfileLabel } from '../../shared/utils/operational-profile.helper';

// Dashboard alimentado exclusivamente por los tres endpoints agregados del backend.

@Component({
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="page-head">
      <div>
        <span class="eyebrow">PANORAMA INSTITUCIONAL</span>
        <h1>Dashboard de bienestar</h1>
        <p>Indicadores agregados de formularios, seguridad y rutas de atención.</p>
      </div>
      @if (generatedAt()) {
        <span class="live">● Actualizado {{ generatedAt() | date: 'dd MMM, HH:mm' }}</span>
      }
    </div>

    <section class="panel dashboard-filters" aria-labelledby="filters-title">
      <div>
        <h2 id="filters-title">Filtros del informe</h2>
        <p>Todos los indicadores responden al mismo periodo y alcance.</p>
      </div>
      <label>Desde<input type="date" [value]="from()" (change)="setFrom($event)" /></label>
      <label>Hasta<input type="date" [value]="to()" (change)="setTo($event)" /></label>
      <label
        >Institución<select [value]="institutionId()" (change)="setInstitution($event)">
          <option value="">Todas las instituciones</option>
          @for (institution of institutions(); track institution.id) {
            <option [value]="institution.id">{{ institution.nombre }}</option>
          }
        </select></label
      >
      <label
        >Agrupación<select [value]="grouping()" (change)="setGrouping($event)">
          <option value="dia">Por día</option>
          <option value="semana">Por semana</option>
          <option value="mes">Por mes</option>
        </select></label
      >
      <div class="filter-actions">
        <button class="primary" type="button" (click)="load()" [disabled]="loading()">
          {{ loading() ? 'Consultando…' : 'Aplicar filtros' }}</button
        ><button class="secondary" type="button" (click)="clearFilters()">Limpiar</button>
      </div>
    </section>

    @if (loading() && !population()) {
      <section class="state-card">Cargando indicadores reales…</section>
    } @else if (error() && !population()) {
      <section class="state-card error">
        <h2>No fue posible cargar el dashboard</h2>
        <p>{{ error() }}</p>
        <button class="secondary" type="button" (click)="load()">Intentar nuevamente</button>
      </section>
    } @else if (population(); as populationData) {
      @if (error()) {
        <div class="notice warning" role="alert">{{ error() }}</div>
      }
      <div class="stat-grid dashboard-stats" aria-label="Indicadores principales">
        @for (item of mainStats(); track item.label) {
          <article class="stat" [class.critical-stat]="item.critical">
            <span aria-hidden="true">{{ item.icon }}</span
            ><small>{{ item.label }}</small
            ><strong>{{ item.value }}</strong
            ><i>{{ item.note }}</i>
          </article>
        }
      </div>

      <div class="dashboard-section-title">
        <div>
          <span class="eyebrow">POBLACIÓN</span>
          <h2>Formularios recibidos</h2>
        </div>
        <span class="total-chip">{{ populationData.resumen.aplicaciones }} aplicaciones</span>
      </div>
      <div class="panel-grid dashboard-grid">
        <section class="panel wide">
          <header>
            <div>
              <h2>Evolución temporal</h2>
              <p>Aplicaciones recibidas por {{ groupingLabel() }}.</p>
            </div>
          </header>
          @if (populationData.evolucionTemporal.length) {
            <div class="real-chart" aria-label="Gráfica de evolución de aplicaciones">
              @for (point of populationData.evolucionTemporal; track point.periodo) {
                <div class="chart-column">
                  <b>{{ point.total }}</b>
                  <div class="bar-track">
                    <i [style.height.%]="barHeight(point.total, evolutionMax())"></i>
                  </div>
                  <small>{{ periodLabel(point.periodo) }}</small>
                </div>
              }
            </div>
          } @else {
            <div class="compact-empty">No hay aplicaciones en el periodo seleccionado.</div>
          }
        </section>
        <section class="panel">
          <h2>Completitud</h2>
          <p>Estado de los formularios recibidos.</p>
          <div class="completion-number">
            <strong>{{ completionRate() }}%</strong><span>formularios completos</span>
          </div>
          <div class="progress-track" aria-hidden="true">
            <i [style.width.%]="completionRate()"></i>
          </div>
          <dl class="metric-list">
            <div>
              <dt>Completos</dt>
              <dd>{{ populationData.resumen.formulariosCompletos }}</dd>
            </div>
            <div>
              <dt>Incompletos</dt>
              <dd>{{ populationData.resumen.formulariosIncompletos }}</dd>
            </div>
            <div>
              <dt>Instituciones</dt>
              <dd>{{ populationData.resumen.institucionesParticipantes }}</dd>
            </div>
          </dl>
        </section>
      </div>

      <div class="three-panels">
        <section class="panel">
          <h2>Por instrumento</h2>
          <p>Aplicaciones según población evaluada.</p>
          <div class="instrument-row">
            <span><b>IPBAM-20</b><small>Adolescentes</small></span
            ><strong>{{ populationData.resultadosPorInstrumento.ADOLESCENTE.aplicaciones }}</strong>
          </div>
          <div class="instrument-row">
            <span><b>IPBIM-C20</b><small>Niños y cuidadores</small></span
            ><strong>{{
              populationData.resultadosPorInstrumento.INFANTIL_CUIDADOR.aplicaciones
            }}</strong>
          </div>
        </section>
        <section class="panel">
          <h2>Distribución por edad</h2>
          <p>Participantes por rango de edad.</p>
          <div class="horizontal-bars">
            @for (item of populationData.distribucionEdad; track item.categoria) {
              <div>
                <span>{{ categoryLabel(item.categoria) }}</span
                ><i><b [style.width.%]="barWidth(item.total, ageMax())"></b></i
                ><strong>{{ item.total }}</strong>
              </div>
            } @empty {
              <div class="compact-empty">Sin información de edad.</div>
            }
          </div>
        </section>
        <section class="panel">
          <h2>Perfil operativo</h2>
          <p>Clasificación calculada por el backend.</p>
          <div class="profile-list">
            @for (item of populationData.distribucionPerfil; track item.categoria) {
              <div>
                <span class="profile-dot"></span><span>{{ profileName(item.categoria) }}</span
                ><b>{{ item.total }}</b>
              </div>
            } @empty {
              <div class="compact-empty">Sin perfiles en este periodo.</div>
            }
          </div>
        </section>
      </div>

      <div class="dashboard-section-title section-space">
        <div>
          <span class="eyebrow">SEGURIDAD</span>
          <h2>Alertas y valoración</h2>
        </div>
      </div>
      <div class="indicator-grid">
        @for (item of securityStats(); track item.label) {
          <article class="indicator" [class.urgent]="item.urgent">
            <span>{{ item.label }}</span
            ><strong>{{ item.value }}</strong
            ><small>{{ item.note }}</small>
          </article>
        }
      </div>

      <div class="dashboard-section-title section-space">
        <div>
          <span class="eyebrow">RUTAS</span>
          <h2>Atención y seguimiento</h2>
        </div>
      </div>
      <div class="indicator-grid">
        @for (item of routeStats(); track item.label) {
          <article class="indicator" [class.urgent]="item.urgent">
            <span>{{ item.label }}</span
            ><strong>{{ item.value }}</strong
            ><small>{{ item.note }}</small>
          </article>
        }
      </div>

      <section class="panel institution-panel">
        <header>
          <div>
            <h2>Aplicaciones por institución</h2>
            <p>Comparación agregada dentro del alcance consultado.</p>
          </div>
        </header>
        <div class="horizontal-bars institution-bars">
          @for (item of populationData.distribucionInstitucion; track item.categoria) {
            <div>
              <span>{{ item.categoria }}</span
              ><i><b [style.width.%]="barWidth(item.total, institutionMax())"></b></i
              ><strong>{{ item.total }}</strong>
            </div>
          } @empty {
            <div class="compact-empty">No hay instituciones con aplicaciones en el periodo.</div>
          }
        </div>
      </section>
    }
  `,
  styles: `
    .dashboard-filters {
      display: grid;
      grid-template-columns: 1.4fr repeat(4, minmax(130px, 1fr)) auto;
      gap: 0.85rem;
      align-items: end;
      margin-bottom: 1rem;
    }
    .dashboard-filters h2,
    .dashboard-filters p {
      margin-bottom: 0.2rem;
    }
    .dashboard-filters p {
      color: #6c817e;
      font-size: 0.78rem;
    }
    .dashboard-filters label {
      display: grid;
      gap: 0.35rem;
      color: #526d68;
      font-size: 0.72rem;
      font-weight: 750;
    }
    .dashboard-filters input,
    .dashboard-filters select {
      width: 100%;
    }
    .filter-actions {
      display: flex;
      gap: 0.45rem;
    }
    .filter-actions button {
      white-space: nowrap;
    }
    .dashboard-stats {
      grid-template-columns: repeat(6, 1fr);
      margin-top: 1rem;
    }
    .critical-stat > span {
      background: #fde9e6;
      color: #aa3f35;
    }
    .dashboard-section-title {
      display: flex;
      justify-content: space-between;
      align-items: end;
      margin: 2rem 0 0.8rem;
    }
    .dashboard-section-title h2,
    .dashboard-section-title .eyebrow {
      margin-bottom: 0;
    }
    .total-chip {
      background: #e7f5f1;
      color: #116c5f;
      border-radius: 999px;
      padding: 0.5rem 0.75rem;
      font-size: 0.76rem;
      font-weight: 750;
    }
    .dashboard-grid {
      grid-template-columns: minmax(0, 2fr) minmax(260px, 1fr);
    }
    .panel p {
      color: #6c817e;
      font-size: 0.8rem;
    }
    .real-chart {
      height: 250px;
      display: flex;
      align-items: stretch;
      gap: 0.75rem;
      overflow-x: auto;
      padding: 1.2rem 0.25rem 0;
      border-bottom: 1px solid #dfe8e6;
    }
    .chart-column {
      min-width: 48px;
      flex: 1;
      display: grid;
      grid-template-rows: 20px 1fr 32px;
      text-align: center;
      align-items: end;
    }
    .chart-column b {
      font-size: 0.72rem;
      color: #41605a;
    }
    .chart-column small {
      font-size: 0.62rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      padding-top: 0.4rem;
    }
    .bar-track {
      height: 100%;
      display: flex;
      align-items: flex-end;
      justify-content: center;
    }
    .bar-track i {
      display: block;
      width: min(34px, 70%);
      min-height: 4px;
      background: linear-gradient(#4cae9d, #147565);
      border-radius: 7px 7px 0 0;
    }
    .completion-number {
      display: flex;
      align-items: baseline;
      gap: 0.55rem;
      margin: 1.4rem 0 0.65rem;
    }
    .completion-number strong {
      font-size: 2.25rem;
      color: #116c5f;
    }
    .completion-number span {
      color: #6c817e;
      font-size: 0.8rem;
    }
    .progress-track {
      height: 10px;
      background: #eaf1ef;
      border-radius: 20px;
      overflow: hidden;
    }
    .progress-track i {
      display: block;
      height: 100%;
      background: #2c907f;
      border-radius: inherit;
    }
    .metric-list {
      margin: 1.2rem 0 0;
    }
    .metric-list div {
      display: flex;
      justify-content: space-between;
      padding: 0.65rem 0;
      border-bottom: 1px solid #edf2f1;
    }
    .metric-list dt {
      color: #617672;
      font-size: 0.8rem;
    }
    .metric-list dd {
      margin: 0;
      font-weight: 800;
    }
    .three-panels {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-top: 1rem;
    }
    .instrument-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.85rem 0;
      border-bottom: 1px solid #edf2f1;
    }
    .instrument-row span {
      display: grid;
      gap: 0.15rem;
    }
    .instrument-row small {
      font-size: 0.7rem;
    }
    .instrument-row > strong {
      font-size: 1.4rem;
      color: #116c5f;
    }
    .horizontal-bars {
      display: grid;
      gap: 0.75rem;
      margin-top: 1rem;
    }
    .horizontal-bars > div {
      display: grid;
      grid-template-columns: minmax(70px, 1fr) minmax(80px, 2fr) 28px;
      gap: 0.6rem;
      align-items: center;
      font-size: 0.75rem;
    }
    .horizontal-bars i {
      height: 8px;
      background: #eaf1ef;
      border-radius: 20px;
      overflow: hidden;
    }
    .horizontal-bars i b {
      display: block;
      height: 100%;
      background: #4cae9d;
      border-radius: inherit;
    }
    .horizontal-bars strong {
      text-align: right;
    }
    .profile-list {
      display: grid;
      gap: 0.2rem;
      margin-top: 0.75rem;
    }
    .profile-list > div {
      display: grid;
      grid-template-columns: 10px 1fr auto;
      gap: 0.55rem;
      align-items: center;
      padding: 0.6rem 0;
      border-bottom: 1px solid #edf2f1;
      font-size: 0.76rem;
    }
    .profile-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #d9a84e;
    }
    .section-space {
      margin-top: 2.3rem;
    }
    .indicator-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 0.8rem;
    }
    .indicator {
      background: #fff;
      border: 1px solid #e0e9e7;
      border-top: 3px solid #5ba99b;
      border-radius: 13px;
      padding: 1rem;
      display: grid;
      min-height: 125px;
    }
    .indicator.urgent {
      border-top-color: #d89c3d;
      background: #fffdf8;
    }
    .indicator > span {
      color: #536d68;
      font-size: 0.73rem;
      font-weight: 700;
    }
    .indicator > strong {
      font-size: 1.8rem;
      align-self: end;
    }
    .indicator > small {
      font-size: 0.65rem;
      margin-top: 0.2rem;
    }
    .institution-panel {
      margin-top: 1rem;
    }
    .institution-bars > div {
      grid-template-columns: minmax(140px, 1.2fr) minmax(160px, 3fr) 35px;
    }
    .compact-empty {
      color: #6c817e;
      font-size: 0.8rem;
      padding: 2rem 0;
      text-align: center;
    }
    @media (max-width: 1200px) {
      .dashboard-filters {
        grid-template-columns: repeat(3, 1fr);
      }
      .dashboard-filters > div:first-child {
        grid-column: 1/-1;
      }
      .dashboard-stats {
        grid-template-columns: repeat(3, 1fr);
      }
      .indicator-grid {
        grid-template-columns: repeat(4, 1fr);
      }
    }
    @media (max-width: 800px) {
      .dashboard-filters,
      .dashboard-stats,
      .three-panels,
      .indicator-grid,
      .dashboard-grid {
        grid-template-columns: 1fr 1fr;
      }
      .dashboard-filters > div:first-child,
      .filter-actions,
      .dashboard-grid > * {
        grid-column: 1/-1;
      }
      .filter-actions button {
        flex: 1;
      }
      .page-head {
        align-items: flex-start;
      }
      .live {
        display: none;
      }
    }
    @media (max-width: 540px) {
      .dashboard-filters,
      .dashboard-stats,
      .three-panels,
      .indicator-grid {
        grid-template-columns: 1fr;
      }
      .dashboard-filters > *,
      .filter-actions {
        grid-column: auto;
      }
      .horizontal-bars > div,
      .institution-bars > div {
        grid-template-columns: minmax(85px, 1fr) minmax(70px, 1.5fr) 25px;
      }
    }
  `,
})
export class DashboardComponent {
  private dashboardApi = inject(DashboardService);
  private institutionsApi = inject(InstitutionsService);
  loading = signal(true);
  error = signal('');
  population = signal<PopulationDashboardResponse | null>(null);
  security = signal<SecurityDashboardResponse | null>(null);
  routes = signal<RoutesDashboardResponse | null>(null);
  institutions = signal<Institution[]>([]);
  from = signal('');
  to = signal('');
  institutionId = signal('');
  grouping = signal<'dia' | 'semana' | 'mes'>('dia');
  generatedAt = computed(() => this.population()?.metadata.generadoAt ?? null);
  evolutionMax = computed(() => this.max(this.population()?.evolucionTemporal ?? []));
  ageMax = computed(() => this.max(this.population()?.distribucionEdad ?? []));
  institutionMax = computed(() => this.max(this.population()?.distribucionInstitucion ?? []));
  completionRate = computed(() => {
    const s = this.population()?.resumen;
    return s?.aplicaciones ? Math.round((s.formulariosCompletos / s.aplicaciones) * 100) : 0;
  });
  mainStats = computed(() => [
    {
      label: 'Participantes evaluados',
      value: this.population()?.resumen.adolescentesEvaluados ?? 0,
      icon: '◉',
      note: 'Personas únicas',
      critical: false,
    },
    {
      label: 'Alertas pendientes',
      value: this.security()?.alertasPendientes ?? 0,
      icon: '◇',
      note: 'Requieren gestión',
      critical: true,
    },
    {
      label: 'Sin responsable',
      value: this.security()?.alertasSinResponsable ?? 0,
      icon: '!',
      note: 'Pendientes de asignación',
      critical: true,
    },
    {
      label: 'Rutas abiertas',
      value: this.routes()?.rutasAbiertas ?? 0,
      icon: '□',
      note: 'Casos en atención',
      critical: false,
    },
    {
      label: 'Casos vencidos',
      value: this.routes()?.casosVencidos ?? 0,
      icon: '◷',
      note: 'Próxima acción vencida',
      critical: true,
    },
    {
      label: 'Casos cerrados',
      value: this.routes()?.casosCerrados ?? 0,
      icon: '✓',
      note: 'Cierre registrado',
      critical: false,
    },
  ]);
  securityStats = computed(() => {
    const d = this.security();
    return [
      {
        label: 'Alertas del día',
        value: d?.alertasDelDia ?? 0,
        note: 'Generadas hoy',
        urgent: false,
      },
      { label: 'Pendientes', value: d?.alertasPendientes ?? 0, note: 'No resueltas', urgent: true },
      {
        label: 'Sin responsable',
        value: d?.alertasSinResponsable ?? 0,
        note: 'Sin asignación',
        urgent: true,
      },
      {
        label: 'Con responsable',
        value: d?.alertasConResponsable ?? 0,
        note: 'Asignadas',
        urgent: false,
      },
      {
        label: 'Valoraciones',
        value: d?.valoracionesCompletadas ?? 0,
        note: 'Completadas',
        urgent: false,
      },
      {
        label: 'Urgentes',
        value: d?.situacionesUrgentes ?? 0,
        note: 'Situaciones activas',
        urgent: true,
      },
      {
        label: 'Alertas vencidas',
        value: d?.alertasVencidas ?? 0,
        note: 'Acción vencida',
        urgent: true,
      },
    ];
  });
  routeStats = computed(() => {
    const d = this.routes();
    return [
      {
        label: 'Rutas abiertas',
        value: d?.rutasAbiertas ?? 0,
        note: 'Atención activa',
        urgent: false,
      },
      {
        label: 'En seguimiento',
        value: d?.rutasEnSeguimiento ?? 0,
        note: 'Seguimiento activo',
        urgent: false,
      },
      {
        label: 'Remisiones',
        value: d?.remisionesRealizadas ?? 0,
        note: 'Realizadas',
        urgent: false,
      },
      {
        label: 'Confirmadas',
        value: d?.remisionesConfirmadas ?? 0,
        note: 'Recepción confirmada',
        urgent: false,
      },
      {
        label: 'Sin contacto',
        value: d?.casosSinContactoConfirmado ?? 0,
        note: 'Receptor sin confirmar',
        urgent: true,
      },
      {
        label: 'Casos vencidos',
        value: d?.casosVencidos ?? 0,
        note: 'Acción pendiente',
        urgent: true,
      },
      {
        label: 'Casos cerrados',
        value: d?.casosCerrados ?? 0,
        note: 'Cierre registrado',
        urgent: false,
      },
    ];
  });

  constructor() {
    this.institutionsApi
      .list()
      .subscribe({
        next: ({ institutions }) => this.institutions.set(institutions.filter((i) => i.activa)),
      });
    this.load();
  }
  load() {
    if (this.from() && this.to() && this.from() > this.to()) {
      this.error.set('La fecha inicial no puede ser posterior a la fecha final.');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    const filters = this.filters();
    forkJoin({
      population: this.dashboardApi.population(filters),
      security: this.dashboardApi.security(filters),
      routes: this.dashboardApi.routes(filters),
    }).subscribe({
      next: ({ population, security, routes }) => {
        this.population.set(population);
        this.security.set(security);
        this.routes.set(routes);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(
          'No se pudieron consultar los indicadores. Verifica la conexión e inténtalo nuevamente.',
        );
        this.loading.set(false);
      },
    });
  }
  clearFilters() {
    this.from.set('');
    this.to.set('');
    this.institutionId.set('');
    this.grouping.set('dia');
    this.load();
  }
  setFrom(e: Event) {
    this.from.set((e.target as HTMLInputElement).value);
  }
  setTo(e: Event) {
    this.to.set((e.target as HTMLInputElement).value);
  }
  setInstitution(e: Event) {
    this.institutionId.set((e.target as HTMLSelectElement).value);
  }
  setGrouping(e: Event) {
    this.grouping.set((e.target as HTMLSelectElement).value as 'dia' | 'semana' | 'mes');
  }
  groupingLabel() {
    return { dia: 'día', semana: 'semana', mes: 'mes' }[this.grouping()];
  }
  profileName(v: string) {
    return operationalProfileLabel(v);
  }
  categoryLabel(v: string) {
    return v === 'OTRA_EDAD' ? 'Otra edad' : v + ' años';
  }
  periodLabel(v: string) {
    const date = /^\d{4}-\d{2}$/.test(v)
      ? new Date(v + '-01T00:00:00Z')
      : new Date(v + 'T00:00:00Z');
    return new Intl.DateTimeFormat('es-CO', {
      day: /^\d{4}-\d{2}$/.test(v) ? undefined : '2-digit',
      month: 'short',
      year: /^\d{4}-\d{2}$/.test(v) ? '2-digit' : undefined,
      timeZone: 'UTC',
    }).format(date);
  }
  barHeight(v: number, max: number) {
    return max ? Math.max(5, (v / max) * 100) : 0;
  }
  barWidth(v: number, max: number) {
    return max ? (v / max) * 100 : 0;
  }
  private filters() {
    const f: Record<string, string> = { agrupacion: this.grouping() };
    if (this.from()) f['desde'] = this.from() + 'T00:00:00.000Z';
    if (this.to()) f['hasta'] = this.to() + 'T23:59:59.999Z';
    if (this.institutionId()) f['institucionId'] = this.institutionId();
    return f;
  }
  private max(items: ({ total: number } | DashboardDistribution)[]) {
    return Math.max(0, ...items.map((i) => i.total));
  }
}
