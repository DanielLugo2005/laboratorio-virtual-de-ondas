import { test } from 'node:test';
import assert from 'node:assert/strict';
import { quantities, displacement, LENGTH, csv } from '../src/physics.mjs';
const p = { a: .3, f: 1, v: 4, n: 3, pulse: false };
test('Las magnitudes cumplen v = λf y T = 1/f', () => {
  for (const f of [.2, 1, 2]) for (const v of [2, 4, 8]) {
    const q = quantities({ ...p, f, v }, 'transverse');
    assert.ok(Math.abs(q.wavelength * q.f - v) < 1e-12);
    assert.equal(q.period * q.f, 1);
  }
});
test('Los modos tienen extremos fijos y n + 1 nodos', () => {
  for (let n = 1; n <= 6; n++) for (let i = 0; i <= n; i++) {
    assert.ok(Math.abs(displacement(i * LENGTH / n, .37, { ...p, n }, 'standing')) < 1e-12);
  }
});
test('La superposición de ondas opuestas da la onda estacionaria', () => {
  const q = quantities(p, 'standing'), x = 2.3, t = .2;
  const sum = p.a * Math.sin(q.k*x-q.omega*t) + p.a * Math.sin(q.k*x+q.omega*t);
  assert.ok(Math.abs(sum - displacement(x,t,p,'standing')) < 1e-12);
});
test('El pulso se traslada con v y no depende de frecuencia', () => {
  assert.equal(displacement(2, 1, { ...p, pulse:true }, 'transverse'), p.a);
});
test('CSV conserva saltos de línea y comillas', () => {
  assert.equal(csv([['a"b', 'línea\nnueva']]), '\uFEFF"a""b","línea\nnueva"');
});

test('Longitudinal: los límites conservan el orden de las partículas del medio',()=>{
 const extreme={...p,a:.3,f:1,v:2};
 const q=quantities(extreme,'longitudinal');assert.ok(extreme.a*q.k<1);
 for(let step=0;step<=40;step++){
  const t=step/20;let previous=-Infinity;
  for(let i=0;i<=72;i++){const x=i/72*LENGTH,position=x+displacement(x,t,extreme,'longitudinal');assert.ok(position>previous);previous=position;}
 }
});
