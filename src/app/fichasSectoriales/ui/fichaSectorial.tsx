'use client'
import React, { useEffect, useState } from 'react'
import { Constantes } from '@/config/Constantes'
import { Servicios } from '@/services'
import { imprimir } from '@/utils/imprimir'
import { useAlerts } from '@/hooks'
import { InterpreteMensajes } from '@/utils'
import { Ficha } from '../types/fichaType'
import DynamicButtonList from './buttonList'

const FichasSectoriales = () => {
  const { Alerta } = useAlerts()
  const [loadingData, setLoadingData] = useState<boolean>(false)
  const [errorData, setErrorData] = useState<any>()
  const [listaFicha, setListaFicha] = useState<Ficha[]>([])

  const listarFicha = async () => {
    try {
      setLoadingData(true)
      const respuesta = await Servicios.get({
        url: `${Constantes.baseUrl}/sector`,
      })
      setListaFicha(respuesta.datos)
      setErrorData(null)
    } catch (e) {
      imprimir(`Error al obtener la informacion`, e)
      setErrorData(e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
      throw e
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    listarFicha()
  }, [])

  return <DynamicButtonList listaFicha={listaFicha} />
}

export default FichasSectoriales
