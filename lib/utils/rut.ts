/**
 * Validacion de RUT chileno. El digito verificador es un modulo 11 sobre el
 * cuerpo del RUT, por eso "12.345.678-5" es valido y "...-4" no lo es.
 */
export function normalizarRut(value: string): string {
  return value.replace(/[^0-9kK]/g, '').toUpperCase();
}

export function formatearRut(value: string): string {
  const limpio = normalizarRut(value);
  if (limpio.length < 2) return limpio;

  const cuerpo = limpio.slice(0, -1);
  const verificador = limpio.slice(-1);
  const grupos: string[] = [];

  for (let i = cuerpo.length; i > 0; i -= 3) {
    grupos.unshift(cuerpo.slice(Math.max(0, i - 3), i));
  }

  return `${grupos.join('.')}-${verificador}`;
}

export function esRutValido(value: string): boolean {
  const limpio = normalizarRut(value);
  if (limpio.length < 2) return false;

  const cuerpo = limpio.slice(0, -1);
  const verificador = limpio.slice(-1);
  if (!/^\d+$/.test(cuerpo)) return false;

  let suma = 0;
  let factor = 2;

  for (let i = cuerpo.length - 1; i >= 0; i -= 1) {
    suma += Number(cuerpo[i]) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }

  const resto = 11 - (suma % 11);
  const esperado = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto);

  return esperado === verificador;
}
