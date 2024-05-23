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
    ItemsType,
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
 import { VistaModalVaribles } from '../variables/ui/ModalVariables'
 import { VistaModalItem } from '../items/ui/ModalItem' 

export default function ItemsView() {
    const storedData = localStorage?.getItem('fichaStorage');
  const initialFicha = storedData ? JSON.parse(storedData) : null;
  const [ficha, setFichaNewData] = useState<CrearEditarFichaType>(initialFicha)
  const [subSectorData, setSubSectorData] = useState<SubSectorCRUDType[]>([])
  const [itemEdicion, setItemEdicion] = useState<
  ItemsType | undefined | null
  >()
  const [graficoData, setGraficoData] = useState<GraficoType[]>([])
  const [idVariableData, setIdVariableData] = useState<string>('')

  const [mostrarAlertaEstadoItem, setMostrarAlertaEstadoItem] =
    useState(false)
    const [mostrarAlertaEliminarItem, setMostrarAlertaEliminarItem] =
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
  const [modalItem, setModalItem] = useState(false)


  /// obtener lista de sub sector
  const obtenerSubSectorVariablesItemsPeticion = async () => {
    try {
      setLoading(true)
      console.log('Ficha id',ficha.id)
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/subsector/variables/itemlist${
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
      console.log('Datos de Variables list items ',respuesta.datos)
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
      //obtenerSectorPeticion(),
      obtenerGraficoPeticion(),
    ])
      .then(() => {
        obtenerSubSectorVariablesItemsPeticion()
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
          expandIcon={<ExpandMoreIcon />}
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
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subSectorData.variables
                   .filter((varriableDataRow) => !varriableDataRow.esEliminado)
                   .map((varriableDataRow) => (
                    <TableRow key={varriableDataRow.id}>
                      <TableCell component="th" scope="row">
                        {/* {varriableDataRow.nombre} */}
                        <Accordion >
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel3-content"
                            id="panel3-header"
                            >
                            {`${varriableDataRow.nombre} `}
                          </AccordionSummary>
                            <AccordionDetails>
                                {/* Listado de items */}
                            <Table size="small" aria-label="purchases">
                                <TableHead>
                                <TableRow>
                                    <TableCell></TableCell>
                                    <TableCell align="right"></TableCell>  
                                </TableRow>
                                </TableHead>
                             <TableBody>
                                {varriableDataRow.items
                                .filter((itemDataRow) => !itemDataRow.esEliminado)
                                .map((itemDataRow) => (
                                <TableRow key={itemDataRow.id}>
                                    <TableCell component="th" scope="row">
                                        {itemDataRow.nombre}
                                    </TableCell>
                                    <TableCell align="right">
                                    <Tooltip 
                                        style={{ backgroundColor: itemDataRow.esAgrupador
                                                        ? '#eaf8f4'
                                                        : '#fdf4f6'
                                                       ,
                                                color: itemDataRow.esAgrupador
                                                        ? '#30B082'
                                                        :  '#DE486C',
                                                
                                                        fontSize: '12px'               }}
                                        title={itemDataRow.esAgrupador? 'Es agrupador':'No es agrupador'} arrow>
                                        <Button>{itemDataRow.esAgrupador? 'Es agrupador':'No es agrupador'}</Button>
                                        </Tooltip>
                                        &nbsp;
                                        <Tooltip 
                                        style={{ backgroundColor: itemDataRow.estado == 'ACTIVO'
                                                        ? '#eaf8f4'
                                                        : itemDataRow.estado == 'INACTIVO'
                                                        ? '#fdf4f6'
                                                        : '#ebf5ff',
                                                color: itemDataRow.estado == 'ACTIVO'
                                                        ? '#30B082'
                                                        : itemDataRow.estado == 'INACTIVO'
                                                        ? '#DE486C'
                                                        : '#0288d1',
                                                        fontSize: '12px'               }}
                                        title={itemDataRow.estado} arrow>
                                        <Button>{itemDataRow.estado}</Button>
                                        </Tooltip>
                        
                                        <CustomSwitch
                                            id={`cambiarEstadoUsuario-${itemDataRow.id}`}
                                            titulo={itemDataRow.estado == 'ACTIVO' ? 'Inactivar' : 'Activar'}
                                            accion={() => {
                                              editarEstadoItemModal(itemDataRow)
                                            }}
                                            desactivado={itemDataRow.estado == 'PENDIENTE'}
                                            color={itemDataRow.estado == 'ACTIVO' ? 'success' : 'error'}
                                            marcado={itemDataRow.estado == 'ACTIVO'}
                                            name={
                                                itemDataRow.estado == 'ACTIVO'
                                                ? 'Inactivar Item'
                                                : 'Activar Item'
                                            }
                                        /> 
                                        <IconoTooltip
                                            id={`editarItem-${itemDataRow.id}`}
                                            titulo={'Editar'}
                                            color={'warning'}
                                            accion={() => {
                                                imprimir(`Editaremos`, itemDataRow)
                                                editarItemModal(itemDataRow)
                                            }}
                                            icono={'edit'}
                                            name={'Editar Item'}
                                        /> 

                                        <IconoTooltip
                                            id={`editarItem-${itemDataRow.id}`}
                                            titulo={'Eliminar'}
                                            color={'error'}
                                            accion={() => {
                                                eliminarItemModal(itemDataRow)
                                            }}
                                            icono={'delete'}
                                            name={'Eliminar item'}
                                        />
                        

                                    </TableCell>
                      
                                </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                 {/* Fin Listado de items */}


                            
                            </AccordionDetails>
                            <AccordionActions>
                            <IconoBoton
                                id={'agregarVariable'}
                                key={'agregarVariable'}
                                texto={'+ Nuevo'}
                                variante={xs ? 'icono' : 'boton'}
                                icono={'add_circle_outline'}
                                descripcion={'Agregar Items'}
                                accion={() => {
                                  agregarItemsModal(varriableDataRow.id)
                                }}
                            />
                            </AccordionActions>
                        </Accordion>
                      </TableCell>
                      {/* <TableCell align="right">
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
                                editarVariableModal(varriableDataRow)
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
                      </TableCell> */}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
             

        </AccordionDetails>
        {/* <AccordionActions>
          <IconoBoton
            id={'agregarVariable'}
            key={'agregarVariable'}
            texto={'Agregar'}
            variante={xs ? 'icono' : 'boton'}
            icono={'add_circle_outline'}
            descripcion={'Agregar Variable'}
            accion={() => {
              agregarVariableModal(subSectorData.id)
            }}
          />
        </AccordionActions> */}
      </Accordion>,
    ]
  )
  const agregarItemsModal = (idVariable: string) => {
    setItemEdicion(null)
    setModalItem(true)
    setIdVariableData(idVariable)
  }
  const editarEstadoItemModal = (item: ItemsType) => {
    setItemEdicion(item)
    setMostrarAlertaEstadoItem(true)
  }

  const eliminarItemModal = (item: ItemsType) => {
    setItemEdicion(item)
    setMostrarAlertaEliminarItem(true)
  }
  const aceptarAlertaEliminarItem = async () => {
    setMostrarAlertaEliminarItem(false)
    if (itemEdicion) {
      await eliminarItemPeticion(itemEdicion)
    }
    setItemEdicion(null)
  }
  const cancelarAlertaEliminarItem = async () => {
    setMostrarAlertaEliminarItem(false)
    await delay(500)
    setItemEdicion(null)
  }


  const aceptarAlertaEstadoItem = async () => {
    setMostrarAlertaEstadoItem(false)
    if (itemEdicion) {
      await cambiarEstadoItemPeticion(itemEdicion)
    }
    setItemEdicion(null)
  }

  const cancelarAlertaEstadoItem = async () => {
    setMostrarAlertaEstadoItem(false)
    await delay(500)
    setItemEdicion(null)
  }
  const cerrarModalSubSector = async () => {
    setModalItem(false)
    await delay(500)
    setItemEdicion(null)
  }

  const editarItemModal = (item: ItemsType) => {
    setItemEdicion(item)
    setModalItem(true)
  }

  /// cambiar el estado de item
  const cambiarEstadoItemPeticion = async (item: ItemsType) => {
    try {
      //setLoading(true)
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/items/${item.id}/${
            item.estado == 'ACTIVO' ? 'inactivacion' : 'activacion'
        }`,
        method: 'patch',
      })
      imprimir(`respuesta inactivar item: ${respuesta}`)
      Alerta({
        mensaje: InterpreteMensajes(respuesta),
        variant: 'success',
      })
      await obtenerSubSectorVariablesItemsPeticion()
    } catch (e) {
      imprimir(`Error al inactivar item`, e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  /// Elimina una item
  const eliminarItemPeticion = async (item: ItemsType) => {
    try {
      //setLoading(true)
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/items/${item.id}/eliminar`,
        method: 'patch',
      })
      imprimir(`respuesta eliminar item: ${respuesta}`)
      Alerta({
        mensaje:'Registro eliminado con éxito',// InterpreteMensajes(respuesta),
        variant: 'success',
      })
      await obtenerSubSectorVariablesItemsPeticion()
    } catch (e) {
      imprimir(`Error al eliminar item`, e)
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



  return (
    <>
    <title>{`Items - ${siteName()}`}</title>
    <div style={{ borderBottom: '50px solid #FAFAFA' }}>
      <AlertDialog
        isOpen={mostrarAlertaEstadoItem}
        titulo={'Alerta'}
        texto={`¿Está seguro de ${
            itemEdicion?.estado == 'ACTIVO' ? 'inactivar' : 'activar'
        } el item: ${titleCase(itemEdicion?.nombre ?? '')} ?`}
      >
        <Button variant={'outlined'} onClick={cancelarAlertaEstadoItem}>
          Cancelar
        </Button>
        <Button variant={'contained'} onClick={aceptarAlertaEstadoItem}>
          Aceptar
        </Button>
      </AlertDialog>

      {/* Alerta que pregunta si desea eliminar variable */}
      <AlertDialog
        isOpen={mostrarAlertaEliminarItem}
        titulo={'Alerta'}
        texto={`¿Está seguro de ${'eliminar el item: '
        }  ${titleCase(itemEdicion?.nombre ?? '')} ?`}
      >
        <Button variant={'outlined'} onClick={cancelarAlertaEliminarItem}>
          Cancelar
        </Button>
        <Button variant={'contained'} onClick={aceptarAlertaEliminarItem}>
          Aceptar
        </Button>
      </AlertDialog>

      <CustomDialog
        isOpen={modalItem}
        handleClose={cerrarModalSubSector}
        title={itemEdicion ? 'Editar Item' : 'Nuevo Item'}
      >
          <VistaModalItem
            idVariable={idVariableData}
            //variable={variableEdicion}
            item={itemEdicion}
           // variables={variablesData} //Para el select
           // subsector={subSectorData}
           // graficos={graficoData}
            accionCorrecta={() => {
                cerrarModalSubSector().finally()
                obtenerSubSectorVariablesItemsPeticion().finally()
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
    </>
  );
}

