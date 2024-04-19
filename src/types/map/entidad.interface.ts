export type tipoGobierno = 'GAD' | 'GAR' | 'GAM' | 'GAIOC'

export interface Gobiernos {
  id: tipoGobierno
  name: string
}
export const gobiernos: Gobiernos[] = [
  { id: 'GAD', name: 'Departamental' },
  { id: 'GAM', name: 'Municipal' },
  { id: 'GAR', name: 'Regional' },
  { id: 'GAIOC', name: 'GAIOC' },
]
