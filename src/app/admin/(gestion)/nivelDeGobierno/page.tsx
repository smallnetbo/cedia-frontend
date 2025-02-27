'use client'

import { CustomDataTable } from '@/components/datatable/CustomDataTable'
import { CriterioOrdenType } from '@/components/datatable/ordenTypes'
import { Paginacion } from '@/components/datatable/Paginacion'
import CustomMensajeEstado from '@/components/estados/CustomMensajeEstado'

import { useSession, useAlerts } from '@/hooks'

import { Button, Typography } from '@mui/material'

import { ReactNode, useState, useEffect } from 'react'
import { NivelGobiernoCRUDType } from './types/nivelGobiernoCRUDTypes'

import { imprimir } from '@/utils/imprimir'

import { delay, siteName, titleCase, InterpreteMensajes } from '@/utils'
import { AlertDialog } from '@/components/modales/AlertDialog'
import { CustomDialog } from '@/components/modales/CustomDialog'
import { Constantes } from '@/config/Constantes'

export default function NivelDeGobiernoPage() {
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
  const [nivelGobiernoData, setNivelGobiernoData] = useState<
    NivelGobiernoCRUDType[]
  >([])

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
    }
  }

  /// Contenido del data table
  const contenidoTabla: Array<Array<ReactNode>> = nivelGobiernoData.map(
    (nivelGobiernoData) => [
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
  const aceptarAlertaEstadoNivelGobierno = () => {
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
      ></CustomDialog>

      <CustomDataTable
        titulo={'Nivel de Gobierno'}
        error={!!errorData}
        columnas={ordenCriterios}
        cambioOrdenCriterios={setOrdenCriterios}
        contenidoTabla={contenidoTabla}
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
