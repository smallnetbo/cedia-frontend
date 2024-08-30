import { ReactNode, useEffect, useState } from 'react'
import { imprimir } from '@/utils/imprimir'
import { delay, InterpreteMensajes, siteName, titleCase } from '@/utils'
import { CasbinTypes } from '@/types'
import { useMediaQuery, useTheme } from '@mui/material'

import { CustomSwitch } from '@/components/botones/CustomSwitch'
import { IconoTooltip } from '@/components/botones/IconoTooltip'
import Tooltip from '@mui/material/Tooltip'
import { IconoBoton } from '@/components/botones/IconoBoton'

import Accordion from '@mui/material/Accordion'
import AccordionActions from '@mui/material/AccordionActions'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'

import Button from '@mui/material/Button'
import { useAlerts, useSession } from '@/hooks'
import { useAuth } from '@/context/AuthProvider'
import { usePathname } from 'next/navigation'
import { Constantes } from '@/config/Constantes'
import { CrearEditarFichaType } from './types/fichaCRUDTypes'
import {
  SubSectorCRUDType,
  VariablesType,
  GraficosVarType,
} from '../subsector/types/subSectorCRUDTypes'

import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'

import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

import { AlertDialog } from '@/components/modales/AlertDialog'
import { CustomDialog } from '@/components/modales/CustomDialog'
import { GraficoType } from '../variables/types/variablesCRUDTypes'
import { TipoGraficoType } from './types/tipoGraficoTypes'
import { VistaModalVaribles } from '../variables/ui/ModalVariables'

export default function VariablesView() {
  const storedData = localStorage?.getItem('fichaStorage')
  const initialFicha = storedData ? JSON.parse(storedData) : null
  const [ficha, setFichaNewData] = useState<CrearEditarFichaType>(initialFicha)
  const [subSectorData, setSubSectorData] = useState<SubSectorCRUDType[]>([])
  const [variableEdicion, setVariableEdicion] = useState<
    VariablesType | undefined | null
  >()
  const [graficoEdicion, setGraficoEdicion] = useState<
    GraficosVarType | undefined | null
  >()
  const [graficoData, setGraficoData] = useState<GraficoType[]>([])
  const [tipoGraficoData, setTipoGraficoData] = useState<TipoGraficoType[]>([])
  const [idSubSectorData, setIdSubSectorData] = useState<string>('')

  const [mostrarAlertaEstadoVariable, setMostrarAlertaEstadoVariable] =
    useState(false)
  const [mostrarAlertaEliminarVariable, setMostrarAlertaEliminarVariable] =
    useState(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [filtroSubSector, setFiltroSubSector] = useState<string>('')
  // Proveedor de la sesión
  const { sesionPeticion } = useSession()
  const { permisoUsuario } = useAuth()
  const [limite, setLimite] = useState<number>(10)
  const [pagina, setPagina] = useState<number>(1)
  const [total, setTotal] = useState<number>(0)
  // Hook para mostrar alertas
  const { Alerta } = useAlerts()
  const [errorData, setErrorData] = useState<any>()
  const [permisos, setPermisos] = useState<CasbinTypes>({
    read: false,
    create: false,
    update: false,
    delete: false,
  })
  const pathname = usePathname()
  const theme = useTheme()
  const xs = useMediaQuery(theme.breakpoints.only('xs'))
  const [modalVariable, setModalVariable] = useState(false)

  /// obtener lista de sub sector
  const obtenerSubSectoVariablesrPeticion = async () => {
    try {
      setLoading(true)
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/subsector/sectorlist${
          ficha.id ? `/${ficha.id}` : '/0'
        }`,
      })
      setSubSectorData(respuesta.datos)
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

  /// Método que define permisos por rol desde la sesión
  const definirPermisos = async () => {
    setPermisos(await permisoUsuario(pathname))
  }
  useEffect(() => {
    imprimir('subsectores..')
    definirPermisos().finally()
  }, [])

  useEffect(() => {
    Promise.all([obtenerTipoGraficoPeticion(), obtenerGraficoPeticion()])
      .then(() => {
        obtenerSubSectoVariablesrPeticion()
          .catch(() => {})
          .finally(() => {})
      })
      .catch(() => {})
      .finally(() => {})
  }, [pagina, limite, filtroSubSector])

  /// Contenido del data table

  const contenidoTabla: Array<Array<ReactNode>> = subSectorData.map(
    (subSectorData, indexSubSector) => [
      <Accordion key={`${subSectorData.id}-${indexSubSector}-Accordion`}>
        <AccordionSummary
          key={`${subSectorData.id}-${indexSubSector}-AccordionSummary`}
          expandIcon={<span className="material-icons">expand_more</span>}
          aria-controls="panel3-content"
          id="panel3-header"
        >
          {`${subSectorData.nombre} `}
        </AccordionSummary>
        <AccordionDetails
          key={`${subSectorData.id}-${indexSubSector}-AccordionDetails`}
        >
          <Table
            size="small"
            aria-label="purchases"
            key={`${subSectorData.id}-${indexSubSector}-Table`}
          >
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {subSectorData.variables
                .filter((varriableDataRow) => !varriableDataRow.esEliminado)
                .map((varriableDataRow) => (
                  <TableRow key={varriableDataRow.id}>
                    <TableCell component="th" scope="row">
                      {varriableDataRow.nombre}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip
                        style={{
                          backgroundColor:
                            varriableDataRow.estado == 'ACTIVO'
                              ? '#eaf8f4'
                              : varriableDataRow.estado == 'INACTIVO'
                                ? '#fdf4f6'
                                : '#ebf5ff',
                          color:
                            varriableDataRow.estado == 'ACTIVO'
                              ? '#30B082'
                              : varriableDataRow.estado == 'INACTIVO'
                                ? '#DE486C'
                                : '#0288d1',
                          fontSize: '12px',
                        }}
                        title={varriableDataRow.estado}
                        arrow
                      >
                        <Button>{varriableDataRow.estado}</Button>
                      </Tooltip>

                      <CustomSwitch
                        id={`cambiarEstadoUsuario-${varriableDataRow.id}`}
                        titulo={
                          varriableDataRow.estado == 'ACTIVO'
                            ? 'Inactivar'
                            : 'Activar'
                        }
                        accion={() => {
                          editarEstadoVariablesModal(varriableDataRow)
                        }}
                        desactivado={varriableDataRow.estado == 'PENDIENTE'}
                        color={
                          varriableDataRow.estado == 'ACTIVO'
                            ? 'success'
                            : 'error'
                        }
                        marcado={varriableDataRow.estado == 'ACTIVO'}
                        name={
                          varriableDataRow.estado == 'ACTIVO'
                            ? 'Inactivar Variable'
                            : 'Activar Variable'
                        }
                      />
                      <IconoTooltip
                        id={`editarVariable-${varriableDataRow.id}`}
                        titulo={'Editar'}
                        color={'warning'}
                        accion={() => {
                          imprimir(`Editaremos`, varriableDataRow)
                          editarVariableModal(
                            varriableDataRow,
                            varriableDataRow.graficos
                          )
                        }}
                        icono={'edit'}
                        name={'Editar variable'}
                      />

                      <IconoTooltip
                        id={`editarVariable-${varriableDataRow.id}`}
                        titulo={'Eliminar'}
                        color={'error'}
                        accion={() => {
                          eliminarVariableModal(varriableDataRow)
                        }}
                        icono={'delete'}
                        name={'Eliminar variable'}
                      />
                      {/* </Stack> */}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </AccordionDetails>
        <AccordionActions>
          <IconoBoton
            id={'agregarVariable'}
            key={'agregarVariable'}
            texto={'+ Nuevo'}
            variante={xs ? 'icono' : 'boton'}
            icono={'add_circle_outline'}
            descripcion={'Agregar Variable'}
            accion={() => {
              agregarVariableModal(subSectorData.id)
            }}
          />
        </AccordionActions>
      </Accordion>,
    ]
  )
  const agregarVariableModal = (idSubSector: string) => {
    setVariableEdicion(null)
    setGraficoEdicion(null)
    setModalVariable(true)
    setIdSubSectorData(idSubSector)
  }
  const editarEstadoVariablesModal = (variable: VariablesType) => {
    setVariableEdicion(variable)
    setMostrarAlertaEstadoVariable(true)
  }

  const eliminarVariableModal = (variable: VariablesType) => {
    setVariableEdicion(variable)
    setMostrarAlertaEliminarVariable(true)
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
  const cerrarModalSubSector = async () => {
    setModalVariable(false)
    await delay(500)
    setVariableEdicion(null)
    setGraficoEdicion(null)
  }

  const editarVariableModal = (
    variable: VariablesType,
    grafico: GraficosVarType
  ) => {
    setVariableEdicion(variable)
    setGraficoEdicion(grafico)
    setModalVariable(true)
  }

  /// cambiar el estado de variable
  const cambiarEstadoVariablePeticion = async (vaiable: VariablesType) => {
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
      //await obtenerVariablesPeticion()
      await obtenerSubSectoVariablesrPeticion()
    } catch (e) {
      imprimir(`Error al inactivar sub sector`, e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  /// Elimina una variable
  const eliminarVariablePeticion = async (variable: VariablesType) => {
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
      await obtenerSubSectoVariablesrPeticion()
    } catch (e) {
      imprimir(`Error al eliminar variable`, e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
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

  /// Petición para obtener tipo Grafico
  const obtenerTipoGraficoPeticion = async () => {
    try {
      setLoading(true)
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/tipografico`,
      })
      setTipoGraficoData(respuesta.datos)
      setErrorData(null)
    } catch (e) {
      imprimir(`Error al obtener tipo grafico`, e)
      setErrorData(e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
      throw e
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <title>{`Variables - ${siteName()}`}</title>
      <div style={{ borderBottom: '50px solid #FAFAFA' }}>
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
          maxWidth={'md'}
        >
          <VistaModalVaribles
            idSubSectorData={idSubSectorData}
            variable={variableEdicion}
            subsector={subSectorData}
            grafico={graficoEdicion}
            graficos={graficoData}
            tipoGrafico={tipoGraficoData}
            accionCorrecta={() => {
              cerrarModalSubSector().finally()
              obtenerSubSectoVariablesrPeticion().finally()
            }}
            accionCancelar={cerrarModalSubSector}
          />
        </CustomDialog>

        {contenidoTabla}
      </div>
    </>
  )
}
