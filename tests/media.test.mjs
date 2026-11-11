import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {VIDEO_FILES,videoPath,posterPath} from '../src/video-files.mjs';
test('Los nueve módulos se corresponden con nueve MP4 reales distintos',async()=>{
 const files=Object.values(VIDEO_FILES);assert.equal(files.length,9);assert.equal(new Set(files).size,9);
 const actual=await readdir(new URL('../public/videos/',import.meta.url));
 for(const file of files){assert.ok(actual.includes(file));const data=await readFile(new URL('../public/videos/'+file,import.meta.url));assert.equal(data.toString('ascii',4,8),'ftyp');}
});
test('Rutas multimedia respetan la base local y el subdirectorio de Pages',()=>{
 for(const file of Object.values(VIDEO_FILES))for(const base of ['/','/laboratorio-virtual-de-ondas/','./']){
 assert.equal(videoPath(base,file),base+'videos/'+encodeURIComponent(file));
 assert.equal(posterPath(base,file),base+'posters/'+encodeURIComponent(file.replace('.mp4','.jpg')));
 assert.ok(!videoPath(base,file).includes('localhost'));
 }
});
test('El workflow solo se despliega mediante solicitud manual explícita',async()=>{
 const workflow=await readFile(new URL('../.github/workflows/pages.yml',import.meta.url),'utf8');
 assert.ok(workflow.includes('workflow_dispatch:'));assert.ok(!/^\s+push:/m.test(workflow));assert.ok(workflow.includes('inputs.publicar == true'));
 assert.ok(workflow.includes('pnpm test'));assert.ok(workflow.includes('pnpm build'));assert.ok(workflow.includes('pnpm install --frozen-lockfile'));
});
