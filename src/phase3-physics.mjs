import { C } from './phase2-physics.mjs';
export const TAU = Math.PI*2;
export const radians=degrees=>degrees*Math.PI/180;
export const degrees=radians=>radians*180/Math.PI;
export function waterQuantities(a,f,v) { return {a,f,v,wavelength:v/f,k:TAU*f/v,omega:TAU*f,period:1/f}; }
export function waterContribution(x,z,t,source,q) {
  const r=Math.hypot(x-source.x,z-source.z), retarded=t-r/q.v;
  if(retarded<=source.start) return 0;
  const smooth=u=>{const s=Math.max(0,Math.min(1,u));return s*s*(3-2*s);};
  const envelope=smooth((retarded-source.start)*q.f)*(source.stop===null?1:1-smooth((retarded-source.stop)*q.f));
  if(envelope===0)return 0;
  return q.a/Math.sqrt(1+r/.65)*envelope*Math.sin(q.k*r-q.omega*t);
}
export function waterElevation(x,z,t,sources,q) { return sources.reduce((sum,source)=>sum+waterContribution(x,z,t,source,q),0); }
export const GLASSES = {
  bk7:{label:'N-BK7 · crown',B:[1.03961212,.231792344,1.01046945],C:[.00600069867,.0200179144,103.560653]},
  sf11:{label:'N-SF11 · flint',B:[1.73759695,.313747346,1.89878101],C:[.013188707,.0623068142,155.23629]},
};
export function refractiveIndex(wavelengthNm,material='bk7') {
  const l2=(wavelengthNm/1000)**2,g=GLASSES[material];
  return Math.sqrt(1+g.B.reduce((sum,b,i)=>sum+b*l2/(l2-g.C[i]),0));
}
export function wavelengthColor(nm) {
 let r=0,g=0,b=0;
 if(nm<440){r=(440-nm)/60;b=1;}else if(nm<490){g=(nm-440)/50;b=1;}else if(nm<510){g=1;b=(510-nm)/20;}else if(nm<580){r=(nm-510)/70;g=1;}else if(nm<645){r=1;g=(645-nm)/65;}else r=1;
 const edge=nm<420?.35+.65*(nm-380)/40:nm>700?.35+.65*(750-nm)/50:1;
 return `rgb(${[r,g,b].map(c=>Math.round(255*Math.pow(Math.max(0,c*edge),.8))).join(',')})`;
}
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1];
const cross=(a,b)=>a[0]*b[1]-a[1]*b[0];
const add=(a,b,s=1)=>[a[0]+s*b[0],a[1]+s*b[1]];
const normalize=v=>{const l=Math.hypot(...v);return v.map(x=>x/l);};
export function snell(direction,normal,n1,n2) {
 const d=normalize(direction),n=normalize(normal),cosine=-dot(d,n),ratio=n1/n2;
 const discriminant=1-ratio*ratio*(1-cosine*cosine);
 const reflected=add(d,n,2*cosine);
 if(discriminant < -1e-12)return {direction:null,reflected,tir:true};
 return {direction:normalize(add(d.map(x=>x*ratio),n,ratio*cosine-Math.sqrt(Math.max(0,discriminant)))),reflected,tir:false};
}
export function prismGeometry(apexDegrees) {
 const width=Math.tan(radians(apexDegrees/2));
 return [[0,1],[-width,0],[width,0]];
}
export function raySegmentIntersection(origin,direction,a,b) {
 const edge=[b[0]-a[0],b[1]-a[1]],denom=cross(direction,edge);
 if(Math.abs(denom)<1e-10)return null;
 const offset=[a[0]-origin[0],a[1]-origin[1]],distance=cross(offset,edge)/denom,u=cross(offset,direction)/denom;
 return distance>1e-7&&u>=-1e-9&&u<=1+1e-9?{point:add(origin,direction,distance),distance,u}:null;
}
export function tracePrism(wavelengthNm,incidenceDegrees,apexDegrees,material='bk7') {
 const n=refractiveIndex(wavelengthNm,material),vertices=prismGeometry(apexDegrees);
 const entry=[vertices[1][0]*.42,.58],angle=radians(incidenceDegrees-apexDegrees/2);
 const incident=[Math.cos(angle),Math.sin(angle)],normal=normalize([-1,-vertices[1][0]]);
 const first=snell(incident,normal,1,n);
 const points=[add(entry,incident,-2.1),entry];
 let position=entry,dir=first.direction,face=0,reflections=0,exitDirection=null,exitFace=-1,lastIncidence=0;
 const events=[];
 for(let bounce=0;bounce<12&&dir;bounce++) {
   let next=null;
   for(let i=0;i<3;i++)if(i!==face){const hit=raySegmentIntersection(position,dir,vertices[i],vertices[(i+1)%3]);if(hit&&(!next||hit.distance<next.distance))next={...hit,face:i};}
   if(!next)break;
   points.push(next.point);
   const a=vertices[next.face],b=vertices[(next.face+1)%3],outward=normalize([b[1]-a[1],a[0]-b[0]]),inward=outward.map(v=>-v);
   const refracted=snell(dir,inward,n,1);
   lastIncidence=degrees(Math.acos(Math.max(-1,Math.min(1,-dot(dir,inward)))));
   events.push({point:next.point,face:next.face,incidence:lastIncidence,tir:refracted.tir,normal:outward});
   if(!refracted.tir){exitDirection=refracted.direction;exitFace=next.face;break;}
   reflections++;dir=refracted.reflected;position=next.point;face=next.face;
 }
 const exit=points[points.length-1];
 const deviation=exitDirection?degrees(Math.acos(Math.max(-1,Math.min(1,dot(incident,exitDirection))))):null;
 return {n,vertices,points,incident,entry,exit,exitDirection,exitFace,reflections,events,deviation,
   refraction:degrees(Math.asin(Math.sin(radians(incidenceDegrees))/n)),frequency:C/(wavelengthNm*1e-9),insideWavelength:wavelengthNm/n,lastIncidence};
}
export function screenIntersection(ray,center,normal) {
 if(!ray.exitDirection)return null;
 const denom=dot(ray.exitDirection,normal);
 if(denom<=1e-10)return null;
 const distance=dot([center[0]-ray.exit[0],center[1]-ray.exit[1]],normal)/denom;
 return distance>0?add(ray.exit,ray.exitDirection,distance):null;
}
export function strobeQuantities(rpm,fs,blades) {
 const frequency=rpm/60,omega=TAU*frequency,period=TAU/blades;
 const branch=Math.floor(blades*frequency/fs+.5),apparent=frequency-branch*fs/blades;
 const tie=Math.abs(Math.abs(blades*frequency/fs-branch)-.5)<1e-10;
 return {rpm,fs,blades,frequency,omega,period,branch,apparent,apparentRpm:apparent*60,tie};
}
export function rotorSample(t,q) {
 const sample=Math.floor(t*q.fs+1e-9),sampleTime=sample/q.fs;
 return {sample,sampleTime,trueAngle:q.omega*t,sampledAngle:q.omega*sampleTime};
}
export function symmetricAngle(theta,blades) {
 const period=TAU/blades;
 return ((theta+period/2)%period+period)%period-period/2;
}
