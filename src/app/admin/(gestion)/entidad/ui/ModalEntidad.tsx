import { Box, Button, DialogActions, DialogContent, Grid } from '@mui/material'
import {
  CategoriaType,
  CrearEditarEntidadType,
  EntidadCRUDType,
  NivelGobiernoType,
  //TipoEntidadType,
  DepartamentosType,
} from '../types/entidadCRUDTypes'
import { FormInputDropdown, FormInputText } from '@/components/form'
import { AlertDialog } from '@/components/modales/AlertDialog'
import { useState } from 'react'
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

export interface ModalEntidadType {
  entidad?: EntidadCRUDType | undefined | null
  categoria: CategoriaType[]
  nivelGobierno: NivelGobiernoType[]
  //tipoEntidad: TipoEntidadType[]
  departamentos:DepartamentosType[]
  accionCorrecta: () => void
  accionCancelar: () => void
}
let excelRowsString: string="";
let excelRows2: any = [];
let datajson:number[][];


/*datosArray.push(array1);
datosArray.push(array2);
console.log(datosArray);*/
/*const [fileData, setFileData] = useState([]);
const handleFileChange = (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = (event) => {
    const data = event.target.result;
    const workbook = XLSX.read(data, { type: 'binary' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    setFileData(jsonData);
  };

  reader.readAsBinaryString(file);
};*/
/*const handleInputChange= (event)=> {
  alert('cdvdfvc ');
  const target = event?.target
  const value = target.type==='checkbox' ? target.checked:target.value
  const name = target.name
  const this2 = this
  this.setState({ 
  [name]: value
  })
  let hojas = []
  if (name=='file') {
  let reader = new FileReader()
  reader.readAsArrayBuffer(target.files[0])
  reader.onloadend = (e) => { 
    var data = new Uint8Array(e.target.result);
    var workbook = XLSX.read(data, {type: 'array'});
  
  workbook.SheetNames.forEach(function(sheetName) {
  
  var XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
    hojas.push({ 
      data: XL_row_object,
      sheetName
   })
  })
  console.log(hojas)
  this2.setState({ 
    selectedFileDocument: target.files[0],
    hojas
  })
  
  }
  }
  }*/
  function Upload() {
    const fileUpload = (document.getElementById('fileUpload')) as HTMLInputElement;;
    const regex = /^([a-zA-Z0-9\s_\\.\-:])+(.xls|.xlsx)$/;
    if (regex.test(fileUpload?.value?.toLowerCase())) {
        let fileName = fileUpload?.files[0].name;
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

function processExcel(data) {
    const workbook = XLSX.read(data, {type: 'binary'});
    const firstSheet = workbook.SheetNames[0];
    const excelRows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[firstSheet]);

   
    excelRows2.value=excelRows;
    const dataString = JSON.stringify(excelRows);
    const newString = dataString.replace(/"Latitud":/g, '');
    const newString2 = newString.replace(/"Longitud":/g, '');
    const newString3 = newString2.replace(/{/g, '[');
    const newString4 = newString3.replace(/}/g, ']');
    const newString5 = newString4.replace(/"/g, '');
    
    
    excelRowsString=newString5;
    // Convertir el string a una matriz de números (number[][])
      datajson = JSON.parse(newString5);

    // Imprimir el resultado
    // console.log('parseado --->', datajson);
     // Obtener el elemento por su ID

}

export const VistaModalEntidad = ({
  entidad,
  categoria,
  nivelGobierno,
  //tipoEntidad,
  departamentos,
  accionCorrecta,
  accionCancelar,
}: ModalEntidadType) => {
  // Flag que índica que hay un proceso en ventana modal cargando visualmente
  const [loadingModal, setLoadingModal] = useState<boolean>(false)
  const { Alerta } = useAlerts()
  const { sesionPeticion } = useSession()

  const { handleSubmit, control,setValue  } = useForm<CrearEditarEntidadType>({
    defaultValues: {
      id: entidad?.id,
      codigoEntidad: entidad?.codigoEntidad,
      codigoDepartamento: entidad?.codigoDepartamento,
      nombre: entidad?.nombre,
      coordenadasGeograficas:entidad?.coordenadasGeograficas,
      nombreGam: entidad?.nombreGam,
      idCategoria: entidad?.categoria.id,
      idNivelGobierno: entidad?.nivelGobierno.id,
     // idTipoEntidad: entidad?.tipoEntidad.id,
      filecoordenadas:"",
    },
  })
  console.log(entidad)
  const [mostrarAlertaInfoCargaArchivo, setMostrarAlertaInfoCargaArchivo] =
    useState(false)
  const [isDisabled, setIsDisabled] = useState(false); // Estado local para controlar la propiedad 'disabled'
  const [isVisible, setIsVisible] = useState(true); // Estado local para controlar la visibilidad
  const [nombreGamValue, setNombreGamValue] = useState('');
  const guardarActualizarEntidad = async (data: CrearEditarEntidadType) => {
    /*Se cargara desde el excel solo cuando haya datos (en un nuevo registro o cuando se modifiquen las coordenadas) */
    if(excelRowsString.length>1)
    {
      data.coordenadasGeograficas=excelRowsString;
    } 
    
    console.log('Esto esta en el front',data)
    data.nombreGam=nombreCOmpletoGam
    await guardarActualizarEntidadPeticion(data)
  }

  const guardarActualizarEntidadPeticion = async (
    entidad: CrearEditarEntidadType
  ) => {
    try {
      setLoadingModal(true)
      await delay(1000)
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/entidad${
          entidad.id ? `/${entidad.id}` : ''
        }`,
        method: !!entidad.id ? 'patch' : 'post',
        body: {
          ...entidad,
        },
      })
      Alerta({
        mensaje: InterpreteMensajes(respuesta),
        variant: 'success',
      })
      accionCorrecta()
    } catch (e) {
      imprimir(`Error al crear o actualizar entidad: `, e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    } finally {
      setLoadingModal(false)
    }
  }
var subnombreGam:string=''
var nombreCOmpletoGam:string=''
  const cargarNombreCompleto =  (valorSeleccionado: any) => {
    //alert(valorSeleccionado)
    //console.log('valor seleccionado',valorSeleccionado.target.value)
    const idNivelgob:string=valorSeleccionado.target.value

   var nombreNivelGob:string=''
    const componentes = Object.entries(nivelGobierno).map(([clave, valor]) => {
      if (valor.id === idNivelgob) {
        var valorNombre = (document.getElementById('nombre') as HTMLInputElement).value
        //alert(valor.id+'idNivelgob:'+idNivelgob)
        nombreNivelGob=valor.nombre+' de '+valorNombre
        setValue('nombreGam', nombreNivelGob);
       // console.log(nombreNivelGob);
       // var inputNombreGam = (document.getElementById('nombreGam') as HTMLInputElement)
    
       // setNombreGamValue(nombreNivelGob);
// Asignar un valor al input
      subnombreGam=valor.nombre+' de '
      //inputNombreGam.value = nombreNivelGob;
      //nombreCOmpletoGam=nombreNivelGob
      }
      // Puedes retornar algo aquí si lo necesitas
    });

    if (idNivelgob==='1'){
      setIsDisabled(true);
      setIsVisible(false);
     }
     else{
      setIsDisabled(false);
      setIsVisible(true);
     }

  }

  const completarNombreGam=  () => {
    var valorNombre = document.getElementById('nombre').value;
    var inputNombreGam = document.getElementById('nombreGam');
    setValue('nombreGam', subnombreGam+valorNombre);
    //inputNombreGam.value = subnombreGam+valorNombre;
     console.log(subnombreGam+valorNombre)
     nombreCOmpletoGam=subnombreGam+valorNombre
  }
  const infoCargaArchivoModal = () => {
    setMostrarAlertaInfoCargaArchivo(true)
  }
  const aceptarAlertaInfoCargaArchivo = async () => {
    setMostrarAlertaInfoCargaArchivo(false)
  }


 
  
 
  
  
   
  return (
    <>
    <AlertDialog
    isOpen={mostrarAlertaInfoCargaArchivo}
    titulo={'Informacion del formato para el archivo'}
    texto={
      <>
        Cargar un archivo excel con el siguiente formato:
        <br />
      <TableContainer component={Paper}>
      <Table sx={{ minWidth: 450,'&:last-child td, &:last-child th': { border: 1 }  }} aria-label="simple table">
        <TableHead>
          <TableRow >
            <TableCell align="left">Latitud</TableCell>
            <TableCell align="left">Longitud</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>

            <TableRow >
              <TableCell align="left">{'-66.93279366978281'}</TableCell>
              <TableCell align="left">{'-17.618028490249383'}</TableCell>
            </TableRow>
            <TableRow >
              <TableCell align="left">{'-66.9434534534544'}</TableCell>
              <TableCell align="left">{'-17.622323434343443'}</TableCell>
            </TableRow>
        
        </TableBody>
      </Table>
    </TableContainer>
        
      </>}
  >
   
    <Button variant={'contained'} onClick={aceptarAlertaInfoCargaArchivo}>
      Aceptar
    </Button>
  </AlertDialog>

    <form onSubmit={handleSubmit(guardarActualizarEntidad)}>
      <DialogContent dividers>
        <Grid container direction={'column'} justifyContent="space-evenly">
          <Box height={'5px'} />
          <Grid container direction="row" spacing={{ xs: 2, sm: 1, md: 2 }}>

          <Grid item xs={12} sm={12} md={3}>
              <FormInputDropdown
                id={'idCategoria'}
                name="idCategoria"
                control={control}
                label="Categoria"
                disabled={loadingModal}
                options={categoria.map((cat) => ({
                  key: cat.id,
                  value: cat.id,
                  label: cat.nombre,
                }))}
                rules={{ required: 'Este campo es requerido' }}
              />
            </Grid>

            <Grid item xs={12} sm={12} md={9}>
              <FormInputDropdown
                id={'idNivelGobierno'}
                name="idNivelGobierno"
                control={control}
                label="Nivel de Gobierno"
                disabled={loadingModal}
                options={nivelGobierno.map((nivel) => ({
                  key: nivel.id,
                  value: nivel.id,
                  label: nivel.nombre,
                }))}
                rules={{ required: 'Este campo es requerido' }}
                onChange={(selectedValue) => cargarNombreCompleto(selectedValue)}
              />
            </Grid>

            {/*<Grid item xs={12} sm={12} md={4}>
              <FormInputDropdown
                id={'idTipoEntidad'}
                name="idTipoEntidad"
                control={control}
                label="Tipo de Entidad"
                disabled={loadingModal}
                options={tipoEntidad.map((tipo) => ({
                  key: tipo.id,
                  value: tipo.id,
                  label: tipo.nombre,
                }))}
                rules={{ required: 'Este campo es requerido' }}
              />
              </Grid>*/}
              

            <Grid item xs={12} sm={12} md={6}>
              <FormInputText
                id={'codigoEntidad'}
                control={control}
                name="codigoEntidad"
                label="Codigo Entidad"
              />
            </Grid>
            {isVisible && (
            <Grid item xs={12} sm={12} md={6}>
              <FormInputDropdown
                id={'codigoDepartamento'}
                name="codigoDepartamento"
                control={control}
                label="Departamento"
                disabled={isDisabled} // Usa el estado local aquí
                options={departamentos.map((dpto) => ({
                  key: dpto.id,
                  value: dpto.id,
                  label: dpto.nombre,
                }))}
                //rules={{ required: 'Este campo es requerido' }}
              />
              </Grid>
              )}
           

            <Grid item xs={12} sm={12} md={12}>
              <FormInputText
                id={'nombre'}
                control={control}
                name="nombre"
                label="Nombre Corto"
                rules={{ required: 'Este campo es requerido' }}
                onChange={completarNombreGam}
              />
            </Grid>

            <Grid item xs={12} sm={12} md={12}>
               {/* <FormInputText
                id={'coordenadasGeograficas'}
                control={control}
                name="coordenadasGeograficas"
                label=""
                type={'hidden'}
              />  */}

              {/* <FormInputFile
              id={'filecoordenadas'}
              control={control} 
              name="filecoordenadas"
              label="Coordenadas files"
              handleChange={handleInputChange}
            /> */}
            <IconoTooltip
              id={'icc'}
              titulo={'Informacion'}
              color={'info'}
              accion={() => {
                infoCargaArchivoModal()
              }}
             icono={'info'}
             name={'Eliminar entidad'}
        />
            <input type="file" id="fileUpload" onChange={Upload} />
            </Grid>

            <Grid item xs={12} sm={12} md={12}>
              <FormInputText
                id={'nombreGam'}
                control={control}
                name="nombreGam"
                label="Nombre Completo"
              />
            </Grid>

            

            

            
          </Grid>
          <Box height={'20px'} />
        </Grid>
      </DialogContent>
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
          variant={'outlined'}
          disabled={loadingModal}
          onClick={accionCancelar}
        >
          Cancelar
        </Button>
        <Button variant={'contained'} disabled={loadingModal} type={'submit'}>
          Guardar
        </Button>
      </DialogActions>
    </form>
    </>
  )
}
