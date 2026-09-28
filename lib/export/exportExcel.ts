import * as XLSX from 'xlsx';
import { RegistroPaciente } from '@/types/paciente';

/**
 * Mapa de encabezados: clave del tipo → etiqueta en español (orden fiel a la tabla clínica)
 */
const HEADERS: { key: keyof RegistroPaciente | 'numero'; label: string; width: number }[] = [
  { key: 'numero',                         label: 'N°',                                        width: 6  },
  { key: 'duplaACargo',                    label: 'DUPLA A CARGO',                             width: 40 },
  { key: 'estado',                         label: 'ESTADO',                                    width: 18 },
  { key: 'fechaDerivacionDupla',           label: 'FECHA DERIVACIÓN A DUPLA',                 width: 26 },
  { key: 'fechaEgreso',                    label: 'FECHA DE EGRESO',                           width: 20 },
  { key: 'fechaMaximaContactoInicial',     label: 'FECHA MÁXIMA DE CONTACTO INICIAL',         width: 34 },
  { key: 'fechaIngresoUego',               label: 'FECHA DE INGRESO A UEGO',                  width: 26 },
  { key: 'observacionesIngreso',           label: 'OBSERVACIONES RESPECTO DEL INGRESO',       width: 44 },
  { key: 'nombre',                         label: 'NOMBRE',                                    width: 30 },
  { key: 'rut',                            label: 'RUT',                                       width: 16 },
  { key: 'edad',                           label: 'EDAD',                                      width: 8  },
  { key: 'eg',                             label: 'EG',                                        width: 10 },
  { key: 'tipologia',                      label: 'TIPOLOGÍA',                                 width: 28 },
  { key: 'diagnostico',                    label: 'DIAGNÓSTICO',                               width: 36 },
  { key: 'observacionesDiagnostico',       label: 'OBSERVACIONES RESPECTO AL DIAGNÓSTICO',    width: 46 },
  { key: 'ingresoHorarioEspecial',         label: 'INGRESO FIN DE SEMANA / HORARIO INHÁBIL / FERIADO / UEGO', width: 52 },
  { key: 'telefono',                       label: 'TELÉFONO',                                  width: 18 },
  { key: 'observacionesContacto',          label: 'OBSERVACIONES RESPECTO A CONTACTO',        width: 44 },
  { key: 'migrante',                       label: 'MIGRANTE',                                  width: 12 },
  { key: 'puebloOriginario',               label: 'PUEBLO ORIGINARIO',                         width: 20 },
  { key: 'entregaRecuerdo',                label: 'ENTREGA RECUERDO',                          width: 18 },
  { key: 'entregaDiptico',                 label: 'ENTREGA DÍPTICO INFORMATIVO',               width: 26 },
  { key: 'acompanamientoAtencionCerrada',  label: 'ACOMPAÑAMIENTO PSICOSOCIAL ATENCIÓN CERRADA', width: 44 },
  { key: 'controlAmbulatorioPsicosocial',  label: 'CONTROL AMBULATORIO PSICOSOCIAL',           width: 38 },
  { key: 'atencion1',                      label: 'ATENCIÓN 1',                                width: 16 },
  { key: 'atencion2',                      label: 'ATENCIÓN 2',                                width: 16 },
  { key: 'atencion3',                      label: 'ATENCIÓN 3',                                width: 16 },
  { key: 'atencion4',                      label: 'ATENCIÓN 4',                                width: 16 },
  { key: 'atencion5',                      label: 'ATENCIÓN 5',                                width: 16 },
  { key: 'atencion6',                      label: 'ATENCIÓN 6',                                width: 16 },
  { key: 'atencion7',                      label: 'ATENCIÓN 7',                                width: 16 },
  { key: 'atencion8',                      label: 'ATENCIÓN 8',                                width: 16 },
  { key: 'atencion9',                      label: 'ATENCIÓN 9',                                width: 16 },
  { key: 'atencion10',                     label: 'ATENCIÓN 10',                               width: 16 },
  { key: 'totalAtenciones',               label: 'TOTAL ATENCIONES',                          width: 18 },
  { key: 'observacionAtenciones',          label: 'OBSERVACIÓN ATENCIONES',                    width: 46 },
];

/**
 * Convierte un array de RegistroPaciente a un Workbook XLSX y lo descarga.
 * @param pacientes - datos a exportar (ya filtrados o completos)
 * @param filename  - nombre del archivo sin extensión
 */
export function exportPacientesToExcel(
  pacientes: RegistroPaciente[],
  filename = 'registro_pacientes'
): void {
  // 1. Construir filas como array de objetos con etiquetas en español
  const rows = pacientes.map((p) => {
    const row: Record<string, string | number> = {};
    for (const col of HEADERS) {
      const raw = (p as any)[col.key];
      // Normalizar vacíos
      row[col.label] = raw === null || raw === undefined || raw === '' ? '—' : raw;
    }
    return row;
  });

  // 2. Crear hoja a partir de los datos
  const ws = XLSX.utils.json_to_sheet(rows, {
    header: HEADERS.map((h) => h.label),
  });

  // 3. Anchos de columna
  ws['!cols'] = HEADERS.map((h) => ({ wch: h.width }));

  // 4. Crear libro de trabajo
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Registro Clínico');

  // 5. Nombre de archivo con fecha/hora
  const timestamp = new Date()
    .toLocaleString('es-CL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
    .replace(/[/:, ]/g, '-')
    .replace(/-+/g, '-');

  XLSX.writeFile(wb, `${filename}_${timestamp}.xlsx`);
}
