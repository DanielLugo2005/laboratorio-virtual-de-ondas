export const VIDEO_FILES = {
 transverse:'Onda_transversal_simulacion_20s.mp4',
 longitudinal:'Onda_longitudinal_simulacion_20s.mp4',
 standing:'Onda_estacionaria_simulacion_20s.mp4',
 sound:'Onda_sonora_simulacion_20s.mp4',
 seismic:'Onda_sismica_simulacion_20s.mp4',
 electromagnetic:'Onda_electromagnetica_simulacion_20s.mp4',
 water:'Onda_mecanica_simulacion_20s.mp4',
 light:'Onda_luz_visible_simulacion_20s.mp4',
 strobe:'Efecto_estroboscopico_simulacion_20s.mp4',
};
export function videoPath(base,file){return `${base.endsWith('/')?base:base+'/'}videos/${encodeURIComponent(file)}`;}
export function posterPath(base,file){return `${base.endsWith('/')?base:base+'/'}posters/${encodeURIComponent(file.replace(/\.mp4$/i,'.jpg'))}`;}
