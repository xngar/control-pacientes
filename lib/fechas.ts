/**
 * Utilidades de fecha compartidas por la tabla y la alerta de llamados.
 *
 * Las fechas de la BD son texto ISO ("2026-11-20" o "2026-11-20T00:00:00").
 * Normalizarlas a "YYYY-MM-DD" permite comparar con `===` y ordenar con
 * `<` sin construir objetos Date en cada celda.
 */

export const normalizeFecha = (valor?: string | null): string => {
  const texto = (valor ?? '').trim();
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(texto);
  return iso ? `${iso[1]}-${iso[2]}-${iso[3]}` : texto.toLowerCase();
};

/**
 * Fecha local del navegador en "YYYY-MM-DD".
 * No usar `toISOString()`: converts a UTC y en Chile (UTC-3/-4) devuelve el
 * dia anterior, lo que haria que la alerta saltara un dia antes de la fecha.
 */
export const hoyISO = (): string => {
  const ahora = new Date();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  return `${ahora.getFullYear()}-${mes}-${dia}`;
};

/**
 * Dias entre hoy y una fecha: negativo = la fecha ya paso, 0 = hoy,
 * positivo = futura. Devuelve `null` si la fecha no es ISO interpretable.
 */
export const diasHasta = (fecha?: string | null, hoy: string = hoyISO()): number | null => {
  const iso = normalizeFecha(fecha);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const MS_POR_DIA = 86_400_000;
  const destino = new Date(`${iso}T00:00:00`).getTime();
  const base = new Date(`${normalizeFecha(hoy)}T00:00:00`).getTime();
  if (Number.isNaN(destino) || Number.isNaN(base)) return null;
  return Math.round((destino - base) / MS_POR_DIA);
};
