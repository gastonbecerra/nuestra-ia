import { useEffect, useMemo, useState } from 'react';
import { CircleMarker, GeoJSON, MapContainer, Popup } from 'react-leaflet';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { FeatureCollection, Feature, Geometry } from 'geojson';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { Case, caseLink, countries, national, validProvince } from '../data';
import { countryIds, provincePoints } from '../geo';
import { assetUrl, routeHref } from '../navigation';
export default function TerritoryMap({cases}: {cases:Case[]}) {
  const [mode,setMode] = useState<'pais'|'provincia'>('pais'); const [geo,setGeo] = useState<FeatureCollection>(); const [error,setError] = useState(false);
  useEffect(()=>{ fetch(assetUrl('data/world.json')).then(r=>{if(!r.ok)throw new Error();return r.json();}).then((topology:Topology)=> {
    const collection=feature(topology, topology.objects.countries as GeometryCollection);
    // Omitir polígonos ajenos a la región que cruzan el antimeridiano (p. ej. Fiyi).
    setGeo({...collection,features:collection.features.filter(f=>countryIds[String(f.id).padStart(3,'0')] || ['124','840','328','740','250'].includes(String(f.id).padStart(3,'0')))});
  }).catch(()=>setError(true)); },[]);
  const counts = useMemo(()=>Object.fromEntries([...new Set(cases.flatMap(countries))].map(p=>[p,cases.filter(c=>countries(c).includes(p))])),[cases]);
  const provinces = useMemo(()=>{
    const result = new Map<string,{pais:string;provincia:string;ids:Set<string>}>();
    for(const c of cases) for(const t of c.territorios) if(validProvince(t.provincia)) { const key=`${t.pais}|${t.provincia}`; if(!result.has(key))result.set(key,{...t,ids:new Set()});result.get(key)!.ids.add(c.id); }
    return [...result.entries()];
  },[cases]);
  const mapped = new Set(provinces.filter(([key])=>provincePoints[key]).flatMap(([,v])=>[...v.ids]));
  const nationalCases = cases.filter(c=>national(c));
  const sinTerritorio = cases.filter(c=>!national(c)&&!c.territorios.some(t=>validProvince(t.provincia)));
  return <section className="panel map-panel"><div className="panel-heading"><div><h2>Una mirada regional</h2></div><div className="segmented" aria-label="Escala del mapa"><button aria-pressed={mode==='pais'} onClick={()=>setMode('pais')}>País</button><button aria-pressed={mode==='provincia'} onClick={()=>setMode('provincia')}>Provincia</button></div></div>
    <p className="helper">{mode==='pais'?'Casos vinculados con cada país. Seleccioná un territorio para explorar sus registros.':'Puntos de referencia de provincias, departamentos o regiones. No son ubicaciones exactas de los hechos.'}</p>
    <div className="map-wrap"><MapContainer bounds={[[-56,-119],[33,-32]]} boundsOptions={{padding:[8,8]}} zoomSnap={.25} minZoom={2} maxZoom={8} scrollWheelZoom={false} style={{height:'100%',width:'100%',background:'#f7f4fa'}}>
      {geo && <GeoJSON attribution="Natural Earth · world-atlas" key={`${mode}-${cases.map(c=>c.id).join()}`} data={geo} style={f=>{const name=countryIds[String(f?.id).padStart(3,'0')];const n=counts[name]?.length||0; return {fillColor:n?'#6B1BCF':'#e9e2f0',fillOpacity:mode==='pais'?(n?Math.min(.8,.22+n/100):.15):.12,color:'#927fa4',weight:1};}} onEachFeature={(f:Feature<Geometry>,layer)=>{const name=countryIds[String(f.id).padStart(3,'0')];if(!name||!counts[name])return;const items=counts[name];layer.bindTooltip(`${name}: ${items.length} casos`,{sticky:true});const container=document.createElement('div');const title=document.createElement('strong');title.textContent=name;const p=document.createElement('p');p.textContent=`${items.length} casos · ${items.filter(c=>national(c,name)).length} de alcance nacional`;const a=document.createElement('a');a.href=routeHref(caseLink({pais:name}));a.textContent='Explorar casos →';container.append(title,p,a);layer.bindPopup(container);}}/>}
      {mode==='provincia' && provinces.map(([key,p])=>provincePoints[key]&&<CircleMarker key={key} center={provincePoints[key]} radius={Math.min(18,6+p.ids.size)} pathOptions={{color:'#3A007A',fillColor:'#8F2BFF',fillOpacity:.65}}><Popup><strong>{p.provincia} · {p.pais}</strong><p>{p.ids.size} casos</p><Link to={caseLink({pais:p.pais,provincia:p.provincia})}>Explorar casos →</Link></Popup></CircleMarker>)}
    </MapContainer></div>
    {mode==='provincia'&&<div className="map-legend"><span>{mapped.size} de {cases.length} casos con referencia provincial representable.</span></div>}
    <details className="data-details"><summary>Explorar casuística por países</summary><div className="tags">{Object.entries(counts).sort(([a],[b])=>a.localeCompare(b,'es')).map(([p,items])=><Link className="tag" key={p} to={caseLink({pais:p})}>{p} ({items.length})</Link>)}</div></details>
    {error&&<p role="alert">No se pudo cargar la cartografía local. Podés explorar todos los países en Casuística.</p>}
    {mode==='provincia'&&<aside className="national-box"><div><strong>{nationalCases.length} iniciativas de alcance nacional</strong><p>Se consultan a nivel país, sin asignarlas a una capital ni replicarlas en todas las provincias.</p>{sinTerritorio.length>0&&<p><Link className="text-link" to={caseLink({localizacion:'sin_territorio'})}>{sinTerritorio.length} casos sin unidad territorial especificada →</Link></p>}</div><Link className="text-link" to={caseLink({localizacion:'nacional'})}>Ver iniciativas →</Link><details><summary>Territorios pendientes de representación</summary><ul>{provinces.filter(([key])=>!provincePoints[key]).map(([key,p])=><li key={key}>{p.pais} · {p.provincia} ({p.ids.size})</li>)}</ul><p>Los casos sin unidad subnacional documentada permanecen disponibles en el explorador.</p></details></aside>}
  </section>;
}
