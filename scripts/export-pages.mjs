// Exporta artefactos; commit/push se hacen explícitamente, nunca desde este script.
import { existsSync } from 'node:fs';
import { readFile, mkdir, cp, rm, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';

const arg=process.argv.slice(2).find(a=>a.startsWith('--site='));
const site=resolve(arg ? arg.slice(7) : '../sociologia-uflo');
if(!existsSync(join(site,'.git'))) throw new Error('El destino debe ser un checkout Git de sociologia-uflo. Usar --site=ruta');
const remote=spawnSync('git',['remote','get-url','origin'],{cwd:site,encoding:'utf8'});
if(remote.status!==0 || !/github\.com[:/]gastonbecerra\/sociologia-uflo(?:\.git)?\s*$/.test(remote.stdout))
  throw new Error('El remote destino no corresponde a gastonbecerra/sociologia-uflo');
const dist=resolve('dist-pages');
const index=await readFile(join(dist,'index.html'),'utf8');
if(!index.includes('/nuestra-ia/assets/')) throw new Error('Build incompatible. Ejecutar npm run build:pages');
const corpus=JSON.parse(await readFile(join(dist,'data/corpus.json'),'utf8'));
if(!Array.isArray(corpus.casos)||!corpus.casos.length) throw new Error('Corpus inválido');
const target=join(site,'nuestra-ia');
if(existsSync(target)) {
  const marker=JSON.parse(await readFile(join(target,'version.json'),'utf8'));
  if(marker.app!=='nuestra-ia') throw new Error('El destino no está identificado como una exportación de Nuestra IA');
  await rm(target,{recursive:true});
}
await mkdir(target,{recursive:true});
await cp(dist,target,{recursive:true});
const sha=spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8'});
await writeFile(join(target,'version.json'),JSON.stringify({app:'nuestra-ia',source_repository:'https://github.com/gastonbecerra/nuestra-ia',
  source_commit:sha.status===0?sha.stdout.trim():null,data_version:corpus.version,casos:corpus.casos.length,
  exported_at:new Date().toISOString()},null,2)+'\n');
console.log(`Exportación: ${target}\n${corpus.casos.length} casos · versión ${corpus.version}\nRevisar git diff y publicar con commit/push en sociologia-uflo.`);
