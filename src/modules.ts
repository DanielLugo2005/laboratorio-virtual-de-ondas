import { Waves, MoveHorizontal, Radio, AudioLines, Globe2, Zap, Droplets, Rainbow, Fan } from 'lucide-react';
export const modules = [
  {id:'transverse', title:'Onda transversal', desc:'Explora una cuerda en movimiento y sigue el recorrido de una perturbación.', icon:Waves, color:'#48e0cd', tag:'Movimiento perpendicular'},
  {id:'longitudinal', title:'Onda longitudinal', desc:'Observa cómo viaja la energía entre compresiones y rarefacciones.', icon:MoveHorizontal, color:'#b69aff', tag:'Movimiento paralelo'},
  {id:'standing', title:'Onda estacionaria', desc:'Encuentra los nodos y vientres que aparecen al superponer dos ondas.', icon:Radio, color:'#ffb36c', tag:'Superposición y resonancia'},
  {id:'sound',title:'Onda sonora',desc:'La presión del aire, el tono y la intensidad del sonido.',icon:AudioLines,color:'#64a8ff',tag:'Presión y propagación'},
  {id:'seismic',title:'Onda sísmica',desc:'Propagación de ondas P y S en el interior terrestre.',icon:Globe2,color:'#ff8b8b',tag:'Tiempos de llegada'},
  {id:'electromagnetic',title:'Onda electromagnética',desc:'Campos eléctricos y magnéticos en planos perpendiculares.',icon:Zap,color:'#e1a0f5',tag:'Campos en el vacío'},
  {id:'water',title:'Ondas en el agua',desc:'Frentes circulares e interferencia entre dos fuentes.',icon:Droplets,color:'#6cc8f3',tag:'Frentes e interferencia'},
  {id:'light',title:'Luz visible',desc:'Dispersión de la luz y colores del espectro visible.',icon:Rainbow,color:'#e8cf82',tag:'Refracción y dispersión'},
  {id:'strobe',title:'Efecto estroboscópico',desc:'Rotación aparente y frecuencia de observación.',icon:Fan,color:'#8dbca6',tag:'Muestreo y aliasing'},
];
