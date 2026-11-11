import fs from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import {VIDEO_FILES,videoPath} from '../src/video-files.mjs';
const {chromium}=await import(process.argv[2]?pathToFileURL(process.argv[2]).href:'playwright');
const base='http://127.0.0.1:5177/laboratorio-virtual-de-ondas/';
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','5177','--strictPort'],{windowsHide:true,stdio:['ignore','pipe','pipe']});
let browser;
const report={engine:'Microsoft Edge / Chromium, Windows',basePath:'/laboratorio-virtual-de-ondas/',videos:[],reducedMotion:[],touch:[],errors:[],httpErrors:[],keyboard:false,lazyLoading:false};
try{
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Servidor sin respuesta')),20000);server.stdout.on('data',data=>{if(String(data).includes('Local:')){clearTimeout(timer);resolve();}});server.once('exit',code=>{clearTimeout(timer);reject(Error('Servidor terminó '+code));});});
 browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
 page.on('pageerror',e=>report.errors.push(e.message));
 page.on('response',response=>{if(response.status()>=400&&response.url().startsWith(base))report.httpErrors.push({url:response.url(),status:response.status()});});
 const requests=[];page.on('request',request=>requests.push(request.url()));
 await page.goto(base);await page.getByRole('heading',{name:/Laboratorio virtual/}).waitFor();
 assert.equal(requests.filter(url=>url.includes('.mp4')).length,0);
 assert.equal(requests.filter(url=>/Phase(Two|Three)Lab/.test(url)).length,0);
 report.lazyLoading=true;
 await fs.mkdir('verification/final',{recursive:true});
 for(const [id,file] of Object.entries(VIDEO_FILES)){
  await page.goto(base+'#'+id);
  await page.getByRole('button',{name:'Pausar',exact:true}).click();
  assert.ok(!(await page.locator('body').innerText()).match(/fase [1-4]|etapa [1-4]|video pendiente|sin archivo asignado/i));
  const video=page.locator('.video-player video'),section=page.locator('.video-section');
  assert.equal(await video.evaluate(v=>v.autoplay),false);
  assert.equal(await video.evaluate(v=>v.paused),true);
  await section.scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>{const v=document.querySelector('.video-player video');return v&&v.readyState>=1&&v.duration===20;},{},{timeout:30000});
  assert.equal(await video.evaluate(v=>v.currentSrc),new URL(videoPath('/laboratorio-virtual-de-ondas/',file),base).href);
  await page.getByRole('button',{name:'Reproducir video',exact:true}).click();
  await page.waitForFunction(()=>{const v=document.querySelector('video');return !v.paused&&v.currentTime>.05;},{},{timeout:15000});
  await page.getByRole('button',{name:'Pausar video',exact:true}).click();
  const stopped=await video.evaluate(v=>v.currentTime);await page.waitForTimeout(120);assert.equal(await video.evaluate(v=>v.currentTime),stopped);
  await video.evaluate(v=>new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Seek bloqueado')),12000);v.addEventListener('seeked',()=>{clearTimeout(timer);resolve();},{once:true});v.currentTime=10;}));
  assert.ok(Math.abs(await video.evaluate(v=>v.currentTime)-10)<.05);
  await page.getByLabel('Volumen del video',{exact:true}).fill('35');assert.ok(Math.abs(await video.evaluate(v=>v.volume)-.35)<.001);
  await page.getByRole('button',{name:'Pantalla completa',exact:true}).click();
  await page.waitForFunction(()=>document.fullscreenElement?.tagName==='VIDEO');await page.evaluate(()=>document.exitFullscreen());
  await page.getByRole('button',{name:'Reiniciar video',exact:true}).click();assert.ok(await video.evaluate(v=>v.paused&&v.currentTime<.05));
  assert.equal(await page.locator('.video-explanation article').count(),4);
  assert.equal(await section.getByRole('alert').count(),0);
  const details=await video.evaluate(v=>({duration:v.duration,width:v.videoWidth,height:v.videoHeight,src:v.currentSrc,paused:v.paused,controls:v.controls,playsInline:v.playsInline}));
  await video.evaluate(v=>new Promise(resolve=>{v.addEventListener('seeked',resolve,{once:true});v.currentTime=13.2;}));
  await section.screenshot({path:'verification/final/video-'+id+'.png'});
  await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await section.screenshot({path:'verification/final/video-'+id+'-movil.png'});await page.setViewportSize({width:1440,height:1000});
  report.videos.push({id,...details,playPause:true,seek:true,volume:true,fullscreen:true,restart:true});
  console.log('Video verificado:',id);
 }
 await page.goto(base+'#transverse');await page.getByRole('button',{name:'Pausar',exact:true}).click();
 const slider=page.getByRole('slider',{name:'Frecuencia',exact:true});const before=await slider.inputValue();await slider.focus();await slider.press('ArrowRight');assert.notEqual(await slider.inputValue(),before);report.keyboard=true;
 const reduced=await browser.newContext({reducedMotion:'reduce'}),reducedPage=await reduced.newPage();
 for(const id of Object.keys(VIDEO_FILES)){
  await reducedPage.goto(base+'#'+id);await reducedPage.getByRole('button',{name:'Iniciar',exact:true}).waitFor();assert.equal(await reducedPage.getByRole('button',{name:'Pausar',exact:true}).count(),0);report.reducedMotion.push(id);
 }
 await reduced.close();
 const touch=await browser.newContext({isMobile:true,hasTouch:true,viewport:{width:390,height:844},reducedMotion:'reduce'}),touchPage=await touch.newPage();
 for(const id of Object.keys(VIDEO_FILES)){
  await touchPage.goto(base+'#'+id);await touchPage.getByRole('button',{name:'Iniciar',exact:true}).waitFor();assert.ok(await touchPage.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await touchPage.getByRole('button',{name:'Iniciar',exact:true}).tap();await touchPage.getByRole('button',{name:'Pausar',exact:true}).waitFor();await touchPage.getByRole('button',{name:'Pausar',exact:true}).tap();report.touch.push(id);
 }
 await touch.close();assert.deepEqual(report.errors,[]);assert.deepEqual(report.httpErrors,[]);
 await fs.writeFile('verification/final/browser-audit.json',JSON.stringify(report,null,2));console.log('Auditoría final correcta: videos, prefijo Pages, carga diferida, teclado, movimiento reducido y controles táctiles.');
}finally{await browser?.close();server.kill();}
