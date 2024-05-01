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
import {
  CategoriaType,
  DepartamentosType,
  EntidadCRUDType,
  NivelGobiernoType,
 // TipoEntidadType,
} from './types/entidadCRUDTypes'
import { IconoTooltip } from '@/components/botones/IconoTooltip'
import { imprimir } from '@/utils/imprimir'
import { BotonBuscar } from '@/components/botones/BotonBuscar'
import { BotonOrdenar } from '@/components/botones/BotonOrdenar'
import { IconoBoton } from '@/components/botones/IconoBoton'
import { delay, InterpreteMensajes, siteName, titleCase } from '@/utils'
import { AlertDialog } from '@/components/modales/AlertDialog'
import { CustomDialog } from '@/components/modales/CustomDialog'
import { VistaModalEntidad } from './ui/ModalEntidad'
import { FiltroEntidad } from './ui/FiltroEntidad'
import { useAlerts, useSession } from '@/hooks'
import { Constantes } from '@/config/Constantes'
import { ordenFiltrado } from '@/components/datatable/utils'
import { Alerta } from 'stories/components/organismos/dialogos/AlertDialog.stories'
import { useAuth } from '@/context/AuthProvider'
import CustomMensajeEstado from '@/components/estados/CustomMensajeEstado'
import { CustomSwitch } from '@/components/botones/CustomSwitch'

export default function EntidadPage() {
  const [entidadData, setEntidadData] = useState<EntidadCRUDType[]>([])
  const [categoriaData, setCategoriaData] = useState<CategoriaType[]>([])
  const [nivelGobiernoData, setNivelGobiernoData] = useState<
    NivelGobiernoType[]
  >([])
  //const [tipoEntidadData, setTipoEntidadData] = useState<TipoEntidadType[]>([])
const [departamentosData, setDepartamentosData] = useState<DepartamentosType[]>([])

  const [loading, setLoading] = useState<boolean>(true)
  // Hook para mostrar alertas
  const { Alerta } = useAlerts()
  const [errorData, setErrorData] = useState<any>()
  const [modalEntidad, setModalEntidad] = useState(false)

  const [mostrarAlertaEstadoEntidad, setMostrarAlertaEstadoEntidad] =
    useState(false)

    const [mostrarAlertaEliminarEntidad, setMostrarAlertaEliminarEntidad] =
    useState(false)

  const [entidadEdicion, setEntidadEdicion] = useState<
    EntidadCRUDType | undefined | null
  >()

  const [limite, setLimite] = useState<number>(10)
  const [pagina, setPagina] = useState<number>(1)
  const [total, setTotal] = useState<number>(0)

  const [filtroEntidad, setFiltroEntidad] = useState<string>('')

  const [mostrarFiltroEntidad, setMostrarFiltroEntidad] = useState(false)

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
    { campo: 'codigoEntidad', nombre: 'Codigo', ordenar: true },
    { campo: 'nombre', nombre: 'Nombre' },
    { campo: 'nivelGobierno', nombre: 'Nivel De Gobierno' },
    ///{ campo: 'tipoEntidad', nombre: 'Tipo De Entidad' },
    { campo: 'categoria', nombre: 'Categoria' },
    { campo: 'estado', nombre: 'Estado' },
    { campo: 'acciones', nombre: 'Acciones' },
  ])

  /// Contenido del data table
  const contenidoTabla: Array<Array<ReactNode>> = entidadData.map(
    (entidadData, indexEntidad) => [
      <Typography key={`${entidadData.id}-${indexEntidad}-codigoEntidad`}>
        {`${entidadData.codigoEntidad} `}
      </Typography>,
      <div key={`${entidadData.id}-${indexEntidad}-nombre`}>
        <Typography variant={'body2'}>{`${entidadData.nombre} `}</Typography>
      </div>,

      <div key={`${entidadData.id}-${indexEntidad}-nivelGobierno`}>
        <Typography
          variant={'body2'}
        >{`${entidadData.nivelGobierno.nombre} `}</Typography>
      </div>,
      // <div key={`${entidadData.id}-${indexEntidad}-tipoEntidad`}>
      //   <Typography
      //     variant={'body2'}
      //   >{`${entidadData.tipoEntidad.nombre} `}</Typography>
      // </div>,
      <div key={`${entidadData.id}-${indexEntidad}-categoria`}>
        <Typography
          variant={'body2'}
        >{`${entidadData.categoria.nombre} `}</Typography>
      </div>,
      <Typography
        component={'div'}
        key={`${entidadData.id}-${indexEntidad}-estado`}
      >
        <CustomMensajeEstado
          titulo={entidadData.estado}
          descripcion={entidadData.estado}
          color={
            entidadData.estado == 'ACTIVO'
              ? 'success'
              : entidadData.estado == 'INACTIVO'
                ? 'error'
                : 'info'
          }
        />
      </Typography>,

      <Stack
        key={`${entidadData.id}-${entidadData}-acciones`}
        direction={'row'}
        alignItems={'center'}
      >
        <CustomSwitch
          id={`cambiarEstadoUsuario-${entidadData.id}`}
          titulo={entidadData.estado == 'ACTIVO' ? 'Inactivar' : 'Activar'}
          accion={() => {
            editarEstadoEntidadModal(entidadData)
          }}
          desactivado={entidadData.estado == 'PENDIENTE'}
          color={entidadData.estado == 'ACTIVO' ? 'success' : 'error'}
          marcado={entidadData.estado == 'ACTIVO'}
          name={
            entidadData.estado == 'ACTIVO'
              ? 'Inactivar Usuario'
              : 'Activar Usuario'
          }
        />
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

<IconoTooltip
          id={`editarEntidad-${entidadData.id}`}
          titulo={'Eliminar'}
          color={'error'}
          accion={() => {
            eliminarEntidadModal(entidadData)
          }}
          icono={'delete'}
          name={'Eliminar entidad'}
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

  /// obtener lista de entidad
  const obtenerEntidadPeticion = async () => {
    try {
      setLoading(true)

      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/entidad/todos`,
        params: {
          pagina: pagina,
          limite: limite,
          ...(filtroEntidad.length == 0 ? {} : { filtro: filtroEntidad }),
          ...(ordenFiltrado(ordenCriterios).length == 0
            ? {}
            : {
                orden: ordenFiltrado(ordenCriterios).join(','),
              }),
        },
      })
      setEntidadData(respuesta.datos?.filas)
      setTotal(respuesta.datos?.total)
      setErrorData(null)
    } catch (e) {
      imprimir(`Error al obtener entidades`, e)
      setErrorData(e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  /// cambiar el estado de entidad
  const cambiarEstadoEntidadPeticion = async (entidad: EntidadCRUDType) => {
    try {
      //setLoading(true)
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/entidad/${entidad.id}/${
          entidad.estado == 'ACTIVO' ? 'inactivacion' : 'activacion'
        }`,
        method: 'patch',
      })
      imprimir(`respuesta inactivar entidad: ${respuesta}`)
      Alerta({
        mensaje: InterpreteMensajes(respuesta),
        variant: 'success',
      })
      await obtenerEntidadPeticion()
    } catch (e) {
      imprimir(`Error al inactivar entidad`, e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

   /// Elimina una entidad
   const eliminarEntidadPeticion = async (entidad: EntidadCRUDType) => {
    try {
      //setLoading(true)
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/entidad/${entidad.id}/eliminar`,
        method: 'patch',
      })
      imprimir(`respuesta eliminar entidad: ${respuesta}`)
      Alerta({
        mensaje:'Registro eliminado con éxito',// InterpreteMensajes(respuesta),
        variant: 'success',
      })
      await obtenerEntidadPeticion()
    } catch (e) {
      imprimir(`Error al eliminar entidad`, e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  /// Petición para obtener las categorias
  const obtenerCategoriaPeticion = async () => {
    try {
      setLoading(true)
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/categoria`,
      })
      setCategoriaData(respuesta.datos)
      setErrorData(null)
    } catch (e) {
      imprimir(`Error al obtener categoria`, e)
      setErrorData(e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
      throw e
    } finally {
      setLoading(false)
    }
  }
  /// Petición para obtener el nivel de gobierno
  const obtenerNivelGobiernoPeticion = async () => {
    try {
      setLoading(true)
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/nivel-gobierno`,
      })
      setNivelGobiernoData(respuesta.datos)
      setErrorData(null)
    } catch (e) {
      imprimir(`Error al obtener el nivel de gobierno`, e)
      setErrorData(e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
      throw e
    } finally {
      setLoading(false)
    }
  }
  /// Petición para obtener tipo entidad
  /*const obtenerTipoEntidadPeticion = async () => {
    try {
      setLoading(true)
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/tipo-entidad`,
      })
      setTipoEntidadData(respuesta.datos)
      setErrorData(null)
    } catch (e) {
      imprimir(`Error al obtener el tipo de entidad`, e)
      setErrorData(e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
      throw e
    } finally {
      setLoading(false)
    }
  }*/
  /// Petición para obtener Entidades Departamentos
  const obtenerDepartamentosPeticion = async () => {
    try {
      setLoading(true)
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/entidad/departamentos`,
      })
      setDepartamentosData(respuesta.datos)
      setErrorData(null)
    } catch (e) {
      imprimir(`Error al obtener departamentos`, e)
      setErrorData(e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
      throw e
    } finally {
      setLoading(false)
    }
  }

  const agregarEntidadModal = () => {
    setEntidadEdicion(null)
    setModalEntidad(true)
  }

  const editarEstadoEntidadModal = (entidad: EntidadCRUDType) => {
    setEntidadEdicion(entidad)
    setMostrarAlertaEstadoEntidad(true)
  }

  const eliminarEntidadModal = (entidad: EntidadCRUDType) => {
    setEntidadEdicion(entidad)
    setMostrarAlertaEliminarEntidad(true)
  }

  const editarEntidadModal = (entidad: EntidadCRUDType) => {
    setEntidadEdicion(entidad)
    setModalEntidad(true)
  }

  const aceptarAlertaEstadoEntidad = async () => {
    setMostrarAlertaEstadoEntidad(false)
    if (entidadEdicion) {
      await cambiarEstadoEntidadPeticion(entidadEdicion)
    }
    setEntidadEdicion(null)
  }

  const cancelarAlertaEstadoEntidad = async () => {
    setMostrarAlertaEstadoEntidad(false)
    await delay(500)
    setEntidadEdicion(null)
  }

  const aceptarAlertaEliminarEntidad = async () => {
    setMostrarAlertaEliminarEntidad(false)
    if (entidadEdicion) {
      await eliminarEntidadPeticion(entidadEdicion)
    }
    setEntidadEdicion(null)
  }

  const cancelarAlertaEliminarEntidad = async () => {
    setMostrarAlertaEliminarEntidad(false)
    await delay(500)
    setEntidadEdicion(null)
  }

  const cerrarModalEntidad = async () => {
    setModalEntidad(false)
    await delay(500)
    setEntidadEdicion(null)
  }

  /// Método que define permisos por rol desde la sesión
  const definirPermisos = async () => {
    setPermisos(await permisoUsuario(pathname))
  }
  useEffect(() => {
    imprimir('entidades..')
    definirPermisos().finally()
  }, [])

  useEffect(() => {
    Promise.all([
      obtenerCategoriaPeticion(),
      obtenerNivelGobiernoPeticion(),
     // obtenerTipoEntidadPeticion(),
     obtenerDepartamentosPeticion(),
    ])
      .then(() => {
        obtenerEntidadPeticion()
          .catch(() => {})
          .finally(() => {})
      })
      .catch(() => {})
      .finally(() => {})
  }, [pagina, limite, filtroEntidad])

  useEffect(() => {
    if (!mostrarFiltroEntidad) {
      setFiltroEntidad('')
    }
  }, [mostrarFiltroEntidad])

  return (
    <>
      <title>{`Entidad - ${siteName()}`}</title>

      <AlertDialog
        isOpen={mostrarAlertaEstadoEntidad}
        titulo={'Alerta'}
        texto={`¿Está seguro de ${
          entidadEdicion?.estado == 'ACTIVO' ? 'inactivar' : 'activar'
        } a ${titleCase(entidadEdicion?.nombre ?? '')} ?`}
      >
        <Button variant={'outlined'} onClick={cancelarAlertaEstadoEntidad}>
          Cancelar
        </Button>
        <Button variant={'contained'} onClick={aceptarAlertaEstadoEntidad}>
          Aceptar
        </Button>
      </AlertDialog>


      {/* Alerta que pregunta si desea eliminar entidad */}
      <AlertDialog
        isOpen={mostrarAlertaEliminarEntidad}
        titulo={'Alerta'}
        texto={`¿Está seguro de ${'eliminar la entidad '
        }  ${titleCase(entidadEdicion?.nombre ?? '')} ?`}
      >
        <Button variant={'outlined'} onClick={cancelarAlertaEliminarEntidad}>
          Cancelar
        </Button>
        <Button variant={'contained'} onClick={aceptarAlertaEliminarEntidad}>
          Aceptar
        </Button>
      </AlertDialog>

      <CustomDialog
        isOpen={modalEntidad}
        handleClose={cerrarModalEntidad}
        title={entidadEdicion ? 'Editar entidad' : 'Nueva entidad'}
      >
        <VistaModalEntidad
          entidad={entidadEdicion}
          categoria={categoriaData}
          nivelGobierno={nivelGobiernoData}
         // tipoEntidad={tipoEntidadData}
         departamentos={departamentosData}
          accionCorrecta={() => {
            cerrarModalEntidad().finally()
            obtenerEntidadPeticion().finally()
          }}
          accionCancelar={cerrarModalEntidad}
        />
      </CustomDialog>

      <CustomDataTable
        titulo={'Entidad'}
        error={!!errorData}
        cargando={loading}
        acciones={acciones}
        columnas={ordenCriterios}
        cambioOrdenCriterios={setOrdenCriterios}
        contenidoTabla={contenidoTabla}
        filtros={
          mostrarFiltroEntidad && (
            <FiltroEntidad
              filtroCodigo={filtroEntidad}
              accionCorrecta={(filtros) => {
                setPagina(1)
                setLimite(10)
                setFiltroEntidad(filtros.codigoEntidad)
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
