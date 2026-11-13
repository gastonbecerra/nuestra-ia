import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Pause, Play } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { useData } from '../main';
import { Dimension, countries, frequency, human, labels, unique } from '../data';
import TerritoryMap from '../components/TerritoryMap';
export default function Panorama() {
  const data=useData(), cases=data.casos;
  const [panel,setPanel]=useState('tiempo'); const [auto,setAuto]=useState(()=>!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const sequence=['tiempo','ambitos','tecnologias','riesgos','promesas'];
  useEffect(()=>{if(!auto)return;const id=setInterval(()=>setPanel(p=>sequence[(sequence.indexOf(p)+1)%sequence.length]),8000);return()=>clearInterval(id);},[auto]);
  const time=unique(cases.map(c=>c.anio)).filter(y=>/^\d{4}$/.test(y)).sort().map(year=>({name:year,year:Number(year),count:cases.filter(c=>c.anio===year).length}));
  const stats=[['Casos',cases.length],['Países',unique(cases.flatMap(countries)).length],
    ['Ámbitos',frequency(cases,'ambitos').length],['Años con registros',time.length]];
  return <><div className="intro-row"><div>
    <h1>La inteligencia artificial,<br/><span>desde nuestras experiencias.</span></h1>
    <p>Una casuística latinoamericana para conocer usos, promesas, riesgos y controversias de la IA.</p></div>
    <Link className="button secondary" to="/casos">Explorar la casuística <ArrowRight size={17}/></Link></div>
    <section className="stats-grid" aria-label="Resumen del corpus">{stats.map(([label,n])=><div className="stat" key={label}><strong>{n}</strong><span>{label}</span></div>)}</section>
    <div className="panorama-grid"><TerritoryMap cases={cases}/><section className="panel descriptive"><div className="panel-heading"><div><h2>{panel==='tiempo'?'Casos a través del tiempo':labels[panel as Dimension]}</h2></div><button className="icon-button" onClick={()=>setAuto(!auto)} aria-label={auto?'Pausar panel automático':'Activar panel automático'} aria-pressed={auto}>{auto?<Pause size={18}/>:<Play size={18}/>}</button></div><div className="panel-tabs" role="group" aria-label="Visualización descriptiva">{sequence.map(p=><button key={p} aria-pressed={p===panel} onClick={()=>{setPanel(p);setAuto(false);}}>{p==='tiempo'?'Años':labels[p as Dimension]}</button>)}</div>
      <p className="helper">{panel==='tiempo'?'Año del acontecimiento consignado en cada caso. No representa una serie de adopción poblacional.':'Cantidad de casos por categoría. Un caso puede tener varias etiquetas.'}</p>
      <div className="chart" role="img" aria-label={panel==='tiempo'?'Casos por año':`Frecuencia de ${labels[panel as Dimension]}`}><ResponsiveContainer width="100%" height="100%">{panel==='tiempo'?<LineChart data={time} margin={{left:-22,right:15,top:12,bottom:10}}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="year" type="number" domain={['dataMin','dataMax']} allowDecimals={false} tickCount={6} tick={{fontSize:12}}/><YAxis allowDecimals={false} tick={{fontSize:12}}/><Tooltip labelFormatter={v=>`Año ${v}`}/><Line isAnimationActive={false} type="linear" dataKey="count" name="Casos" stroke="#6B1BCF" strokeWidth={3}/></LineChart>:<BarChart data={frequency(cases,panel as Dimension).slice(0,8).map(r=>({...r,label:human(r.name)}))} layout="vertical" margin={{left:5,right:22}}><XAxis type="number" allowDecimals={false} hide/><YAxis type="category" dataKey="label" width={130} tick={{fontSize:11}}/><Tooltip/><Bar isAnimationActive={false} dataKey="count" name="Casos" fill="#6B1BCF" radius={[0,5,5,0]}/></BarChart>}</ResponsiveContainer></div>
      <details className="data-details"><summary>Ver datos en tabla</summary><table><thead><tr><th>{panel==='tiempo'?'Año':'Categoría'}</th><th>Casos</th></tr></thead><tbody>{(panel==='tiempo'?time:frequency(cases,panel as Dimension)).map(r=><tr key={r.name}><td>{human(r.name)}</td><td>{r.count}</td></tr>)}</tbody></table></details>
    </section></div><section className="next-grid"><Link to="/comparaciones"><span className="eyebrow">Del panorama a las preguntas</span><h2>Comparar territorios y experiencias <ArrowRight size={20}/></h2><p>Explorá qué cambia entre países, ámbitos y perfiles de riesgo.</p></Link><Link to="/proyecto#metodologia"><span className="eyebrow">Cómo construimos esta base</span><h2>Una casuística con contexto <ArrowRight size={20}/></h2><p>Conocé su origen, los criterios y los límites de estas lecturas.</p></Link></section></>;
}
