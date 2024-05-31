import { Box, Button, DialogActions, DialogContent, Grid } from '@mui/material'
 import {
 
   CrearEditarFichaType,
   FichaCRUDType,
 } from '../fichas/types/fichaCRUDTypes' 

 import {
  FichaType,
  SubSectorType,
  VariablesType,
  ItemsType,
  GuardarEntidadVariable,
  EntidadVariableType,
  EntidadNoEnExcelType,
} from './types/cargaDatosType' 
import { FormInputDropdown, FormInputText,FormInputDate,optionType } from '@/components/form'
import { AlertDialog } from '@/components/modales/AlertDialog'
import { useState,useEffect,ReactNode,useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useAlerts, useSession } from '@/hooks'
import { delay, InterpreteMensajes,titleCase } from '@/utils'
import { Constantes } from '@/config/Constantes'
import { imprimir } from '@/utils/imprimir'
import FormInputFile from '@/components/form/FormInputFile'
import * as XLSX from 'xlsx';
import { IconoTooltip } from '@/components/botones/IconoTooltip'

import { makeStyles,Typography } from '@mui/material'

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import {SketchPicker} from 'react-color'
//import Select,{ SelectChangeEvent } from 'react-select'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import { FormInputAutocomplete } from '@/components/form/FormInputAutocomplete'
import TablaDinamica from './TablaCargaDatos'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'
import OutlinedInput from '@mui/material/OutlinedInput'
import { Theme, useTheme } from '@mui/material/styles'
import CircularProgress from '@mui/material/CircularProgress';

export default function FormCargaDatosView() {
  
    const storedData = localStorage?.getItem('fichaStorage');
     const initialFicha = storedData ? JSON.parse(storedData) : null;
     //console.log('Valor del estorage',initialFicha)
    const [ficha, setFichaNewData] = useState<CrearEditarFichaType>(initialFicha)
    const [sectorData, setSectorData] = useState<FichaType[]>([])
    const [subsectorData, setSubSectorData] = useState<SubSectorType[]>([])
    const [variablesData, setVariablesData] =useState<VariablesType[] | null>(null)// useState<VariablesType[]>([])
    const [itemsData, setItemsData] = useState<ItemsType[]>([])
    const [cabeceraTablaData, setCabeceraTablaData] = useState('')
    const [currentColor, setCurrentColor] = useState(ficha?.colorPrimario ?? '#00AE98')
    const [currentColorSecundario, setCurrentColorSecundario] = useState(ficha?.colorSecundario ?? '#00AE98')
    const [opciones, setOpciones] = useState<Array<optionType>>([])
    const [valorSelectFicha, setValorSelectFicha] = useState<string>('')
    const [openSelectFicha, setOpenSelectFicha] = useState(false)
    const [valorSelectSubSector, setValorSelectSubSector] = useState<string>('')
    const [openSelectSubSector, setOpenSelectSubSector] = useState(false)
    const [valorSelectVariable, setValorSelectVariable] = useState<string>('')
    const [openSelectVariable, setOpenSelectVariable] = useState(false)
    const [showAlert, setShowAlert] = useState(false)
    const [mensajeAlert, setMensajeAlert] = useState<string>('')
    const [datosCargaEntidadvariable, setdatosCargaEntidadvariable] = useState<{ [key: string]: any }[]>([]);
    const [columnasParaTabla, setcolumnasParaTabla] = useState<string[]>([])
    const [columnNamesExcel, setColumnNamesExcel] = useState<string[]>([])
    const [camposItemValidaosMinuscula, setcamposItemValidaosMinuscula] = useState<string[]>([])
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const [mensajeVariableSeleccionado, setmensajeVariableSeleccionado] = useState<string>('')
    const [botonDeshabilitado, setBotonDeshabilitado] = useState(false);
    const [entidadVariableData, setEntidadVariableData] = useState<EntidadVariableType | null>(null)
    const [cantidadRegistrados, setCantidadRegistrados] = useState<number>(0)
    const [mostrarAlertaEliminarEntidadVariable, setMostrarAlertaEliminarEntidadVariable] =useState(false)
    const [visibleGuardar, setVisibleGuardar] = useState(false)
    const [nombreUsuarioReg, setNombreUsuarioReg] = useState<string>('')
    const [cantidadEntidad, setCantidadEntidad] = useState<number>(0)
    const [cantidadEntidadEnExcel, setCantidadEntidadEnExcel] = useState<number>(0)
    const [codigosEntidad, setCodigosEntidad] = useState<string[]>([])
    const [entidadesNoExcelData, setEntidadesNoExcelData] = useState<EntidadNoEnExcelType[]>([])
    const [visibleProgresCircle, setVisibleProgresCircle] = useState(false)

    const { Alerta } = useAlerts()
    const { sesionPeticion } = useSession()
     const { handleSubmit, control,setValue } = useForm<GuardarEntidadVariable>({
         defaultValues: {
           id: '',
           datoRegistro:{},
           idEntidad:'',
           idVariable:'',
          
         },
       })
      
       const guardarActualizarEntidadVariable = async (data: GuardarEntidadVariable) => {
          //console.log(datosCargaEntidadvariable)
          setBotonDeshabilitado(true)
          const pasoValidacion= await validacionRegistrarEntidadVariable(data)
          console.log(pasoValidacion)
          if(pasoValidacion){

          let contador =0
          let totalFIlas=datosCargaEntidadvariable.length
          for (const [clave, valor] of Object.entries(datosCargaEntidadvariable)) {
            const nuevoObjeto = { ...valor };
            delete nuevoObjeto.entidad
            const idEntidad:string=valor.entidad
            
            data.idEntidad=idEntidad.toString()
            console.log(data.idEntidad)
            data.datoRegistro=nuevoObjeto
            console.log('Esto esta en el front',data)
            await guardarActualizarEntidadVariablePeticion(data)
            contador++
          }
          if (contador===totalFIlas)
            {
              Alerta({
                mensaje: 'Registro creado con éxito.',
                variant: 'success',
              })
              
              const cantidadReg=await obtenerCantidadRegistrosPorIdVariablePeticion(data.idVariable)
              if (cantidadReg>0)
                {
                  setVisibleGuardar(false)
                }
                else{
                  setVisibleGuardar(true)
                }
              await obtenerUnRegistrosPorIdVariablePeticion(data.idVariable)
            }
            limpiarInputCampoCargaExcel()
            setdatosCargaEntidadvariable([])
            setcolumnasParaTabla([])
            setEntidadesNoExcelData([])
          
          }
          else{
            setShowAlert(true)
          }
          setBotonDeshabilitado(false)
       }

       const guardarActualizarEntidadVariablePeticion = async (
        entidadVariable: GuardarEntidadVariable
      ) => {
        try {
        //  setLoadingModal(true)
          await delay(1000)
          const respuesta = await sesionPeticion({
            url: `${Constantes.baseUrl}/entidadvariable${
              entidadVariable.id ? `/${entidadVariable.id}` : ''
            }`,
            method: !!entidadVariable.id ? 'patch' : 'post',
            body: {
              ...entidadVariable,
            },
          })
          // console.log(respuesta.datos)
          // if (respuesta.datos){
          //   setEntidadVariableData(respuesta.datos)
          // }
          
          // Alerta({
          //   mensaje: InterpreteMensajes(respuesta),
          //   variant: 'success',
          // })
         // accionCorrecta()
        } catch (e) {
          imprimir(`Error al cargar datos : `, e)
          Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
        } finally {
        //  setLoadingModal(false)
        }
      }

      const validacionRegistrarEntidadVariable = async (
        data: GuardarEntidadVariable
      )=>{
          let pasoValidacion:boolean=true
          if (data.idVariable==='')
            {
              pasoValidacion= false
              setMensajeAlert('Debe seleccionar Variable')

            }
          if (datosCargaEntidadvariable.length<1)
            {
              pasoValidacion= false
              setMensajeAlert('No hay datos cargados de excel')
            }
          //Si no encontraron errores de validacion probamos con otro validador
          if (pasoValidacion){
            pasoValidacion=await validaCabeceraExcelConItemsSeleccionados(columnNamesExcel)
          }
          return pasoValidacion
      }
    
      const tipoFicha = [
        { id: '1', nombre: 'CIUDADANO' },
        { id: '2', nombre: 'FISCAL' },
        { id: '3', nombre: 'GENERAL' },
        { id: '4', nombre: 'GENERO' },
      ]
      
      useEffect(() => {
        obtenerSectorPeticion()
        obtenerTodosCodigosEntidadPeticion()
        obtenerCantidadEntidadPeticion().finally(() => {})
      }, [])


     

      const handleInputChange = (event:any,value:string) => {
        const selectedOptionSector = sectorData.find(option => option.nombre === value) 
        if (selectedOptionSector) {
          obtenerSubSectorPeticion(selectedOptionSector.id)  
        }
        
      }
    
      
    function Upload() {
        setVisibleProgresCircle(true)
        const fileUpload = (document.getElementById('fileUpload')) as HTMLInputElement;
        const dirextension=fileUpload?.value?.toLowerCase()
        const regex = /^([a-zA-Z0-9\s_\\.\-:])+(.xls|.xlsx|.csv|.ods)$/;
        if (regex.test(fileUpload?.value?.toLowerCase())) {
            let fileName = fileUpload?.files?.[0]?.name;
           
            if (typeof (FileReader) !== 'undefined') {
                const reader = new FileReader();
                if (reader.readAsBinaryString) {
                    reader.onload = (e) => {
                        processExcel(reader.result);
                    };
                    reader.readAsBinaryString(fileUpload?.files[0]);
                }
            } else {
                console.log("This browser does not support HTML5.");
            }
        } else {
            console.log("Please upload a valid Excel file.")
            if (dirextension){
              setMensajeAlert(`Archivo incorrecto, los tipos de archivos permitidos son: .xls, .xlsx, .csv, .ods `)
              setShowAlert(true)
              limpiarInputCampoCargaExcel()
            }
            
        }
    }
    
    const processExcel= async (data:any)=> {
      //console.log(columnNames)
      const workbook = XLSX.read(data, {type: 'binary'});
      const firstSheet = workbook.SheetNames[0];
      //const excelRows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[firstSheet])
      //Extraccion de la primera fila del excel
      const sheet = workbook.Sheets[firstSheet]
      const excelRows: any[][]  = XLSX.utils.sheet_to_json(sheet, { header: 1 })

      const columnKeys = Object.keys(sheet)
      const extractedColumnNames = columnKeys.filter((key) => key.match(/[A-Z]+1$/))
      .map((key) => sheet[key].v.trim().toLowerCase())
      console.log(extractedColumnNames)
    
      const processedExcelRows = excelRows.slice(1).map((row: any[]) => {
        const processedRow: { [key: string]: any } = {};
        extractedColumnNames.forEach((colName, index) => {
          processedRow[colName] = row[index];
        });
        return processedRow;
      });
      console.log('Filas procesadas:', processedExcelRows)

      await cargaDatosCabeceraExcel(extractedColumnNames)
      console.log(itemsData)
      const pasoValidacion=await validaCabeceraExcelConItemsSeleccionados(extractedColumnNames)
      
     console.log(excelRows)
     if(pasoValidacion)
      {
        //Carga de los datos que hay en la columna entidad del excel
        const datosColumnaEntidadExcel = processedExcelRows.map((fila:any) => fila.entidad)
        const pasoValidacionEntidades=await validacionEntidades(datosColumnaEntidadExcel,codigosEntidad)
        if (pasoValidacionEntidades){
          const nuevoObjetoFiltrado = filtrarColumnasValidas(processedExcelRows,extractedColumnNames)
          console.log(nuevoObjetoFiltrado)
          setdatosCargaEntidadvariable(nuevoObjetoFiltrado)
          // Obtener las claves (propiedades) del objeto para mostrar la cabecera de la tabla
          const columns = nuevoObjetoFiltrado.length > 0 ? Object.keys(nuevoObjetoFiltrado[0]) : [];
          setcolumnasParaTabla(columns)
       
          console.log(datosColumnaEntidadExcel.length)
          setCantidadEntidadEnExcel(datosColumnaEntidadExcel.length)
        }
        else{
          setShowAlert(true)
        }
        
      }
      else{
        setShowAlert(true)
      }
      setVisibleProgresCircle(false)
  }

  // Función para filtrar las columnas validas del excel, incluida la columna entidad
  function filtrarColumnasValidas(processedExcelRows:any,extractedColumnNames:any): { [key: string]: any }[] {
    const nuevoObjeto: { [key: string]: any }[] = [];
    const columnasValidas :string[]= ['entidad', ...itemsData.map((item) => item.nombre.replace(/\s+/g, ''))];
    const columnasValidasMinusculas = columnasValidas.map((cadena:any) => cadena.toLowerCase())
    setcamposItemValidaosMinuscula(columnasValidasMinusculas)
    processedExcelRows.forEach((fila:any) => { 
      const filaExtraida: { [key: string]: any } = {};
      columnasValidasMinusculas.forEach((columna) => {
        if (fila[columna] !== undefined) {
          filaExtraida[columna] = fila[columna];
        }
      });
      nuevoObjeto.push(filaExtraida);
    })
    return nuevoObjeto;
  }
  
  const cargaDatosCabeceraExcel = async (cabeceraExcel: any)=>{
    setColumnNamesExcel(cabeceraExcel)
  }

  const validaCabeceraExcelConItemsSeleccionados = async (cabeceraExcel: any)=>{
    let pasoValidacion:boolean=true
    if (itemsData.length>0)
      {
            const itemsDataEnMinusculas = itemsData.map((item) => ({
              ...item,
              nombre: item.nombre.toLowerCase(),
            }))
            console.log('item Data',itemsDataEnMinusculas)
            const cabeceraEnMinusculas = cabeceraExcel.map((cadena:any) => cadena.toLowerCase())
            console.log('cabeceraExcel actualizado:', cabeceraEnMinusculas)
          
            const existeColumnaEntidad = cabeceraEnMinusculas.includes("entidad")
        if(existeColumnaEntidad){ 
            const valorNoEncontrado = itemsDataEnMinusculas.find((item) => {
              const nombreEnMinusculas = item.nombre.toLowerCase();
              return !cabeceraEnMinusculas.includes(nombreEnMinusculas);
            })

            if (valorNoEncontrado) {
              pasoValidacion=false
              setMensajeAlert(`La columna "${valorNoEncontrado.nombre}" no está en el archivo excel.`)
              limpiarInputCampoCargaExcel()
              //setShowAlert(true)
            } else {
              console.log("Todos los valores están en cabeceraEnMinusculas.");
            }
        }
        else{
          pasoValidacion=false
          setMensajeAlert('No hay la columna entidad en el archivo excel.')
          limpiarInputCampoCargaExcel()
         // setShowAlert(true)
        }
      }
      else{
        pasoValidacion=false
        setMensajeAlert('No hay items en la variable o no selecciono variable')
        limpiarInputCampoCargaExcel()
        //setShowAlert(true)
      }

      return pasoValidacion
  }

  const validacionEntidades = async (entidadesExcel: any, entidadesDataBD:any)=>{
    let pasoValidacionEntidades:boolean=true
    const diferencias = entidadesExcel
                            .map((elemento, index) => {
                             if (!entidadesDataBD.includes(elemento)) {
                               return { posicion: index, elemento };
                             }
                             return null;
                            })
      .filter(diferencia => diferencia !== null)
      if (diferencias.length>0){
        setMensajeAlert(`La entidad "${diferencias[0].elemento}" en la fila "${diferencias[0].posicion + 2}" no existe en la base de datos.`)
        pasoValidacionEntidades=false
        limpiarInputCampoCargaExcel()
      }
      else{
        const entidadesNoEstanExcel = entidadesDataBD
                            .map((elemento, index) => {
                             if (!entidadesExcel.includes(elemento)) {
                               return { posicion: index, elemento };
                             }
                             return null;
                            })
      .filter(diferencia => diferencia !== null)
      const entidadesNoExcelFiltrada = entidadesNoEstanExcel.map((entidad: { elemento: string }) => String(entidad.elemento))
      console.log('Entidades que no estan en el excel',entidadesNoExcelFiltrada)
        if(entidadesNoExcelFiltrada.length>0){
          await obtenerConjuntoEntidadesPeticion(entidadesNoExcelFiltrada)
        }
      
      }
      return pasoValidacionEntidades
  }


  const aceptarAlerta = async () => {
    setShowAlert(false) 
  }
  const limpiarInputCampoCargaExcel = async () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Limpia el valor del input
    }
  }
  //console.log(columnNames)

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

const obtenerConjuntoEntidadesPeticion = async (arrayEntidades:string[]) => {
  console.log('arry para consulta',arrayEntidades)
  try {
    
    const respuesta = await sesionPeticion({
      url: `${Constantes.baseUrl}/entidad/conjunto-entidades/${arrayEntidades}`,
    })
    console.log(respuesta.datos)
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

const obtenerCantidadRegistrosPorIdVariablePeticion = async (idVariable: string) => {
  try {
    const respuesta = await sesionPeticion({
      url: `${Constantes.baseUrl}/entidadvariable/cantidad/variable/${idVariable}`,
    })
    setCantidadRegistrados(respuesta.count.count)
    console.log(respuesta.count.count)
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
    const codigos = data.map((entidad: { codigoEntidad: string }) => +entidad.codigoEntidad)
    setCodigosEntidad(codigos)
  } catch (e) {
    imprimir(`Error al obtener cantidad de registros de entidad`, e)
    Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    throw e
  } finally {
  
  }
}

const obtenerUnRegistrosPorIdVariablePeticion = async (idVariable: string) => {
  try {
    const respuesta = await sesionPeticion({
      url: `${Constantes.baseUrl}/entidadvariable/registro/variable/${idVariable}`,
    })
    console.log(respuesta.usuarioCreacion)
    setEntidadVariableData(respuesta)
    respuesta.usuarioCreacion && await obtenerUnUsuarioPeticion(respuesta.usuarioCreacion)
 //   return respuesta.datos
    
  } catch (e) {
    imprimir(`Error al obtener un registros de EntidadVariable`, e)
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
    console.log(respuesta.datos.persona)
    const nombreUsuario=respuesta.datos.persona.nombres+' '+respuesta.datos.persona.primerApellido+' '+respuesta.datos.persona.segundoApellido
    setNombreUsuarioReg(nombreUsuario)
   // setEntidadVariableData(respuesta)
 //   return respuesta.datos
    
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
  const handleInputChangeSelectFicha = async (event: SelectChangeEvent<typeof valorSelectFicha>) => {
    setValorSelectFicha(event.target.value)
    await restablecerDatosEnSelectFicha()
    if(event.target.value)
      {
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
  const handleInputChangeSelectSubSector = async (event: SelectChangeEvent<typeof valorSelectSubSector>) => {
    await restablecerDatosEnSelectSubSector()
    setValorSelectSubSector(event.target.value)
    if(event.target.value)
      {
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
  const handleInputChangeSelectVariable = async (event: SelectChangeEvent<typeof valorSelectSubSector>) => {
    await restablecerDatosEnSelectVariable()
    const idVariable=event.target.value
    setValorSelectVariable(idVariable)
    setValue('idVariable', idVariable)
    if(idVariable)
      {
      const cantidadReg=await obtenerCantidadRegistrosPorIdVariablePeticion(idVariable)
      if (cantidadReg>0)
        {
          setVisibleGuardar(false)
        }
        else{
          setVisibleGuardar(true)
        }
      await obtenerUnRegistrosPorIdVariablePeticion(idVariable)
       const datosConsultaItem = await obtenerItemsPeticion(idVariable)
       let infoDeVariableSeleccionada:string=''
       if(datosConsultaItem.length>0)
        {
          infoDeVariableSeleccionada='Items de Variable: entidad'
          datosConsultaItem.map((dat:any)=>{
            // console.log(dat.nombre)
             infoDeVariableSeleccionada=infoDeVariableSeleccionada+'| '+dat.nombre
          })
        console.log(datosConsultaItem)
        }
        else{
          infoDeVariableSeleccionada='La variable seleccionada no tiene Item'
        }
        setmensajeVariableSeleccionado(infoDeVariableSeleccionada)
       
      }
  }
  // Función para formatear la fecha como "dd/mm/yyyy"
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-GB', options); // 'en-GB' for DD/MM/YYYY format
  }
  const eliminarCargaEntidadVariable = () => {
   // setSubSectorEdicion(subSector)
    setMostrarAlertaEliminarEntidadVariable(true)
  }
  const cancelarAlertaEliminarCargaEntidadVariable = async () => {
    setMostrarAlertaEliminarEntidadVariable(false)
    await delay(500)
   // setSubSectorEdicion(null)
  }

  const aceptarAlertaEliminarCargaEntidadVariable = async () => {
    setMostrarAlertaEliminarEntidadVariable(false)
    if (entidadVariableData) {
      await eliminarCargaEntidadVariablePeticion(entidadVariableData)
    }
    //setSubSectorEdicion(null)
  }
   /// Eliminar carga Entidad Variable
   const eliminarCargaEntidadVariablePeticion = async (entidadVariableData: EntidadVariableType) => {
    try {
      //setLoading(true)
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/entidadvariable/${entidadVariableData.idVariable}/eliminar-idvariable`,
        method: 'patch',
      })
      
      if(respuesta.finalizado)
        {
          setEntidadVariableData(null)
          setVisibleGuardar(true)
        }
      imprimir(`respuesta eliminar carga entidad variable: ${respuesta}`)
      Alerta({
        mensaje:'Registro eliminado con éxito',// InterpreteMensajes(respuesta),
        variant: 'success',
      })
     // await obtenerSubSectorPeticion()
    } catch (e) {
      imprimir(`Error al eliminar carga entidad variable`, e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    } finally {
     // setLoading(false)
    }
  }
 
  const restablecerDatosEnSelectFicha = async ()=>{
    setValorSelectVariable('')
    setValorSelectSubSector('')
    setmensajeVariableSeleccionado('')
    setEntidadVariableData(null)
    setdatosCargaEntidadvariable([])
    setVisibleGuardar(false)
    setcolumnasParaTabla([])
    setEntidadesNoExcelData([])
    
  }

  const restablecerDatosEnSelectSubSector = async ()=>{
    setValorSelectVariable('')
    setmensajeVariableSeleccionado('')
    setEntidadVariableData(null)
    setdatosCargaEntidadvariable([])
    setVisibleGuardar(false)
    setcolumnasParaTabla([])
    setEntidadesNoExcelData([])
  }
  
  const restablecerDatosEnSelectVariable = async ()=>{
    setdatosCargaEntidadvariable([])
    setcolumnasParaTabla([])
    setEntidadesNoExcelData([])
  }

   
    return (
        <>
        <AlertDialog
        isOpen={mostrarAlertaEliminarEntidadVariable}
        titulo={'Alerta'}
        texto={'Esta seguro de eliminar los datos cargados?'}
      >
        <Button variant={'outlined'} onClick={cancelarAlertaEliminarCargaEntidadVariable}>
          Cancelar
        </Button>
        <Button variant={'contained'} onClick={aceptarAlertaEliminarCargaEntidadVariable}>
          Aceptar
        </Button>
      </AlertDialog>


        <AlertDialog
        isOpen={showAlert}
        titulo={'Alerta'}
        texto={mensajeAlert}
        >
        
        <Button variant={'contained'} onClick={aceptarAlerta}>
          Aceptar
        </Button>
      </AlertDialog>
        <form onSubmit={handleSubmit(guardarActualizarEntidadVariable)}>
        {/* <DialogContent dividers> */}
          {/* Prueba para el formulario */}
          <Grid container direction="row" justifyContent="space-evenly">
            {/* Espacio entre las dos columnas */}
            <Box height={'5px'} />

            {/* Primera columna */}
            <Grid item xs={12} sm={6} md={6} lg={5}>
              <Grid
                container
                direction="column"
                spacing={{ xs: 2, sm: 1, md: 2 }}
              >
                {/* Input 1 */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{ flex: 1, height: '1px', backgroundColor: 'black' }}
                  />
                  <div>
                    <p style={{ textAlign: 'center' }}>Configuración</p>
                  </div>
                  <div
                    style={{ flex: 1, height: '1px', backgroundColor: 'black' }}
                  />
                </div>

      <Grid item xs={12} sm={12} md={12}>
                {/* <FormInputAutocomplete
                  id={'nombreCorto'}
                  control={control}
                  name="nombreCorto"
                  label="Ficha"
                  rules={
                    { required: 'Este campo es requerido' } 
                  }
                  freeSolo
                  newValues
                  forcePopupIcon
                  options={sectorData.map((ang) => ({
                    key: ang.id,
                    value: ang.id,
                    label: ang.nombre,
                  }))}
                  getOptionLabel={(option) => option.label}
                  renderOption={(option) => <>{option.label}</>}
                  onInputChange={handleInputChange}
                /> */}


      <FormControl sx={{ m: 1, width: '100%', }} size="small" > 
        <InputLabel id="demo-controlled-open-select-label">Ficha</InputLabel>
        <Select
          labelId="demo-controlled-open-select-label"
          id="demo-controlled-open-select"
          open={openSelectFicha}
          onClose={handleCloseSelectFicha}
          onOpen={handleOpenSelectFicha}
          value={valorSelectFicha}
          label="Ficha"
          onChange={handleInputChangeSelectFicha}
        >
          {sectorData.map((sect) => (
            <MenuItem
              value={sect.id} 
            >
              {sect.nombre}
            </MenuItem>
          ))}
        </Select>
       </FormControl> 
    </Grid>

    {/* Input 2 */}
    <Grid item xs={12} sm={12} md={8}>
       <FormControl sx={{ m: 1, width: '100%' }} size="small"> 
        <InputLabel id="demo-select-small-label">Sub Sector</InputLabel>
        <Select
          labelId="demo-select-small-label"
          id="demo-select-small"
          open={openSelectSubSector}
          onClose={handleCloseSelectSubSector}
          onOpen={handleOpenSelectSubSector}
          value={valorSelectSubSector}
          label="Sub Sector"
          onChange={handleInputChangeSelectSubSector}
        >
          {subsectorData.map((subsect) => (
            <MenuItem
              value={subsect.id} 
            >
              {subsect.nombre}
            </MenuItem>
          ))}
        </Select>
       </FormControl> 
    </Grid>

      <Grid item xs={12} sm={12} md={4}>
       <FormControl sx={{ m: 1, width: '100%' }} size="small"> 
          <InputLabel id="demo-select-small-label">Variables</InputLabel>
          <Select
            labelId="demo-select-small-label"
            id="demo-select-small"
            name="idVariable"
            open={openSelectVariable}
            onClose={handleCloseSelectVariable}
            onOpen={handleOpenSelectVariable}
            value={valorSelectVariable}
            label="Variables"
            onChange={handleInputChangeSelectVariable}
          >
            {variablesData && variablesData.map((variable) => (
              <MenuItem
                value={variable.id} 
              >
                {variable.nombre}
              </MenuItem>
            ))}
          </Select>
       </FormControl> 
        <div >
         <p>{mensajeVariableSeleccionado}</p>
         </div>
      </Grid>
              
    </Grid>
  </Grid>

            {/* Segunda columna */}
            <Grid item xs={12} sm={6} md={6} lg={5}>
              <Grid
                container
                direction="column"
                spacing={{ xs: 2, sm: 1, md: 2 }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{ flex: 1, height: '1px', backgroundColor: 'black' }}
                  />
                  <div>
                    <p style={{ textAlign: 'center' }}>Información</p>
                  </div>
                  <div
                    style={{ flex: 1, height: '1px', backgroundColor: 'black' }}
                  />
                </div>
                {/* Input 6 */}
                <Grid item xs={12} sm={12} md={12}>
                
                </Grid>


                 <Grid item xs={12} sm={12} md={12}>
                  {entidadVariableData && (
                  
                 <div style={{  height: '190px' }}>
                   <Typography variant={'body2'} >
                    Fecha ultima actualización: {entidadVariableData?.fechaCreacion ? formatDate(entidadVariableData.fechaCreacion) : 'N/A'}
                  </Typography>
                  <Typography variant={'body2'} >
                    Operador: {titleCase(nombreUsuarioReg)}
                  </Typography>
                  <Typography variant={'body2'} >
                    Cantidad de Ragistro: {cantidadRegistrados} 
                  </Typography>
             
               <Grid container>
                 <Grid item xs={6}>
                {/* <Button
                   variant={'contained'} 
                   color={'info'}
                  >
                  Descargar
                 </Button> */}
                
                </Grid> 
                <Grid item xs={6} container justifyContent="flex-end">
                <Button 
                  variant={'outlined'} 
                  color={'error'}
                  onClick={eliminarCargaEntidadVariable}
                  //disabled={loadingModal} 
                  type={'button'}>
                  Eliminar
               </Button>
                </Grid>
              </Grid>
              </div>
              )}
                   
                </Grid> 
                

                <Grid item xs={12} sm={12} md={12}>
                {visibleGuardar && (
                   <input type="file" id="fileUpload" ref={fileInputRef} onChange={Upload} disabled={botonDeshabilitado} />
                )}
                 
                 {visibleProgresCircle && (
                  <Box sx={{ display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                     }}>
                     <CircularProgress />
                   </Box>
                 )}
                   
                </Grid>
            
              </Grid>
            </Grid>

            {/* Espacio entre las dos columnas */}
            <Box height={'20px'} />
          </Grid>
        
<Grid container direction="row" justifyContent="space-evenly" >
            {/* Espacio entre las dos columnas */}
  <Box height={'5px'} />

    {/* Primera columna */}
    <Grid item xs={12} sm={6} md={6} lg={5} >
        <Grid
          container
          direction="column"
          spacing={{ xs: 2, sm: 1, md: 2 }}
          style={{
            maxWidth: '100%',
            maxHeight: '320px',
            overflow: 'auto',
            //border: '1px solid #000000',
            }}
          >
      {/* Input 1 */}
          <Grid item xs={12} sm={6} md={6}  lg={5} >
              {/* Espacio para la tabla */}
              <TableContainer component={Paper} >
                 <Table size="small" sx={{ minWidth: 50,'&:last-child td, &:last-child th': { border: 1 }  }} aria-label="simple table">
                  <TableHead>
                   <TableRow >  
                     {/* { Object.keys(datosCargaEntidadvariable[0]).map((columna) => (
              <th key={columna}>{columna}</th>
             ))}    */}   
                      {columnasParaTabla.map((columna) => (
                      <TableCell key={columna}>{columna}</TableCell>
                    ))}      
                    </TableRow>
                 </TableHead>
                <TableBody>
                  {datosCargaEntidadvariable.map((fila, index) => (
                        <TableRow key={index}>
                            {Object.keys(fila).map((columna) => (
                                <TableCell key={columna}>{fila[columna]}</TableCell>
                            ))}
                        </TableRow>
                    ))}

                </TableBody>
               </Table>
              </TableContainer>
          </Grid> 

          
                  
    </Grid>
  </Grid>

    {/* Segunda columna */}
  <Grid item xs={12} sm={6} md={6} lg={5}>
      <Grid
        container
        direction="column"
        spacing={{ xs: 2, sm: 1, md: 2 }}
        >
      
      {/* Input 6 */}
                
        <Grid item xs={12} sm={12} md={12}>
           {/* Espacio para poner el div de detallle de la carga actual */}    
            {datosCargaEntidadvariable.length>0 &&(
              <div >
                   <Typography variant={'body2'} >
                    Total entidades: {cantidadEntidad}
                  </Typography>
                  <Typography variant={'body2'} >
                    Total para cargar: {cantidadEntidadEnExcel}
                  </Typography>
              </div>  
            )} 
             
             {entidadesNoExcelData.length>0 &&(
              <>
             <Typography variant={'body2'} >
                    Entidades que no estan en la carga: {entidadesNoExcelData.length}
            </Typography>
            <div style={{
                  maxWidth: '100%',
                  maxHeight: '320px',
                  overflow: 'auto',
                  //border: '1px solid #000000',
                  }}>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 150,border: 1 }} size="small" aria-label="a dense table">
                <TableHead>
                  <TableRow>
                    <TableCell align="left">Codigo</TableCell>
                    <TableCell align="left">Entidad</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {entidadesNoExcelData.map((row) => (
                    <TableRow
                      key={row.id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell align="left">{row.codigoEntidad}</TableCell>
                      <TableCell align="left">{row.nombre}</TableCell>
                      
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
           </TableContainer>  
           </div>
           </> 
          )}   
        </Grid> 
                

     </Grid>
  </Grid>

      {/* Espacio entre las dos columnas */}
 <Box height={'20px'} />
</Grid>

   {/* </DialogContent> */}
        <DialogActions
              sx={{
                my: 1,
                mx: 2,
                justifyContent: {
                  lg: 'center',
                  md: 'center',
                  xs: 'center',
                  sm: 'center',
                },
              }}
            >
          {visibleGuardar && (
          <Button 
            variant={'contained'}
            disabled={botonDeshabilitado}   
            type={'submit'}>
            Guardar
          </Button>
          )}
        </DialogActions>
</form>
    <br></br>
    <br></br>
    <br></br>
        </>
      )
}

