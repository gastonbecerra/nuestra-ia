import { useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useData } from '../main';
import { Case, labels, countries, unique, comparisonCases, frequency, human, cross, caseLink } from '../data';
import { Heading, Select, Empty, dimFilter } from '../components/UI';
import { currentSearchParams } from '../navigation';

const dimensions = ['ambitos', 'riesgos', 'promesas'] as const;
type ComparisonDimension = typeof dimensions[number];

function comparisonParams(params: URLSearchParams) {
  const clean = new URLSearchParams(params);
  for (const key of [...clean.keys()]) if (!['paises', 'anio', 'medida'].includes(key)) clean.delete(key);
  return clean;
}

function Heatmap({ cases, selected, dimension, year, percent }: {
  cases: Case[]; selected: string[]; dimension: ComparisonDimension; year: string; percent: boolean;
}) {
  const categories = frequency(cases, dimension).slice(0, 12).map(r => r.name);
  const matrix = selected.map(group => ({ group, ...cross(cases, group, dimension) }));
  const headingId = `heatmap-${dimension}`;

  return <section className="panel matrix-panel" aria-labelledby={headingId}>
    <div className="panel-heading">
      <h2 id={headingId}>Países × {labels[dimension].toLowerCase()}</h2>
      <span className="helper">Seleccioná una celda para ver sus casos.</span>
    </div>
    <div className="table-scroll">
      <table className="matrix">
        <caption>Primeras {categories.length} categorías por frecuencia. Valores en {percent ? 'porcentaje' : 'casos'}.</caption>
        <thead><tr><th scope="col">País</th><th scope="col">N total / con dato</th>
          {categories.map(cat => <th scope="col" key={cat}>{human(cat)}</th>)}
        </tr></thead>
        <tbody>{matrix.map(group => <tr key={group.group}>
          <th scope="row">{group.group}</th><td>{group.total} / {group.coverage}</td>
          {categories.map(cat => {
            const row = group.rows.find(r => r.name === cat);
            const count = row?.count || 0;
            const value = percent ? row?.percent || 0 : count;
            const link = caseLink({ pais: group.group, anio: year, [dimFilter[dimension]]: cat });
            return <td key={cat} style={{ background: `rgba(107,27,207,${Math.min(.2, (row?.percent || 0) / 300)})` }}>
              {count ? <Link aria-label={`${group.group}, ${human(cat)}: ${count} casos`} to={link}>
                {percent ? `${value.toFixed(1)}%` : value}
              </Link> : <span>0</span>}
            </td>;
          })}
        </tr>)}</tbody>
      </table>
    </div>
  </section>;
}

export default function Comparisons() {
  const data = useData();
  const [params, setParams] = useSearchParams();
  const selected = (params.get('paises') ?? 'Argentina,Colombia,Perú').split(',').filter(Boolean);
  const percent = params.get('medida') === 'porcentaje';
  const year = params.get('anio') || '';

  useEffect(() => {
    const clean = comparisonParams(params);
    if (clean.toString() !== params.toString()) setParams(clean, { replace: true });
  }, [params, setParams]);

  const change = (key: string, value: string) => {
    const next = comparisonParams(currentSearchParams());
    if (value) next.set(key, value); else next.delete(key);
    setParams(next, { replace: true });
  };
  const toggle = (country: string) => {
    const current = (currentSearchParams().get('paises') ?? 'Argentina,Colombia,Perú').split(',').filter(Boolean);
    const next = current.includes(country) ? current.filter(p => p !== country) : [...current, country];
    // Mantener paises= para distinguir una selección vacía de la selección inicial.
    const query = comparisonParams(currentSearchParams());
    query.set('paises', next.join(','));
    setParams(query, { replace: true });
  };
  const cases = useMemo(() => comparisonCases(data.casos, selected, { anio: year }), [data, params.toString()]);

  return <>
    <Heading title="Territorios, usos y preguntas">Elegí países para comparar ámbitos, riesgos y promesas. Cada cifra permite volver a los casos que la componen.</Heading>
    <section className="panel comparison-controls">
      <div style={{ maxWidth: 240, marginBottom: 17 }}>
        <Select label="Año" value={year} onChange={value => change('anio', value)} options={unique(data.casos.map(c => c.anio)).sort()} />
      </div>
      <fieldset className="country-selector"><legend>Países a comparar</legend>
        {unique(data.casos.flatMap(countries)).sort((a, b) => a.localeCompare(b, 'es')).map(country =>
          <label key={country}><input type="checkbox" checked={selected.includes(country)} onChange={() => toggle(country)} />{country}</label>)}
      </fieldset>
      <div className="comparison-bottom">
        <span><strong>{cases.length}</strong> casos únicos de {data.casos.length}</span>
        <div className="segmented">
          <button aria-pressed={!percent} onClick={() => change('medida', 'conteo')}>Casos</button>
          <button aria-pressed={percent} onClick={() => change('medida', 'porcentaje')}>% del grupo</button>
        </div>
      </div>
    </section>
    {!cases.length || !selected.length
      ? <Empty><button onClick={() => setParams({})}>Restablecer comparación</button></Empty>
      : dimensions.map(dimension => <Heatmap key={dimension} cases={cases} selected={selected} dimension={dimension} year={year} percent={percent} />)}
    <aside className="method-note"><h3>Cómo interpretar los cruces</h3><p>Un caso puede tener varias categorías y países. Se cuenta una vez por combinación; las sumas pueden superar el total del corpus y el 100 %.</p><Link to="/proyecto#metodologia">Leer metodología →</Link></aside>
  </>;
}
