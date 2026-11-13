import { lazy, Suspense, useEffect } from 'react';
import { NavLink, Route, Routes, Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, BookOpen, ChartNoAxesCombined, Compass, Layers } from 'lucide-react';
import { useData } from './main';
const Panorama=lazy(()=>import('./pages/Panorama'));
const Cases=lazy(()=>import('./pages/Cases'));
const Detail=lazy(()=>import('./pages/Detail'));
const Comparisons=lazy(()=>import('./pages/Comparisons'));
const Project=lazy(()=>import('./pages/Project'));
const links = [{to:'/',label:'Panorama',icon:Compass},{to:'/comparaciones',label:'Comparaciones',icon:ChartNoAxesCombined},{to:'/casos',label:'Casuística',icon:Layers},{to:'/proyecto',label:'Sobre el proyecto',icon:BookOpen}];
export default function App() {
  const data = useData(); const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0,0); document.getElementById('content')?.focus(); document.title = `Nuestra IA · ${links.find(l => l.to !== '/' && pathname.startsWith(l.to))?.label || 'Panorama regional'}`; }, [pathname]);
  return <><a className="skip" href="#content" onClick={event=>{event.preventDefault();document.getElementById('content')?.focus();}}>Saltar al contenido</a><header className="site-header"><div className="container header-row"><Link className="brand" to="/" aria-label="Nuestra IA, inicio"><span><strong>Nuestra IA</strong><small>Casuística regional de inteligencia artificial</small></span></Link><a className="institution" href="https://www.recursossociologicos.ar/" target="_blank" rel="noreferrer">Recursos Sociológicos <ArrowUpRight size={15}/></a></div><nav className="container nav" aria-label="Navegación principal">{links.map(({to,label,icon:Icon}) => <NavLink key={to} to={to} end={to==='/'}><Icon size={17}/>{label}</NavLink>)}</nav></header>
    <main id="content" className="container main" tabIndex={-1}><Suspense fallback={<p role="status">Cargando sección…</p>}><Routes><Route path="/" element={<Panorama/>}/><Route path="/comparaciones" element={<Comparisons/>}/><Route path="/casos" element={<Cases/>}/><Route path="/casos/:id" element={<Detail/>}/><Route path="/proyecto" element={<Project/>}/><Route path="*" element={<section className="empty"><h1>Página no encontrada</h1><Link to="/">Volver al panorama</Link></section>}/></Routes></Suspense></main>
    <footer className="container footer"><div><strong>Nuestra IA</strong><p>Licenciatura en Sociología UFLO</p></div><div><Link to="/proyecto#metodologia">Metodología y límites</Link><small>Versión {data.version} · Sincronización: {data.generado_en.replace(' UTC','')}</small></div></footer></>;
}
