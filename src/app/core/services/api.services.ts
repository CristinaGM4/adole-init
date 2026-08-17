import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  Alert,
  Application,
  ApplicationInput,
  AuditEntry,
  AdolescentHistory,
  Case,
  CaseStatus,
  DashboardResponse,
  ConsentRecord,
  EscalationReport,
  DirectoryEntry,
  FollowUp,
  Institution,
  NotificationRecord,
  ProtectionRoute,
  PublicApplicationResponse,
  PublicConsentInput,
  PublicConsentResponse,
  PublicInstitution,
  Referral,
  RouteAction,
  SafetyAssessmentInput,
  SociodemographicContextInput,
  User,
} from '../models/api.models';
abstract class Api {
  protected http = inject(HttpClient);
  protected url = environment.apiUrl;
}
@Injectable({ providedIn: 'root' })
export class ApiHealthService extends Api {
  check() {
    return this.http.get<{ status: string }>(`${this.url}/health`);
  }
}
@Injectable({ providedIn: 'root' })
export class PublicFormsService extends Api {
  institutions() {
    return this.http.get<{ institutions: PublicInstitution[] }>(`${this.url}/public/institutions`);
  }
  consent(body: PublicConsentInput) {
    return this.http.post<PublicConsentResponse>(`${this.url}/public/consents`, body);
  }
  submit(
    submissionToken: string,
    application: ApplicationInput,
    contextoSociodemografico: SociodemographicContextInput,
  ) {
    return this.http.post<PublicApplicationResponse>(`${this.url}/public/applications`, {
      submissionToken,
      application,
      contextoSociodemografico,
    });
  }
}
@Injectable({ providedIn: 'root' })
export class ApplicationsService extends Api {
  list(filters: Record<string, string> = {}) {
    return this.http.get<{ applications: Application[] }>(`${this.url}/aplicaciones`, {
      params: new HttpParams({ fromObject: filters }),
    });
  }
  get(id: string) {
    return this.http.get<{ application: Application }>(`${this.url}/aplicaciones/${id}`);
  }
  create(body: ApplicationInput) {
    return this.http.post<{ application: Application }>(`${this.url}/aplicaciones`, body);
  }
}
@Injectable({ providedIn: 'root' })
export class CasesService extends Api {
  list(filters: Record<string, string> = {}) {
    return this.http.get<{ cases: Case[] }>(`${this.url}/casos`, {
      params: new HttpParams({ fromObject: filters }),
    });
  }
  get(id: string) {
    return this.http.get<{ case: Case }>(`${this.url}/casos/${id}`);
  }
  actions(id: string) {
    return this.http.get<{ actions: RouteAction[] }>(`${this.url}/casos/${id}/acciones`);
  }
  recordAction(
    id: string,
    body: { tipo: string; descripcion: string; estadoPosterior?: CaseStatus },
  ) {
    return this.http.post<{ action: RouteAction }>(`${this.url}/casos/${id}/acciones`, body);
  }
  assign(id: string, responsableId: string | null) {
    return this.http.patch<{ case: Case }>(`${this.url}/casos/${id}/responsable`, {
      responsableId,
    });
  }
  transition(id: string, estado: CaseStatus) {
    return this.http.post<{ case: Case }>(`${this.url}/casos/${id}/transiciones`, { estado });
  }
  enableClosure(id: string, motivo: string) {
    return this.http.post<{ case: Case }>(`${this.url}/casos/${id}/criterios-cierre`, { motivo });
  }
}
@Injectable({ providedIn: 'root' })
export class AlertsService extends Api {
  list(filters: Record<string, string> = {}) {
    return this.http.get<{ alerts: Alert[] }>(`${this.url}/alertas`, {
      params: new HttpParams({ fromObject: filters }),
    });
  }
  assume(id: string) {
    return this.http.post<{ alert: Alert; idempotent: boolean }>(
      `${this.url}/alertas/${id}/asumir`,
      {},
    );
  }
}
@Injectable({ providedIn: 'root' })
export class SafetyAssessmentService extends Api {
  create(alertId: string, body: SafetyAssessmentInput) {
    return this.http.post<{ valuation: unknown }>(
      `${this.url}/alertas/${alertId}/valoracion`,
      body,
    );
  }
}
@Injectable({ providedIn: 'root' })
export class ReferralsService extends Api {
  list(caseId: string) {
    return this.http.get<{ referrals: Referral[] }>(`${this.url}/casos/${caseId}/remisiones`);
  }
  create(
    caseId: string,
    body: {
      servicioId: string;
      institucionReceptora: string;
      profesionalReceptor?: string | null;
      observaciones?: string | null;
    },
  ) {
    return this.http.post<{ referral: Referral }>(`${this.url}/casos/${caseId}/remisiones`, body);
  }
  confirm(id: string, body: { profesionalReceptor?: string; observaciones?: string | null } = {}) {
    return this.http.patch<{ referral: Referral; idempotent: boolean }>(
      `${this.url}/remisiones/${id}/confirmar-recepcion`,
      body,
    );
  }
}
@Injectable({ providedIn: 'root' })
export class FollowUpsService extends Api {
  overdue() {
    return this.http.get<{ followups: FollowUp[] }>(`${this.url}/seguimientos/vencidos`);
  }
  list(caseId: string) {
    return this.http.get<{ followups: FollowUp[] }>(`${this.url}/casos/${caseId}/seguimientos`);
  }
  create(caseId: string, body: { fechaProgramada: string; responsableId: string }) {
    return this.http.post(`${this.url}/casos/${caseId}/seguimientos`, body);
  }
  complete(
    id: string,
    body: { resultado: string; proximaAccion?: string | null; proximaFecha?: string | null },
  ) {
    return this.http.patch(`${this.url}/seguimientos/${id}/realizar`, body);
  }
  cancel(id: string, motivo: string) {
    return this.http.patch(`${this.url}/seguimientos/${id}/cancelar`, { motivo });
  }
}
@Injectable({ providedIn: 'root' })
export class ConsentsService extends Api {
  list(filters: Record<string, string> = {}) {
    return this.http.get<{ consents: ConsentRecord[] }>(`${this.url}/consentimientos`, {
      params: new HttpParams({ fromObject: filters }),
    });
  }
}
@Injectable({ providedIn: 'root' })
export class NotificationsService extends Api {
  list(filters: Record<string, string> = {}) {
    return this.http.get<{ notifications: NotificationRecord[] }>(`${this.url}/notificaciones`, {
      params: new HttpParams({ fromObject: filters }),
    });
  }
  retry(id: string) {
    return this.http.post<{ outcome: string; notification?: NotificationRecord }>(
      `${this.url}/notificaciones/${id}/reintentar`,
      {},
    );
  }
}
@Injectable({ providedIn: 'root' })
export class EscalationsService extends Api {
  simulate(institucionId?: string) {
    const params = institucionId ? new HttpParams().set('institucionId', institucionId) : undefined;
    return this.http.get<EscalationReport>(`${this.url}/escalamientos`, { params });
  }
  evaluate(institucionId?: string) {
    const params = institucionId ? new HttpParams().set('institucionId', institucionId) : undefined;
    return this.http.post<EscalationReport>(`${this.url}/escalamientos/evaluar`, {}, { params });
  }
}
@Injectable({ providedIn: 'root' })
export class AdolescentsService extends Api {
  history(id: string) {
    return this.http.get<AdolescentHistory>(`${this.url}/adolescentes/${id}/historial`);
  }
}
@Injectable({ providedIn: 'root' })
export class ProtectionRoutesService extends Api {
  list(caseId: string) {
    return this.http.get<{ protectionRoutes: ProtectionRoute[] }>(
      `${this.url}/casos/${caseId}/rutas-proteccion`,
    );
  }
  create(
    caseId: string,
    body: { tipoVulneracion: ProtectionRoute['tipoVulneracion']; descripcion: string },
  ) {
    return this.http.post<{ protectionRoute: ProtectionRoute }>(
      `${this.url}/casos/${caseId}/rutas-proteccion`,
      body,
    );
  }
  addAction(id: string, body: { tipo: string; descripcion: string }) {
    return this.http.post(`${this.url}/rutas-proteccion/${id}/acciones`, body);
  }
  close(id: string, motivoCierre: string) {
    return this.http.patch<{ protectionRoute: ProtectionRoute; idempotent: boolean }>(
      `${this.url}/rutas-proteccion/${id}/cerrar`,
      { motivoCierre },
    );
  }
}
@Injectable({ providedIn: 'root' })
export class DashboardService extends Api {
  get(kind: 'poblacional' | 'seguridad' | 'rutas', filters: Record<string, string> = {}) {
    return this.http.get<DashboardResponse>(`${this.url}/dashboard/${kind}`, {
      params: new HttpParams({ fromObject: filters }),
    });
  }
}
@Injectable({ providedIn: 'root' })
export class DirectoryService extends Api {
  list() {
    return this.http.get<{ services: DirectoryEntry[] }>(`${this.url}/directorio`);
  }
  create(body: Omit<DirectoryEntry, 'id' | 'updatedAt'>) {
    return this.http.post<{ service: DirectoryEntry }>(`${this.url}/directorio`, body);
  }
  update(id: string, body: Partial<Omit<DirectoryEntry, 'id' | 'updatedAt'>>) {
    return this.http.patch<{ service: DirectoryEntry }>(`${this.url}/directorio/${id}`, body);
  }
}
@Injectable({ providedIn: 'root' })
export class UsersService extends Api {
  list() {
    return this.http.get<{ users: User[] }>(`${this.url}/usuarios`);
  }
  create(body: {
    nombre: string;
    email: string;
    password: string;
    rol: User['rol'];
    institucionId: string | null;
  }) {
    return this.http.post<{ user: User }>(`${this.url}/usuarios`, body);
  }
  update(id: string, body: Partial<User> & { password?: string }) {
    return this.http.patch<{ user: User }>(`${this.url}/usuarios/${id}`, body);
  }
}
@Injectable({ providedIn: 'root' })
export class InstitutionsService extends Api {
  list() {
    return this.http.get<{ institutions: Institution[] }>(`${this.url}/instituciones`);
  }
  create(body: Omit<Institution, 'id'>) {
    return this.http.post<{ institution: Institution }>(`${this.url}/instituciones`, body);
  }
  update(id: string, body: Partial<Omit<Institution, 'id'>>) {
    return this.http.patch<{ institution: Institution }>(`${this.url}/instituciones/${id}`, body);
  }
}
@Injectable({ providedIn: 'root' })
export class AuditService extends Api {
  list(filters: Record<string, string> = {}) {
    return this.http.get<{ audit: AuditEntry[] }>(`${this.url}/auditoria`, {
      params: new HttpParams({ fromObject: filters }),
    });
  }
}
