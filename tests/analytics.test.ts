import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Bundle, Dimension, validateBundle, cross, filterCases, comparisonCases, frequency, national, unique } from '../src/data';
const bundle:Bundle=JSON.parse(readFileSync('public/data/corpus.json','utf8'));
test('La instantánea contiene todos los IDs únicos y conserva arrays para campos multivalor',()=>{
  validateBundle(bundle); assert.equal(unique(bundle.casos.map(c=>c.id)).length,bundle.casos.length);
  assert.equal(bundle.casos.length,bundle.indicadores.casos);
  for(const c of bundle.casos){assert.ok(Array.isArray(c.urls));assert.ok(Array.isArray(c.territorios));}
});
test('Todos los cruces precalculados por R coinciden con la aplicación, incluidos denominadores',()=>{
  assert.ok(bundle.cruces.length>0);
  for(const r of bundle.cruces){
    const dim=r.cruce.replace('pais_x_','') as Dimension;
    const calculated=cross(bundle.casos,r.grupo,dim);const row=calculated.rows.find(x=>x.name===r.categoria);
    assert.equal(row?.count,r.n_casos,`${r.grupo}/${r.categoria}`);
    assert.equal(calculated.total,r.denominador);assert.equal(calculated.coverage,r.casos_con_dato);
    assert.ok(Math.abs((row?.percent||0)-r.porcentaje)<.00001);
  }
});
test('Selección exacta: no confundir etiquetas ni perder multiterritorios; búsqueda tolera acentos',()=>{
  const example={...bundle.casos[0],ambitos:['educacion','educacion'],herramientas:['Boti'],
    territorios:[{pais:'Argentina',provincia:'Nacional'},{pais:'Colombia',provincia:'Antioquia'}]};
  assert.equal(filterCases([example],{ambito:'educa'}).length,0);
  assert.equal(filterCases([example],{herramienta:'Boti',pais:'Colombia',provincia:'Antioquia'}).length,1);
  assert.equal(filterCases([example],{pais:'Argentina',provincia:'Antioquia'}).length,0);
  assert.equal(frequency([example],'ambitos')[0].count,1);
  assert.equal(national(example,'Colombia'),false);assert.equal(national(example,'Argentina'),true);
  const accented={...example,titulo:'Educación pública',resumen:''};
  assert.equal(filterCases([accented],{q:'educacion publica'}).length,1);
});
test('Casos nacionales no se incorporan a una provincia; un caso repetido en países no duplica el corpus',()=>{
  const record={...bundle.casos[0],territorios:[{pais:'Argentina',provincia:'Nacional'},{pais:'Colombia',provincia:'Nacional'}]};
  assert.equal(filterCases([record],{alcance:'subnacional'}).length,0);
  assert.equal(cross([record],'Argentina · Buenos Aires','ambitos',true).total,0);
  assert.equal(cross([record],'Argentina','ambitos').total,1);
  assert.equal(cross([record],'Colombia','ambitos').total,1);
});
test('El alcance nacional de un país no se transfiere al vínculo provincial con otro país',()=>{
  const mixed={...bundle.casos[0],territorios:[{pais:'Argentina',provincia:'Nacional'},{pais:'Colombia',provincia:'Antioquia'}]};
  assert.equal(comparisonCases([mixed],['Colombia'],{alcance:'nacional'}).length,0);
  assert.equal(comparisonCases([mixed],['Argentina'],{alcance:'subnacional'}).length,0);
  assert.equal(comparisonCases([mixed],['Colombia'],{alcance:'subnacional'}).length,1);
  assert.equal(comparisonCases([mixed],['Argentina','Colombia'],{alcance:'nacional'}).length,1);
});
