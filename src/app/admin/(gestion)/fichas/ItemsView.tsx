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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Button from '@mui/material/Button'
import { useAlerts, useSession } from '@/hooks'
import { useAuth } from '@/context/AuthProvider'
import { usePathname } from 'next/navigation'
import { Constantes } from '@/config/Constantes'
import { CrearEditarFichaType } from './types/fichaCRUDTypes'
import {
  SubSectorCRUDType,
  ItemsType,
} from '../subsector/types/subSectorCRUDTypes'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import { AlertDialog } from '@/components/modales/AlertDialog'
import { CustomDialog } from '@/components/modales/CustomDialog'
import { GraficoType } from '../variables/types/variablesCRUDTypes'
import { VistaModalItem } from '../items/ui/ModalItem'
import { TipoDatoType } from '../items/types/tipoDatoTypes'
import { Servicios } from '@/services'

export default function ItemsView() {
  const storedData = localStorage?.getItem('fichaStorage')
  const initialFicha = storedData ? JSON.parse(storedData) : null
  const [ficha, setFichaNewData] = useState<CrearEditarFichaType>(initialFicha)
  const [subSectorData, setSubSectorData] = useState<SubSectorCRUDType[]>([])
  const [itemEdicion, setItemEdicion] = useState<ItemsType | undefined | null>()
  const [estadoCruceVariable, setEstadoCruceVariable] = useState(false)
  const [graficoData, setGraficoData] = useState<GraficoType[]>([])
  const [tipoDato, setTipoDato] = useState<TipoDatoType[]>([])
  const [idVariableData, setIdVariableData] = useState<string>('')

  const [mostrarAlertaEstadoItem, setMostrarAlertaEstadoItem] = useState(false)
  const [mostrarAlertaCruceVariable, setMostrarAlertaCruceVariable] =
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

      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/subsector/variables/itemlist${
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

  const listarTipoDato = async () => {
    try {
      setLoading(true)
      const respuesta = await Servicios.get({
        url: `${Constantes.baseUrl}/tipoDato/`,
      })
      setTipoDato(respuesta.datos)
    } catch (e) {
      imprimir(`Error al obtener la informacion`, e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
      throw e
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    listarTipoDato()
  }, [])
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

  const contenidoTabla: Array<Array<ReactNode>> = subSectorData.map(
    (subSectorData, indexSubSector) => [
      <Accordion key={`${subSectorData.id}-${indexSubSector}-Accordion`}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel3-content"
          id="panel3-header"
        >
          {`${subSectorData.nombre}`}
        </AccordionSummary>
        <AccordionDetails>
          <Table size="small" aria-label="variables">
            <TableBody>
              {subSectorData.variables
                .filter((varriableDataRow) => !varriableDataRow.esEliminado)
                .map((varriableDataRow) => (
                  <TableRow key={varriableDataRow.id}>
                    <TableCell component="th" scope="row">
                      <Accordion>
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          aria-controls="panel3-content"
                          id="panel3-header"
                        >
                          {`${varriableDataRow.nombre}`}
                        </AccordionSummary>
                        <AccordionDetails>
                          <Table size="small" aria-label="items">
                            {/* Encabezado de acciones */}
                            <TableHead>
                              <TableRow>
                                <TableCell>Nombre</TableCell>
                                <TableCell align="center">Agrupador</TableCell>
                                <TableCell align="center">Estado</TableCell>
                                <TableCell align="center">
                                  Cruce Variable
                                </TableCell>
                                <TableCell align="center">Acciones</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {varriableDataRow.items
                                .filter(
                                  (itemDataRow) => !itemDataRow.esEliminado
                                )
                                .map((itemDataRow) => (
                                  <TableRow key={itemDataRow.id}>
                                    <TableCell component="th" scope="row">
                                      {itemDataRow.nombre}
                                    </TableCell>
                                    <TableCell align="center">
                                      <Tooltip
                                        title={
                                          itemDataRow.esAgrupador
                                            ? 'Es agrupador'
                                            : 'No es agrupador'
                                        }
                                        arrow
                                      >
                                        <Button
                                          style={{
                                            backgroundColor:
                                              itemDataRow.esAgrupador
                                                ? '#eaf8f4'
                                                : '#fdf4f6',
                                            color: itemDataRow.esAgrupador
                                              ? '#30B082'
                                              : '#DE486C',
                                            fontSize: '12px',
                                          }}
                                        >
                                          {itemDataRow.esAgrupador
                                            ? 'Sí'
                                            : 'No'}
                                        </Button>
                                      </Tooltip>
                                    </TableCell>
                                    <TableCell align="center">
                                      <Tooltip title={itemDataRow.estado} arrow>
                                        <Button
                                          style={{
                                            backgroundColor:
                                              itemDataRow.estado === 'ACTIVO'
                                                ? '#eaf8f4'
                                                : itemDataRow.estado ===
                                                    'INACTIVO'
                                                  ? '#fdf4f6'
                                                  : '#ebf5ff',
                                            color:
                                              itemDataRow.estado === 'ACTIVO'
                                                ? '#30B082'
                                                : itemDataRow.estado ===
                                                    'INACTIVO'
                                                  ? '#DE486C'
                                                  : '#0288d1',
                                            fontSize: '12px',
                                          }}
                                        >
                                          {itemDataRow.estado}
                                        </Button>
                                      </Tooltip>
                                      <CustomSwitch
                                        id={`cambiarEstadoUsuario-${itemDataRow.id}`}
                                        titulo={
                                          itemDataRow.estado === 'ACTIVO'
                                            ? 'Inactivar'
                                            : 'Activar'
                                        }
                                        accion={() =>
                                          editarEstadoItemModal(itemDataRow)
                                        }
                                        desactivado={
                                          itemDataRow.estado === 'PENDIENTE'
                                        }
                                        color={
                                          itemDataRow.estado === 'ACTIVO'
                                            ? 'success'
                                            : 'error'
                                        }
                                        marcado={
                                          itemDataRow.estado === 'ACTIVO'
                                        }
                                        name={
                                          itemDataRow.estado == 'ACTIVO'
                                            ? 'Inactivar Item'
                                            : 'Activar Item'
                                        }
                                      />
                                    </TableCell>
                                    <TableCell align="center">
                                      <CustomSwitch
                                        id={`mostrarCruceVariable-${itemDataRow.id}`}
                                        titulo={
                                          itemDataRow.cruceVariable
                                            ? 'Inactivar'
                                            : 'Activar'
                                        }
                                        accion={() =>
                                          editarItemCruceVariableModal(
                                            itemDataRow,
                                            !itemDataRow.cruceVariable
                                          )
                                        }
                                        color={
                                          itemDataRow.cruceVariable
                                            ? 'success'
                                            : 'error'
                                        }
                                        marcado={itemDataRow.cruceVariable}
                                        name={
                                          itemDataRow.cruceVariable
                                            ? 'Inactivar Item'
                                            : 'Activar Item'
                                        }
                                      />
                                    </TableCell>
                                    <TableCell align="center">
                                      <IconoTooltip
                                        id={`editarItem-${itemDataRow.id}`}
                                        titulo="Editar"
                                        color="warning"
                                        accion={() => {
                                          imprimir(`Editaremos`, itemDataRow)
                                          editarItemModal(itemDataRow)
                                        }}
                                        icono={'edit'}
                                        name={'Editar Item'}
                                      />
                                      <IconoTooltip
                                        id={`eliminarItem-${itemDataRow.id}`}
                                        titulo="Eliminar"
                                        color="error"
                                        accion={() => {
                                          eliminarItemModal(itemDataRow)
                                        }}
                                        icono={'delete'}
                                        name={'Eliminar Item'}
                                      />
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
                            descripcion={'Agregar Items'}
                            accion={() =>
                              agregarItemsModal(varriableDataRow.id)
                            }
                          />
                        </AccordionActions>
                      </Accordion>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </AccordionDetails>
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
  const editarItemCruceVariableModal = (
    item: ItemsType,
    estadoCruceVariable: boolean
  ) => {
    setItemEdicion(item)
    setEstadoCruceVariable(estadoCruceVariable)
    setMostrarAlertaCruceVariable(true)
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

  const aceptarAlertaEstadoItemCruceVariable = async () => {
    setMostrarAlertaCruceVariable(false)
    if (itemEdicion) {
      await actualizarEstadoCruceVariable(itemEdicion, estadoCruceVariable)
    }
    setItemEdicion(null)
  }

  const cancelarAlertaEstadoItemCruceVariable = async () => {
    setMostrarAlertaCruceVariable(false)
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
  const actualizarEstadoCruceVariable = async (
    item: ItemsType,
    nuevoEstado: boolean
  ) => {
    try {
      setLoading(true)

      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/items/${item.id}/activacionCruceVariable`,
        method: 'PATCH',
        body: { estado: nuevoEstado },
      })

      imprimir(
        `Respuesta actualizar estado cruce variable: ${JSON.stringify(respuesta)}`
      )

      Alerta({
        mensaje: InterpreteMensajes(respuesta),
        variant: 'success',
      })

      await obtenerSubSectorVariablesItemsPeticion()
    } catch (e) {
      imprimir(`Error al actualizar estado cruce variable:`, e)
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
        mensaje: 'Registro eliminado con éxito', // InterpreteMensajes(respuesta),
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

        <AlertDialog
          isOpen={mostrarAlertaCruceVariable}
          titulo={'Alerta'}
          texto={`El item: ${titleCase(itemEdicion?.nombre ?? '')} ${
            itemEdicion?.cruceVariable
              ? 'No se mostrará en cruce de variable'
              : 'Se mostrará en cruce de variable'
          }`}
        >
          <Button
            variant={'outlined'}
            onClick={cancelarAlertaEstadoItemCruceVariable}
          >
            Cancelar
          </Button>
          <Button
            variant={'contained'}
            onClick={aceptarAlertaEstadoItemCruceVariable}
          >
            Aceptar
          </Button>
        </AlertDialog>

        {/* Alerta que pregunta si desea eliminar variable */}
        <AlertDialog
          isOpen={mostrarAlertaEliminarItem}
          titulo={'Alerta'}
          texto={`¿Está seguro de ${'eliminar el item: '}  ${titleCase(itemEdicion?.nombre ?? '')} ?`}
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
            item={itemEdicion}
            tipoDato={tipoDato}
            accionCorrecta={() => {
              cerrarModalSubSector().finally()
              obtenerSubSectorVariablesItemsPeticion().finally()
            }}
            accionCancelar={cerrarModalSubSector}
          />
        </CustomDialog>

        {contenidoTabla}
      </div>
    </>
  )
}
