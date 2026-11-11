import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { VIDEO_FILES } from '../src/video-files.mjs';
const root=fileURLToPath(new URL('..',import.meta.url));
const sourceFolder=path.join(root,'public','videos');
const filenames=await fs.readdir(sourceFolder);
const report=[];
for(const [id,file] of Object.entries(VIDEO_FILES)){
 assert.ok(filenames.includes(file),'Falta o no coincide exactamente: '+file);
 const bytes=await fs.readFile(path.join(sourceFolder,file));
 assert.ok(bytes.length>0&&bytes.length<100*1024*1024,'Tamaño no compatible: '+file);
 assert.equal(bytes.toString('ascii',4,8),'ftyp','Contenedor no MP4: '+file);
 assert.ok(bytes.includes(Buffer.from('avc1')),'No se detectó H.264: '+file);
 const poster=await fs.readFile(path.join(root,'public','posters',file.replace(/\.mp4$/i,'.jpg')));
 assert.ok(poster[0]===255&&poster[1]===216,'Miniatura no JPEG: '+id);
 const hash=createHash('sha256').update(bytes).digest('hex');
 if(process.argv.includes('--dist')){
  const deployed=await fs.readFile(path.join(root,'dist','videos',file));
  assert.equal(createHash('sha256').update(deployed).digest('hex'),hash,'El archivo compilado difiere: '+file);
 }
 report.push({id,file,bytes:bytes.length,sha256:hash});
}
const total=report.reduce((sum,r)=>sum+r.bytes,0);
console.log(JSON.stringify({videos:report.length,totalBytes:total,totalMiB:+(total/1024**2).toFixed(2),largestBytes:Math.max(...report.map(r=>r.bytes)),distChecked:process.argv.includes('--dist')},null,2));
if(process.argv.includes('--report')){await fs.mkdir('verification',{recursive:true});await fs.writeFile('verification/media-inventory.json',JSON.stringify(report,null,2));}
