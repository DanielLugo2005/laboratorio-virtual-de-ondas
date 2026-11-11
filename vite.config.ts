import { defineConfig } from 'vite';
export default defineConfig({
 base:'/laboratorio-virtual-de-ondas/',
 server:{watch:{ignored:['**/verification/**','**/.local-backups/**']}},
});
