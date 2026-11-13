import { mkdir, writeFile } from 'node:fs/promises';
const url = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';
const response = await fetch(url);
if (!response.ok) throw new Error(`Cartografía: ${response.status}`);
const text = await response.text(); const data = JSON.parse(text);
if (data.type !== 'Topology' || !data.objects.countries) throw new Error('Topología inválida');
await mkdir('public/data', {recursive:true});
await writeFile('public/data/world.json', text);
console.log('Cartografía world-atlas (Natural Earth, dominio público) descargada para uso local.');
