'use client'

import { CustomSwitch } from '@/components/botones/CustomSwitch'
import { CustomDataTable } from '@/components/datatable/CustomDataTable'
import { CriterioOrdenType } from '@/components/datatable/ordenTypes'
import { Paginacion } from '@/components/datatable/Paginacion'
import CustomMensajeEstado from '@/components/estados/CustomMensajeEstado'
import { useAuth } from '@/context/AuthProvider'
import { useSession } from '@/hooks'
import { CasbinTypes } from '@/types'
import {
  Button,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { usePathname } from 'next/navigation'
import { ReactNode, useState } from 'react'
import { NivelGobiernoCRUDType } from './types/nivelGobiernoCRUDTypes'
import { IconoTooltip } from '@/components/botones/IconoTooltip'
import { imprimir } from '@/utils/imprimir'
import { BotonBuscar } from '@/components/botones/BotonBuscar'
import { BotonOrdenar } from '@/components/botones/BotonOrdenar'
import { IconoBoton } from '@/components/botones/IconoBoton'
import { delay, siteName, titleCase } from '@/utils'
import { AlertDialog } from '@/components/modales/AlertDialog'
import { CustomDialog } from '@/components/modales/CustomDialog'
import { VistaModalNivelGobierno } from './ui/ModalNivelGobierno'
import { FiltroNivelGobierno } from './ui/FiltroNivelGobierno'

export default function NivelDeGobiernoPage() {
  const [loading, setLoading] = useState<boolean>(true)
  const [errorData, setErrorData] = useState<any>()
  const [modalNivelGobierno, setModalNivelGobierno] = useState(false)

  const [
    mostrarAlertaEstadoNivelGobierno,
    setMostrarAlertaEstadoNivelGobierno,
  ] = useState(false)

  const [nivelGobiernoEdicion, setNivelGobiernoEdicion] = useState<
    NivelGobiernoCRUDType | undefined | null
  >()

  const [limite, setLimite] = useState<number>(10)
  const [pagina, setPagina] = useState<number>(1)
  const [total, setTotal] = useState<number>(0)

  const [filtroNivelGobierno, setFiltroNivelGobierno] = useState<string>('')

  const [mostrarFiltroNivelGobierno, setMostrarFiltroNivelGobierno] =
    useState(false)

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
    { campo: 'estado', nombre: 'Estado', ordenar: true },
    { campo: 'acciones', nombre: 'Acciones' },
  ])

  const nivelGobiernoData = [
    {
      id: 1,
      nombre: 'GD',
      estado: 'ACTIVO',
    },
    {
      id: 2,
      nombre: 'GDM',
      estado: 'ACTIVO',
    },
    {
      id: 3,
      nombre: 'GAT',
      estado: 'ACTIVO',
    },
  ]

  /// Contenido del data table
  const contenidoTabla: Array<Array<ReactNode>> = nivelGobiernoData.map(
    (nivelGobiernoData, indexNivelGobierno) => [
      <Typography key={`${nivelGobiernoData.id}`} variant={'body2'}>
        {`${nivelGobiernoData.id} `}
      </Typography>,
      <div key={`${nivelGobiernoData.id}-${nivelGobiernoData}-nombre`}>
        <Typography variant={'body2'}>
          {`${nivelGobiernoData.nombre} `}
        </Typography>
      </div>,

      <Typography
        component={'div'}
        key={`${nivelGobiernoData.id}-${nivelGobiernoData}-estado`}
      >
        <CustomMensajeEstado
          titulo={nivelGobiernoData.estado}
          descripcion={nivelGobiernoData.estado}
          color={
            nivelGobiernoData.estado == 'ACTIVO'
              ? 'success'
              : nivelGobiernoData.estado == 'INACTIVO'
                ? 'error'
                : 'info'
          }
        />
      </Typography>,

      <Stack
        key={`${nivelGobiernoData.id}-${nivelGobiernoData}-acciones`}
        direction={'row'}
        alignItems={'center'}
      >
        <CustomSwitch
          id={`cambiarEstadoNivelGobierno-${nivelGobiernoData.id}`}
          titulo={
            nivelGobiernoData.estado == 'ACTIVO' ? 'Inactivar' : 'Activar'
          }
          accion={() => {
            editarEstadoNivelGobiernoModal(nivelGobiernoData)
          }}
          desactivado={nivelGobiernoData.estado == 'PENDIENTE'}
          color={nivelGobiernoData.estado == 'ACTIVO' ? 'success' : 'error'}
          marcado={nivelGobiernoData.estado == 'ACTIVO'}
          name={
            nivelGobiernoData.estado == 'ACTIVO'
              ? 'Inactivar Nivel de Gobierno'
              : 'Activar Nivel de Gobierno'
          }
        />

        <IconoTooltip
          id={`editarNivelGobierno-${nivelGobiernoData.id}`}
          titulo={'Editar'}
          color={'warning'}
          accion={() => {
            imprimir(`Editaremos`, nivelGobiernoData)
            editarNivelGobiernoModal(nivelGobiernoData)
          }}
          icono={'edit'}
          name={'Editar nivel de gobierno'}
        />
      </Stack>,
    ]
  )

  /// Acciones para data table
  const acciones: Array<ReactNode> = [
    <BotonBuscar
      id={'accionFiltrarNivelGobiernoToggle'}
      key={'accionFiltrarNivelGobiernoToggle'}
      seleccionado={mostrarFiltroNivelGobierno}
      cambiar={setMostrarFiltroNivelGobierno}
    />,
    xs && (
      <BotonOrdenar
        id={'ordenarNivelGobierno'}
        key={`ordenarNivelGobierno`}
        label={'Ordenar Nivel De Gobierno'}
        criterios={ordenCriterios}
        cambioCriterios={setOrdenCriterios}
      />
    ),

    <IconoBoton
      id={'agregarNivelGobierno'}
      key={'agregarNivelGobierno'}
      texto={'Agregar'}
      variante={xs ? 'icono' : 'boton'}
      icono={'add_circle_outline'}
      descripcion={'Agregar nivel de gobierno'}
      accion={() => {
        agregarNivelGobiernoModal()
      }}
    />,
  ]

  const agregarNivelGobiernoModal = () => {
    setNivelGobiernoEdicion(null)
    setModalNivelGobierno(true)
  }

  const editarEstadoNivelGobiernoModal = (
    nivelGobierno: NivelGobiernoCRUDType
  ) => {
    setNivelGobiernoEdicion(nivelGobierno)
    setMostrarAlertaEstadoNivelGobierno(true)
  }

  const editarNivelGobiernoModal = (nivelGobierno: NivelGobiernoCRUDType) => {
    setNivelGobiernoEdicion(nivelGobierno)
    setModalNivelGobierno(true)
  }

  const aceptarAlertaEstadoNivelGobierno = async () => {
    setMostrarAlertaEstadoNivelGobierno(false)
    if (nivelGobiernoEdicion) {
      //await ruta endpoint para cambiar estado
      console.log(nivelGobiernoEdicion)
    }
    setNivelGobiernoEdicion(null)
  }

  const cancelarAlertaEstadoNivelGobierno = async () => {
    setMostrarAlertaEstadoNivelGobierno(false)
    await delay(500)
    setNivelGobiernoEdicion(null)
  }

  const cerrarModalNivelGobierno = async () => {
    setModalNivelGobierno(false)
    await delay(500)
    setNivelGobiernoEdicion(null)
  }
  return (
    <>
      <title>{`NivelGobierno - ${siteName()}`}</title>
      <AlertDialog
        isOpen={mostrarAlertaEstadoNivelGobierno}
        titulo={'Alerta'}
        texto={`¿Está seguro de ${
          nivelGobiernoEdicion?.estado == 'ACTIVO' ? 'inactivar' : 'activar'
        } a ${titleCase(nivelGobiernoEdicion?.nombre ?? '')} ?`}
      >
        <Button
          variant={'outlined'}
          onClick={cancelarAlertaEstadoNivelGobierno}
        >
          Cancelar
        </Button>
        <Button
          variant={'contained'}
          onClick={aceptarAlertaEstadoNivelGobierno}
        >
          Aceptar
        </Button>
      </AlertDialog>

      <CustomDialog
        isOpen={modalNivelGobierno}
        handleClose={cerrarModalNivelGobierno}
        title={
          nivelGobiernoEdicion
            ? 'Editar nivel de gobierno'
            : 'Nuevo nivel de gobierno'
        }
      >
        <VistaModalNivelGobierno
          nivelGobierno={nivelGobiernoEdicion}
          accionCorrecta={() => {
            cerrarModalNivelGobierno().finally()
          }}
          accionCancelar={cerrarModalNivelGobierno}
        />
      </CustomDialog>

      <CustomDataTable
        titulo={'Nivel de Gobierno'}
        error={!!errorData}
        //cargando={loading}
        acciones={acciones}
        columnas={ordenCriterios}
        cambioOrdenCriterios={setOrdenCriterios}
        contenidoTabla={contenidoTabla}
        filtros={
          mostrarFiltroNivelGobierno && (
            <FiltroNivelGobierno
              filtroNombre={filtroNivelGobierno}
              accionCorrecta={(filtros) => {
                setPagina(1)
                setLimite(10)
                setFiltroNivelGobierno(filtros.nombre)
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
