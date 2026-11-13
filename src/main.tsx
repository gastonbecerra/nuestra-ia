import React, { createContext, useContext, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { assetUrl, hashRouting } from './navigation';
import { Bundle, validateBundle } from './data';
import App from './App';
import './styles.css';
const DataContext = createContext<Bundle | null>(null);
export const useData = () => { const data = useContext(DataContext); if (!data) throw new Error('Sin datos'); return data; };
function Root() {
  const [data, setData] = useState<Bundle>(); const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    fetch(assetUrl('data/corpus.json'), { signal: controller.signal }).then(r => { if (!r.ok) throw new Error('No se encontró la versión local del corpus'); return r.json(); })
      .then(raw => { validateBundle(raw); setData(raw); }).catch(e => { if (e.name !== 'AbortError') setError(e.message); });
    return () => controller.abort();
  }, []);
  if (error) return <main className="container error-page"><h1>No se pudo cargar la casuística</h1><p role="alert">{error}</p><p>Ejecutá <code>npm run data:update</code> o <code>npm run data:local</code> y volvé a cargar.</p><button onClick={() => location.reload()}>Reintentar</button></main>;
  if (!data) return <main className="container loading" role="status">Cargando Nuestra IA…</main>;
  const Router = hashRouting ? HashRouter : BrowserRouter;
  return <DataContext value={data}><Router><App /></Router></DataContext>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><Root /></React.StrictMode>);
