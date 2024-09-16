import { Constantes } from '@/config/Constantes'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import TravelExploreIcon from '@mui/icons-material/TravelExplore'
import ListAltIcon from '@mui/icons-material/ListAlt'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import PublicIcon from '@mui/icons-material/Public'
import AssessmentIcon from '@mui/icons-material/Assessment'

export const ICONS = [
  {
    icon: AccountCircleIcon,
    color: '#a6ce3e',
    title: 'Niveles de Gobierno',
    subtitle:
      'Departamental / Municipal / Indigena Originario Capesino / Regional',
    backgroundImage: `url(${Constantes.sitePath}/inicio/mapa-verde.png)`,
  },
  {
    icon: TravelExploreIcon,
    color: '#a6ce3e',
    title: 'Datos Generales y Sectoriales',
    subtitle: 'Electoral (2015-2021) / Fiscal / Género / Política de cuidado',
    backgroundImage: `url(${Constantes.sitePath}/inicio/mapa-verde.png)`,
  },
  {
    icon: ListAltIcon,
    color: '#0ec9ae',
    title: 'Comparativas entre Gobiernos Autónomos',
    subtitle: 'Según: GAD / Categoria Municipal y GAM/ GAIOC / GAR',
    backgroundImage: `url(${Constantes.sitePath}/inicio/mapa-turquesa.png)`,
  },
  {
    icon: AutoStoriesIcon,
    color: '#0ec9ae',
    title: 'Cruce de Variables Sectoriales',
    subtitle:
      'Según: GAD / Grupos de Municipios por Dptos / Grupo de municipios por Categoria Municipal / GAIOC',
    backgroundImage: `url(${Constantes.sitePath}/inicio/mapa-turquesa.png)`,
  },
  {
    icon: PublicIcon,
    color: '#f7931e',
    title: 'Georeferenciación de Variables Sectoriales',
    subtitle: 'Según Nivel de Gobierno',
    backgroundImage: `url(${Constantes.sitePath}/inicio/mapa-naranja.png)`,
  },
  {
    icon: AssessmentIcon,
    color: '#f7931e',
    title: 'Índices e Indicadores',
    subtitle: 'Evaluación del ejercicio efectivo de competencias',
    backgroundImage: `url(${Constantes.sitePath}/inicio/mapa-naranja.png)`,
  },
]
