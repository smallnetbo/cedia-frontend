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
import { FichaCRUDType } from './types/fichaCRUDTypes'
import { IconoTooltip } from '@/components/botones/IconoTooltip'
import { imprimir } from '@/utils/imprimir'
import { BotonBuscar } from '@/components/botones/BotonBuscar'
import { BotonOrdenar } from '@/components/botones/BotonOrdenar'
import { IconoBoton } from '@/components/botones/IconoBoton'
import { delay, InterpreteMensajes, siteName, titleCase } from '@/utils'
import { AlertDialog } from '@/components/modales/AlertDialog'
import { CustomDialog } from '@/components/modales/CustomDialog'
import { VistaModalFicha } from './ui/ModalFicha'
import { FiltroFicha } from './ui/FiltroFicha'
import { useAlerts, useSession } from '@/hooks'
import { Constantes } from '@/config/Constantes'
import { ordenFiltrado } from '@/components/datatable/utils'
import { useAuth } from '@/context/AuthProvider'
import CustomMensajeEstado from '@/components/estados/CustomMensajeEstado'
import { CustomSwitch } from '@/components/botones/CustomSwitch'

export default function ListadoFichaPage() {
  const [fichaData, setFichaData] = useState<FichaCRUDType[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  // Hook para mostrar alertas
  const { Alerta } = useAlerts()
  const [errorData, setErrorData] = useState<any>()
  const [modalFicha, setModalFicha] = useState(false)

  const [mostrarAlertaEstadoFicha, setMostrarAlertaEstadoFicha] =
    useState(false)

  const [mostrarAlertaEliminarFicha, setMostrarAlertaEliminarFicha] =
    useState(false)

  const [fichaEdicion, setFichaEdicion] = useState<
    FichaCRUDType | undefined | null
  >()

  const [limite, setLimite] = useState<number>(10)
  const [pagina, setPagina] = useState<number>(1)
  const [total, setTotal] = useState<number>(0)

  const [filtroFicha, setFiltroFicha] = useState<string>('')

  const [mostrarFiltroFicha, setMostrarFiltroFicha] = useState(false)

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
    { campo: 'codigoSector', nombre: 'Codigo', ordenar: true },
    { campo: 'nombre', nombre: 'Nombre' },
    { campo: 'nombreCorto', nombre: 'Nombre Corto' },
    { campo: 'tipoSector', nombre: 'Tipo Sector' },
    { campo: 'colorPrimario', nombre: 'Color Primario' },
    { campo: 'colorSecundario', nombre: 'Color Secundario' },
    { campo: 'fechaInicio', nombre: 'Fecha Inicio' },
    { campo: 'fechaFin', nombre: 'Fecha Fin' },
    { campo: 'estado', nombre: 'Estado' },
    { campo: 'acciones', nombre: 'Acciones' },
  ])

  /// Contenido del data table
  const contenidoTabla: Array<Array<ReactNode>> = fichaData.map(
    (fichaData, indexFicha) => [
      <Typography key={`${fichaData.id}-${indexFicha}-codigoSector`}>
        {`${fichaData.codigoSector} `}
      </Typography>,
      <div key={`${fichaData.id}-${indexFicha}-nombre`}>
        <Typography variant={'body2'}>{`${fichaData.nombre} `}</Typography>
      </div>,

      <div key={`${fichaData.id}-${indexFicha}-nombreCorto`}>
        <Typography variant={'body2'}>{`${fichaData.nombreCorto} `}</Typography>
      </div>,

      <div key={`${fichaData.id}-${indexFicha}-tipoSector`}>
        <Typography variant={'body2'}>{`${fichaData.tipoSector} `}</Typography>
      </div>,

      <div key={`${fichaData.id}-${indexFicha}-colorPrimario`}>
        <Typography
          variant={'body2'}
        >{`${fichaData.colorPrimario} `}</Typography>
      </div>,

      <div key={`${fichaData.id}-${indexFicha}-colorSecundario`}>
        <Typography
          variant={'body2'}
        >{`${fichaData.colorSecundario} `}</Typography>
      </div>,

      <div key={`${fichaData.id}-${indexFicha}-fechaInicio`}>
        <Typography variant={'body2'}>{`${fichaData.fechaInicio} `}</Typography>
      </div>,

      <div key={`${fichaData.id}-${indexFicha}-fechaFin`}>
        <Typography variant={'body2'}>{`${fichaData.fechaFin} `}</Typography>
      </div>,

      <Typography
        component={'div'}
        key={`${fichaData.id}-${indexFicha}-estado`}
      >
        <CustomMensajeEstado
          titulo={fichaData.estado}
          descripcion={fichaData.estado}
          color={
            fichaData.estado == 'ACTIVO'
              ? 'success'
              : fichaData.estado == 'INACTIVO'
                ? 'error'
                : 'info'
          }
        />
      </Typography>,

      <Stack
        key={`${fichaData.id}-${fichaData}-acciones`}
        direction={'row'}
        alignItems={'center'}
      >
        <CustomSwitch
          id={`cambiarEstadoUsuario-${fichaData.id}`}
          titulo={fichaData.estado == 'ACTIVO' ? 'Inactivar' : 'Activar'}
          accion={() => {
            editarEstadoFichaModal(fichaData)
          }}
          desactivado={fichaData.estado == 'PENDIENTE'}
          color={fichaData.estado == 'ACTIVO' ? 'success' : 'error'}
          marcado={fichaData.estado == 'ACTIVO'}
          name={
            fichaData.estado == 'ACTIVO'
              ? 'Inactivar Usuario'
              : 'Activar Usuario'
          }
        />
        <IconoTooltip
          id={`editarFicha-${fichaData.id}`}
          titulo={'Editar'}
          color={'warning'}
          accion={() => {
            imprimir(`Editaremos`, fichaData)
            editarFichaModal(fichaData)
          }}
          icono={'edit'}
          name={'Editar ficha'}
        />

        <IconoTooltip
          id={`editarFicha-${fichaData.id}`}
          titulo={'Eliminar'}
          color={'error'}
          accion={() => {
            eliminarFichaModal(fichaData)
          }}
          icono={'delete'}
          name={'Eliminar ficha'}
        />
      </Stack>,
    ]
  )

  /// Acciones para data table
  const acciones: Array<ReactNode> = [
    <BotonBuscar
      id={'accionFiltrarFichaToggle'}
      key={'accionFiltrarFichaToggle'}
      seleccionado={mostrarFiltroFicha}
      cambiar={setMostrarFiltroFicha}
    />,
    xs && (
      <BotonOrdenar
        id={'ordenarFicha'}
        key={`ordenarFicha`}
        label={'Ordenar Ficha'}
        criterios={ordenCriterios}
        cambioCriterios={setOrdenCriterios}
      />
    ),

    <IconoBoton
      id={'agregarFicha'}
      key={'agregarFicha'}
      texto={'Agregar'}
      variante={xs ? 'icono' : 'boton'}
      icono={'add_circle_outline'}
      descripcion={'Agregar ficha'}
      accion={() => {
        agregarFichaModal()
      }}
    />,
  ]

  /// obtener lista de fichas
  const obtenerFichaPeticion = async () => {
    try {
      setLoading(true)

      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/sector/todos`,
        params: {
          pagina: pagina,
          limite: limite,
          ...(filtroFicha.length == 0 ? {} : { filtro: filtroFicha }),
          ...(ordenFiltrado(ordenCriterios).length == 0
            ? {}
            : {
                orden: ordenFiltrado(ordenCriterios).join(','),
              }),
        },
      })
      setFichaData(respuesta.datos?.filas)
      setTotal(respuesta.datos?.total)
      setErrorData(null)
    } catch (e) {
      imprimir(`Error al obtener Fichas`, e)
      setErrorData(e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  /// cambiar el estado de ficha
  const cambiarEstadoFichaPeticion = async (ficha: FichaCRUDType) => {
    try {
      //setLoading(true)
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/sector/${ficha.id}/${
          ficha.estado == 'ACTIVO' ? 'inactivacion' : 'activacion'
        }`,
        method: 'patch',
      })
      imprimir(`respuesta inactivar ficha: ${respuesta}`)
      Alerta({
        mensaje: InterpreteMensajes(respuesta),
        variant: 'success',
      })
      await obtenerFichaPeticion()
    } catch (e) {
      imprimir(`Error al inactivar ficha`, e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  /// Elimina una Ficha
  const eliminarFichaPeticion = async (ficha: FichaCRUDType) => {
    try {
      //setLoading(true)
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/sector/${ficha.id}/eliminar`,
        method: 'patch',
      })
      imprimir(`respuesta eliminar ficha: ${respuesta}`)
      Alerta({
        mensaje: 'Registro eliminado con éxito', // InterpreteMensajes(respuesta),
        variant: 'success',
      })
      await obtenerFichaPeticion()
    } catch (e) {
      imprimir(`Error al eliminar ficha`, e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const agregarFichaModal = () => {
    setFichaEdicion(null)
    setModalFicha(true)
  }

  const editarEstadoFichaModal = (ficha: FichaCRUDType) => {
    setFichaEdicion(ficha)
    setMostrarAlertaEstadoFicha(true)
  }

  const eliminarFichaModal = (ficha: FichaCRUDType) => {
    setFichaEdicion(ficha)
    setMostrarAlertaEliminarFicha(true)
  }

  const editarFichaModal = (ficha: FichaCRUDType) => {
    setFichaEdicion(ficha)
    setModalFicha(true)
  }

  const aceptarAlertaEstadoFicha = async () => {
    setMostrarAlertaEstadoFicha(false)
    if (fichaEdicion) {
      await cambiarEstadoFichaPeticion(fichaEdicion)
    }
    setFichaEdicion(null)
  }

  const cancelarAlertaEstadoFicha = async () => {
    setMostrarAlertaEstadoFicha(false)
    await delay(500)
    setFichaEdicion(null)
  }

  const aceptarAlertaEliminarFicha = async () => {
    setMostrarAlertaEliminarFicha(false)
    if (fichaEdicion) {
      await eliminarFichaPeticion(fichaEdicion)
    }
    setFichaEdicion(null)
  }

  const cancelarAlertaEliminarFicha = async () => {
    setMostrarAlertaEliminarFicha(false)
    await delay(500)
    setFichaEdicion(null)
  }

  const cerrarModalFicha = async () => {
    setModalFicha(false)
    await delay(500)
    setFichaEdicion(null)
  }

  /// Método que define permisos por rol desde la sesión
  const definirPermisos = async () => {
    setPermisos(await permisoUsuario(pathname))
  }
  useEffect(() => {
    imprimir('ficha..')
    definirPermisos().finally()
  }, [])

  useEffect(() => {
    Promise.all([])
      .then(() => {
        obtenerFichaPeticion()
          .catch(() => {})
          .finally(() => {})
      })
      .catch(() => {})
      .finally(() => {})
  }, [pagina, limite, filtroFicha])

  useEffect(() => {
    if (!mostrarFiltroFicha) {
      setFiltroFicha('')
    }
  }, [mostrarFiltroFicha])

  return (
    <>
      <title>{`Ficha - ${siteName()}`}</title>

      <AlertDialog
        isOpen={mostrarAlertaEstadoFicha}
        titulo={'Alerta'}
        texto={`¿Está seguro de ${
          fichaEdicion?.estado == 'ACTIVO' ? 'inactivar' : 'activar'
        } la Ficha: ${titleCase(fichaEdicion?.nombre ?? '')} ?`}
      >
        <Button variant={'outlined'} onClick={cancelarAlertaEstadoFicha}>
          Cancelar
        </Button>
        <Button variant={'contained'} onClick={aceptarAlertaEstadoFicha}>
          Aceptar
        </Button>
      </AlertDialog>

      {/* Alerta que pregunta si desea eliminar ficha */}
      <AlertDialog
        isOpen={mostrarAlertaEliminarFicha}
        titulo={'Alerta'}
        texto={`¿Está seguro de ${'eliminar la Ficha: '}  ${titleCase(fichaEdicion?.nombre ?? '')} ?`}
      >
        <Button variant={'outlined'} onClick={cancelarAlertaEliminarFicha}>
          Cancelar
        </Button>
        <Button variant={'contained'} onClick={aceptarAlertaEliminarFicha}>
          Aceptar
        </Button>
      </AlertDialog>

      <CustomDialog
        isOpen={modalFicha}
        handleClose={cerrarModalFicha}
        title={fichaEdicion ? 'Editar Ficha' : 'Nueva Ficha'}
      >
        <VistaModalFicha
          ficha={fichaEdicion}
          accionCorrecta={() => {
            cerrarModalFicha().finally()
            obtenerFichaPeticion().finally()
          }}
          accionCancelar={cerrarModalFicha}
        />
      </CustomDialog>

      <CustomDataTable
        titulo={'Fichas'}
        error={!!errorData}
        cargando={loading}
        acciones={acciones}
        columnas={ordenCriterios}
        cambioOrdenCriterios={setOrdenCriterios}
        contenidoTabla={contenidoTabla}
        filtros={
          mostrarFiltroFicha && (
            <FiltroFicha
              filtroCodigo={filtroFicha}
              accionCorrecta={(filtros) => {
                setPagina(1)
                setLimite(10)
                setFiltroFicha(filtros.codigoSector)
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
