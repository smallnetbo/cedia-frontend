'use client'

import { CustomDataTable } from '@/components/datatable/CustomDataTable'
import { CriterioOrdenType } from '@/components/datatable/ordenTypes'
import { Paginacion } from '@/components/datatable/Paginacion'
import CustomMensajeEstado from '@/components/estados/CustomMensajeEstado'

import { useSession, useAlerts } from '@/hooks'

import { Button, Typography, useMediaQuery, useTheme } from '@mui/material'

import { ReactNode, useState, useEffect } from 'react'
import { NivelGobiernoCRUDType } from './types/nivelGobiernoCRUDTypes'

import { imprimir } from '@/utils/imprimir'
import { BotonBuscar } from '@/components/botones/BotonBuscar'
import { BotonOrdenar } from '@/components/botones/BotonOrdenar'
import { IconoBoton } from '@/components/botones/IconoBoton'
import { delay, siteName, titleCase, InterpreteMensajes } from '@/utils'
import { AlertDialog } from '@/components/modales/AlertDialog'
import { CustomDialog } from '@/components/modales/CustomDialog'
import { VistaModalNivelGobierno } from './ui/ModalNivelGobierno'
import { FiltroNivelGobierno } from './ui/FiltroNivelGobierno'
import { Constantes } from '@/config/Constantes'

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
  const [nivelGobiernoData, setNivelGobiernoData] = useState<
    NivelGobiernoCRUDType[]
  >([])

  const [mostrarFiltroNivelGobierno, setMostrarFiltroNivelGobierno] =
    useState(false)

  const theme = useTheme()
  const xs = useMediaQuery(theme.breakpoints.only('xs'))

  const { sesionPeticion } = useSession()
  const { Alerta } = useAlerts()

  const [ordenCriterios, setOrdenCriterios] = useState<
    Array<CriterioOrdenType>
  >([
    { campo: 'id', nombre: 'Id' },
    { campo: 'nombre', nombre: 'Nombre' },
    { campo: 'nombreCorto', nombre: 'Nombre Corto' },
    { campo: 'estado', nombre: 'Estado' },
  ])

  useEffect(() => {
    obtenerNivelGobiernoPeticion().finally()
  }, [])

  const obtenerNivelGobiernoPeticion = async () => {
    try {
      setLoading(true)

      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/nivel-gobierno/todos`,
        params: {
          pagina: pagina,
          limite: limite,
        },
      })
      setNivelGobiernoData(respuesta.datos?.filas)
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

      <div key={`${nivelGobiernoData.id}-${nivelGobiernoData}-nombreCorto`}>
        <Typography variant={'body2'}>
          {`${nivelGobiernoData.nombreCorto} `}
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

  const aceptarAlertaEstadoNivelGobierno = async () => {
    setMostrarAlertaEstadoNivelGobierno(false)
    if (nivelGobiernoEdicion) {
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
        //acciones={acciones}
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
