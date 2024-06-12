import { SubSector } from '../../types/datosGeneralesType'

export const filterDatoGeneralVista = (subSectores: SubSector[]) => {
  return subSectores.filter(
    (subSectores) => !subSectores.vistasVisualizadas.datosGenerales
  )
}

export const filterDatoGeneralReporte = (subSectores: SubSector[]) => {
  return subSectores.filter(
    (subSectores) => subSectores.vistasVisualizadas.datosGenerales
  )
}
