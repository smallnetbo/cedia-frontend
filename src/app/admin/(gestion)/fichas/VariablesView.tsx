//import * as React from 'react';
import { ReactNode, useEffect, useState } from 'react'
import { imprimir } from '@/utils/imprimir'
import { delay, InterpreteMensajes, siteName, titleCase } from '@/utils'
import { ordenFiltrado } from '@/components/datatable/utils'
import { CasbinTypes } from '@/types'
import {
    //Button,
    Stack,
    Typography,
    useMediaQuery,
    useTheme,
  } from '@mui/material'
import CustomMensajeEstado from '@/components/estados/CustomMensajeEstado'
import { CustomSwitch } from '@/components/botones/CustomSwitch'
import { IconoTooltip } from '@/components/botones/IconoTooltip'
import Tooltip from '@mui/material/Tooltip'
import { IconoBoton } from '@/components/botones/IconoBoton'
import { CustomDataTable } from '@/components/datatable/CustomDataTable'
import Accordion from '@mui/material/Accordion'
import AccordionActions from '@mui/material/AccordionActions'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Button from '@mui/material/Button'
import { useAlerts, useSession } from '@/hooks'
import { useAuth } from '@/context/AuthProvider'
import { usePathname } from 'next/navigation'
import { Constantes } from '@/config/Constantes'
import { CrearEditarFichaType } from './types/fichaCRUDTypes'
import {
    SubSectorCRUDType,
    SectorType,
    VariablesType,
    GraficosVarType,
  } from '../subsector/types/subSectorCRUDTypes'
import { FiltroSubSector } from '../subsector/ui/FiltroSubSector'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper';
import { AlertDialog } from '@/components/modales/AlertDialog'
import { CustomDialog } from '@/components/modales/CustomDialog'
import {
  // SubSectorCRUDType,
   //SubSectorType,
   GraficoType,
   VariablesCRUDType,
 } from '../variables/types/variablesCRUDTypes'
 import { TipoGraficoType } from './types/tipoGraficoTypes'
 import { VistaModalVaribles } from '../variables/ui/ModalVariables'

export default function VariablesView() {
    const storedData = localStorage?.getItem('fichaStorage');
  const initialFicha = storedData ? JSON.parse(storedData) : null;
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
      console.log('Ficha id',ficha.id)
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/subsector/sectorlist${
            ficha.id ? `/${ficha.id}` : '/0'
        }`,
        // params: {
        //   pagina: pagina,
        //   limite: limite,
        //   ...(filtroSubSector.length == 0 ? {} : { filtro: filtroSubSector }),
        //   ...(ordenFiltrado(ordenCriterios).length == 0
        //     ? {}
        //     : {
        //         orden: ordenFiltrado(ordenCriterios).join(','),
        //       }),
        // },
      })
      setSubSectorData(respuesta.datos)
      console.log('Datos de Variables',respuesta.datos)
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
    Promise.all([
      obtenerTipoGraficoPeticion(),
      obtenerGraficoPeticion(),
    ])
      .then(() => {
        obtenerSubSectoVariablesrPeticion()
          .catch(() => {})
          .finally(() => {})
      })
      .catch(() => {})
      .finally(() => {})
  }, [pagina, limite, filtroSubSector])

//   useEffect(() => {
//      if (!mostrarFiltroSubSector) {
//          setFiltroSubSector('')
//      }
//   }, [mostrarFiltroSubSector])

/// Contenido del data table
const row = [
  { id: '1', nombre: 'CIUDADANO' },
  { id: '2', nombre: 'FISCAL' },
  { id: '3', nombre: 'GENERAL' },
  { id: '4', nombre: 'GENERO' },
];
console.log('SubSectorDatoa',subSectorData)
const contenidoTabla: Array<Array<ReactNode>> = subSectorData.map(
    (subSectorData, indexSubSector) => [
        <Accordion >
        <AccordionSummary
          expandIcon={<span className="material-icons">expand_more</span>}
          aria-controls="panel3-content"
          id="panel3-header"
        >
          {`${subSectorData.nombre} `}
        </AccordionSummary>
        <AccordionDetails>

        <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell align="right"></TableCell>  
                    {/* <TableCell align="right">Amount</TableCell>
                    <TableCell align="right">Total price ($)</TableCell> */}
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
                          {/* <Typography
                            component={'div'}
                            key={`${varriableDataRow.id}-estado`}
                           > 
                            <CustomMensajeEstado
                              titulo={varriableDataRow.estado}
                              descripcion={varriableDataRow.estado}
                              color={
                                varriableDataRow.estado == 'ACTIVO'
                                  ? 'success'
                                  : varriableDataRow.estado == 'INACTIVO'
                                    ? 'error'
                                    : 'info'
                              }
                            />
                         </Typography>,   */}

                         <Tooltip 
                           style={{ backgroundColor: varriableDataRow.estado == 'ACTIVO'
                                                     ? '#eaf8f4'
                                                    : varriableDataRow.estado == 'INACTIVO'
                                                    ? '#fdf4f6'
                                                    : '#ebf5ff',
                                    color: varriableDataRow.estado == 'ACTIVO'
                                           ? '#30B082'
                                           : varriableDataRow.estado == 'INACTIVO'
                                           ? '#DE486C'
                                           : '#0288d1',
                                    fontSize: '12px'               }}
                           title={varriableDataRow.estado} arrow>
                           <Button>{varriableDataRow.estado}</Button>
                         </Tooltip>
                        {/* <Stack
                          key={`${varriableDataRow.id}-acciones`}
                          direction={'row'}
                          alignItems={'right'}
                         > */}
                           <CustomSwitch
                            id={`cambiarEstadoUsuario-${varriableDataRow.id}`}
                            titulo={varriableDataRow.estado == 'ACTIVO' ? 'Inactivar' : 'Activar'}
                            accion={() => {
                              editarEstadoVariablesModal(varriableDataRow)
                            }}
                            desactivado={varriableDataRow.estado == 'PENDIENTE'}
                            color={varriableDataRow.estado == 'ACTIVO' ? 'success' : 'error'}
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
                                editarVariableModal(varriableDataRow,varriableDataRow.graficos)
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
                      {/* <TableCell align="right">{historyRow.amount}</TableCell>
                      <TableCell align="right">
                        {Math.round(historyRow.amount * historyRow.price * 100) / 100}
                      </TableCell> */}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
             

        </AccordionDetails>
        <AccordionActions>
          {/* <Button>Cancel</Button> */}
          {/* <Button>Añadir</Button> */}
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


    //   <Typography key={`${subSectorData.id}-${indexSubSector}-nombre`}>
    //     {`${subSectorData.nombre} `}
    //   </Typography>,

    //   <div key={`${subSectorData.id}-${indexSubSector}-nombreCorto`}>
    //     <Typography variant={'body2'}>{`${subSectorData.nombreCorto} `}</Typography>
    //   </div>,

    // <div key={`${subSectorData.id}-${indexSubSector}-posicion`}>
    // <Typography variant={'body2'}>{`${subSectorData.posicion} `}</Typography>
    // </div>,

    //   <div key={`${subSectorData.id}-${indexSubSector}-subsector`}>
    //     <Typography
    //       variant={'body2'}
    //     >{`${subSectorData.subsector.nombre} `}</Typography>
    //   </div>,
 
    //    <div key={`${subSectorData.id}-${indexSubSector}-graficos`}>
    //     <Typography
    //        variant={'body2'}
    //      >{`${subSectorData.graficos.titulo} `}</Typography>
    //    </div>,

    //   <Typography
    //     component={'div'}
    //     key={`${subSectorData.id}-${indexSubSector}-estado`}
    //   >
    //     <CustomMensajeEstado
    //       titulo={subSectorData.estado}
    //       descripcion={subSectorData.estado}
    //       color={
    //         subSectorData.estado == 'ACTIVO'
    //           ? 'success'
    //           : subSectorData.estado == 'INACTIVO'
    //             ? 'error'
    //             : 'info'
    //       }
    //     />
    //   </Typography>,

    //   <Stack
    //     key={`${subSectorData.id}-${subSectorData}-acciones`}
    //     direction={'row'}
    //     alignItems={'center'}
    //   >
    //     <CustomSwitch
    //       id={`cambiarEstadoUsuario-${subSectorData.id}`}
    //       titulo={subSectorData.estado == 'ACTIVO' ? 'Inactivar' : 'Activar'}
    //       accion={() => {
    //         editarEstadoVariablesModal(subSectorData)
    //       }}
    //       desactivado={subSectorData.estado == 'PENDIENTE'}
    //       color={subSectorData.estado == 'ACTIVO' ? 'success' : 'error'}
    //       marcado={subSectorData.estado == 'ACTIVO'}
    //       name={
    //         subSectorData.estado == 'ACTIVO'
    //           ? 'Inactivar Variable'
    //           : 'Activar Variable'
    //       }
    //     />
    //     <IconoTooltip
    //       id={`editarVariable-${subSectorData.id}`}
    //       titulo={'Editar'}
    //       color={'warning'}
    //       accion={() => {
    //         imprimir(`Editaremos`, subSectorData)
    //         editarVariableModal(subSectorData)
    //       }}
    //       icono={'edit'}
    //       name={'Editar variable'}
    //     />

    //    <IconoTooltip
    //       id={`editarVariable-${subSectorData.id}`}
    //       titulo={'Eliminar'}
    //       color={'error'}
    //       accion={() => {
    //         eliminarVariableModal(subSectorData)
    //       }}
    //       icono={'delete'}
    //       name={'Eliminar variable'}
    //     />
    //   </Stack>,
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

  const editarVariableModal = (variable: VariablesType, grafico:GraficosVarType) => {
    console.log('Variable para modal',variable)
    console.log('grafico para modal',grafico)
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
        mensaje:'Registro eliminado con éxito',// InterpreteMensajes(respuesta),
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
        texto={`¿Está seguro de ${'eliminar la variable '
        }  ${titleCase(variableEdicion?.nombre ?? '')} ?`}
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
        maxWidth = {"md"}
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
      {/* <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          Accordion 1
        </AccordionSummary>
        <AccordionDetails>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
          malesuada lacus ex, sit amet blandit leo lobortis eget.
        </AccordionDetails>
      </Accordion>


      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2-content"
          id="panel2-header"
        >
          Accordion 2
        </AccordionSummary>
        <AccordionDetails>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
          malesuada lacus ex, sit amet blandit leo lobortis eget.
        </AccordionDetails>
      </Accordion> */}


      {/* <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel3-content"
          id="panel3-header"
        >
          Accordion Actions
        </AccordionSummary>
        <AccordionDetails>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
          malesuada lacus ex, sit amet blandit leo lobortis eget.
        </AccordionDetails>
        <AccordionActions>
          <Button>Cancel</Button>
          <Button>Agree</Button>
        </AccordionActions>
      </Accordion> */}



      
     

      {contenidoTabla}
    </div>
  );
}

