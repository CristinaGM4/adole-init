import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
  standalone: true,
  imports: [RouterLink],
  template: `<section class="state-card">
    <div class="state-icon">↗</div>
    <h1>Acceso restringido</h1>
    <p>
      Tu sesión es válida, pero tu rol o alcance institucional no permite consultar esta sección.
    </p>
    <a class="primary button" routerLink="/dashboard">Volver al inicio</a>
  </section>`,
})
export class ForbiddenComponent {}
