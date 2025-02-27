import { Gobiernos } from '@/types/map/entidad.interface'
import { SelectedEntidad } from '../../reporte/ui/modalReportes/ModalReporteGeoreferencia'
import { Parametros } from '../../reporte/ui/reportesPDF/PdfReportePorEntidad'

export const transformarDatosParaPDFGeoreferencia = (
  switchEntidadesMap:
    | {
        [key: string]: {
          nameAgrupador: string
          entidades: SelectedEntidad[]
        }
      }
    | undefined,
  titulo: string | undefined,
  subTitulo: Gobiernos
): Parametros => {
  if (!switchEntidadesMap) {
    return {
      titulo: titulo || 'Reporte por Entidad',
      subTitulo: subTitulo.name as unknown as string,
      colorPrimario: '#2c3e50',
      colorSecundario: '#34495e',
      categorias: [],
    }
  }

  const categorias = Object.entries(switchEntidadesMap).map(
    ([, { nameAgrupador, entidades }]) => ({
      titulo: nameAgrupador,
      color: entidades[0]?.color || '#000000',
      entidades: entidades.map((entidad) => ({
        nombre: entidad.nombre,
      })),
    })
  )

  return {
    titulo: titulo || 'Reporte por Entidad',
    subTitulo: subTitulo.name as unknown as string,
    colorPrimario: '#2c3e50',
    colorSecundario: '#34495e',
    categorias,
  }
}
