import { useSearchParams, useLocation } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useData } from '../main';
import { CaseCard, Empty, Heading, Select } from '../components/UI';
import { Filters, countries, filterCases, frequency, human, unique } from '../data';
import { currentSearchParams } from '../navigation';
export default function Cases() {
  const {casos}=useData(); const [params,setParams]=useSearchParams();const location=useLocation();
  const f=Object.fromEntries(params) as Filters; const results=filterCases(casos,f);const page=Math.max(1,Math.min(Number(params.get('pagina'))||1,Math.max(1,Math.ceil(results.length/12))));
  const change=(key:string,value:string)=>{const p=currentSearchParams();p.delete('pagina');if(value)p.set(key,value);else p.delete(key);if(key==='pais')p.delete('provincia');setParams(p,{replace:true});};
  const selected=Object.entries(f).filter(([k,v])=>k!=='pagina'&&v);
  const sorted=(v:string[])=>unique(v).sort((a,b)=>a.localeCompare(b,'es'));
  return <><Heading title="Explorar la casuística"/>
    <section className="panel filter-panel" aria-label="Filtros de casos"><label className="search-field"><Search size={20}/><input aria-label="Buscar casos" placeholder="Buscar por título, descripción o país…" value={f.q||''} onChange={e=>change('q',e.target.value)}/></label>
      <div className="filters-grid"><Select label="País" value={f.pais||''} onChange={v=>change('pais',v)} options={sorted(casos.flatMap(countries))}/><Select label="Provincia / departamento / región" value={f.provincia||''} onChange={v=>change('provincia',v)} options={sorted(casos.flatMap(c=>c.territorios.filter(t=>!f.pais||t.pais===f.pais).map(t=>t.provincia)).filter(Boolean))}/><Select label="Año" value={f.anio||''} onChange={v=>change('anio',v)} options={sorted(casos.map(c=>c.anio))}/><Select label="Ámbito" value={f.ambito||''} onChange={v=>change('ambito',v)} options={frequency(casos,'ambitos').map(r=>r.name)}/></div>
      <details open={!!(f.tecnologia||f.actor||f.riesgo||f.promesa||f.fuente||f.alcance)}><summary>Más filtros: tecnologías, actores, riesgos, promesas y fuente</summary><div className="filters-grid extra-filters"><Select label="Tecnología" value={f.tecnologia||''} onChange={v=>change('tecnologia',v)} options={frequency(casos,'tecnologias').map(r=>r.name)}/><Select label="Actor" value={f.actor||''} onChange={v=>change('actor',v)} options={frequency(casos,'actores').map(r=>r.name)}/><Select label="Riesgo" value={f.riesgo||''} onChange={v=>change('riesgo',v)} options={frequency(casos,'riesgos').map(r=>r.name)}/><Select label="Promesa" value={f.promesa||''} onChange={v=>change('promesa',v)} options={frequency(casos,'promesas').map(r=>r.name)}/><Select label="Fuente / reseñista" value={f.fuente||''} onChange={v=>change('fuente',v)} options={sorted(casos.map(c=>c.fuente).filter(Boolean))}/><Select label="Localización documentada" value={f.alcance||''} onChange={v=>change('alcance',v)} options={['nacional','subnacional']}/></div></details>
      {selected.length>0&&<div className="active-filters">{selected.map(([k,v])=><button className="filter-chip" key={k} onClick={()=>change(k,'')}>{human(v!)} <X size={13}/><span className="sr-only">Quitar filtro</span></button>)}<button className="text-button" onClick={()=>setParams({})}>Limpiar todos los filtros</button></div>}
    </section><div className="results-heading"><h2>{results.length} <span>de {casos.length} casos</span></h2></div>
    {results.length?<><div className="case-grid">{results.slice((page-1)*12,page*12).map(c=><CaseCard key={c.id} c={c} back={location.pathname+location.search}/>)}</div><nav className="pagination" aria-label="Páginas de resultados"><button disabled={page<=1} onClick={()=>{const p=new URLSearchParams(params);p.set('pagina',String(page-1));setParams(p);}}>Anterior</button><span>Página {page} de {Math.ceil(results.length/12)}</span><button disabled={page>=Math.ceil(results.length/12)} onClick={()=>{const p=new URLSearchParams(params);p.set('pagina',String(page+1));setParams(p);}}>Siguiente</button></nav></>:<Empty><button onClick={()=>setParams({})}>Limpiar filtros</button></Empty>}
  </>;
}
