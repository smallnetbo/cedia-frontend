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
import { ItemsCRUDType, VariablesType } from './types/itemsCRUDTypes'
import { IconoTooltip } from '@/components/botones/IconoTooltip'
import { imprimir } from '@/utils/imprimir'
import { BotonBuscar } from '@/components/botones/BotonBuscar'
import { BotonOrdenar } from '@/components/botones/BotonOrdenar'
import { IconoBoton } from '@/components/botones/IconoBoton'
import { delay, InterpreteMensajes, siteName, titleCase } from '@/utils'
import { AlertDialog } from '@/components/modales/AlertDialog'
import { CustomDialog } from '@/components/modales/CustomDialog'
import { FiltroItem } from './ui/FiltroItems'
import { useAlerts, useSession } from '@/hooks'
import { Constantes } from '@/config/Constantes'
import { ordenFiltrado } from '@/components/datatable/utils'
import { useAuth } from '@/context/AuthProvider'
import CustomMensajeEstado from '@/components/estados/CustomMensajeEstado'
import { CustomSwitch } from '@/components/botones/CustomSwitch'

export default function ItemsPage() {
  const [itemsData, setItemsData] = useState<ItemsCRUDType[]>([])
  const [variablesData, setVariablesData] = useState<VariablesType[]>([])

  const [loading, setLoading] = useState<boolean>(true)
  // Hook para mostrar alertas
  const { Alerta } = useAlerts()
  const [errorData, setErrorData] = useState<any>()
  const [modalItem, setModalItem] = useState(false)

  const [mostrarAlertaEstadoItem, setMostrarAlertaEstadoItem] = useState(false)

  const [mostrarAlertaEliminarItem, setMostrarAlertaEliminarItem] =
    useState(false)

  const [itemEdicion, setItemEdicion] = useState<
    ItemsCRUDType | undefined | null
  >()

  const [limite, setLimite] = useState<number>(10)
  const [pagina, setPagina] = useState<number>(1)
  const [total, setTotal] = useState<number>(0)

  const [filtroItem, setFiltroItem] = useState<string>('')

  const [mostrarFiltroItem, setMostrarFiltroItem] = useState(false)

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
    { campo: 'color', nombre: 'Color' },
    { campo: 'icono', nombre: 'Icono' },
    { campo: 'posicion', nombre: 'Posición' },
    { campo: 'esAgrupador', nombre: 'Es Agrupador' },
    { campo: 'variables', nombre: 'Variable' },
    { campo: 'estado', nombre: 'Estado' },
    { campo: 'acciones', nombre: 'Acciones' },
  ])

  /// Contenido del data table
  const contenidoTabla: Array<Array<ReactNode>> = itemsData.map(
    (itemsData, indexItem) => [
      <Typography key={`${itemsData.id}-${indexItem}-nombre`}>
        {`${itemsData.nombre} `}
      </Typography>,
      <div key={`${itemsData.id}-${indexItem}-color`}>
        <Typography variant={'body2'}>{`${itemsData.color} `}</Typography>
      </div>,

      <div key={`${itemsData.id}-${indexItem}-icono`}>
        <Typography variant={'body2'}>{`${itemsData.icono} `}</Typography>
      </div>,

      <div key={`${itemsData.id}-${indexItem}-posicion`}>
        <Typography variant={'body2'}>{`${itemsData.posicion} `}</Typography>
      </div>,

      <Typography
        component={'div'}
        key={`${itemsData.id}-${indexItem}-esAgrupador`}
      >
        <CustomMensajeEstado
          titulo={itemsData.esAgrupador ? 'Si' : 'No'}
          descripcion={
            itemsData.esAgrupador ? 'Es Agrupador' : 'No es Agrupador'
          }
          color={itemsData.esAgrupador ? 'success' : 'error'}
        />
      </Typography>,

      <div key={`${itemsData.id}-${indexItem}-variables`}>
        <Typography
          variant={'body2'}
        >{`${itemsData.variables.nombre} `}</Typography>
      </div>,

      <Typography component={'div'} key={`${itemsData.id}-${indexItem}-estado`}>
        <CustomMensajeEstado
          titulo={itemsData.estado}
          descripcion={itemsData.estado}
          color={
            itemsData.estado == 'ACTIVO'
              ? 'success'
              : itemsData.estado == 'INACTIVO'
                ? 'error'
                : 'info'
          }
        />
      </Typography>,

      <Stack
        key={`${itemsData.id}-${itemsData}-acciones`}
        direction={'row'}
        alignItems={'center'}
      >
        <CustomSwitch
          id={`cambiarEstadoUsuario-${itemsData.id}`}
          titulo={itemsData.estado == 'ACTIVO' ? 'Inactivar' : 'Activar'}
          accion={() => {
            editarEstadoItemModal(itemsData)
          }}
          desactivado={itemsData.estado == 'PENDIENTE'}
          color={itemsData.estado == 'ACTIVO' ? 'success' : 'error'}
          marcado={itemsData.estado == 'ACTIVO'}
          name={
            itemsData.estado == 'ACTIVO' ? 'Inactivar Item' : 'Activar Item'
          }
        />
        <IconoTooltip
          id={`editarItem-${itemsData.id}`}
          titulo={'Editar'}
          color={'warning'}
          accion={() => {
            imprimir(`Editaremos`, itemsData)
            editarItemModal(itemsData)
          }}
          icono={'edit'}
          name={'Editar Item'}
        />

        <IconoTooltip
          id={`eliminarItem-${itemsData.id}`}
          titulo={'Eliminar'}
          color={'error'}
          accion={() => {
            eliminarItemModal(itemsData)
          }}
          icono={'delete'}
          name={'Eliminar Item'}
        />
      </Stack>,
    ]
  )

  /// Acciones para data table
  const acciones: Array<ReactNode> = [
    <BotonBuscar
      id={'accionFiltrarItemToggle'}
      key={'accionFiltrarItemToggle'}
      seleccionado={mostrarFiltroItem}
      cambiar={setMostrarFiltroItem}
    />,
    xs && (
      <BotonOrdenar
        id={'ordenarItem'}
        key={`ordenarItem`}
        label={'Ordenar Item'}
        criterios={ordenCriterios}
        cambioCriterios={setOrdenCriterios}
      />
    ),

    <IconoBoton
      id={'agregarItem'}
      key={'agregarItem'}
      texto={'Agregar'}
      variante={xs ? 'icono' : 'boton'}
      icono={'add_circle_outline'}
      descripcion={'Agregar Item'}
      accion={() => {
        agregarItemModal()
      }}
    />,
  ]

  /// obtener lista de item
  const obtenerItemsPeticion = async () => {
    try {
      setLoading(true)

      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/items/todos`,
        params: {
          pagina: pagina,
          limite: limite,
          ...(filtroItem.length == 0 ? {} : { filtro: filtroItem }),
          ...(ordenFiltrado(ordenCriterios).length == 0
            ? {}
            : {
                orden: ordenFiltrado(ordenCriterios).join(','),
              }),
        },
      })
      setItemsData(respuesta.datos?.filas)
      setTotal(respuesta.datos?.total)
      setErrorData(null)
    } catch (e) {
      imprimir(`Error al obtener item`, e)
      setErrorData(e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  /// cambiar el estado de item
  const cambiarEstadoItemPeticion = async (item: ItemsCRUDType) => {
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
      await obtenerItemsPeticion()
    } catch (e) {
      imprimir(`Error al inactivar item`, e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  /// Elimina una item
  const eliminarItemPeticion = async (item: ItemsCRUDType) => {
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
      await obtenerItemsPeticion()
    } catch (e) {
      imprimir(`Error al eliminar item`, e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  /// Petición para obtener las variables
  const obtenerVariablesPeticion = async () => {
    try {
      setLoading(true)
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/variables`,
      })
      setVariablesData(respuesta.datos)
      setErrorData(null)
    } catch (e) {
      imprimir(`Error al obtener variables`, e)
      setErrorData(e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
      throw e
    } finally {
      setLoading(false)
    }
  }

  const agregarItemModal = () => {
    setItemEdicion(null)
    setModalItem(true)
  }

  const editarEstadoItemModal = (item: ItemsCRUDType) => {
    setItemEdicion(item)
    setMostrarAlertaEstadoItem(true)
  }

  const eliminarItemModal = (item: ItemsCRUDType) => {
    setItemEdicion(item)
    setMostrarAlertaEliminarItem(true)
  }

  const editarItemModal = (item: ItemsCRUDType) => {
    setItemEdicion(item)
    setModalItem(true)
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

  const cerrarModalItem = async () => {
    setModalItem(false)
    await delay(500)
    setItemEdicion(null)
  }

  /// Método que define permisos por rol desde la sesión
  const definirPermisos = async () => {
    setPermisos(await permisoUsuario(pathname))
  }
  useEffect(() => {
    imprimir('items..')
    definirPermisos().finally()
  }, [])

  useEffect(() => {
    Promise.all([obtenerVariablesPeticion()])
      .then(() => {
        obtenerItemsPeticion()
          .catch(() => {})
          .finally(() => {})
      })
      .catch(() => {})
      .finally(() => {})
  }, [pagina, limite, filtroItem])

  useEffect(() => {
    if (!mostrarFiltroItem) {
      setFiltroItem('')
    }
  }, [mostrarFiltroItem])

  return (
    <>
      <title>{`Item - ${siteName()}`}</title>

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

      {/* Alerta que pregunta si desea eliminar item */}
      <AlertDialog
        isOpen={mostrarAlertaEliminarItem}
        titulo={'Alerta'}
        texto={`¿Está seguro de ${'eliminar el item '}  ${titleCase(itemEdicion?.nombre ?? '')} ?`}
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
        handleClose={cerrarModalItem}
        title={itemEdicion ? 'Editar Item' : 'Nuevo Item'}
      >
        {/* <VistaModalItem
           item={itemEdicion}
           variables={variablesData}
           accionCorrecta={() => {
            cerrarModalItem().finally()
            obtenerItemsPeticion().finally()
          }}
          accionCancelar={cerrarModalItem}
         />   */}
      </CustomDialog>

      <CustomDataTable
        titulo={'Items'}
        error={!!errorData}
        cargando={loading}
        acciones={acciones}
        columnas={ordenCriterios}
        cambioOrdenCriterios={setOrdenCriterios}
        contenidoTabla={contenidoTabla}
        filtros={
          mostrarFiltroItem && (
            <FiltroItem
              filtroNombre={filtroItem}
              accionCorrecta={(filtros) => {
                setPagina(1)
                setLimite(10)
                setFiltroItem(filtros.nombre)
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
