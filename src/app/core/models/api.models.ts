export type Role = 'ADMIN' | 'SECRETARIA_EDUCACION';
export type CaseStatus =
  | 'APLICACION_RECIBIDA'
  | 'CLASIFICACION_REALIZADA'
  | 'ALERTA_PENDIENTE_REVISION'
  | 'VALORACION_SEGURIDAD_EN_CURSO'
  | 'RUTA_ABIERTA'
  | 'CONTACTO_INICIAL_REALIZADO'
  | 'REMISION_REALIZADA'
  | 'CONTACTO_RECEPTOR_CONFIRMADO'
  | 'ATENCION_VALORACION_CONFIRMADA'
  | 'SEGUIMIENTO_ACTIVO'
  | 'CIERRE_PENDIENTE'
  | 'CASO_CERRADO'
  | 'EMERGENCIA_IDENTIFICADA'
  | 'ACTIVACION_URGENTE_REALIZADA'
  | 'TRANSFERENCIA_EN_CURSO'
  | 'TRANSFERENCIA_CONFIRMADA';
export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: Role;
  institucionId: string | null;
  activo: boolean;
  institucion?: { id: string; nombre: string };
}
export interface Institution {
  id: string;
  nombre: string;
  codigo: string;
  tipo: string;
  direccion?: string | null;
  municipio: string;
  activa: boolean;
}
export interface Adolescent {
  id: string;
  codigo: string;
  edad: number;
}
export interface Alert {
  id: string;
  casoId: string;
  estado: 'SIN_RESPONSABLE' | 'PENDIENTE_VALORACION' | 'EN_VALORACION' | 'RESUELTA';
  responsableId: string | null;
  responsable?: Pick<User, 'id' | 'nombre'> | null;
  generadaAt: string;
  proximaAccion: string;
  caso?: Case;
}
export interface Application {
  id: string;
  institucionId: string;
  edadAlAplicar?: number;
  versionInstrumento?: 'IPBAM-20-1.0' | 'IPBIM-C20-1.0';
  tipoInstrumento?: 'ADOLESCENTE' | 'INFANTIL_CUIDADOR';
  modoPiloto?: boolean;
  estado: 'RECIBIDA_COMPLETA' | 'RECIBIDA_INCOMPLETA';
  fechaEnvio: string;
  adolescente: Adolescent;
  resultado?: {
    perfilOperativo: string | null;
    safetyAlert: boolean;
    sintomasPuntaje?: number;
    sintomasBanda?: string;
  };
  resultadoInfantil?: {
    perfilOperativo: string | null;
    seguridadEstado: string;
    safetyAlert: boolean;
    versionAlgoritmo?: string;
  } | null;
  alerta?: Alert | null;
  institucion?: Institution;
  caso?: Case;
  contextoTemblor?: SociodemographicContextInput | null;
}
export interface Case {
  id: string;
  estado: CaseStatus;
  perfilOperativo: string | null;
  safetyAlertStatus: string | null;
  motivo: string;
  proximaAccion: string | null;
  fechaProximaAccion: string | null;
  fechaApertura: string;
  fechaCierre?: string | null;
  adolescente: Adolescent;
  institucion: Institution;
  responsableActual?: Pick<User, 'id' | 'nombre' | 'rol'> | null;
  alerta?: Alert | null;
  aplicacion: { id: string; estado: string; versionInstrumento: string; fechaEnvio: string };
}
export interface RouteAction {
  id: string;
  tipo: string;
  descripcion: string;
  estadoAnterior?: CaseStatus;
  estadoPosterior?: CaseStatus;
  createdAt: string;
  usuario?: Pick<User, 'nombre'>;
}
export interface FollowUp {
  id: string;
  casoId: string;
  estado: 'PROGRAMADO' | 'REALIZADO' | 'VENCIDO' | 'CANCELADO';
  fechaProgramada: string;
  responsable: Pick<User, 'id' | 'nombre'>;
  caso?: Case;
  resultado?: string | null;
}
export interface DirectoryEntry {
  id: string;
  nombre: string;
  tipo: string;
  usoPrincipal: string;
  formaAcceso: string;
  telefono?: string | null;
  direccion?: string | null;
  horario?: string | null;
  territorio: string;
  activo: boolean;
  updatedAt: string;
}
export interface Referral {
  id: string;
  casoId: string;
  servicioId: string;
  institucionReceptora: string;
  profesionalReceptor?: string | null;
  observaciones?: string | null;
  fechaRemision: string;
  contactoRealizado: boolean;
  fechaContacto?: string | null;
  recepcionConfirmada: boolean;
  fechaConfirmacion?: string | null;
  servicio: Pick<DirectoryEntry, 'id' | 'nombre' | 'tipo' | 'territorio' | 'activo'>;
  registradoPor: Pick<User, 'id' | 'nombre' | 'rol'>;
}
export interface ProtectionRoute {
  id: string;
  casoId: string;
  tipoVulneracion:
    | 'VIOLENCIA_INTRAFAMILIAR'
    | 'MALTRATO'
    | 'ABUSO'
    | 'EXPLOTACION'
    | 'NEGLIGENCIA_GRAVE'
    | 'OTRA_VULNERACION';
  descripcion: string;
  estado: 'ACTIVA' | 'CERRADA';
  fechaActivacion: string;
  fechaCierre?: string | null;
  motivoCierre?: string | null;
  activadaPor: Pick<User, 'id' | 'nombre' | 'rol'>;
}
export interface AuditEntry {
  id: string;
  createdAt: string;
  accion: string;
  entidad: string;
  entidadId: string;
  usuario: Pick<User, 'id' | 'nombre' | 'email' | 'rol'>;
}
export interface Answer {
  pregunta: number;
  valor: number;
}
export interface ApplicationInput {
  codigoAdolescente: string;
  edad: number;
  institucionId: string;
  consentimientoId: string;
  lugarAplicacion: string;
  versionInstrumento: string;
  fechaInicio: string;
  respuestas: Answer[];
}
export interface PublicInstitution {
  id: string;
  nombre: string;
  codigo: string;
  municipio: string;
}
export type ConsentDecision = 'ACEPTADO' | 'RECHAZADO';
export interface PublicConsentInput {
  institucionId: string;
  codigoParticipante: string;
  tipoInformante: 'ADOLESCENTE' | 'CUIDADOR';
  relacionCuidador?: string;
  decision: ConsentDecision;
  versionTexto: 'CONSENT-MANIZALES-1.0';
  asentimiento: ConsentDecision | 'NO_APLICA';
  versionTextoAsentimiento?: 'ASSENT-MANIZALES-1.0' | null;
}
export interface PublicConsentResponse {
  consent: { id: string };
  formAllowed: boolean;
  submissionToken?: string;
  expiresInSeconds?: number;
}
export interface PublicApplicationResponse {
  message?: string;
  application?: { id: string };
}
export type SexoNacimiento = 'FEMENINO' | 'MASCULINO' | 'INTERSEXUAL' | 'PREFIERE_NO_RESPONDER';
export type Escolarizacion = 'ESCOLARIZADO' | 'NO_ESCOLARIZADO';
export type GradoEscolar =
  'TRANSICION' | `GRADO_${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11}` | 'COMPLEMENTARIO';
export type TipoConviviente =
  | 'MADRE'
  | 'PADRE'
  | 'HERMANOS_HERMANAS'
  | 'ABUELOS_ABUELAS'
  | 'OTROS_FAMILIARES'
  | 'FAMILIA_ACOGIDA_OTRO_CUIDADOR'
  | 'OTRA_SITUACION';
export type PersonaInformante =
  'ADOLESCENTE' | 'MADRE' | 'PADRE' | 'ABUELO_ABUELA' | 'OTRO_FAMILIAR' | 'OTRO_CUIDADOR';
export type LesionFisica =
  | 'NO'
  | 'LEVE_SIN_ATENCION_MEDICA'
  | 'NECESITO_ATENCION_MEDICA'
  | 'NECESITO_HOSPITALIZACION'
  | 'NO_SEGURO';
export type TipoLesion =
  | 'GOLPE_CONTUSION'
  | 'HERIDA_CORTADURA'
  | 'CAIDA'
  | 'FRACTURA_LESION_IMPORTANTE'
  | 'DIFICULTAD_RESPIRATORIA_DESCOMPENSACION'
  | 'OTRA'
  | 'PREFIERE_NO_RESPONDER';
export type SiNoNoSabe = 'NO' | 'SI' | 'NO_SE';
export type SalidaVivienda = 'NO' | 'ALGUNAS_HORAS' | 'UNO_O_MAS_DIAS' | 'AUN_NO_HA_REGRESADO';
export type DanoVivienda =
  'NO' | 'DANOS_LEVES' | 'DIFICULTA_VIVIR_NORMALMENTE' | 'GRAVE_NO_HABITABLE' | 'NO_SE';
export type NecesidadServicio =
  | 'AGUA'
  | 'ENERGIA'
  | 'ALIMENTACION'
  | 'MEDICAMENTOS'
  | 'TRANSPORTE'
  | 'ACCESO_SERVICIOS_SALUD'
  | 'NINGUNA'
  | 'OTRA';
export type CambioTemporal = 'NO' | 'SI' | 'NO_SEGURO';
export interface SociodemographicContextInput {
  sexoRegistradoNacimiento: SexoNacimiento;
  escolarizacion: Escolarizacion;
  grado: GradoEscolar | null;
  comunaCorregimiento: string;
  convivencia: TipoConviviente[];
  personaInformante: PersonaInformante;
  lesionFisica: LesionFisica;
  tiposLesion: TipoLesion[];
  familiaresHeridos: SiNoNoSabe;
  salidaVivienda: SalidaVivienda;
  danosVivienda: DanoVivienda;
  necesidadesServicios: NecesidadServicio[];
  cambioResidenciaEscuelaCuidador: CambioTemporal;
}
export interface ConsentRecord {
  id: string;
  institucionId: string;
  codigoParticipante: string;
  tipoInformante: 'ADOLESCENTE' | 'CUIDADOR';
  decision: ConsentDecision;
  versionTexto: string;
  asentimiento?: ConsentDecision | null;
  versionTextoAsentimiento?: string | null;
  fechaDecision: string;
  origen: string;
}
export interface NotificationRecord {
  id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  canal: string;
  estado: string;
  intentos: number;
  createdAt: string;
  destinatario?: Pick<User, 'id' | 'nombre' | 'rol'>;
  caso?: Pick<Case, 'id' | 'estado'> | null;
}
export interface EscalationReport {
  metadata: { evaluadoAt: string; persistido: boolean; institucionId: string | null };
  resumen: Record<string, number>;
  grupos: unknown[];
}
export interface AdolescentHistory {
  adolescent: Adolescent & { institucionId?: string };
  metadata: { totalAplicaciones: number; orden: string; nominal: boolean };
  applications: Application[];
}
export interface SafetyAssessmentInput {
  ideacionActual: boolean;
  intencion: boolean;
  plan: boolean;
  accesoMedios: boolean;
  intentoReciente: boolean;
  autolesionReciente: boolean;
  consumoRelevante: boolean;
  agitacion: boolean;
  desesperanza: boolean;
  adultoProtector: boolean;
  condicionesSeguridad: string;
  observaciones?: string | null;
}
export interface DashboardMetadata {
  generadoAt: string;
  desde: string | null;
  hasta: string | null;
  agrupacion?: 'dia' | 'semana' | 'mes';
  institucionId: string | null;
  nominal: false;
}
export interface DashboardDistribution {
  categoria: string;
  total: number;
}
export interface PopulationDashboardResponse {
  metadata: DashboardMetadata;
  resumen: {
    adolescentesEvaluados: number;
    aplicaciones: number;
    institucionesParticipantes: number;
    formulariosCompletos: number;
    formulariosIncompletos: number;
    formulariosConContextoSociodemografico: number;
  };
  distribucionEdad: DashboardDistribution[];
  distribucionInstitucion: DashboardDistribution[];
  distribucionPerfil: DashboardDistribution[];
  distribucionDominios: Record<string, DashboardDistribution[]>;
  sociodemografico: {
    distribucionSexo: DashboardDistribution[];
    distribucionEscolarizacion: DashboardDistribution[];
    distribucionGrado: DashboardDistribution[];
    distribucionComunaCorregimiento: DashboardDistribution[];
    distribucionConvivencia: DashboardDistribution[];
    distribucionPersonaInformante: DashboardDistribution[];
  };
  afectacionesTemblor: {
    distribucionLesionFisica: DashboardDistribution[];
    distribucionTiposLesion: DashboardDistribution[];
    distribucionFamiliaresHeridos: DashboardDistribution[];
    distribucionSalidaVivienda: DashboardDistribution[];
    distribucionDanosVivienda: DashboardDistribution[];
    distribucionNecesidadesServicios: DashboardDistribution[];
    distribucionCambioTemporal: DashboardDistribution[];
  };
  evolucionTemporal: { periodo: string; total: number }[];
  resultadosPorInstrumento: {
    ADOLESCENTE: { aplicaciones: number; perfiles: DashboardDistribution[] };
    INFANTIL_CUIDADOR: {
      aplicaciones: number;
      perfiles: DashboardDistribution[];
      dominios: Record<string, DashboardDistribution[]>;
    };
  };
}
export interface SecurityDashboardResponse {
  metadata: DashboardMetadata;
  alertasDelDia: number;
  alertasPendientes: number;
  alertasSinResponsable: number;
  alertasConResponsable: number;
  valoracionesCompletadas: number;
  situacionesUrgentes: number;
  transferenciasPendientes: number;
  transferenciasConfirmadas: number;
  alertasVencidas: number;
}
export interface RoutesDashboardResponse {
  metadata: DashboardMetadata;
  rutasAbiertas: number;
  rutasEnSeguimiento: number;
  remisionesRealizadas: number;
  remisionesConfirmadas: number;
  casosVencidos: number;
  casosSinContactoConfirmado: number;
  casosCerrados: number;
}
export type DashboardResponse = {
  metadata: {
    generadoAt: string;
    desde: string | null;
    hasta: string | null;
    institucionId: string | null;
    nominal: false;
  };
  [key: string]: unknown;
};
