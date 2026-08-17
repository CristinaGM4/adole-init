import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { InstitutionsService } from '../../core/services/api.services';
import { Institution } from '../../core/models/api.models';
@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `<div class="page-head">
      <div>
        <span class="eyebrow">ADMINISTRACIÓN</span>
        <h1>Instituciones</h1>
        <p>Catálogo institucional y alcance territorial.</p>
      </div>
      <button class="primary" (click)="showForm.set(!showForm())">＋ Crear institución</button>
    </div>
    @if (showForm()) {
      <section class="panel form-panel">
        <form [formGroup]="form" (ngSubmit)="create()">
          <div class="form-grid">
            <label>Nombre<input formControlName="nombre" /></label
            ><label>Código<input formControlName="codigo" /></label
            ><label>Tipo<input formControlName="tipo" /></label
            ><label>Municipio<input formControlName="municipio" /></label
            ><label>Dirección<input formControlName="direccion" /></label>
          </div>
          @if (error()) {
            <div class="error">{{ error() }}</div>
          }
          <div class="form-actions">
            <button type="button" class="secondary" (click)="showForm.set(false)">Cancelar</button
            ><button class="primary" [disabled]="form.invalid || saving()">
              Guardar institución
            </button>
          </div>
        </form>
      </section>
    }
    <section class="panel">
      @if (loading()) {
        <div class="state-card">Cargando instituciones…</div>
      } @else {
        @if (error()) {
          <div class="error" role="alert">{{ error() }}</div>
        }
        @if (items().length === 0 && !error()) {
          <div class="state-card">
            <h2>No hay instituciones registradas</h2>
            <p>Crea la primera institución para habilitar los formularios de bienestar.</p>
          </div>
        }
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Institución</th>
                <th>Tipo</th>
                <th>Municipio</th>
                <th>Dirección</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              @for (i of items(); track i.id) {
                <tr>
                  <td>
                    <b>{{ i.codigo }}</b>
                  </td>
                  <td>{{ i.nombre }}</td>
                  <td>{{ i.tipo }}</td>
                  <td>{{ i.municipio }}</td>
                  <td>{{ i.direccion || '—' }}</td>
                  <td>
                    <button [class]="i.activa ? 'badge success' : 'badge'" (click)="toggle(i)">
                      {{ i.activa ? 'Activa' : 'Inactiva' }}
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>`,
})
export class InstitutionsAdminComponent {
  private api = inject(InstitutionsService);
  private fb = inject(FormBuilder);
  items = signal<Institution[]>([]);
  loading = signal(true);
  showForm = signal(false);
  saving = signal(false);
  error = signal('');
  form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    codigo: ['', Validators.required],
    tipo: ['INSTITUCION_EDUCATIVA', Validators.required],
    municipio: ['Manizales', Validators.required],
    direccion: [''],
  });
  constructor() {
    this.load();
  }
  load() {
    this.loading.set(true);
    this.error.set('');
    this.api.list().subscribe({
      next: (r) => {
        this.items.set(r.institutions);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('No fue posible cargar las instituciones.');
      },
    });
  }
  create() {
    if (this.form.invalid) return;
    this.saving.set(true);
    const v = this.form.getRawValue();
    this.api.create({ ...v, direccion: v.direccion || null, activa: true }).subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.load();
      },
      error: (e) => {
        this.saving.set(false);
        this.error.set(e.error?.error?.message || 'No fue posible crear la institución.');
      },
    });
  }
  toggle(i: Institution) {
    this.api.update(i.id, { activa: !i.activa }).subscribe({
      next: () => this.load(),
      error: (e) => this.error.set(e.error?.error?.message || 'No fue posible actualizar.'),
    });
  }
}
