import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AIR, C, soundQuantities, acousticState, seismicQuantities, seismicSignal, electromagneticQuantities, electromagneticFields, project3D } from '../src/phase2-physics.mjs';
const near=(a,b,tolerance=1e-10)=>assert.ok(Math.abs(a-b)<=tolerance*Math.max(1,Math.abs(b)),`${a} ≠ ${b}`);
test('Sonido: λ, T y ejemplo numérico',()=>{
 const q=soundQuantities(10,250); near(q.wavelength,1.3728);near(q.period,.004);
 near(q.pressureAmplitude,1.204*343.2*2*Math.PI*250*1e-5);
});
test('Presión acústica es el negativo del gradiente, no del desplazamiento',()=>{
 const q=soundQuantities(20,500),x=.34,t=.0007,h=1e-6;
 const gradient=(acousticState(x+h,t,q).displacement-acousticState(x-h,t,q).displacement)/(2*h);
 near(acousticState(x,t,q).pressure,-q.rho*q.v*q.v*gradient,1e-8);
 assert.ok(acousticState(0,0,q).pressure<0);near(acousticState(0,0,q).displacement,0);
});
test('Sonido: duplicar amplitud cuadruplica I y duplica Δp₀',()=>{
 const a=soundQuantities(10,250),b=soundQuantities(20,250);near(b.intensity/a.intensity,4);near(b.pressureAmplitude/a.pressureAmplitude,2);near(b.wavelength,a.wavelength);
});
test('Sonido: medios y límites mantienen aproximación lineal y λf=v',()=>{
 for(const medium of Object.keys(AIR)) for(const f of [100,250,1000]) {const q=soundQuantities(40,f,medium);near(q.wavelength*f,q.v);assert.ok(q.k*q.a<.001);}
});
test('Sismos: trayectoria hipocentral incluye la profundidad',()=>{
 const q=seismicQuantities(120,6,3.5);near(q.horizontal**2+q.depth**2,120**2);near(q.tp,20);near(q.ts,120/3.5);near(q.delta,q.ts-q.tp);assert.ok(q.ts>q.tp);
});
test('Sismos: las llegadas escalan con d y la señal no precede a la llegada',()=>{
 const a=seismicQuantities(100,6,3.5),b=seismicQuantities(200,6,3.5);near(b.delta,2*a.delta);near(b.tp,2*a.tp);assert.equal(seismicSignal(a.tp-.1,a.tp),0);assert.equal(seismicSignal(a.tp,a.tp),0);assert.notEqual(seismicSignal(a.tp+.25,a.tp),0);
 for(const vp of [5,8]) for(const vs of [2,4]) {assert.ok(seismicQuantities(20,vp,vs).delta>0);assert.ok(vp*vp>4/3*vs*vs);}
 assert.throws(()=>seismicQuantities(5,6,3.5),RangeError);
});
test('EM: c fijo, conversión THz, nm y relación E₀=cB₀',()=>{
 const a=electromagneticQuantities(500,3),b=electromagneticQuantities(1000,6);near(a.wavelength*1e9,599.584916);near(a.period*1e15,2);near(a.e0,C*a.b0);near(b.wavelength,a.wavelength/2,1e-14);near(b.b0,2*a.b0,1e-14);near(b.intensity,4*a.intensity);
});
test('EM: perpendicularidad, fase y vector de energía +x',()=>{
 const q=electromagneticQuantities(500,3);
 for(const x of [0,1e-7,3e-7,1e-6])for(const t of [0,3e-16,1e-15]){
 const {e,b}=electromagneticFields(x,t,q);near(e.reduce((sum,v,i)=>sum+v*b[i],0),0);assert.equal(e[0],0);assert.equal(b[0],0);near(e[1],C*b[2]);assert.ok(e[1]*b[2]>=0);
 }
});
test('Cámara: cambia la proyección 3D sin modificar campos físicos',()=>{
 const a=project3D(1,0,1,20),b=project3D(1,0,1,50);assert.notDeepEqual(a,b);assert.ok([...a,...b].every(Number.isFinite));
});
