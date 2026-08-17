const profileLabels: Record<string, string> = {
  BIENESTAR_PRESERVADO: 'Bienestar preservado',
  RECURSOS_MODERADOS: 'Recursos moderados',
  VULNERABILIDAD_GLOBAL: 'Vulnerabilidad global',
  BAJO_BIENESTAR_INDIVIDUAL_FAMILIAR: 'Bajo bienestar individual/familiar',
  RECURSOS_MIXTOS: 'Recursos mixtos',
};

export function operationalProfileLabel(profile?: string | null) {
  if (!profile) return 'Sin clasificación';
  return profileLabels[profile] || profile.replaceAll('_', ' ').toLocaleLowerCase('es');
}
