import { test } from 'node:test';
import assert from 'node:assert/strict';
import { waterQuantities, waterContribution, waterElevation, refractiveIndex, snell, tracePrism, prismGeometry, raySegmentIntersection, strobeQuantities, rotorSample, symmetricAngle, TAU, radians } from '../src/phase3-physics.mjs';
const near=(a,b,eps=1e-9)=>assert.ok(Math.abs(a-b)<=eps,`${a} ≠ ${b}`);
const source={x:0,z:0,start:2,stop:null};
test('Agua: frente causal y amplitud finita en la fuente',()=>{
 const q=waterQuantities(.1,1,2);near(q.wavelength,2);near(q.wavelength*q.f,q.v);
 assert.equal(waterContribution(3,0,3.49,source,q),0);assert.equal(waterContribution(3,0,3.5,source,q),0);
 assert.ok(Math.abs(waterContribution(3,0,3.75,source,q))>0);
 assert.ok(Number.isFinite(waterContribution(0,0,2.25,source,q)));
 near(waterContribution(1,0,4.25,source,q),waterContribution(0,1,4.25,source,q));
});
test('Agua: dos fuentes coherentes se suman y no actúan antes de su activación',()=>{
 const q=waterQuantities(.1,1,2),a={x:-1,z:0,start:0,stop:null},b={x:1,z:0,start:4,stop:null};
 near(waterElevation(0,1,4.5,[a,b],q),waterContribution(0,1,4.5,a,q));
 near(waterElevation(0,1,7.25,[a,b],q),2*waterContribution(0,1,7.25,a,q));
});
test('Agua: apagar fuente no elimina instantáneamente su tren lejano',()=>{
 const q=waterQuantities(.1,1,2),off={...source,start:0,stop:4};
 near(waterContribution(4,0,4.25,off,q),waterContribution(4,0,4.25,{...off,stop:null},q));
 assert.equal(waterContribution(4,0,7.1,off,q),0);
});
test('Sellmeier coincide con líneas d de los datos de SCHOTT',()=>{
 near(refractiveIndex(587.6,'bk7'),1.5168,1e-5);near(refractiveIndex(587.6,'sf11'),1.78472,1e-5);
 assert.ok(refractiveIndex(400,'bk7')>refractiveIndex(700,'bk7'));
 assert.ok(refractiveIndex(400,'sf11')-refractiveIndex(700,'sf11')>refractiveIndex(400,'bk7')-refractiveIndex(700,'bk7'));
});
test('Snell vectorial conserva n·sen θ y detecta reflexión interna total',()=>{
 const i=radians(35),r=snell([Math.sin(i),-Math.cos(i)],[0,1],1,1.5);
 assert.equal(r.tir,false);near(1.5*r.direction[0],Math.sin(i));
 const tir=snell([Math.sin(radians(50)),-Math.cos(radians(50))],[0,1],1.5,1);
 assert.equal(tir.tir,true);assert.equal(tir.direction,null);near(tir.reflected[1],Math.cos(radians(50)));
});
test('Prisma: entrada, salida, desviación y conservación de frecuencia',()=>{
 const q=tracePrism(550,55,60,'bk7');assert.ok(q.exitDirection);assert.equal(q.reflections,0);
 near(Math.sin(radians(q.refraction))*q.n,Math.sin(radians(55)));
 const exitAngle=Math.asin(q.n*Math.sin(radians(60-q.refraction)));
 near(q.deviation,55+exitAngle*180/Math.PI-60);
 near(q.frequency*q.insideWavelength*1e-9,299792458/q.n,1e-6);
 assert.ok(tracePrism(400,55,60,'bk7').deviation>tracePrism(700,55,60,'bk7').deviation);
});
test('Prisma: RIT continúa la trayectoria hasta otra cara',()=>{
 const q=tracePrism(550,10,60,'bk7');assert.ok(q.reflections>0);assert.ok(q.exitDirection);assert.equal(q.events[0].tir,true);assert.equal(q.exitFace,1);
});
test('Prisma: geometrías del intervalo de controles salen sin NaN',()=>{
 for(const material of ['bk7','sf11'])for(const nm of [380,550,750])for(const apex of [35,45,60,75])for(const i of [0,10,55,75]){
  const q=tracePrism(nm,i,apex,material);assert.ok(q.exitDirection,`${material}, ${nm}, ${apex}, ${i}`);assert.ok(q.points.flat().every(Number.isFinite));
  for(let j=1;j<q.points.length-1;j++){
   const p=q.points[j],next=q.points[j+1],mid=[(p[0]+next[0])/2,(p[1]+next[1])/2];
   const vertices=prismGeometry(apex);
   for(let k=0;k<3;k++){const a=vertices[k],b=vertices[(k+1)%3];assert.ok((b[0]-a[0])*(mid[1]-a[1])-(b[1]-a[1])*(mid[0]-a[0])>=-1e-8);}
  }
 }
});
test('Intersecciones rayo-segmento descartan caras detrás de la fuente',()=>{
 assert.equal(raySegmentIntersection([0,0],[1,0],[-1,-1],[-1,1]),null);
 near(raySegmentIntersection([0,0],[1,0],[2,-1],[2,1]).distance,2);
});
test('Estroboscopio: casos de reposo, avance y retroceso con N=6',()=>{
 const q=strobeQuantities(600,60,6);near(q.frequency,10);near(q.omega,20*Math.PI);near(q.apparentRpm,0);
 near(strobeQuantities(600,59,6).apparentRpm,10);near(strobeQuantities(600,61,6).apparentRpm,-10);
 near(strobeQuantities(600,40,4).apparentRpm,0);
});
test('Muestreo exacto, retención y rama equivalente módulo 2π/N',()=>{
 for(const blades of [2,4,6,12])for(const fs of [2,59,60,61,150]){
 const q=strobeQuantities(600,fs,blades);
 for(const n of [0,1,3,20]){
 const s=rotorSample((n+.1)/fs,q);assert.equal(s.sample,n);near(s.sampleTime,n/fs);near(s.sampledAngle,q.omega*n/fs);
 near(symmetricAngle(s.sampledAngle-TAU*q.apparent*n/fs,blades),0,1e-8);
 assert.ok(q.apparent>=-fs/(2*blades)-1e-10&&q.apparent<fs/(2*blades)+1e-10);
 }
 }
});
test('Nyquist de simetría tiene dos interpretaciones y convención negativa',()=>{
 const q=strobeQuantities(600,120,6);assert.equal(q.tie,true);near(q.apparent,-10);
});
