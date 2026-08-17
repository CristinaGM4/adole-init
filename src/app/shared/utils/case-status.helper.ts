import { CaseStatus } from '../../core/models/api.models';
const l: Record<CaseStatus, string> = {
  APLICACION_RECIBIDA: 'Aplicación recibida',
  CLASIFICACION_REALIZADA: 'Clasificación realizada',
  ALERTA_PENDIENTE_REVISION: 'Alerta pendiente de revisión',
  VALORACION_SEGURIDAD_EN_CURSO: 'Valoración de seguridad en curso',
  RUTA_ABIERTA: 'Ruta abierta',
  CONTACTO_INICIAL_REALIZADO: 'Contacto inicial realizado',
  REMISION_REALIZADA: 'Remisión realizada',
  CONTACTO_RECEPTOR_CONFIRMADO: 'Contacto receptor confirmado',
  ATENCION_VALORACION_CONFIRMADA: 'Atención confirmada',
  SEGUIMIENTO_ACTIVO: 'Seguimiento activo',
  CIERRE_PENDIENTE: 'Cierre pendiente',
  CASO_CERRADO: 'Caso cerrado',
  EMERGENCIA_IDENTIFICADA: 'Emergencia identificada',
  ACTIVACION_URGENTE_REALIZADA: 'Activación urgente realizada',
  TRANSFERENCIA_EN_CURSO: 'Transferencia en curso',
  TRANSFERENCIA_CONFIRMADA: 'Transferencia confirmada',
};
export const caseStatus = (s: CaseStatus) => ({
  label: l[s],
  className:
    s.includes('EMERGENCIA') || s.includes('URGENTE')
      ? 'critical'
      : s === 'CASO_CERRADO'
        ? 'success'
        : s.includes('ALERTA')
          ? 'warning'
          : 'info',
});
