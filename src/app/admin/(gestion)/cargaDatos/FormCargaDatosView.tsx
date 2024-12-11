import { Alert, Box, Button, Grid, Icon, styled } from '@mui/material'

import {
  FichaType,
  SubSectorType,
  VariablesType,
  ItemsType,
  GuardarEntidadVariable,
  EntidadVariableType,
  EntidadNoEnExcelType,
} from './types/cargaDatosType'
import { AlertDialog } from '@/components/modales/AlertDialog'
import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useAlerts, useSession } from '@/hooks'
import { delay, InterpreteMensajes, titleCase } from '@/utils'
import { Constantes } from '@/config/Constantes'
import { imprimir } from '@/utils/imprimir'
import SaveIcon from '@mui/icons-material/Save'

import * as XLSX from 'xlsx'
import { Typography } from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import Paper from '@mui/material/Paper'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import { Icono } from '@/components/Icono'

import { TipoDatoType } from '../items/types/tipoDatoTypes'
import { Servicios } from '@/services'
import {
  extraerNombresDeColumnas,
  filtrarFilasValidas,
  procesarFilasDelExcel,
  validarColumnasNoEncontradas,
  validarExtensionArchivo,
  validarFilasExcel,
} from './dataUtils/validacionesExcel'
import { COLUMNAS, EXTENSIONES, LOTE_TAMANO } from './types/tipoArchivo'
import {
  downloadExcel,
  downloadExcelPlantilla,
  readFileAsArrayBuffer,
} from './dataUtils/dataUtils'
import { dividirEnLotes, transformItemsData } from './dataUtils/transformData'
import TablaCargaDatos from './TablaCargaDatos'
import React from 'react'

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
})

export default function FormCargaDatosView() {
  //  datos
  const [sectorData, setSectorData] = useState<FichaType[]>([])
  const [subsectorData, setSubSectorData] = useState<SubSectorType[]>([])
  const [variablesData, setVariablesData] = useState<VariablesType[] | null>(
    null
  )
  const [nombreVariableData, setNombreVariableData] =
    useState<VariablesType | null>(null)
  const [itemsData, setItemsData] = useState<ItemsType[]>([])
  const [entidadVariableData, setEntidadVariableData] =
    useState<EntidadVariableType | null>(null)
  const [entidadesNoExcelData, setEntidadesNoExcelData] = useState<
    EntidadNoEnExcelType[]
  >([])
  const [tipoDato, setTipoDato] = useState<TipoDatoType[]>([])
  const [datosCargaEntidadvariable, setdatosCargaEntidadvariable] = useState<
    { [key: string]: any }[]
  >([])

  // archivos y nombres
  const [fileName, setFileName] = useState<string>('')
  const [columnasParaTabla, setcolumnasParaTabla] = useState<string[]>([])
  const [columnNamesExcel, setColumnNamesExcel] = useState<string[]>([])
  const [camposItemValidaosMinuscula, setcamposItemValidaosMinuscula] =
    useState<string[]>([])
  const [jsonFormateadoDowloadExcel, setJsonFormateadoDowloadExcel] = useState(
    []
  )
  const [columnasplantillaExcel, setColumnasplantillaExcel] = useState<
    string[]
  >([])
  const [codigosEntidad, setCodigosEntidad] = useState<string[]>([])

  // controles y visualización
  const [valorSelectFicha, setValorSelectFicha] = useState<string>('')
  const [openSelectFicha, setOpenSelectFicha] = useState(false)
  const [valorSelectSubSector, setValorSelectSubSector] = useState<string>('')
  const [openSelectSubSector, setOpenSelectSubSector] = useState(false)
  const [valorSelectVariable, setValorSelectVariable] = useState<string>('')
  const [openSelectVariable, setOpenSelectVariable] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [mensajeAlert, setMensajeAlert] = useState<React.ReactNode>(null)
  const [mensajeVariableSeleccionado, setmensajeVariableSeleccionado] =
    useState<string>('')
  const [botonDeshabilitado, setBotonDeshabilitado] = useState(false)
  const [cantidadRegistrados, setCantidadRegistrados] = useState<number>(0)
  const [
    mostrarAlertaEliminarEntidadVariable,
    setMostrarAlertaEliminarEntidadVariable,
  ] = useState(false)
  const [visibleGuardar, setVisibleGuardar] = useState(false)
  const [nombreUsuarioReg, setNombreUsuarioReg] = useState<string>('')
  const [cantidadEntidad, setCantidadEntidad] = useState<number>(0)
  const [cantidadEntidadEnExcel, setCantidadEntidadEnExcel] =
    useState<number>(0)
  const [visibleProgresCircle, setVisibleProgresCircle] = useState(false)
  const [visibleProgresGuardar, setVisibleProgresGuardar] = useState(false)
  const [totalRegistros, setTotalRegistros] = useState(0)
  const [registrosGuardados, setRegistrosGuardados] = useState(0)

  // Referencias
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Hooks de formulario
  const { handleSubmit, control, setValue } = useForm<GuardarEntidadVariable>({
    defaultValues: {
      id: '',
      datoRegistro: {},
      idEntidad: '',
      idVariable: '',
    },
  })

  // Hooks personalizados
  const { Alerta } = useAlerts()
  const { sesionPeticion } = useSession()

  const guardarActualizarEntidadVariable = async (
    data: GuardarEntidadVariable
  ) => {
    data.datosJson = datosCargaEntidadvariable
    setBotonDeshabilitado(true)
    setVisibleProgresGuardar(true)

    const pasoValidacion = await validacionRegistrarEntidadVariable(data)
    if (!pasoValidacion) {
      setShowAlert(true)
      setBotonDeshabilitado(false)
      setVisibleProgresGuardar(false)
      return
    }

    try {
      const lotes = dividirEnLotes(data.datosJson, LOTE_TAMANO)
      setTotalRegistros(data.datosJson.length)
      let registrosGuardadosCount = 0
      for (const lote of lotes) {
        const respuesta = await guardarActualizarEntidadVariablePeticion({
          ...data,
          datosJson: lote,
        })

        if (!respuesta) {
          setShowAlert(true)
          break
        }

        registrosGuardadosCount += lote.length
        setRegistrosGuardados(registrosGuardadosCount)
        await new Promise((resolve) => setTimeout(resolve, 50))

        await obtenerCantidadRegistrosPorIdVariablePeticion(data.idVariable)
      }
      setVisibleGuardar(false)
      await obtenerUnRegistrosPorIdVariablePeticion(data.idVariable)
      await obtenerListadoRegistrosPorIdVariablePeticion(data.idVariable)
      setFileName('')
      Alerta({
        mensaje: 'Todos los registros se han guardado exitosamente.',
        variant: 'success',
      })

      limpiarInputCampoCargaExcel()
      setdatosCargaEntidadvariable([])
      setcolumnasParaTabla([])
      setEntidadesNoExcelData([])
    } catch (e) {
      setShowAlert(true)
    } finally {
      setBotonDeshabilitado(false)
      setVisibleProgresGuardar(false)
    }
  }

  const guardarActualizarEntidadVariablePeticion = async (
    entidadVariable: GuardarEntidadVariable
  ) => {
    try {
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/entidadvariable${entidadVariable.id ? `/${entidadVariable.id}` : ''}`,
        method: entidadVariable.id ? 'patch' : 'post',
        body: entidadVariable,
      })

      return respuesta
    } catch (e) {
      const mensajeError = InterpreteMensajes(e)
      imprimir(`Error al cargar datos: `, e)
      Alerta({ mensaje: mensajeError, variant: 'error' })
      throw new Error(mensajeError)
    }
  }

  const validacionRegistrarEntidadVariable = async (
    data: GuardarEntidadVariable
  ) => {
    let pasoValidacion: boolean = true
    if (data.idVariable === '') {
      pasoValidacion = false
      setMensajeAlert('Debe seleccionar Variable')
    }
    if (datosCargaEntidadvariable.length < 1) {
      pasoValidacion = false
      setMensajeAlert('No hay datos cargados de excel')
    }
    //Si no encontraron errores de validacion probamos con otro validador
    if (pasoValidacion) {
      pasoValidacion =
        await validaCabeceraExcelConItemsSeleccionados(columnNamesExcel)
    }
    return pasoValidacion
  }

  useEffect(() => {
    listarTipoDato()
    obtenerSectorPeticion()
    obtenerTodosCodigosEntidadPeticion()
    obtenerCantidadEntidadPeticion().finally(() => {})
  }, [])

  const listarTipoDato = async () => {
    try {
      const respuesta = await Servicios.get({
        url: `${Constantes.baseUrl}/tipoDato/`,
      })
      setTipoDato(respuesta.datos)
    } catch (e) {
      imprimir(`Error al obtener la informacion`, e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
      throw e
    } finally {
    }
  }

  const Upload = () => {
    setVisibleProgresCircle(true)

    const fileUpload = fileInputRef.current?.files?.[0]

    if (!fileUpload) {
      setVisibleProgresCircle(false)
      return
    }

    const file = fileUpload.name.toLowerCase()

    if (!validarExtensionArchivo(file, EXTENSIONES)) {
      setMensajeAlert(
        'Archivo incorrecto, los tipos de archivos permitidos son: .xls, .xlsx, .csv, .ods'
      )
      setShowAlert(true)
      limpiarInputCampoCargaExcel()
      setVisibleProgresCircle(false)
      return
    }

    setFileName(fileUpload.name)

    readFileAsArrayBuffer(
      fileUpload,
      (arrayBuffer) => handleFileUpload(arrayBuffer, fileUpload.name),
      handleFileUploadError
    )
  }

  const handleFileUpload = (arrayBuffer: ArrayBuffer, fileName: string) => {
    processExcel(arrayBuffer, fileName)
  }

  const clearFileSelection = () => {
    setFileName('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    setdatosCargaEntidadvariable([])
    setcolumnasParaTabla([])
    setCantidadEntidadEnExcel(0)
    setEntidadesNoExcelData([])
    setJsonFormateadoDowloadExcel([])
    setColumnNamesExcel([])
    setcamposItemValidaosMinuscula([])
    setMensajeAlert(null)
    setShowAlert(false)
  }

  const handleFileUploadError = (error: Event | Error) => {
    if (error instanceof Error) {
      setMensajeAlert(error.message)
    } else {
      setMensajeAlert('Error desconocido')
    }
    setShowAlert(true)
    limpiarInputCampoCargaExcel()
    setVisibleProgresCircle(false)
  }

  const processExcel = async (data: ArrayBuffer, fileName: string) => {
    try {
      const workbook = XLSX.read(data, { type: 'binary' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const excelRows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 })

      const extractedColumnNames = extraerNombresDeColumnas(sheet)
      const processedExcelRows = procesarFilasDelExcel(
        excelRows,
        extractedColumnNames
      )
      const filteredRowsSinUndefined = filtrarFilasValidas(processedExcelRows)

      await cargaDatosCabeceraExcel(extractedColumnNames)

      const pasoValidacion =
        await validaCabeceraExcelConItemsSeleccionados(extractedColumnNames)
      if (!pasoValidacion) {
        throw new Error(
          'La cabecera del Excel no pasó la validación con los ítems seleccionados.'
        )
      }

      const itemsDataEnMinusculas = transformItemsData(itemsData, tipoDato)
      const columnasNoEncontradas = validarColumnasNoEncontradas(
        extractedColumnNames,
        itemsDataEnMinusculas
      )
      if (columnasNoEncontradas.length > 0) {
        throw new Error(
          `Las siguientes columnas no están en itemsData: ${columnasNoEncontradas.join(', ')}`
        )
      }

      const validacionDatos = validarFilasExcel(
        filteredRowsSinUndefined,
        itemsDataEnMinusculas
      )
      if (validacionDatos.length > 0) {
        const errores = validacionDatos.map((error) => error)
        throw errores
      }

      const datosColumnaEntidadExcel = filteredRowsSinUndefined.map(
        (fila: any) => fila.ENTIDAD
      )
      const pasoValidacionEntidades = await validacionEntidades(
        datosColumnaEntidadExcel,
        codigosEntidad
      )
      if (!pasoValidacionEntidades) {
        throw new Error('La validación de las entidades no fue exitosa.')
      }

      const nuevoObjetoFiltrado = filtrarColumnasValidas(
        filteredRowsSinUndefined,
        extractedColumnNames
      )
      setdatosCargaEntidadvariable(nuevoObjetoFiltrado)
      const columns =
        nuevoObjetoFiltrado.length > 0
          ? Object.keys(nuevoObjetoFiltrado[0])
          : []
      setcolumnasParaTabla(columns)
      setCantidadEntidadEnExcel(datosColumnaEntidadExcel.length)
      setFileName(fileName)
    } catch (error) {
      handleProcessError(error)
    } finally {
      setVisibleProgresCircle(false)
    }
  }

  const handleProcessError = (error: any) => {
    let errorMessage: React.ReactNode = 'Ocurrió un error desconocido.'

    if (error instanceof Error) {
      errorMessage = error.message
    } else if (Array.isArray(error)) {
      errorMessage = (
        <ul>
          {error.map((err, index) => (
            <li key={index}>{err}</li>
          ))}
        </ul>
      )
    } else if (typeof error === 'string') {
      errorMessage = error
    }

    setMensajeAlert(errorMessage)
    setShowAlert(true)
    limpiarInputCampoCargaExcel()
  }

  function filtrarColumnasValidas(
    rowExcelLimpias: any,
    extractedColumnNames: any
  ): { [key: string]: any }[] {
    const nuevoObjeto: { [key: string]: any }[] = []
    const columnasValidas: string[] = [
      'ENTIDAD',
      ...itemsData.map((item) => item.nombreCorto.replace(/\s+/g, '')),
    ]
    const columnasValidasMinusculas = columnasValidas.map((cadena: any) =>
      cadena.toUpperCase()
    )
    setcamposItemValidaosMinuscula(columnasValidasMinusculas)
    rowExcelLimpias.forEach((fila: any) => {
      const filaExtraida: { [key: string]: any } = {}
      columnasValidasMinusculas.forEach((columna) => {
        if (fila[columna] !== undefined) {
          filaExtraida[columna] = fila[columna]
        }
      })
      nuevoObjeto.push(filaExtraida)
    })
    return nuevoObjeto
  }

  const cargaDatosCabeceraExcel = async (cabeceraExcel: any) => {
    setColumnNamesExcel(cabeceraExcel)
  }

  const validaCabeceraExcelConItemsSeleccionados = async (
    cabeceraExcel: any
  ) => {
    let pasoValidacion: boolean = true
    if (itemsData.length > 0) {
      const itemsDataEnMinusculas = itemsData.map((item) => ({
        ...item,
        nombreCorto: item.nombreCorto.toUpperCase(),
      }))
      const cabeceraEnMinusculas = cabeceraExcel.map((cadena: any) =>
        cadena.toUpperCase()
      )

      const existeColumnaEntidad = cabeceraEnMinusculas.includes('ENTIDAD')
      if (existeColumnaEntidad) {
        const valorNoEncontrado = itemsDataEnMinusculas.find((item) => {
          const nombreEnMinusculas = item.nombreCorto.toUpperCase()
          return !cabeceraEnMinusculas.includes(nombreEnMinusculas)
        })

        if (valorNoEncontrado) {
          pasoValidacion = false
          setMensajeAlert(
            `La columna "${valorNoEncontrado.nombreCorto}" no está en el archivo excel.`
          )
          limpiarInputCampoCargaExcel()
        }
      } else {
        pasoValidacion = false
        setMensajeAlert('No hay la columna entidad en el archivo excel.')
        limpiarInputCampoCargaExcel()
      }
    } else {
      pasoValidacion = false
      setMensajeAlert('No hay items en la variable o no selecciono variable')
      limpiarInputCampoCargaExcel()
    }

    return pasoValidacion
  }

  const validacionEntidades = async (
    entidadesExcel: any[],
    entidadesDataBD: any[]
  ): Promise<boolean> => {
    const diferencias = entidadesExcel
      .map((elemento, index) =>
        !entidadesDataBD.includes(elemento)
          ? { posicion: index, elemento }
          : null
      )
      .filter((diferencia) => diferencia !== null)

    if (diferencias.length > 0 && diferencias[0]) {
      throw new Error(
        `La entidad "${diferencias[0].elemento}" en la fila "${diferencias[0].posicion + 2}" no existe en la base de datos.`
      )
    }

    const entidadesNoEstanExcel = entidadesDataBD.filter(
      (elemento) => !entidadesExcel.includes(elemento)
    )

    if (entidadesNoEstanExcel.length > 0) {
      await obtenerConjuntoEntidadesPeticion(entidadesNoEstanExcel)
    }

    return true
  }

  const limpiarInputCampoCargaExcel = async () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  /// Petición para obtener Ficha
  const obtenerSectorPeticion = async () => {
    try {
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/sector`,
      })
      setSectorData(respuesta.datos)
    } catch (e) {
      imprimir(`Error al obtener Ficha`, e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
      throw e
    } finally {
    }
  }

  const obtenerConjuntoEntidadesPeticion = async (arrayEntidades: string[]) => {
    try {
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/entidad/conjunto-entidades/${arrayEntidades}`,
      })
      setEntidadesNoExcelData(respuesta.datos)
    } catch (e) {
      imprimir(`Error al obtener conjunto de entidades`, e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
      throw e
    } finally {
    }
  }

  /// Petición para obtener Sub sector
  const obtenerSubSectorPeticion = async (id: string) => {
    try {
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/subsector/list/sector/${id}`,
      })
      setSubSectorData(respuesta.datos)
    } catch (e) {
      imprimir(`Error al obtener Sub sector`, e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
      throw e
    } finally {
    }
  }

  /// Petición para obtener variables
  const obtenerVariablesPeticion = async (id: string) => {
    try {
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/variables/list/subsector/${id}`,
      })
      setVariablesData(respuesta.datos)
    } catch (e) {
      imprimir(`Error al obtener variables`, e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
      throw e
    } finally {
    }
  }

  /// Petición para obtener Item
  const obtenerItemsPeticion = async (id: string) => {
    try {
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/items/list/variable/${id}`,
      })
      setItemsData(respuesta.datos)
      return respuesta.datos
    } catch (e) {
      imprimir(`Error al obtener Item`, e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
      throw e
    } finally {
    }
  }

  const obtenerCantidadRegistrosPorIdVariablePeticion = async (
    idVariable: string
  ) => {
    try {
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/entidadvariable/cantidad/variable/${idVariable}`,
      })
      setCantidadRegistrados(respuesta.count.count)
      return respuesta.count.count
    } catch (e) {
      imprimir(`Error al obtener cantidad de registros de variable`, e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
      throw e
    } finally {
    }
  }

  const obtenerCantidadEntidadPeticion = async () => {
    try {
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/entidad/cantidad`,
      })
      setCantidadEntidad(respuesta.count.count)
      //return respuesta.count.count
    } catch (e) {
      imprimir(`Error al obtener cantidad de registros de entidad`, e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
      throw e
    } finally {
    }
  }

  const obtenerTodosCodigosEntidadPeticion = async () => {
    try {
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/entidad/codigos-entidad`,
      })
      const data = respuesta.datos
      const codigos = data.map(
        (entidad: { codigoEntidad: string }) => +entidad.codigoEntidad
      )
      setCodigosEntidad(codigos)
    } catch (e) {
      imprimir(`Error al obtener cantidad de registros de entidad`, e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
      throw e
    } finally {
    }
  }

  const obtenerUnRegistrosPorIdVariablePeticion = async (
    idVariable: string
  ) => {
    try {
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/entidadvariable/registro/variable/${idVariable}`,
      })

      setEntidadVariableData(respuesta)
      respuesta.usuarioCreacion &&
        (await obtenerUnUsuarioPeticion(respuesta.usuarioCreacion))
      //   return respuesta.datos
    } catch (e) {
      imprimir(`Error al obtener un registros de EntidadVariable`, e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
      throw e
    } finally {
    }
  }

  const obtenerListadoRegistrosPorIdVariablePeticion = async (
    idVariable: string
  ) => {
    try {
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/entidadvariable/list/variable/${idVariable}`,
      })

      const data = respuesta.datos
      const objetoConEntidad = data.map((dat: any) => {
        const { datoRegistro, entidad } = dat
        const codigoEntidad = entidad.codigoEntidad
        return {
          ...dat,
          datoRegistro: {
            ...datoRegistro,
            ENTIDAD: codigoEntidad,
          },
        }
      })
      const formattedData: any = objetoConEntidad.map(
        (datos: any) => datos.datoRegistro
      )
      setJsonFormateadoDowloadExcel(formattedData)
    } catch (e) {
      imprimir(`Error al obtener listado registros de EntidadVariable`, e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
      throw e
    } finally {
    }
  }

  const obtenerUnUsuarioPeticion = async (idUsuario: string) => {
    try {
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/usuarios/usuario/${idUsuario}`,
      })

      const nombreUsuario =
        respuesta.datos.persona.nombres +
        ' ' +
        respuesta.datos.persona.primerApellido +
        ' ' +
        respuesta.datos.persona.segundoApellido
      setNombreUsuarioReg(nombreUsuario)
    } catch (e) {
      imprimir(`Error al obtener datos de usuario`, e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
      throw e
    } finally {
    }
  }

  const handleCloseSelectFicha = () => {
    setOpenSelectFicha(false)
  }

  const handleOpenSelectFicha = () => {
    setOpenSelectFicha(true)
  }
  const handleInputChangeSelectFicha = async (
    event: SelectChangeEvent<typeof valorSelectFicha>
  ) => {
    setValorSelectFicha(event.target.value)
    await restablecerDatosEnSelectFicha()
    if (event.target.value) {
      obtenerSubSectorPeticion(event.target.value)
    }
  }
  //Sub Sector

  const handleCloseSelectSubSector = () => {
    setOpenSelectSubSector(false)
  }

  const handleOpenSelectSubSector = () => {
    setOpenSelectSubSector(true)
  }
  const handleInputChangeSelectSubSector = async (
    event: SelectChangeEvent<typeof valorSelectSubSector>
  ) => {
    await restablecerDatosEnSelectSubSector()
    setValorSelectSubSector(event.target.value)
    if (event.target.value) {
      obtenerVariablesPeticion(event.target.value)
    }
  }

  //Variables
  const handleCloseSelectVariable = () => {
    setOpenSelectVariable(false)
  }

  const handleOpenSelectVariable = () => {
    setOpenSelectVariable(true)
  }
  const handleInputChangeSelectVariable = async (
    event: SelectChangeEvent<typeof valorSelectSubSector>
  ) => {
    await restablecerDatosEnSelectVariable()
    const idVariable = event.target.value
    setValorSelectVariable(idVariable)
    setValue('idVariable', idVariable)

    if (idVariable) {
      const cantidadReg =
        await obtenerCantidadRegistrosPorIdVariablePeticion(idVariable)
      setVisibleGuardar(cantidadReg <= 0)

      await obtenerUnRegistrosPorIdVariablePeticion(idVariable)
      await obtenerListadoRegistrosPorIdVariablePeticion(idVariable)

      const datosConsultaItem = await obtenerItemsPeticion(idVariable)
      let infoDeVariableSeleccionada = ''

      const variableSeleccionada =
        variablesData?.find((variable) => variable.id === idVariable) || null
      setNombreVariableData(variableSeleccionada)

      if (datosConsultaItem.length > 0) {
        datosConsultaItem.forEach((dat: any) => {
          infoDeVariableSeleccionada += `| ${dat.nombreCorto}`
        })
        const nombresCortos = datosConsultaItem.map(
          (dat: any) => dat.nombreCorto
        )
        const nuevoArray = ['ENTIDAD', ...nombresCortos]
        setColumnasplantillaExcel(nuevoArray)
      } else {
        setVisibleGuardar(false)
        Alerta({
          mensaje: 'La variable seleccionada no tiene ítems.',
          variant: 'warning',
        })
      }

      setmensajeVariableSeleccionado(infoDeVariableSeleccionada)
    }
  }

  // Función para formatear la fecha como "dd/mm/yyyy"
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }
    return new Date(dateString).toLocaleDateString('en-GB', options) // 'en-GB' for DD/MM/YYYY format
  }
  const eliminarCargaEntidadVariable = () => {
    setMostrarAlertaEliminarEntidadVariable(true)
  }
  const cancelarAlertaEliminarCargaEntidadVariable = async () => {
    setMostrarAlertaEliminarEntidadVariable(false)
    await delay(500)
  }

  const aceptarAlertaEliminarCargaEntidadVariable = async () => {
    setMostrarAlertaEliminarEntidadVariable(false)
    if (entidadVariableData) {
      await eliminarCargaEntidadVariablePeticion(entidadVariableData)
    }
  }
  /// Eliminar carga Entidad Variable
  const eliminarCargaEntidadVariablePeticion = async (
    entidadVariableData: EntidadVariableType
  ) => {
    try {
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/entidadvariable/${entidadVariableData.idVariable}/eliminar-idvariable`,
        method: 'patch',
      })

      if (respuesta.finalizado) {
        setEntidadVariableData(null)
        setVisibleGuardar(true)
      }
      imprimir(`respuesta eliminar carga entidad variable: ${respuesta}`)
      Alerta({
        mensaje: 'Registro eliminado con éxito', // InterpreteMensajes(respuesta),
        variant: 'success',
      })
    } catch (e) {
      imprimir(`Error al eliminar carga entidad variable`, e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    } finally {
    }
  }

  const restablecerDatosEnSelectFicha = async () => {
    setValorSelectVariable('')
    setValorSelectSubSector('')
    setmensajeVariableSeleccionado('')
    setEntidadVariableData(null)
    setdatosCargaEntidadvariable([])
    setVisibleGuardar(false)
    setcolumnasParaTabla([])
    setEntidadesNoExcelData([])
    setFileName('')
  }

  const restablecerDatosEnSelectSubSector = async () => {
    setValorSelectVariable('')
    setmensajeVariableSeleccionado('')
    setEntidadVariableData(null)
    setdatosCargaEntidadvariable([])
    setVisibleGuardar(false)
    setcolumnasParaTabla([])
    setEntidadesNoExcelData([])
    setFileName('')
  }

  const restablecerDatosEnSelectVariable = async () => {
    setdatosCargaEntidadvariable([])
    setcolumnasParaTabla([])
    setEntidadesNoExcelData([])
    setFileName('')
  }

  const tieneDatos =
    entidadVariableData ||
    datosCargaEntidadvariable.length > 0 ||
    entidadesNoExcelData.length > 0

  return (
    <>
      <AlertDialog
        isOpen={mostrarAlertaEliminarEntidadVariable}
        titulo={'Alerta'}
        texto={'Esta seguro de eliminar los datos cargados?'}
      >
        <Button
          variant={'outlined'}
          onClick={cancelarAlertaEliminarCargaEntidadVariable}
        >
          Cancelar
        </Button>
        <Button
          variant={'contained'}
          onClick={aceptarAlertaEliminarCargaEntidadVariable}
        >
          Aceptar
        </Button>
      </AlertDialog>

      <AlertDialog isOpen={showAlert} titulo={'Alerta'} texto={mensajeAlert}>
        <Button variant={'contained'} onClick={() => setShowAlert(false)}>
          Aceptar
        </Button>
      </AlertDialog>

      <form onSubmit={handleSubmit(guardarActualizarEntidadVariable)}>
        <Paper elevation={3} sx={{ padding: 3, borderRadius: 2 }}>
          <Grid container spacing={4}>
            {/* Primera columna (Selects y Carga de Archivos) */}
            <Grid item xs={12} sm={tieneDatos ? 6 : 12}>
              <Typography variant="h6" gutterBottom>
                Configuración
              </Typography>

              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12} sm={tieneDatos ? 12 : 4}>
                  <FormControl fullWidth variant="outlined" size="small">
                    <InputLabel>Ficha</InputLabel>
                    <Select
                      open={openSelectFicha}
                      onClose={handleCloseSelectFicha}
                      onOpen={handleOpenSelectFicha}
                      value={valorSelectFicha}
                      label="Ficha"
                      onChange={handleInputChangeSelectFicha}
                    >
                      {sectorData.map((sect) => (
                        <MenuItem key={sect.id} value={sect.id}>
                          {sect.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={tieneDatos ? 12 : 4}>
                  <FormControl fullWidth variant="outlined" size="small">
                    <InputLabel>Sub Sector</InputLabel>
                    <Select
                      open={openSelectSubSector}
                      onClose={handleCloseSelectSubSector}
                      onOpen={handleOpenSelectSubSector}
                      value={valorSelectSubSector}
                      label="Sub Sector"
                      onChange={handleInputChangeSelectSubSector}
                    >
                      {subsectorData.map((subsect) => (
                        <MenuItem key={subsect.id} value={subsect.id}>
                          {subsect.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={tieneDatos ? 12 : 4}>
                  <FormControl fullWidth variant="outlined" size="small">
                    <InputLabel>Variables</InputLabel>
                    <Select
                      open={openSelectVariable}
                      onClose={handleCloseSelectVariable}
                      onOpen={handleOpenSelectVariable}
                      value={valorSelectVariable}
                      label="Variables"
                      onChange={handleInputChangeSelectVariable}
                    >
                      {variablesData?.map((variable) => (
                        <MenuItem key={variable.id} value={variable.id}>
                          {variable.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3 }}>
                {visibleGuardar && (
                  <>
                    {!tieneDatos && (
                      <Alert severity="info" sx={{ mt: 4, mb: 2 }}>
                        <strong>Items de Variables: </strong> ENTIDAD
                        {mensajeVariableSeleccionado}
                      </Alert>
                    )}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 2,
                      }}
                    >
                      <Button
                        component="label"
                        variant="contained"
                        startIcon={<CloudUploadIcon />}
                        disabled={visibleProgresCircle}
                        sx={{
                          color: 'white',
                          flex: 1,
                          mr: 2,
                          boxShadow: 3,
                          borderRadius: 2,
                        }}
                      >
                        Cargar Archivo
                        <VisuallyHiddenInput
                          type="file"
                          onChange={Upload}
                          ref={fileInputRef}
                          multiple
                        />
                      </Button>

                      <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<Icon>file_download</Icon>}
                        onClick={() =>
                          downloadExcelPlantilla(
                            columnasplantillaExcel,
                            nombreVariableData?.nombreCorto
                          )
                        }
                        sx={{ flex: 1, boxShadow: 3, borderRadius: 2 }}
                      >
                        Descargar Plantilla
                      </Button>
                    </Box>
                  </>
                )}

                {fileName && (
                  <Box
                    sx={{
                      mt: 2,
                      padding: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: 'background.paper',
                      boxShadow: 1,
                    }}
                  >
                    <Icon sx={{ mr: 2 }}>attach_file</Icon>
                    <Typography variant="body1" sx={{ flex: 1 }}>
                      Archivo seleccionado: <strong>{fileName}</strong>
                    </Typography>
                    <Button
                      variant="text"
                      color="error"
                      onClick={clearFileSelection}
                      startIcon={<Icon>delete</Icon>}
                    ></Button>
                  </Box>
                )}

                {visibleProgresCircle && (
                  <Box
                    display="flex"
                    justifyContent="center"
                    style={{ marginTop: '16px' }}
                  >
                    <CircularProgress />
                  </Box>
                )}

                {/* {showAlert && (
                  <Box
                    display="flex"
                    justifyContent="center"
                    style={{ marginTop: '16px' }}
                  >
                    <Alert severity="error">{mensajeAlert}</Alert>
                  </Box>
                )} */}
              </Box>

              {datosCargaEntidadvariable.length > 0 && (
                <TablaCargaDatos
                  columnas={columnasParaTabla}
                  datos={datosCargaEntidadvariable}
                />
              )}
            </Grid>

            {/* Segunda columna (Información y Detalles) */}
            {tieneDatos && (
              <Grid item xs={12} sm={6}>
                <Typography variant="h6" gutterBottom>
                  Información
                </Typography>

                {mensajeVariableSeleccionado && (
                  <Alert severity="info" sx={{ mt: 4, mb: 2 }}>
                    <strong>Items de Variables: </strong> ENTIDAD
                    {mensajeVariableSeleccionado}
                  </Alert>
                )}
                {entidadVariableData && (
                  <>
                    <Alert severity="info">
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Fecha última actualización:</strong>{' '}
                        {entidadVariableData?.fechaCreacion
                          ? formatDate(entidadVariableData.fechaCreacion)
                          : 'N/A'}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Operador:</strong> {titleCase(nombreUsuarioReg)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Cantidad de Registro:</strong>{' '}
                        {cantidadRegistrados}
                      </Typography>
                    </Alert>

                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mt: 2,
                      }}
                    >
                      <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<Icono>file_download</Icono>}
                        onClick={() =>
                          downloadExcel(
                            jsonFormateadoDowloadExcel,
                            nombreVariableData?.nombreCorto
                          )
                        }
                        sx={{
                          flex: 1,
                          mr: 2,

                          boxShadow: 3,
                          borderRadius: 2,
                        }}
                      >
                        Descargar
                      </Button>

                      <Button
                        variant="outlined"
                        color="error"
                        onClick={eliminarCargaEntidadVariable}
                        sx={{ flex: 1, boxShadow: 3, borderRadius: 2 }}
                      >
                        Eliminar
                      </Button>
                    </Box>
                  </>
                )}

                {entidadesNoExcelData.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Alert
                      severity="info"
                      sx={{
                        mb: 2,
                      }}
                    >
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Entidades que no están en la carga:</strong>{' '}
                        {entidadesNoExcelData.length}
                      </Typography>

                      {datosCargaEntidadvariable.length > 0 && (
                        <>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong> Total entidades:</strong>{' '}
                            {titleCase(cantidadEntidad.toString())}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Total para cargar::</strong>{' '}
                            {cantidadEntidadEnExcel}
                          </Typography>
                        </>
                      )}
                    </Alert>
                    <TablaCargaDatos
                      columnas={COLUMNAS}
                      datos={entidadesNoExcelData}
                    />
                  </Box>
                )}
              </Grid>
            )}
          </Grid>

          {/* Botones de Acción */}
          {datosCargaEntidadvariable.length > 0 && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mt: 1,
              }}
            >
              <Button
                variant="contained"
                disabled={botonDeshabilitado}
                type="submit"
                color="info"
                startIcon={<SaveIcon />}
                sx={{
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                  mr: 2,
                  position: 'relative',
                }}
              >
                {botonDeshabilitado ? 'Guardando...' : 'Guardar'}
              </Button>

              {visibleProgresGuardar && (
                <Typography
                  variant="body2"
                  sx={{
                    color: '#555',
                    fontWeight: '500',
                    ml: 2,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <CircularProgress
                    size={16}
                    sx={{
                      color: '#555',
                      mr: 1,
                    }}
                  />
                  {`Guardando ${registrosGuardados} de ${totalRegistros} registros`}
                </Typography>
              )}
            </Box>
          )}
        </Paper>
      </form>
      <br />
      <br />
      <br />
    </>
  )
}
