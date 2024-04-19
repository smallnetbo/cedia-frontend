import departamentoData from '@/scripts/departamentoGeo.json'
import municipiosData from '@/scripts/municipiosGeo.json'
import { tipoGobierno } from './entidad.interface'

const departamentos = JSON.stringify(departamentoData)
export const departamentosGeneral = JSON.parse(departamentos)

const municipios = JSON.stringify(municipiosData)
export const municipiosGeneral = JSON.parse(municipios)

export function getData(typeVisualize: tipoGobierno) {
  switch (typeVisualize) {
    case 'GAD':
      return departamentosGeneral
    case 'GAM':
      return municipiosGeneral
    case 'GAR':
      return null
    default:
      return null
  }
}

export interface ObjetoEntidad {
  c_ut_dep?: string
  nom_dpto: string
  st_area_sh?: number
  st_length_?: number
  municipio?: string
  codigomef?: string
}

export const initialStyleMap = {
  color: '#05B2A7',
  opacity: 1,
  weight: 3,
}
