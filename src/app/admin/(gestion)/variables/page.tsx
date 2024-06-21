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
  // SubSectorCRUDType,
  SubSectorType,
  GraficoType,
  VariablesCRUDType,
} from './types/variablesCRUDTypes'
import { IconoTooltip } from '@/components/botones/IconoTooltip'
import { imprimir } from '@/utils/imprimir'
import { BotonBuscar } from '@/components/botones/BotonBuscar'
import { BotonOrdenar } from '@/components/botones/BotonOrdenar'
import { IconoBoton } from '@/components/botones/IconoBoton'
import { delay, InterpreteMensajes, siteName, titleCase } from '@/utils'
import { AlertDialog } from '@/components/modales/AlertDialog'
import { CustomDialog } from '@/components/modales/CustomDialog'
import { VistaModalVaribles } from './ui/ModalVariables'
import { FiltroVariables } from './ui/FiltroVariables'
import { useAlerts, useSession } from '@/hooks'
import { Constantes } from '@/config/Constantes'
import { ordenFiltrado } from '@/components/datatable/utils'
import { useAuth } from '@/context/AuthProvider'
import CustomMensajeEstado from '@/components/estados/CustomMensajeEstado'
import { CustomSwitch } from '@/components/botones/CustomSwitch'

export default function VariablesPage() {
  const [variablesData, setVariablesData] = useState<VariablesCRUDType[]>([])
  const [subSectorData, setSubSectorData] = useState<SubSectorType[]>([])
  const [graficoData, setGraficoData] = useState<GraficoType[]>([])

  const [loading, setLoading] = useState<boolean>(true)
  // Hook para mostrar alertas
  const { Alerta } = useAlerts()
  const [errorData, setErrorData] = useState<any>()
  const [modalVariable, setModalVariable] = useState(false)

  const [mostrarAlertaEstadoVariable, setMostrarAlertaEstadoVariable] =
    useState(false)

  const [mostrarAlertaEliminarVariable, setMostrarAlertaEliminarVariable] =
    useState(false)

  const [variableEdicion, setVariableEdicion] = useState<
    VariablesCRUDType | undefined | null
  >()

  const [limite, setLimite] = useState<number>(10)
  const [pagina, setPagina] = useState<number>(1)
  const [total, setTotal] = useState<number>(0)

  const [filtroVariable, setFiltroVariables] = useState<string>('')

  const [mostrarFiltroVariables, setMostrarFiltroVariables] = useState(false)

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
    { campo: 'posicion', nombre: 'Posicion' },
    { campo: 'subsector', nombre: 'Sub Sector' },
    { campo: 'graficos', nombre: 'Grafico' },
    { campo: 'estado', nombre: 'Estado' },
    { campo: 'acciones', nombre: 'Acciones' },
  ])

  /// Contenido del data table
  const contenidoTabla: Array<Array<ReactNode>> = variablesData.map(
    (variablesData, indexVariables) => [
      <Typography key={`${variablesData.id}-${indexVariables}-nombre`}>
        {`${variablesData.nombre} `}
      </Typography>,
      <div key={`${variablesData.id}-${indexVariables}-nombreCorto`}>
        <Typography
          variant={'body2'}
        >{`${variablesData.nombreCorto} `}</Typography>
      </div>,

      <div key={`${variablesData.id}-${indexVariables}-posicion`}>
        <Typography
          variant={'body2'}
        >{`${variablesData.posicion} `}</Typography>
      </div>,

      <div key={`${variablesData.id}-${indexVariables}-subsector`}>
        <Typography
          variant={'body2'}
        >{`${variablesData.subsector.nombre} `}</Typography>
      </div>,

      <div key={`${variablesData.id}-${indexVariables}-graficos`}>
        <Typography
          variant={'body2'}
        >{`${variablesData.graficos.titulo} `}</Typography>
      </div>,
      <Typography
        component={'div'}
        key={`${variablesData.id}-${indexVariables}-estado`}
      >
        <CustomMensajeEstado
          titulo={variablesData.estado}
          descripcion={variablesData.estado}
          color={
            variablesData.estado == 'ACTIVO'
              ? 'success'
              : variablesData.estado == 'INACTIVO'
                ? 'error'
                : 'info'
          }
        />
      </Typography>,

      <Stack
        key={`${variablesData.id}-${variablesData}-acciones`}
        direction={'row'}
        alignItems={'center'}
      >
        <CustomSwitch
          id={`cambiarEstadoUsuario-${variablesData.id}`}
          titulo={variablesData.estado == 'ACTIVO' ? 'Inactivar' : 'Activar'}
          accion={() => {
            editarEstadoVariablesModal(variablesData)
          }}
          desactivado={variablesData.estado == 'PENDIENTE'}
          color={variablesData.estado == 'ACTIVO' ? 'success' : 'error'}
          marcado={variablesData.estado == 'ACTIVO'}
          name={
            variablesData.estado == 'ACTIVO'
              ? 'Inactivar Variable'
              : 'Activar Variable'
          }
        />
        <IconoTooltip
          id={`editarVariable-${variablesData.id}`}
          titulo={'Editar'}
          color={'warning'}
          accion={() => {
            imprimir(`Editaremos`, variablesData)
            editarVariableModal(variablesData)
          }}
          icono={'edit'}
          name={'Editar variable'}
        />

        <IconoTooltip
          id={`editarVariable-${variablesData.id}`}
          titulo={'Eliminar'}
          color={'error'}
          accion={() => {
            eliminarVariableModal(variablesData)
          }}
          icono={'delete'}
          name={'Eliminar variable'}
        />
      </Stack>,
    ]
  )

  /// Acciones para data table
  const acciones: Array<ReactNode> = [
    <BotonBuscar
      id={'accionFiltrarVariableToggle'}
      key={'accionFiltrarVariableToggle'}
      seleccionado={mostrarFiltroVariables}
      cambiar={setMostrarFiltroVariables}
    />,
    xs && (
      <BotonOrdenar
        id={'ordenarVariables'}
        key={`ordenarVariables`}
        label={'Ordenar Variables'}
        criterios={ordenCriterios}
        cambioCriterios={setOrdenCriterios}
      />
    ),

    <IconoBoton
      id={'agregarVariable'}
      key={'agregarVariable'}
      texto={'Agregar'}
      variante={xs ? 'icono' : 'boton'}
      icono={'add_circle_outline'}
      descripcion={'Agregar Variable'}
      accion={() => {
        agregarVariableModal()
      }}
    />,
  ]

  /// obtener lista de variables
  const obtenerVariablesPeticion = async () => {
    try {
      setLoading(true)

      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/variables/todos`,
        params: {
          pagina: pagina,
          limite: limite,
          ...(filtroVariable.length == 0 ? {} : { filtro: filtroVariable }),
          ...(ordenFiltrado(ordenCriterios).length == 0
            ? {}
            : {
                orden: ordenFiltrado(ordenCriterios).join(','),
              }),
        },
      })
      setVariablesData(respuesta.datos?.filas)
      setTotal(respuesta.datos?.total)
      setErrorData(null)
    } catch (e) {
      imprimir(`Error al obtener variables`, e)
      setErrorData(e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  /// cambiar el estado de variable
  const cambiarEstadoVariablePeticion = async (vaiable: VariablesCRUDType) => {
    try {
      //setLoading(true)
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/variables/${vaiable.id}/${
          vaiable.estado == 'ACTIVO' ? 'inactivacion' : 'activacion'
        }`,
        method: 'patch',
      })
      imprimir(`respuesta inactivar variable: ${respuesta}`)
      Alerta({
        mensaje: InterpreteMensajes(respuesta),
        variant: 'success',
      })
      await obtenerVariablesPeticion()
    } catch (e) {
      imprimir(`Error al inactivar sub sector`, e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  /// Elimina una variable
  const eliminarVariablePeticion = async (variable: VariablesCRUDType) => {
    try {
      //setLoading(true)
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/variables/${variable.id}/eliminar`,
        method: 'patch',
      })
      imprimir(`respuesta eliminar variable: ${respuesta}`)
      Alerta({
        mensaje: 'Registro eliminado con éxito', // InterpreteMensajes(respuesta),
        variant: 'success',
      })
      await obtenerVariablesPeticion()
    } catch (e) {
      imprimir(`Error al eliminar variable`, e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  /// Petición para obtener las subsector
  const obtenerSubSectorPeticion = async () => {
    try {
      setLoading(true)
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/subsector`,
      })
      setSubSectorData(respuesta.datos)
      setErrorData(null)
    } catch (e) {
      imprimir(`Error al obtener sub sector`, e)
      setErrorData(e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
      throw e
    } finally {
      setLoading(false)
    }
  }
  /// Petición para obtener el Grafico
  const obtenerGraficoPeticion = async () => {
    try {
      setLoading(true)
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/grafico`,
      })
      setGraficoData(respuesta.datos)
      setErrorData(null)
    } catch (e) {
      imprimir(`Error al obtener grafico`, e)
      setErrorData(e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
      throw e
    } finally {
      setLoading(false)
    }
  }

  const agregarVariableModal = () => {
    setVariableEdicion(null)
    setModalVariable(true)
  }

  const editarEstadoVariablesModal = (variable: VariablesCRUDType) => {
    setVariableEdicion(variable)
    setMostrarAlertaEstadoVariable(true)
  }

  const eliminarVariableModal = (variable: VariablesCRUDType) => {
    setVariableEdicion(variable)
    setMostrarAlertaEliminarVariable(true)
  }

  const editarVariableModal = (variable: VariablesCRUDType) => {
    setVariableEdicion(variable)
    setModalVariable(true)
  }

  const aceptarAlertaEstadoVariable = async () => {
    setMostrarAlertaEstadoVariable(false)
    if (variableEdicion) {
      await cambiarEstadoVariablePeticion(variableEdicion)
    }
    setVariableEdicion(null)
  }

  const cancelarAlertaEstadoVariable = async () => {
    setMostrarAlertaEstadoVariable(false)
    await delay(500)
    setVariableEdicion(null)
  }

  const aceptarAlertaEliminarVariable = async () => {
    setMostrarAlertaEliminarVariable(false)
    if (variableEdicion) {
      await eliminarVariablePeticion(variableEdicion)
    }
    setVariableEdicion(null)
  }

  const cancelarAlertaEliminarVariable = async () => {
    setMostrarAlertaEliminarVariable(false)
    await delay(500)
    setVariableEdicion(null)
  }

  const cerrarModalSubSector = async () => {
    setModalVariable(false)
    await delay(500)
    setVariableEdicion(null)
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
    Promise.all([obtenerSubSectorPeticion(), obtenerGraficoPeticion()])
      .then(() => {
        obtenerVariablesPeticion()
          .catch(() => {})
          .finally(() => {})
      })
      .catch(() => {})
      .finally(() => {})
  }, [pagina, limite, filtroVariable])

  useEffect(() => {
    if (!mostrarFiltroVariables) {
      setFiltroVariables('')
    }
  }, [mostrarFiltroVariables])

  return (
    <>
      <title>{`Variables - ${siteName()}`}</title>

      <AlertDialog
        isOpen={mostrarAlertaEstadoVariable}
        titulo={'Alerta'}
        texto={`¿Está seguro de ${
          variableEdicion?.estado == 'ACTIVO' ? 'inactivar' : 'activar'
        } la variable: ${titleCase(variableEdicion?.nombre ?? '')} ?`}
      >
        <Button variant={'outlined'} onClick={cancelarAlertaEstadoVariable}>
          Cancelar
        </Button>
        <Button variant={'contained'} onClick={aceptarAlertaEstadoVariable}>
          Aceptar
        </Button>
      </AlertDialog>

      {/* Alerta que pregunta si desea eliminar variable */}
      <AlertDialog
        isOpen={mostrarAlertaEliminarVariable}
        titulo={'Alerta'}
        texto={`¿Está seguro de ${'eliminar la variable '}  ${titleCase(variableEdicion?.nombre ?? '')} ?`}
      >
        <Button variant={'outlined'} onClick={cancelarAlertaEliminarVariable}>
          Cancelar
        </Button>
        <Button variant={'contained'} onClick={aceptarAlertaEliminarVariable}>
          Aceptar
        </Button>
      </AlertDialog>

      <CustomDialog
        isOpen={modalVariable}
        handleClose={cerrarModalSubSector}
        title={variableEdicion ? 'Editar Variable' : 'Nueva Variable'}
      >
        {/* <VistaModalVaribles
          variable={variableEdicion}
          subsector={subSectorData}
          graficos={graficoData}
          accionCorrecta={() => {
            cerrarModalSubSector().finally()
            obtenerVariablesPeticion().finally()
          }}
          accionCancelar={cerrarModalSubSector}
        />   */}
      </CustomDialog>

      <CustomDataTable
        titulo={'Variables'}
        error={!!errorData}
        cargando={loading}
        acciones={acciones}
        columnas={ordenCriterios}
        cambioOrdenCriterios={setOrdenCriterios}
        contenidoTabla={contenidoTabla}
        filtros={
          mostrarFiltroVariables && (
            <FiltroVariables
              filtroNombreCorto={filtroVariable}
              accionCorrecta={(filtros) => {
                setPagina(1)
                setLimite(10)
                setFiltroVariables(filtros.nombreCorto)
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
