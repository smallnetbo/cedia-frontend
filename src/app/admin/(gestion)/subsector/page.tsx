'use client'

import { CustomDataTable } from '@/components/datatable/CustomDataTable'
import { CriterioOrdenType } from '@/components/datatable/ordenTypes'
import { Paginacion } from '@/components/datatable/Paginacion'

import { CasbinTypes } from '@/types'
import {
  Button,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { usePathname } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'
import { SubSectorCRUDType, SectorType } from './types/subSectorCRUDTypes'
import { IconoTooltip } from '@/components/botones/IconoTooltip'
import { imprimir } from '@/utils/imprimir'
import { BotonBuscar } from '@/components/botones/BotonBuscar'
import { BotonOrdenar } from '@/components/botones/BotonOrdenar'
import { IconoBoton } from '@/components/botones/IconoBoton'
import { delay, InterpreteMensajes, siteName, titleCase } from '@/utils'
import { AlertDialog } from '@/components/modales/AlertDialog'
import { CustomDialog } from '@/components/modales/CustomDialog'
import { VistaModalSubSector } from './ui/ModalSubSector'
import { FiltroSubSector } from './ui/FiltroSubSector'
import { useAlerts, useSession } from '@/hooks'
import { Constantes } from '@/config/Constantes'
import { ordenFiltrado } from '@/components/datatable/utils'
import { useAuth } from '@/context/AuthProvider'
import CustomMensajeEstado from '@/components/estados/CustomMensajeEstado'
import { CustomSwitch } from '@/components/botones/CustomSwitch'

export default function SubSectorPage() {
  const [subSectorData, setSubSectorData] = useState<SubSectorCRUDType[]>([])
  const [sectorData, setSectorData] = useState<SectorType[]>([])

  const [loading, setLoading] = useState<boolean>(true)
  // Hook para mostrar alertas
  const { Alerta } = useAlerts()
  const [errorData, setErrorData] = useState<any>()
  const [modalSubSector, setModalSubSector] = useState(false)

  const [mostrarAlertaEstadoSubSector, setMostrarAlertaEstadoSubSector] =
    useState(false)

  const [mostrarAlertaEliminarSubSector, setMostrarAlertaEliminarSubSector] =
    useState(false)

  const [subSectorEdicion, setSubSectorEdicion] = useState<
    SubSectorCRUDType | undefined | null
  >()

  const [limite, setLimite] = useState<number>(10)
  const [pagina, setPagina] = useState<number>(1)
  const [total, setTotal] = useState<number>(0)

  const [filtroSubSector, setFiltroSubSector] = useState<string>('')

  const [mostrarFiltroSubSector, setMostrarFiltroSubSector] = useState(false)

  // Proveedor de la sesión
  const { sesionPeticion } = useSession()
  const { permisoUsuario } = useAuth()

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
    { campo: 'nombre', nombre: 'Nombre', ordenar: true },
    { campo: 'nombreCorto', nombre: 'Nombre Corto' },
    { campo: 'icono', nombre: 'Icono' },
    { campo: 'sector', nombre: 'Sector' },
    { campo: 'estado', nombre: 'Estado' },
    { campo: 'acciones', nombre: 'Acciones' },
  ])

  /// Contenido del data table
  const contenidoTabla: Array<Array<ReactNode>> = subSectorData.map(
    (subSectorData, indexSubSector) => [
      <Typography key={`${subSectorData.id}-${indexSubSector}-nombre`}>
        {`${subSectorData.nombre} `}
      </Typography>,
      <div key={`${subSectorData.id}-${indexSubSector}-nombreCorto`}>
        <Typography
          variant={'body2'}
        >{`${subSectorData.nombreCorto} `}</Typography>
      </div>,

      <div key={`${subSectorData.id}-${indexSubSector}-icono`}>
        <Typography variant={'body2'}>{`${subSectorData.icono} `}</Typography>
      </div>,

      <div key={`${subSectorData.id}-${indexSubSector}-sector`}>
        <Typography
          variant={'body2'}
        >{`${subSectorData.sector.nombre} `}</Typography>
      </div>,

      <Typography
        component={'div'}
        key={`${subSectorData.id}-${indexSubSector}-estado`}
      >
        <CustomMensajeEstado
          titulo={subSectorData.estado}
          descripcion={subSectorData.estado}
          color={
            subSectorData.estado == 'ACTIVO'
              ? 'success'
              : subSectorData.estado == 'INACTIVO'
                ? 'error'
                : 'info'
          }
        />
      </Typography>,

      <Stack
        key={`${subSectorData.id}-${subSectorData}-acciones`}
        direction={'row'}
        alignItems={'center'}
      >
        <CustomSwitch
          id={`cambiarEstadoUsuario-${subSectorData.id}`}
          titulo={subSectorData.estado == 'ACTIVO' ? 'Inactivar' : 'Activar'}
          accion={() => {
            editarEstadoSubSectorModal(subSectorData)
          }}
          desactivado={subSectorData.estado == 'PENDIENTE'}
          color={subSectorData.estado == 'ACTIVO' ? 'success' : 'error'}
          marcado={subSectorData.estado == 'ACTIVO'}
          name={
            subSectorData.estado == 'ACTIVO'
              ? 'Inactivar Sub sector'
              : 'Activar Sub sector'
          }
        />
        <IconoTooltip
          id={`editarSubSector-${subSectorData.id}`}
          titulo={'Editar'}
          color={'warning'}
          accion={() => {
            imprimir(`Editaremos`, subSectorData)
            editarSubSectorModal(subSectorData)
          }}
          icono={'edit'}
          name={'Editar Sub sector'}
        />

        <IconoTooltip
          id={`editarSubSector-${subSectorData.id}`}
          titulo={'Eliminar'}
          color={'error'}
          accion={() => {
            eliminarSubSectorModal(subSectorData)
          }}
          icono={'delete'}
          name={'Eliminar sub sector'}
        />
      </Stack>,
    ]
  )

  /// Acciones para data table
  const acciones: Array<ReactNode> = [
    <BotonBuscar
      id={'accionFiltrarSubSectorToggle'}
      key={'accionFiltrarSubSectorToggle'}
      seleccionado={mostrarFiltroSubSector}
      cambiar={setMostrarFiltroSubSector}
    />,
    xs && (
      <BotonOrdenar
        id={'ordenarSubSector'}
        key={`ordenarSubSector`}
        label={'Ordenar SubSector'}
        criterios={ordenCriterios}
        cambioCriterios={setOrdenCriterios}
      />
    ),

    <IconoBoton
      id={'agregarSubSector'}
      key={'agregarSubSector'}
      texto={'Agregar'}
      variante={xs ? 'icono' : 'boton'}
      icono={'add_circle_outline'}
      descripcion={'Agregar Sub Sector'}
      accion={() => {
        agregarSubSectorModal()
      }}
    />,
  ]

  /// obtener lista de sub sector
  const obtenerSubSectorPeticion = async () => {
    try {
      setLoading(true)

      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/subsector/todos`,
        params: {
          pagina: pagina,
          limite: limite,
          ...(filtroSubSector.length == 0 ? {} : { filtro: filtroSubSector }),
          ...(ordenFiltrado(ordenCriterios).length == 0
            ? {}
            : {
                orden: ordenFiltrado(ordenCriterios).join(','),
              }),
        },
      })
      setSubSectorData(respuesta.datos?.filas)
      setTotal(respuesta.datos?.total)
      setErrorData(null)
    } catch (e) {
      imprimir(`Error al obtener subsector`, e)
      setErrorData(e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  /// cambiar el estado de sub sector
  const cambiarEstadoSubSectorPeticion = async (
    subSector: SubSectorCRUDType
  ) => {
    try {
      //setLoading(true)
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/subsector/${subSector.id}/${
          subSector.estado == 'ACTIVO' ? 'inactivacion' : 'activacion'
        }`,
        method: 'patch',
      })
      imprimir(`respuesta inactivar subSector: ${respuesta}`)
      Alerta({
        mensaje: InterpreteMensajes(respuesta),
        variant: 'success',
      })
      await obtenerSubSectorPeticion()
    } catch (e) {
      imprimir(`Error al inactivar sub sector`, e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  /// Elimina una sub sector
  const eliminarSubSectorPeticion = async (subSector: SubSectorCRUDType) => {
    try {
      //setLoading(true)
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/subsector/${subSector.id}/eliminar`,
        method: 'patch',
      })
      imprimir(`respuesta eliminar sub sector: ${respuesta}`)
      Alerta({
        mensaje: 'Registro eliminado con éxito', // InterpreteMensajes(respuesta),
        variant: 'success',
      })
      await obtenerSubSectorPeticion()
    } catch (e) {
      imprimir(`Error al eliminar sub sector`, e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  /// Petición para obtener las sectores
  const obtenerSectorPeticion = async () => {
    try {
      setLoading(true)
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/sector`,
      })
      setSectorData(respuesta.datos)
      setErrorData(null)
    } catch (e) {
      imprimir(`Error al obtener sector`, e)
      setErrorData(e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
      throw e
    } finally {
      setLoading(false)
    }
  }

  const agregarSubSectorModal = () => {
    setSubSectorEdicion(null)
    setModalSubSector(true)
  }

  const editarEstadoSubSectorModal = (subSector: SubSectorCRUDType) => {
    setSubSectorEdicion(subSector)
    setMostrarAlertaEstadoSubSector(true)
  }

  const eliminarSubSectorModal = (subSector: SubSectorCRUDType) => {
    setSubSectorEdicion(subSector)
    setMostrarAlertaEliminarSubSector(true)
  }

  const editarSubSectorModal = (subSector: SubSectorCRUDType) => {
    setSubSectorEdicion(subSector)
    setModalSubSector(true)
  }

  const aceptarAlertaEstadoSubSector = async () => {
    setMostrarAlertaEstadoSubSector(false)
    if (subSectorEdicion) {
      await cambiarEstadoSubSectorPeticion(subSectorEdicion)
    }
    setSubSectorEdicion(null)
  }

  const cancelarAlertaEstadoSubSector = async () => {
    setMostrarAlertaEstadoSubSector(false)
    await delay(500)
    setSubSectorEdicion(null)
  }

  const aceptarAlertaEliminarSubSector = async () => {
    setMostrarAlertaEliminarSubSector(false)
    if (subSectorEdicion) {
      await eliminarSubSectorPeticion(subSectorEdicion)
    }
    setSubSectorEdicion(null)
  }

  const cancelarAlertaEliminarSubSector = async () => {
    setMostrarAlertaEliminarSubSector(false)
    await delay(500)
    setSubSectorEdicion(null)
  }

  const cerrarModalSubSector = async () => {
    setModalSubSector(false)
    await delay(500)
    setSubSectorEdicion(null)
  }

  /// Método que define permisos por rol desde la sesión
  const definirPermisos = async () => {
    setPermisos(await permisoUsuario(pathname))
  }
  useEffect(() => {
    imprimir('subsectores..')
    definirPermisos().finally()
  }, [])

  useEffect(() => {
    Promise.all([obtenerSectorPeticion()])
      .then(() => {
        obtenerSubSectorPeticion()
          .catch(() => {})
          .finally(() => {})
      })
      .catch(() => {})
      .finally(() => {})
  }, [pagina, limite, filtroSubSector])

  useEffect(() => {
    if (!mostrarFiltroSubSector) {
      setFiltroSubSector('')
    }
  }, [mostrarFiltroSubSector])

  return (
    <>
      <title>{`Sub Sector - ${siteName()}`}</title>

      <AlertDialog
        isOpen={mostrarAlertaEstadoSubSector}
        titulo={'Alerta'}
        texto={`¿Está seguro de ${
          subSectorEdicion?.estado == 'ACTIVO' ? 'inactivar' : 'activar'
        } el sub sector: ${titleCase(subSectorEdicion?.nombre ?? '')} ?`}
      >
        <Button variant={'outlined'} onClick={cancelarAlertaEstadoSubSector}>
          Cancelar
        </Button>
        <Button variant={'contained'} onClick={aceptarAlertaEstadoSubSector}>
          Aceptar
        </Button>
      </AlertDialog>

      {/* Alerta que pregunta si desea eliminar subsector */}
      <AlertDialog
        isOpen={mostrarAlertaEliminarSubSector}
        titulo={'Alerta'}
        texto={`¿Está seguro de ${'eliminar el sub sector '}  ${titleCase(subSectorEdicion?.nombre ?? '')} ?`}
      >
        <Button variant={'outlined'} onClick={cancelarAlertaEliminarSubSector}>
          Cancelar
        </Button>
        <Button variant={'contained'} onClick={aceptarAlertaEliminarSubSector}>
          Aceptar
        </Button>
      </AlertDialog>

      <CustomDialog
        isOpen={modalSubSector}
        handleClose={cerrarModalSubSector}
        title={subSectorEdicion ? 'Editar Sub Sector' : 'Nuevo Sub Sector'}
      >
        <VistaModalSubSector
          subSector={subSectorEdicion}
          sector={sectorData}
          accionCorrecta={() => {
            cerrarModalSubSector().finally()
            obtenerSubSectorPeticion().finally()
          }}
          accionCancelar={cerrarModalSubSector}
        />
      </CustomDialog>

      <CustomDataTable
        titulo={'SubSector'}
        error={!!errorData}
        cargando={loading}
        acciones={acciones}
        columnas={ordenCriterios}
        cambioOrdenCriterios={setOrdenCriterios}
        contenidoTabla={contenidoTabla}
        filtros={
          mostrarFiltroSubSector && (
            <FiltroSubSector
              filtroNombreCorto={filtroSubSector}
              accionCorrecta={(filtros) => {
                setPagina(1)
                setLimite(10)
                setFiltroSubSector(filtros.nombreCorto)
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
