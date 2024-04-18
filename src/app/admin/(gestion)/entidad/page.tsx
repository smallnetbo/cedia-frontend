'use client'

import { CustomDataTable } from '@/components/datatable/CustomDataTable'
import { CriterioOrdenType } from '@/components/datatable/ordenTypes'
import { Paginacion } from '@/components/datatable/Paginacion'

import { CasbinTypes } from '@/types'
import { Stack, Typography, useMediaQuery, useTheme } from '@mui/material'
import { usePathname } from 'next/navigation'
import { ReactNode, useState } from 'react'
import { EntidadCRUDType } from './types/entidadCRUDTypes'
import { IconoTooltip } from '@/components/botones/IconoTooltip'
import { imprimir } from '@/utils/imprimir'
import { BotonBuscar } from '@/components/botones/BotonBuscar'
import { BotonOrdenar } from '@/components/botones/BotonOrdenar'
import { IconoBoton } from '@/components/botones/IconoBoton'
import { delay, siteName, titleCase } from '@/utils'
import { AlertDialog } from '@/components/modales/AlertDialog'
import { CustomDialog } from '@/components/modales/CustomDialog'
import { VistaModalEntidad } from './ui/ModalEntidad'
import { FiltroEntidad } from './ui/FiltroEntidad'

export default function EntidadPage() {
  const [loading, setLoading] = useState<boolean>(true)
  const [errorData, setErrorData] = useState<any>()
  const [modalEntidad, setModalEntidad] = useState(false)

  const [mostrarAlertaEstadoEntidad, setMostrarAlertaEstadoEntidad] =
    useState(false)

  const [entidadEdicion, setEntidadEdicion] = useState<
    EntidadCRUDType | undefined | null
  >()

  const [limite, setLimite] = useState<number>(10)
  const [pagina, setPagina] = useState<number>(1)
  const [total, setTotal] = useState<number>(0)

  const [filtroEntidad, setFiltroEntidad] = useState<string>('')

  const [mostrarFiltroEntidad, setMostrarFiltroEntidad] = useState(false)

  const [permisos, setPermisos] = useState<CasbinTypes>({
    read: false,
    create: false,
    update: false,
    delete: false,
  })

  const theme = useTheme()
  const xs = useMediaQuery(theme.breakpoints.only('xs'))
  const pathname = usePathname()

  const [ordenCriterios, setOrdenCriterios] = useState<
    Array<CriterioOrdenType>
  >([
    { campo: 'id', nombre: 'Id', ordenar: true },
    { campo: 'nombre', nombre: 'Nombre', ordenar: true },
    { campo: 'categoria', nombre: 'Categoria', ordenar: true },
    { campo: 'acciones', nombre: 'Acciones' },
  ])

  const entidadData = [
    {
      id: 1,
      nombre: 'La Paz',
      categoria: 'GAD',
    },
    {
      id: 2,
      nombre: 'Santa Cruz',
      categoria: 'GAD',
    },
    {
      id: 3,
      nombre: 'Beni',
      categoria: 'GAD',
    },
  ]

  /// Contenido del data table
  const contenidoTabla: Array<Array<ReactNode>> = entidadData.map(
    (entidadData, indexEntidad) => [
      <Typography key={`${entidadData.id}`} variant={'body2'}>
        {`${entidadData.id} `}
      </Typography>,
      <div key={`${entidadData.id}-${entidadData}-nombre`}>
        <Typography variant={'body2'}>{`${entidadData.nombre} `}</Typography>
      </div>,

      <div key={`${entidadData.id}-${entidadData}-categoria`}>
        <Typography variant={'body2'}>{`${entidadData.categoria} `}</Typography>
      </div>,

      <Stack
        key={`${entidadData.id}-${entidadData}-acciones`}
        direction={'row'}
        alignItems={'center'}
      >
        <IconoTooltip
          id={`editarEntidad-${entidadData.id}`}
          titulo={'Editar'}
          color={'warning'}
          accion={() => {
            imprimir(`Editaremos`, entidadData)
            editarEntidadModal(entidadData)
          }}
          icono={'edit'}
          name={'Editar entidad'}
        />
      </Stack>,
    ]
  )

  /// Acciones para data table
  const acciones: Array<ReactNode> = [
    <BotonBuscar
      id={'accionFiltrarEntidadToggle'}
      key={'accionFiltrarEntidadToggle'}
      seleccionado={mostrarFiltroEntidad}
      cambiar={setMostrarFiltroEntidad}
    />,
    xs && (
      <BotonOrdenar
        id={'ordenarEntidad'}
        key={`ordenarEntidad`}
        label={'Ordenar Entidad'}
        criterios={ordenCriterios}
        cambioCriterios={setOrdenCriterios}
      />
    ),

    <IconoBoton
      id={'agregarEntidad'}
      key={'agregarEntidad'}
      texto={'Agregar'}
      variante={xs ? 'icono' : 'boton'}
      icono={'add_circle_outline'}
      descripcion={'Agregar entidad'}
      accion={() => {
        agregarEntidadModal()
      }}
    />,
  ]

  const agregarEntidadModal = () => {
    setEntidadEdicion(null)
    setModalEntidad(true)
  }

  const editarEstadoEntidadModal = (entidad: EntidadCRUDType) => {
    setEntidadEdicion(entidad)
    setMostrarAlertaEstadoEntidad(true)
  }

  const editarEntidadModal = (entidad: EntidadCRUDType) => {
    setEntidadEdicion(entidad)
    setModalEntidad(true)
  }

  const aceptarAlertaEstadoEntidad = async () => {
    setMostrarAlertaEstadoEntidad(false)
    if (entidadEdicion) {
      //await ruta endpoint para cambiar estado
    }
    setEntidadEdicion(null)
  }

  const cancelarAlertaEstadoEntidad = async () => {
    setMostrarAlertaEstadoEntidad(false)
    await delay(500)
    setEntidadEdicion(null)
  }

  const cerrarModalEntidad = async () => {
    setModalEntidad(false)
    await delay(500)
    setEntidadEdicion(null)
  }
  return (
    <>
      <title>{`Entidad - ${siteName()}`}</title>
      <CustomDialog
        isOpen={modalEntidad}
        handleClose={cerrarModalEntidad}
        title={entidadEdicion ? 'Editar entidad' : 'Nueva entidad'}
      >
        <VistaModalEntidad
          entidad={entidadEdicion}
          accionCorrecta={() => {
            cerrarModalEntidad().finally()
          }}
          accionCancelar={cerrarModalEntidad}
        />
      </CustomDialog>

      <CustomDataTable
        titulo={'Entidad'}
        error={!!errorData}
        //cargando={loading}
        acciones={acciones}
        columnas={ordenCriterios}
        cambioOrdenCriterios={setOrdenCriterios}
        contenidoTabla={contenidoTabla}
        filtros={
          mostrarFiltroEntidad && (
            <FiltroEntidad
              filtroNombre={filtroEntidad}
              accionCorrecta={(filtros) => {
                setPagina(1)
                setLimite(10)
                setFiltroEntidad(filtros.nombre)
              }}
              accionCerrar={() => {}}
            />
          )
        }
        paginacion={
          <Paginacion
            pagina={pagina}
            limite={limite}
            total={total}
            cambioPagina={setPagina}
            cambioLimite={setLimite}
          />
        }
      />
    </>
  )
}
