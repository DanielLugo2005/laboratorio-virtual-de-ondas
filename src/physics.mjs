export const LENGTH = 12;
export function quantities(p, kind) {
  const f = kind === 'standing' ? p.v * p.n / (2 * LENGTH) : p.f;
  const wavelength = p.v / f;
  return { f, wavelength, period: 1 / f, omega: 2 * Math.PI * f, k: 2 * Math.PI / wavelength };
}
export function displacement(x, t, p, kind) {
  const q = quantities(p, kind);
  if (kind === 'standing') return 2 * p.a * Math.sin(q.k * x) * Math.cos(q.omega * t);
  if (kind === 'transverse' && p.pulse) {
    const center = -2 + p.v * t;
    return p.a * Math.exp(-(((x - center) / 0.65) ** 2));
  }
  return p.a * Math.sin(q.k * x - q.omega * t);
}
export function csv(rows) {
  return '\uFEFF' + rows.map(row => row.map(value => '"' + String(value).replaceAll('"', '""') + '"').join(',')).join('\r\n');
}
