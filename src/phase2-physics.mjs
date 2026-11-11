export const C = 299792458;
export const EPSILON_0 = 8.8541878128e-12;
export const AIR = {
  cold: { label: 'Aire a 0 °C', v: 331.3, rho: 1.292 },
  room: { label: 'Aire a 20 °C', v: 343.2, rho: 1.204 },
  warm: { label: 'Aire a 40 °C', v: 354.7, rho: 1.127 },
};
export function soundQuantities(amplitudeMicrometers, f, medium = 'room') {
  const { v, rho } = AIR[medium];
  const a = amplitudeMicrometers * 1e-6;
  const omega = 2 * Math.PI * f, k = omega / v;
  const pressureAmplitude = rho * v * omega * a;
  return { a, f, v, rho, omega, k, wavelength: v / f, period: 1 / f,
    pressureAmplitude, intensity: pressureAmplitude ** 2 / (2 * rho * v) };
}
export function acousticState(x, t, q) {
  const phase = q.k * x - q.omega * t;
  return { displacement: q.a * Math.sin(phase), pressure: -q.rho * q.v ** 2 * q.a * q.k * Math.cos(phase) };
}
export function seismicQuantities(d, vp, vs, depth = 10) {
  if (!(d > depth && depth > 0 && vp > vs && vs > 0)) throw new RangeError('Se requiere d > profundidad > 0 y vP > vS > 0.');
  return { d, vp, vs, depth, horizontal: Math.sqrt(d*d-depth*depth), tp:d/vp, ts:d/vs, delta:d/vs-d/vp };
}
export function seismicSignal(t, arrival) {
  const dt = t - arrival;
  return dt <= 0 ? 0 : Math.sin(2 * Math.PI * .6 * dt) * Math.exp(-dt/8) * (1-Math.exp(-dt));
}
export function electromagneticQuantities(fTerahertz, e0) {
  const f=fTerahertz*1e12;
  return { f, e0, b0:e0/C, v:C, wavelength:C/f, period:1/f, omega:2*Math.PI*f, k:2*Math.PI*f/C,
    intensity: .5*EPSILON_0*C*e0*e0 };
}
export function electromagneticFields(x, t, q) {
  const wave = Math.sin(q.k*x-q.omega*t);
  return { e:[0,q.e0*wave,0], b:[0,0,q.b0*wave] };
}
// Proyección ortográfica de coordenadas 3D; la cámara rota, no los campos.
export function project3D(x,y,z,yawDegrees=30,elevationDegrees=24) {
  const yaw=yawDegrees*Math.PI/180, elevation=elevationDegrees*Math.PI/180;
  return [450+100*(x*Math.cos(yaw)-z*Math.sin(yaw)),
    205-100*(y*Math.cos(elevation)+(x*Math.sin(yaw)+z*Math.cos(yaw))*Math.sin(elevation))];
}
