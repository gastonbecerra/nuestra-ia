export type Dimension = 'ambitos' | 'tecnologias' | 'herramientas' | 'actores' | 'riesgos' | 'promesas';
export interface Territory { pais: string; provincia: string }
export interface Case {
  id: string; titulo: string; resumen: string; anio: string; fuente: string; autor: string; curso: string;
  urls: string[]; territorios: Territory[]; pais_original: string; provincia_original: string; alcance: string;
  ambitos: string[]; tecnologias: string[]; herramientas: string[]; actores: string[]; riesgos: string[];
  promesas: string[]; poblaciones: string[]; condiciones: string[]; implementacion: string[];
  tipo_fuente: string; comentarios: string; territorio_pendiente: boolean;
  riesgos_original?: string; promesas_original?: string;
}
export interface Cross { cruce: string; grupo: string; categoria: string; n_casos: number; denominador: number; casos_con_dato: number; porcentaje: number }
export interface Bundle { version: string; generado_en: string; fuente: string; casos: Case[]; indicadores: Record<string, number>; cruces: Cross[] }
export const labels: Record<Dimension, string> = { ambitos: 'Ámbitos', tecnologias: 'Tecnologías', herramientas: 'Herramientas', actores: 'Actores', riesgos: 'Riesgos', promesas: 'Promesas' };
const displayLabels:Record<string,string> = {
  pais:'País', ambitos:'Ámbitos', tecnologias:'Tecnologías', politica:'Política', educacion:'Educación',
  legislacion_justicia:'Legislación y justicia', legislacion_local:'Legislación local',
  comunicacion_cultura:'Comunicación y cultura', salud_fisica_mental:'Salud física y mental',
  organizacion_empresa:'Organización y empresa', programacion_desarrollo:'Programación y desarrollo',
  inclusion_accesibilidad:'Inclusión y accesibilidad', industria_infraestructura:'Industria e infraestructura',
  analitica_datos:'Analítica de datos', apoyo_decision:'Apoyo a decisiones', vision_computacional:'Visión computacional',
  generativa_texto:'IA generativa de texto', generativa_imagen:'IA generativa de imagen',
  generativa_video:'IA generativa de video', reconocimiento_voz_nlp:'Voz y lenguaje natural',
  automatizacion_documental:'Automatización documental', alfabetizacion_ia:'Alfabetización en IA',
  automatizacion:'Automatización', sintesis_voz:'Síntesis de voz',
  privacidad_datos:'Privacidad y datos', desigualdad_acceso:'Desigualdad de acceso',
  calidad_informacion:'Calidad de la información', errores_sesgos:'Errores y sesgos',
  responsabilidad_legal:'Responsabilidad legal', fallo_tecnico:'Fallo técnico',
  falta_regulacion:'Falta de regulación', fake_desinformacion:'Desinformación',
  reemplazo_desempleo:'Reemplazo y desempleo', precarizacion:'Precarización',
  polarizacion:'Polarización', validacion_insuficiente:'Validación insuficiente',
  perdida_habilidades_cognitivas:'Pérdida de habilidades cognitivas', camara_eco:'Cámara de eco',
  modernizacion:'Modernización', prevencion:'Prevención', analisis:'Análisis', innovacion:'Innovación',
  personalizacion:'Personalización', aceleracion:'Aceleración', inclusion:'Inclusión',
  planificacion:'Planificación', alfabetizacion:'Alfabetización', proteccion:'Protección',
  organizacion:'Organización', autonomia:'Autonomía', inversion:'Inversión',
};
export const human = (s: string) => displayLabels[s] || s.replaceAll('_', ' ').replace(/^./, c => c.toLocaleUpperCase('es'));
export const unique = <T,>(items: T[]) => [...new Set(items)];
export const countries = (c: Case) => unique(c.territorios.map(t => t.pais));
export const national = (c: Case, pais?: string) => c.territorios.some(t => (!pais || t.pais === pais) && t.provincia.toLocaleLowerCase('es') === 'nacional');
export const validProvince = (s: string) => !!s && !['nacional','na','n/a','global','regional','no aplica','no_aplica'].includes(s.trim().toLowerCase());
export const fold = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
export function frequency(cases: Case[], dimension: Dimension) {
  const counts = new Map<string, number>();
  for (const c of cases) for (const label of unique(c[dimension])) counts.set(label, (counts.get(label) || 0) + 1);
  return [...counts].map(([name, count]) => ({ name, count })).sort((a,b) => b.count-a.count || a.name.localeCompare(b.name, 'es'));
}
export interface Filters { q?: string; pais?: string; provincia?: string; anio?: string; ambito?: string; tecnologia?: string; herramienta?: string; actor?: string; riesgo?: string; promesa?: string; fuente?: string; alcance?: string }
export function filterCases(cases: Case[], f: Filters) {
  return cases.filter(c => (!f.q || fold(`${c.titulo} ${c.resumen} ${c.pais_original}`).includes(fold(f.q)))
    && (!f.pais || countries(c).includes(f.pais))
    && (!f.provincia || c.territorios.some(t => (!f.pais || t.pais === f.pais) && t.provincia === f.provincia))
    && (!f.anio || c.anio === f.anio)
    && (!f.ambito || c.ambitos.includes(f.ambito)) && (!f.tecnologia || c.tecnologias.includes(f.tecnologia))
    && (!f.herramienta || c.herramientas.includes(f.herramienta))
    && (!f.actor || c.actores.includes(f.actor)) && (!f.riesgo || c.riesgos.includes(f.riesgo))
    && (!f.promesa || c.promesas.includes(f.promesa)) && (!f.fuente || c.fuente === f.fuente)
    && (!f.alcance || (f.alcance === 'nacional' ? national(c, f.pais) : c.territorios.some(t => (!f.pais || t.pais === f.pais) && validProvince(t.provincia)))));
}
export function caseLink(filters: Filters) {
  return `/casos?${new URLSearchParams(Object.entries(filters).filter(([,v]) => !!v) as [string,string][]).toString()}`;
}
export function comparisonCases(cases: Case[], selected: string[], filters: Filters) {
  return cases.filter(c => selected.some(pais => filterCases([c], {...filters, pais}).length > 0));
}
export function cross(cases: Case[], group: string, dimension: Dimension, byProvince = false) {
  const subset = cases.filter(c => byProvince ? c.territorios.some(t => `${t.pais} · ${t.provincia}` === group) : countries(c).includes(group));
  const coverage = subset.filter(c => c[dimension].length > 0).length;
  return { total: subset.length, coverage, rows: frequency(subset, dimension).map(r => ({ ...r, percent: subset.length ? 100*r.count/subset.length : 0 })) };
}
export function validateBundle(raw: unknown): asserts raw is Bundle {
  const d = raw as Bundle;
  if (!d || typeof d.version !== 'string' || !Array.isArray(d.casos) || !d.casos.length || !Array.isArray(d.cruces)) throw new Error('Archivo de datos inválido');
  if (unique(d.casos.map(c => c.id)).length !== d.casos.length) throw new Error('IDs duplicados');
  for (const c of d.casos) {
    if (!c.id || !c.titulo || !Array.isArray(c.territorios) || !Array.isArray(c.urls) || Object.keys(labels).some(k => !Array.isArray(c[k as Dimension]))) throw new Error('Registro incompleto');
  }
}
