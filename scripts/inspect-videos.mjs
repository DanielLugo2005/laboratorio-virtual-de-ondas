import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';
const {chromium}=await import(process.argv[2]?pathToFileURL(process.argv[2]).href:'playwright');
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','5176','--strictPort'],{windowsHide:true,stdio:['ignore','pipe','pipe']});
let browser;
try{
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Servidor sin respuesta')),20000);server.stdout.on('data',data=>{if(String(data).includes('Local:')){clearTimeout(timer);resolve();}});server.once('exit',code=>{clearTimeout(timer);reject(Error('Servidor terminó '+code));});});
 browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage({viewport:{width:1200,height:900}});
 await page.goto('http://127.0.0.1:5176/laboratorio-virtual-de-ondas/');
 await fs.mkdir('verification/video-review',{recursive:true});
 await fs.mkdir('public/posters',{recursive:true});
 const names=(await fs.readdir('public/videos')).filter(n=>n.toLowerCase().endsWith('.mp4')).sort();
 const report=[];
 for(const name of names){
  const item=await page.evaluate(async({name})=>{
   document.body.innerHTML='';const video=document.createElement('video');video.preload='auto';video.muted=true;video.src=new URL('videos/'+encodeURIComponent(name),location.href).href;document.body.append(video);
   await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('No carga '+name)),25000);video.onloadeddata=()=>{clearTimeout(timer);resolve();};video.onerror=()=>{clearTimeout(timer);reject(Error('Error multimedia '+video.error?.code+' '+name));};});
   const duration=video.duration,width=video.videoWidth,height=video.videoHeight;let poster='';
   const canvas=document.createElement('canvas');canvas.width=960;canvas.height=600;const ctx=canvas.getContext('2d');ctx.fillStyle='#0b1622';ctx.fillRect(0,0,960,600);ctx.fillStyle='#dce8ef';ctx.font='16px sans-serif';ctx.fillText(name,12,24);
   for(const [i,fraction] of [.06,.35,.66,.92].entries()){
    video.currentTime=duration*fraction;await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Seek bloqueado')),12000);video.onseeked=()=>{clearTimeout(timer);resolve();};});
    const x=i%2*480,y=38+Math.floor(i/2)*280,scale=Math.min(478/width,250/height);ctx.drawImage(video,x+(478-width*scale)/2,y,width*scale,height*scale);ctx.fillStyle='#c8dce7';ctx.fillText((duration*fraction).toFixed(2)+' s',x+12,y+271);if(i===2){const thumb=document.createElement('canvas');thumb.width=640;thumb.height=360;thumb.getContext('2d').drawImage(video,0,0,640,360);poster=thumb.toDataURL('image/jpeg',.82);}
   }
   const before=video.currentTime;await video.play();await new Promise(resolve=>setTimeout(resolve,350));video.pause();const playback=video.currentTime>before;
   return {name,poster,duration,width,height,playback,canPlayH264:video.canPlayType('video/mp4; codecs="avc1.42E01E"'),frames:canvas.toDataURL('image/png')};
  },{name});
  const {frames,poster,...details}=item;
  const bytes=await fs.readFile(path.join('public/videos',name));
  details.bytes=bytes.length;
  const codecs=[];
  const walk=(start,end)=>{for(let p=start;p+8<=end;){let size=bytes.readUInt32BE(p);const type=bytes.toString('ascii',p+4,p+8);if(size===1)size=Number(bytes.readBigUInt64BE(p+8));if(size===0)size=end-p;if(size<8||p+size>end)break;if(type==='stsd'){const entryCount=bytes.readUInt32BE(p+12);let e=p+16;for(let i=0;i<entryCount&&e+8<=p+size;i++){codecs.push(bytes.toString('ascii',e+4,e+8));const entrySize=bytes.readUInt32BE(e);if(entrySize<8)break;e+=entrySize;}}if(['moov','trak','mdia','minf','stbl'].includes(type))walk(p+8,p+size);p+=size;}};walk(0,bytes.length);details.codecs=codecs;
  await fs.writeFile('verification/video-review/'+name.replace('.mp4','.png'),Buffer.from(frames.split(',')[1],'base64'));
  await fs.writeFile('public/posters/'+name.replace('.mp4','.jpg'),Buffer.from(poster.split(',')[1],'base64'));
  report.push(details);console.log(JSON.stringify(details));
 }
 await fs.writeFile('verification/video-review/metadata.json',JSON.stringify({checkedAt:new Date().toISOString(),videos:report},null,2));
}finally{await browser?.close();server.kill();}
