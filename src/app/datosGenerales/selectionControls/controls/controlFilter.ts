import { FiltroGobiernos } from '@/types/filtros/filtros.interface'

export const getFilteredOptions = (
  selectedGobiernoId: string,
  filtrado: FiltroGobiernos[]
): FiltroGobiernos[] => {
  switch (selectedGobiernoId) {
    case 'GAD':
      return filtrado.filter(
        (opcion) => opcion.id === 'DOSGOB' || opcion.id === 'TODOGAD'
      )
    case 'GAM':
      return filtrado.filter(
        (opcion) =>
          opcion.id === 'DOSGOB' ||
          opcion.id === 'MUNICAT' ||
          opcion.id === 'MUNIDPTO'
      )
    case 'GAR':
      return filtrado.filter(
        (opcion) => opcion.id === 'DOSGOB' || opcion.id === 'TODOGAD'
      )
    case 'GAIOC':
      return filtrado.filter(
        (opcion) => opcion.id === 'DOSGOB' || opcion.id === 'TODOGAIOC'
      )
    default:
      return filtrado
  }
}
