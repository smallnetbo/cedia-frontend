// FichasView.js
import { Box, Button, DialogActions, DialogContent, Grid } from '@mui/material'
import {
  //CategoriaType,
 // CrearEditarEntidadType,
  CrearEditarFichaType,
  FichaCRUDType,
  //EntidadCRUDType,
  //NivelGobiernoType,
  //TipoEntidadType,
 /// DepartamentosType,
} from './types/fichaCRUDTypes' // '../types/entidadCRUDTypes'
import { FormInputDropdown, FormInputText,FormInputDate,FormInputTextWithIcon } from '@/components/form'
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
import {SketchPicker} from 'react-color'
import Popover from '@mui/material/Popover'

export default function FormFichasView() {
    // const miDatoString = localStorage.getItem('miDato')
    //         if (miDatoString !== null) {
    //             const miDato = JSON.parse(miDatoString)
    //             console.log('Ficha desde Local',miDato)
               
    //         } else {
    //             console.log('El valor de miDato en localStorage es null.');
    //         }
    const storedData = localStorage?.getItem('fichaStorage');
     const initialFicha = storedData ? JSON.parse(storedData) : null;
     console.log('Valor del estorage',initialFicha)
    const [ficha, setFichaNewData] = useState<CrearEditarFichaType>(initialFicha)
    const [currentColor, setCurrentColor] = useState(ficha?.colorPrimario ?? '#00AE98')
    const [currentColorSecundario, setCurrentColorSecundario] = useState(ficha?.colorSecundario ?? '#00AE98')
    const [anchorElColorPrimario, setAnchorElColorPrimario] = useState<HTMLButtonElement | null>(null)
    const [anchorElColorSecundario, setAnchorElColorSecundario] = useState<HTMLButtonElement | null>(null)

   console.log('Ficha cargada',ficha)
   
    const { Alerta } = useAlerts()
    const { sesionPeticion } = useSession()
    const { handleSubmit, control,setValue } = useForm<CrearEditarFichaType>({
        defaultValues: {
          id: ficha?.id,
          codigoSector: ficha?.codigoSector,
          nombre: ficha?.nombre,
          nombreCorto: ficha?.nombreCorto,
          tipoSector: ficha?.tipoSector,
          colorPrimario: ficha?.colorPrimario || '',
          colorSecundario: ficha?.colorSecundario || '',
          fechaInicio: ficha?.fechaInicio,
          fechaFin: ficha?.fechaFin,
        },
      })
      const handleChangeComplete = (color:any) => {
        setCurrentColor(color)
        setValue('colorPrimario', color.hex)
      }
      const handleChangeCompleteSecundario = (color:any) => {
        setCurrentColorSecundario(color)
        setValue('colorSecundario', color.hex)
      }
      const guardarActualizarFicha = async (data: CrearEditarFichaType) => {
         if (ficha?.id !== undefined) {
           data.id = ficha.id
         }
        console.log('Esto esta en el front',data)
        await guardarActualizarFichaPeticion(data)
      }
      const guardarActualizarFichaPeticion = async (
        ficha: CrearEditarFichaType
      ) => {
        try {
          //setLoadingModal(true)
          await delay(1000)
          const respuesta = await sesionPeticion({
            url: `${Constantes.baseUrl}/sector${
                ficha.id ? `/${ficha.id}` : ''
            }`,
            method: !!ficha.id ? 'patch' : 'post',
            body: {
              ...ficha,
            },
          })
          console.log('Despues de insert edit',respuesta)
          if(respuesta.datos.id){
            localStorage.setItem('fichaStorage', JSON.stringify(respuesta.datos))
            setFichaNewData(respuesta.datos)
          }else
          {
            console.log('Se edito',ficha)
            localStorage.setItem('fichaStorage', JSON.stringify(ficha))
            setFichaNewData(ficha)
            
          }
          
          Alerta({
            mensaje: InterpreteMensajes(respuesta),
            variant: 'success',
          })
          //accionCorrecta()
        } catch (e) {
          imprimir(`Error al crear o actualizar ficha: `, e)
          Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
        } finally {
          //setLoadingModal(false)
        }
      }
      const tipoFicha = [
        { valor: 'CIUDADANO', nombre: 'CIUDADANO' },
        { valor: 'FISCAL', nombre: 'FISCAL' },
        { valor: 'GENERAL', nombre: 'GENERAL' },
        { valor: 'GENERO', nombre: 'GENERO' },
      ];
    //Funciones para color primario
      const handleIconClickColorPrimario = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorElColorPrimario(event.currentTarget);
      }
      const handleClosePaletaColorPrimario = () => {
        setAnchorElColorPrimario(null);
      }
      const handleChangeCompleteColorPrimario = (color: any) => {
        //setCurrentColor(color.hex)
        //handleClosePaletaColorPrimario()

        setCurrentColor(color)
        setValue('colorPrimario', color.hex)
      }
      const openPaletaColorPrimario = Boolean(anchorElColorPrimario);
      const idPopColorPrimario = openPaletaColorPrimario ? 'color-popoverPrimario' : undefined

      //Funciones para color secundario
      const handleIconClickColorSecundario = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorElColorSecundario(event.currentTarget);
      }
      const handleClosePaletaColorSecundario = () => {
        setAnchorElColorSecundario(null);
      }
      const handleChangeCompleteColorSecundario = (color: any) => {
        setCurrentColorSecundario(color)
        setValue('colorSecundario', color.hex)
      }
      const openPaletaColorSecundario = Boolean(anchorElColorSecundario);
      const idPopColorSecundario = openPaletaColorSecundario ? 'color-popoverSecundario' : undefined
    return (
        <>
        <form onSubmit={handleSubmit(guardarActualizarFicha)} style={{ borderBottom: '50px solid #FAFAFA' }}>
          {/* <DialogContent dividers> */}
            <Grid container direction={'column'} justifyContent="space-evenly">
              <Box height={'5px'} />
              <Grid container direction="row" spacing={{ xs: 2, sm: 1, md: 2 }}>
              {/* <Grid item xs={12} sm={12} md={4}>
                  <FormInputText
                    id={'id'}
                    control={control}
                    name="id"
                    label="Id Ficha"
                    //rules={{ required: 'Este campo es requerido' }}
                  />
                </Grid> */}

              <Grid item xs={12} sm={12} md={4}>
                  <FormInputText
                    id={'codigoSector'}
                    control={control}
                    name="codigoSector"
                    label="Código Ficha"
                    rules={{ required: 'Este campo es requerido',
                             maxLength:{
                              value:5,
                              message:'Este campo acepta como máximo 5 caracteres'
                             }
                             }}
                  />
                </Grid>
                <Grid item xs={12} sm={12} md={4}>
                  {/* <FormInputText
                    id={'colorPrimario'}
                    control={control}
                    name="colorPrimario"
                    label="Color Primario"
                  /> */}

                  <FormInputTextWithIcon
                    id="colorPrimario"
                    control={control}
                    name="colorPrimario"
                    label="Color Primario"
                    icon={'palette'}
                    onIconClick={handleIconClickColorPrimario}
                  />
                  <Popover
                    id={idPopColorPrimario}
                    open={openPaletaColorPrimario}
                    anchorEl={anchorElColorPrimario}
                    onClose={handleClosePaletaColorPrimario}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                  >
                <SketchPicker
                  color={currentColor}
                  onChangeComplete={handleChangeCompleteColorPrimario}
                />
                </Popover>
                </Grid>

                <Grid item xs={12} sm={12} md={4}>
                  {/* <FormInputText
                    id={'colorSecundario'}
                    control={control}
                    name="colorSecundario"
                    label="Color Secundario"
                  /> */}
                  <FormInputTextWithIcon
                    id="colorSecundario"
                    control={control}
                    name="colorSecundario"
                    label="Color Secundario"
                    icon={'palette'}
                    onIconClick={handleIconClickColorSecundario}
                  />
                  <Popover
                    id={idPopColorSecundario}
                    open={openPaletaColorSecundario}
                    anchorEl={anchorElColorSecundario}
                    onClose={handleClosePaletaColorSecundario}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                  >
                  <SketchPicker
                    color={currentColorSecundario}
                    onChangeComplete={handleChangeCompleteColorSecundario}
                   />
                  </Popover>
                </Grid>
    
                <Grid item xs={12} sm={12} md={12}>
                  <FormInputText
                    id={'nombre'}
                    control={control}
                    name="nombre"
                    label="Nombre"
                    clearable={true}
                    rules={{ required: 'Este campo es requerido' }}
                   
                  />
                </Grid>
    
                <Grid item xs={12} sm={12} md={12}>
                  <FormInputText
                    id={'nombreCorto'}
                    control={control}
                    name="nombreCorto"
                    label="Nombre Corto"
                    rules={{ required: 'Este campo es requerido' }}
                  />
                </Grid>
    
                
    
              {/* <Grid item xs={12} sm={12} md={4}>
                  <FormInputDropdown
                    id={'tipoSector'}
                    name="tipoSector"
                    control={control}
                    label="Tipo Ficha"
                    options={tipoFicha.map((tpf) => ({
                      key: tpf.valor,
                      value: tpf.valor,
                      label: tpf.nombre,
                    }))}
                    rules={{ required: 'Este campo es requerido' }}
                  />
                </Grid> */}
    
                <Grid item xs={12} sm={12} md={6}>
                  <FormInputDate
                    id={'fechaInicio'}
                    control={control}
                    name="fechaInicio"
                    label="Fecha Inicio"
                    rules={{ required: 'Este campo es requerido' }}
                  />
                </Grid>
                <Grid item xs={12} sm={12} md={6}>
                  <FormInputDate
                    id={'fechaFin'}
                    control={control}
                    name="fechaFin"
                    label="Fecha Fin"
                    rules={{ required: 'Este campo es requerido' }}
                  />
                </Grid>
       
    
                
              </Grid>
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
            <Button variant={'contained'} 
              //disabled={loadingModal} 
              type={'submit'}>
              Guardar
            </Button>
          </DialogActions>
        </form>
        </>
      )
}

