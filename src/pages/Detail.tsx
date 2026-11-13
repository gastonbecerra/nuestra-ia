import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Link as LinkIcon } from 'lucide-react';
import { useState } from 'react';
import { useData } from '../main';
import { Tags } from '../components/UI';
import { human } from '../data';
function Recorded({values,original}: {values:string[];original?:string}) {
  if (original && /^(no_aplica|no aplica)$/i.test(original.trim())) return <p className="muted">No aplica, según el registro.</p>;
  if (original && /^(sin riesgos|no se identificaron riesgos)$/i.test(original.trim())) return <p className="muted">No se identificaron riesgos, según el registro.</p>;
  return values.length ? <Tags values={values}/> : <p className="muted">No registrado. No equivale a ausencia.</p>;
}
export default function Detail() {
  const {id}=useParams(); const c=useData().casos.find(c=>c.id===id); const location=useLocation(); const [copied,setCopied]=useState(false);
  if(!c)return <div className="empty"><h1>No encontramos este caso</h1><Link to="/casos">Volver a la casuística</Link></div>;
  const back=typeof location.state?.back==='string'&&location.state.back.startsWith('/casos')?location.state.back:'/casos';
  return <article className="detail"><Link className="back-link" to={back}><ArrowLeft size={17}/> Volver a la casuística</Link><header className="detail-heading"><span className="eyebrow">{c.id} · {c.anio || 'Año no registrado'}</span><h1>{c.titulo}</h1><Tags values={c.ambitos}/></header>
    <div className="detail-grid"><div><section className="panel prose"><h2>El caso</h2><p className="lead">{c.resumen || 'Descripción no registrada.'}</p></section><section className="panel"><h2>Promesas y riesgos</h2><div className="detail-columns"><div><h3>Promesas declaradas</h3><Recorded values={c.promesas} original={c.promesas_original}/></div><div><h3>Riesgos consignados</h3><Recorded values={c.riesgos} original={c.riesgos_original}/></div></div><p className="helper">Las etiquetas no distinguen por sí solas riesgo potencial de daño ocurrido. La descripción y las fuentes aportan ese contexto.</p></section>
    <section className="panel"><h2>Actores, tecnologías y condiciones</h2>{([['Tecnologías',c.tecnologias],['Herramientas',c.herramientas],['Actores',c.actores],['Poblaciones involucradas',c.poblaciones],['Condiciones',c.condiciones],['Estado / forma de implementación',c.implementacion]] as [string,string[]][]).map(([title,values])=><div className="detail-section" key={title}><h3>{title}</h3><Tags values={values}/></div>)}</section>
    <section className="panel" id="fuentes"><h2>Evidencias y fuentes documentales</h2>{c.urls.length?<ul className="source-list">{c.urls.map((url,i)=>/^https?:\/\//.test(url)?<li key={url}><a href={url} target="_blank" rel="noopener noreferrer"><span>Fuente {i+1}<small>{url}</small></span><ExternalLink size={17}/></a></li>:<li key={url}>Referencia registrada: {url}</li>)}</ul>:<p>No hay un enlace documental registrado para este caso.</p>}<p className="helper">Tipo de fuente: {human(c.tipo_fuente)||'No registrado'}. Un enlace puede remitir a una página institucional general; su precisión documental varía.</p></section></div>
    <aside><section className="panel sticky-panel"><h2>Ficha de referencia</h2><dl><dt>Territorio documentado</dt><dd>{c.territorios.map((t,i)=><div key={i}><strong>{t.pais}</strong> · {t.provincia||'Unidad subnacional no registrada'}</div>)}</dd><dt>Alcance clasificado</dt><dd>{c.alcance?human(c.alcance):'No registrado'}</dd><dt>Año del caso</dt><dd>{c.anio||'No registrado'}</dd><dt>Fuente / reseñista</dt><dd>{c.fuente||'No registrado'}</dd>{c.autor&&<><dt>Autor</dt><dd>{c.autor}</dd></>}<dt>Curso / colección</dt><dd>{c.curso||'No registrado'}</dd></dl>{c.territorio_pendiente&&<p className="notice">La correspondencia país–provincia requiere revisión. Se conserva la información original: {c.pais_original} / {c.provincia_original}.</p>}<button className="button secondary" onClick={async()=>{try{await navigator.clipboard.writeText(location.pathname?window.location.href:'');setCopied(true);}catch{setCopied(false);}}}><LinkIcon size={16}/>{copied?'Enlace copiado':'Copiar enlace'}</button><Link className="text-link" to="/proyecto#metodologia">Cómo leer esta ficha →</Link></section></aside></div>
  </article>;
}
