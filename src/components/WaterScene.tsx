import { useEffect, useMemo, useRef, useState } from 'react';
import { waterElevation, waterQuantities } from '../phase3-physics.mjs';
export type WaterSource={x:number;z:number;start:number;stop:number|null};
export function WaterScene({q,time,sources,angle,grid,observation,onObserve}:{q:ReturnType<typeof waterQuantities>;time:number;sources:WaterSource[];angle:number;grid:boolean;observation:{x:number;z:number};onObserve:(x:number,z:number)=>void}) {
 const canvas=useRef<HTMLCanvasElement>(null),[width,setWidth]=useState(900);
 useEffect(()=>{if(!canvas.current)return;const observer=new ResizeObserver(entries=>setWidth(Math.round(entries[0].contentRect.width)));observer.observe(canvas.current);return()=>observer.disconnect();},[]);
 const mesh=useMemo(()=>{
   const n=width<600?64:80,yaw=angle*Math.PI/180,cos=Math.cos(yaw),sin=Math.sin(yaw);
   const vertices=Array.from({length:(n+1)*(n+1)},(_,i)=>({x:-4+i%(n+1)*8/n,z:-4+Math.floor(i/(n+1))*8/n}));
   const cells=Array.from({length:n*n},(_,i)=>{const a=Math.floor(i/n)*(n+1)+i%n;return [a,a+1,a+n+2,a+n+1];}).sort((a,b)=>vertices[a[0]].x*sin+vertices[a[0]].z*cos-vertices[b[0]].x*sin-vertices[b[0]].z*cos);
   return {n,vertices,cells,cos,sin};
 },[width,angle]);
 useEffect(()=>{
   const element=canvas.current;if(!element)return;const ctx=element.getContext('2d');if(!ctx)return;
   const w=Math.max(width,300),h=w*.57,dpr=Math.min(devicePixelRatio||1,2);
   if(element.width!==Math.round(w*dpr)||element.height!==Math.round(h*dpr)){element.width=Math.round(w*dpr);element.height=Math.round(h*dpr);}
   ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
   const scale=w/12.6,cx=w*.5,cy=h*.48;
   const project=(x:number,z:number,y:number)=>[cx+scale*(x*mesh.cos-z*mesh.sin),cy+scale*((x*mesh.sin+z*mesh.cos)*.45-y*3)];
   const polygon=(points:number[][],fill:string,stroke?:string)=>{ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=.5;ctx.stroke();}};
   const corners=[[-4,-4],[4,-4],[4,4],[-4,4]];
   polygon(corners.map(([x,z])=>project(x,z,-.36)),'#0a2338','#326276');
   for(const edge of [[1,2],[2,3]])polygon([project(...corners[edge[0]] as [number,number],0),project(...corners[edge[1]] as [number,number],0),project(...corners[edge[1]] as [number,number],-.36),project(...corners[edge[0]] as [number,number],-.36)],'#0e3046','#2b6273');
   const heights=mesh.vertices.map(p=>waterElevation(p.x,p.z,time,sources,q));
   const projected=mesh.vertices.map((p,i)=>project(p.x,p.z,heights[i]));
   for(const cell of mesh.cells){
     const mean=cell.reduce((sum,i)=>sum+heights[i],0)/4;
     const slopeX=(heights[cell[1]]-heights[cell[0]])/(8/mesh.n),slopeZ=(heights[cell[3]]-heights[cell[0]])/(8/mesh.n);
     const light=Math.max(0,Math.min(1,(.7-slopeX*.7-slopeZ*.5)/Math.sqrt(1+slopeX*slopeX+slopeZ*slopeZ)));
     const crest=Math.max(-1,Math.min(1,mean/Math.max(.06,q.a)));
     polygon(cell.map(i=>projected[i]),`rgb(${Math.round(18+light*28+Math.max(0,crest)*18)},${Math.round(67+light*72+crest*30)},${Math.round(94+light*75+crest*20)})`);
   }
   if(grid){ctx.strokeStyle='#b2e9eb44';ctx.lineWidth=.6;for(let row=0;row<=mesh.n;row+=4){ctx.beginPath();for(let col=0;col<=mesh.n;col++){const p=projected[row*(mesh.n+1)+col];col?ctx.lineTo(...p as [number,number]):ctx.moveTo(...p as [number,number]);}ctx.stroke();ctx.beginPath();for(let col=0;col<=mesh.n;col++){const p=projected[col*(mesh.n+1)+row];col?ctx.lineTo(...p as [number,number]):ctx.moveTo(...p as [number,number]);}ctx.stroke();}}
   const marker=(x:number,z:number,label:string,color:string)=>{const y=waterElevation(x,z,time,sources,q),p=project(x,z,y);ctx.beginPath();ctx.arc(p[0],p[1],4,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();ctx.strokeStyle=color;ctx.beginPath();ctx.moveTo(p[0],p[1]-7);ctx.lineTo(p[0],p[1]-25);ctx.stroke();ctx.font=`600 ${Math.max(10,w/80)}px Segoe UI`;ctx.fillStyle=color;ctx.fillText(label,p[0]+6,p[1]-27);};
   sources.filter(s=>s.stop===null).forEach((s,i)=>{
     marker(s.x,s.z,`F${i+1}`,'#d6f7fc');
     const r=q.v*(time-s.start);if(r<=0||r>12)return;ctx.beginPath();let pen=false;
     for(let k=0;k<=160;k++){const x=s.x+r*Math.cos(k/160*Math.PI*2),z=s.z+r*Math.sin(k/160*Math.PI*2);if(Math.abs(x)>4||Math.abs(z)>4){pen=false;continue;}const point=project(x,z,0);pen?ctx.lineTo(...point as [number,number]):ctx.moveTo(...point as [number,number]);pen=true;}
     ctx.strokeStyle='#b4f6ec88';ctx.lineWidth=1.2;ctx.setLineDash([4,5]);ctx.stroke();ctx.setLineDash([]);
   });
   marker(observation.x,observation.z,'O','#ffb36c');
   const active=sources.filter(s=>s.stop===null);
   if(active.length===2){
     const z=2.4,a=active[0],b=active[1];
     if(time>Math.max(a.start+Math.hypot(a.x,z)/q.v,b.start+Math.hypot(b.x,z)/q.v))marker(0,z,'C+','#e8df9b');
     let best={x:0,cos:1};for(let x=.2;x<3.4;x+=.05){const phase=q.k*(Math.hypot(x-a.x,z)-Math.hypot(x-b.x,z));const cosine=Math.cos(phase);if(cosine<best.cos)best={x,cos:cosine};}
     if(best.cos<-.9&&active.every(s=>time>s.start+Math.hypot(best.x-s.x,z)/q.v))marker(best.x,z,'D−','#d9b6ff');
   }
   ctx.font=`${Math.max(10,w/85)}px Segoe UI`;ctx.fillStyle='#a5ccd5';ctx.fillText('Superficie: 8 × 8 m · altura ampliada ×3',18,25);ctx.fillText('Frentes radiales →',w-145,25);
 },[width,mesh,q,time,sources,grid,observation]);
 return <canvas ref={canvas} className="water-canvas" style={{aspectRatio:'1 / .57'}} role="img" aria-label="Malla tridimensional de agua con ondas radiales causales y punto de observación" onClick={event=>{const rect=event.currentTarget.getBoundingClientRect(),w=rect.width,h=w*.57,scale=w/12.6,u=(event.clientX-rect.left-w*.5)/scale,v=(event.clientY-rect.top-h*.48)/(scale*.45);onObserve(Math.max(-3.8,Math.min(3.8,u*mesh.cos+v*mesh.sin)),Math.max(-3.8,Math.min(3.8,-u*mesh.sin+v*mesh.cos)));}}/>;
}
