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
} from './types/cargaDatosType' 
import { FormInputDropdown, FormInputText,FormInputDate,optionType } from '@/components/form'
import { AlertDialog } from '@/components/modales/AlertDialog'
import { useState,useEffect,ReactNode,useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useAlerts, useSession } from '@/hooks'
import { delay, InterpreteMensajes } from '@/utils'
import { Constantes } from '@/config/Constantes'
import { imprimir } from '@/utils/imprimir'
import FormInputFile from '@/components/form/FormInputFile'
import * as XLSX from 'xlsx';
import { IconoTooltip } from '@/components/botones/IconoTooltip'

import { makeStyles } from '@mui/material'

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

export default function FormCargaDatosView() {
  
    const storedData = localStorage?.getItem('fichaStorage');
     const initialFicha = storedData ? JSON.parse(storedData) : null;
     console.log('Valor del estorage',initialFicha)
    const [ficha, setFichaNewData] = useState<CrearEditarFichaType>(initialFicha)
    const [sectorData, setSectorData] = useState<FichaType[]>([])
    const [subsectorData, setSubSectorData] = useState<SubSectorType[]>([])
    const [variablesData, setVariablesData] = useState<VariablesType[]>([])
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
  
   //console.log('Ficha cargada',ficha)
   
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
              
            }
            limpiarInputCampoCargaExcel()
            setdatosCargaEntidadvariable([])
            setcolumnasParaTabla([])
          
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
        obtenerSectorPeticion().finally(() => {})
      }, [])


     

      const handleInputChange = (event:any,value:string) => {
        const selectedOptionSector = sectorData.find(option => option.nombre === value) 
        if (selectedOptionSector) {
          obtenerSubSectorPeticion(selectedOptionSector.id)  
        }
        
      }
    
      
    let excelRows2: any = [];
    let excelRowsString: string="";
    let datajson:number[][];
    function Upload() {
        const fileUpload = (document.getElementById('fileUpload')) as HTMLInputElement;;
        const regex = /^([a-zA-Z0-9\s_\\.\-:])+(.xls|.xlsx)$/;
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
            console.log("Please upload a valid Excel file.");
        }
    }
    
    const processExcel= async (data:any)=> {
      //console.log(columnNames)
      const workbook = XLSX.read(data, {type: 'binary'});
      const firstSheet = workbook.SheetNames[0];
      const excelRows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[firstSheet])
      //Extraccion de la primera fila del excel
      const sheet = workbook.Sheets[firstSheet]
      const columnKeys = Object.keys(sheet)
      const extractedColumnNames = columnKeys.filter((key) => key.match(/[A-Z]+1$/))
      .map((key) => sheet[key].v)
      console.log(extractedColumnNames)

      await cargaDatosCabeceraExcel(extractedColumnNames)
      console.log(itemsData)
      const pasoValidacion=await validaCabeceraExcelConItemsSeleccionados(extractedColumnNames)
      
     console.log(excelRows)
     if(pasoValidacion)
      {
        const nuevoObjetoFiltrado = filtrarColumnasValidas(excelRows,extractedColumnNames)
        console.log(nuevoObjetoFiltrado)
        setdatosCargaEntidadvariable(nuevoObjetoFiltrado)
        // Obtener las claves (propiedades) del objeto para mostrar la cabecera de la tabla
        const columns = nuevoObjetoFiltrado.length > 0 ? Object.keys(nuevoObjetoFiltrado[0]) : [];
        setcolumnasParaTabla(columns)
      }
      else{
        setShowAlert(true)
      }


      
  }

  // Función para filtrar las columnas validas del excel, incluida la columna entidad
  function filtrarColumnasValidas(excelRows:any,extractedColumnNames:any): { [key: string]: any }[] {
    const nuevoObjeto: { [key: string]: any }[] = [];
    const columnasValidas :string[]= ['entidad', ...itemsData.map((item) => item.nombre)];
    const columnasValidasMinusculas = columnasValidas.map((cadena:any) => cadena.toLowerCase())
    setcamposItemValidaosMinuscula(columnasValidasMinusculas)
    excelRows.forEach((fila) => { 
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


  const handleCloseSelectFicha = () => {
    setOpenSelectFicha(false)
  }
  
  const handleOpenSelectFicha = () => {
    setOpenSelectFicha(true)
  }
  const handleInputChangeSelectFicha = (event: SelectChangeEvent<typeof valorSelectFicha>) => {
    setValorSelectFicha(event.target.value)
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
  const handleInputChangeSelectSubSector = (event: SelectChangeEvent<typeof valorSelectSubSector>) => {
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
    setValorSelectVariable(event.target.value)
    setValue('idVariable', event.target.value)
    if(event.target.value)
      {
       const datosConsultaItem = await obtenerItemsPeticion(event.target.value)
       let infoDeVariableSeleccionada:string=''
       if(datosConsultaItem.length>0)
        {
          infoDeVariableSeleccionada='Columnas esperadas: entidad'
          datosConsultaItem.map((dat:any)=>{
            // console.log(dat.nombre)
             infoDeVariableSeleccionada=infoDeVariableSeleccionada+'|'+dat.nombre
          })
        console.log(datosConsultaItem)
        }
        else{
          infoDeVariableSeleccionada='La variable seleccionada no tiene Item'
        }
        setmensajeVariableSeleccionado(infoDeVariableSeleccionada)
       
      }
  }
   
    return (
        <>
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


      <FormControl sx={{ m: 1, minWidth: 140, }} size="small" > 
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
       <FormControl sx={{ m: 1, minWidth: 120 }} size="small"> 
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
       <FormControl sx={{ m: 1, minWidth: 120 }} size="small"> 
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
            {variablesData.map((variable) => (
              <MenuItem
                value={variable.id} 
              >
                {variable.nombre}
              </MenuItem>
            ))}
          </Select>
       </FormControl> 
         <p>{mensajeVariableSeleccionado}</p>
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
                 <div style={{  height: '190px' }}>
                   
                 </div>
                   
                </Grid> 
                

                <Grid item xs={12} sm={12} md={12}>
                   <input type="file" id="fileUpload" ref={fileInputRef} onChange={Upload} />
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
              lg: 'flex-end',
              md: 'flex-end',
              xs: 'center',
              sm: 'center',
            },
          }}
        >
          
          <Button 
            variant={'contained'}
            disabled={botonDeshabilitado}   
            type={'submit'}>
            Guardar
          </Button>
        </DialogActions>
      </form>

      {/* <TablaDinamica datos={itemsData} /> */}
      <TableContainer component={Paper} sx={{width:550}}>
      <Table size="small" sx={{ minWidth: 350,width:550,'&:last-child td, &:last-child th': { border: 1 }  }} aria-label="simple table">
        <TableHead>
          <TableRow >     
              {/* { Object.keys(datosCargaEntidadvariable[0]).map((columna) => (
              <th key={columna}>{columna}</th>
             ))}   */}

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
    <br></br>
    <br></br>
    <br></br>
        </>
      )
}

