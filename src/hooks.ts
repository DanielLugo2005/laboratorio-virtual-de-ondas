import { useEffect, useRef, useState, type RefObject } from 'react';
export function motionIsReduced(){return typeof window!=='undefined'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;}
// Suspende el reloj, sin cambiar sus parámetros, al ocultar el panel o la pestaña.
export function useSimulationActivity(ref:RefObject<HTMLElement|null>,onReduce:()=>void){
 const [visible,setVisible]=useState(true),[documentVisible,setDocumentVisible]=useState(!document.hidden);
 const callback=useRef(onReduce);callback.current=onReduce;
 useEffect(()=>{const element=ref.current;if(!element||!('IntersectionObserver' in window))return;const observer=new IntersectionObserver(entries=>setVisible(entries[0].isIntersecting),{threshold:.01});observer.observe(element);return()=>observer.disconnect();},[ref]);
 useEffect(()=>{const update=()=>setDocumentVisible(!document.hidden);document.addEventListener('visibilitychange',update);return()=>document.removeEventListener('visibilitychange',update);},[]);
 useEffect(()=>{const query=window.matchMedia('(prefers-reduced-motion: reduce)');const update=()=>{if(query.matches)callback.current();};query.addEventListener('change',update);return()=>query.removeEventListener('change',update);},[]);
 return visible&&documentVisible;
}
