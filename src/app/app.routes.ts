import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { LoginComponent } from './features/auth/login.component';
import { InstitutionalLayoutComponent } from './layout/institutional-layout/institutional-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ApplicationsComponent } from './features/applications/applications.component';
import { QuestionnaireComponent } from './features/questionnaire/questionnaire.component';
import { CasesComponent } from './features/cases/cases.component';
import { CaseDetailComponent } from './features/cases/case-detail.component';
import { AlertsComponent } from './features/alerts/alerts.component';
import { FollowUpsComponent } from './features/follow-ups/follow-ups.component';
import { DirectoryComponent } from './features/directory/directory.component';
import { AdministrationComponent } from './features/administration/administration.component';
import { UsersAdminComponent } from './features/administration/users-admin.component';
import { InstitutionsAdminComponent } from './features/administration/institutions-admin.component';
import { AuditComponent } from './features/administration/audit.component';
import { ForbiddenComponent } from './features/forbidden/forbidden.component';
import { ConsentsComponent } from './features/administration/consents.component';
import { NotificationsComponent } from './features/notifications/notifications.component';
import { EscalationsComponent } from './features/administration/escalations.component';
import { AdolescentHistoryComponent } from './features/applications/adolescent-history.component';
export const routes: Routes = [
  { path: 'formulario', component: QuestionnaireComponent },
  { path: 'login', component: LoginComponent },
  { path: 'sin-permiso', component: ForbiddenComponent },
  {
    path: '',
    component: InstitutionalLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      {
        path: 'aplicaciones',
        component: ApplicationsComponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'SECRETARIA_EDUCACION'] },
      },
      {
        path: 'aplicaciones/nueva',
        redirectTo: '/formulario',
      },
      { path: 'casos', component: CasesComponent },
      { path: 'casos/:id', component: CaseDetailComponent },
      { path: 'alertas', component: AlertsComponent },
      { path: 'seguimientos', component: FollowUpsComponent },
      { path: 'notificaciones', component: NotificationsComponent },
      { path: 'adolescentes/:id/historial', component: AdolescentHistoryComponent },
      { path: 'directorio', component: DirectoryComponent },
      {
        path: 'administracion',
        component: AdministrationComponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'SECRETARIA_EDUCACION'] },
      },
      {
        path: 'administracion/consentimientos',
        component: ConsentsComponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'SECRETARIA_EDUCACION'] },
      },
      {
        path: 'administracion/escalamientos',
        component: EscalationsComponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'SECRETARIA_EDUCACION'] },
      },
      {
        path: 'administracion/usuarios',
        component: UsersAdminComponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'SECRETARIA_EDUCACION'] },
      },
      {
        path: 'administracion/instituciones',
        component: InstitutionsAdminComponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'SECRETARIA_EDUCACION'] },
      },
      {
        path: 'auditoria',
        component: AuditComponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'SECRETARIA_EDUCACION'] },
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  { path: '**', redirectTo: '' },
];
