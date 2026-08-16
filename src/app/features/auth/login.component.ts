import {HttpErrorResponse} from '@angular/common/http';
import {Component, inject, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthService} from '../../core/auth/auth.service';
import {ApiHealthService} from '../../core/services/api.services';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <main class="login-shell">
      <section class="brand-panel">
        <span class="eyebrow">MANIZALES · BIENESTAR ADOLESCENTE</span>
        <h1>Cuidar empieza por escuchar.</h1>
        <p>Una plataforma segura para acompañar, actuar a tiempo y dar continuidad a cada ruta.</p>
        <div class="privacy-note">◉ Información protegida · Acceso institucional</div>
      </section>
      <section class="login-card">
        <div class="login-status" [class.online]="backend() === 'online'" [class.offline]="backend() === 'offline'">
          <i aria-hidden="true"></i>
          {{ backend() === 'checking' ? 'Comprobando servicio…' : backend() === 'online' ? 'Servicio disponible' : 'Servicio temporalmente no disponible' }}
        </div>
        <div class="mark">M</div>
        <p class="eyebrow">ACCESO INSTITUCIONAL</p>
        <h2>Bienvenido de nuevo</h2>
        <p>Ingresa con las credenciales asignadas por tu institución.</p>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <label>Correo institucional<input type="email" formControlName="email" autocomplete="email" placeholder="nombre@institucion.gov.co" aria-describedby="email-error"></label>
          @if (form.controls.email.touched && form.controls.email.invalid) {<span id="email-error" class="field-error">Ingresa un correo válido.</span>}
          <label>Contraseña<input type="password" formControlName="password" autocomplete="current-password" placeholder="••••••••••••"></label>
          @if (error()) {<div class="error" role="alert">{{ error() }}</div>}
          <button class="primary" [disabled]="form.invalid || loading() || backend() !== 'online'">{{ loading() ? 'Verificando…' : 'Ingresar a la plataforma' }}</button>
        </form>
        <small>Si tienes problemas de acceso, contacta a la persona administradora.</small>
      </section>
    </main>`
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private health = inject(ApiHealthService);
  private router = inject(Router);
  loading = signal(false);
  error = signal('');
  backend = signal<'checking'|'online'|'offline'>('checking');
  form = this.fb.nonNullable.group({email:['',[Validators.required,Validators.email]],password:['',Validators.required]});

  constructor(){
    this.health.check().subscribe({next:()=>this.backend.set('online'),error:()=>this.backend.set('offline')});
  }

  submit(){
    if(this.form.invalid){this.form.markAllAsTouched();return}
    this.loading.set(true);this.error.set('');
    const {email,password}=this.form.getRawValue();
    this.auth.login(email,password).subscribe({
      next:()=>this.router.navigate(['/dashboard']),
      error:(response:HttpErrorResponse)=>{
        this.loading.set(false);
        const message=response.error?.error?.message;
        this.error.set(response.status===401?'El correo o la contraseña no son correctos.':response.status===403?'Tu usuario no tiene permiso para ingresar.':response.status===0?'No fue posible conectar con el servidor. Reinicia el frontend con npm start.':message||'No fue posible iniciar sesión. Intenta nuevamente.');
      }
    });
  }
}
