import { Box, Button, DialogActions, DialogContent, Grid } from '@mui/material'
import {
  SubSectorCRUDType,
  CrearEditarSubSectorType,
  SectorType,
  GuardarSubSectorType,
} from '../types/subSectorCRUDTypes'
import { FormInputDropdown, FormInputText, optionType} from '@/components/form'
import { AlertDialog } from '@/components/modales/AlertDialog'
import { useState,useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useAlerts, useSession } from '@/hooks'
import { delay, InterpreteMensajes } from '@/utils'
import { Constantes } from '@/config/Constantes'
import { imprimir } from '@/utils/imprimir'
import { FormInputAutocomplete } from '@/components/form/FormInputAutocomplete'
import { Icono } from '@/components/Icono'
import FormInputAutocompleteWithIcon from '@/components/form/FormInputAutocompleteWithIconPalette';
import { CustomSwitch } from '@/components/botones/CustomSwitch'
import FormControl from '@mui/material/FormControl'
export type CustomOptionType<K> = K & { key: string }

export interface ModalSubSectorType {
  subSector?: SubSectorCRUDType | undefined | null
  sector: SectorType[]
  accionCorrecta: () => void
  accionCancelar: () => void
}


export const VistaModalSubSector = ({
  subSector,
  sector,
  accionCorrecta,
  accionCancelar,
}: ModalSubSectorType) => {
  // Flag que índica que hay un proceso en ventana modal cargando visualmente
  const storedData = localStorage?.getItem('fichaStorage');
  const initialFicha = storedData ? JSON.parse(storedData) : null;
  const [opciones, setOpciones] = useState<Array<optionType>>([])
  //console.log('Desde Modal subsector',subSector?.tipoDatoGeneral)
  const [activaSwitchVisibleGeneral, seActivaSwitchVisibleGeneral] = useState<boolean>(
    subSector?.vistasVisualizadas.general ?? false)
  const [activaSwitchVisibleSectorial, seActivaSwitchVisibleSectorial] = useState<boolean>(
    subSector?.vistasVisualizadas.sectorial ?? false)
  const [activaSwitchVisibleComparativa, seActivaSwitchVisibleComparativa] = useState<boolean>(
    subSector?.vistasVisualizadas.comparativa ?? false)
  const [activaSwitchVisibleCruce, seActivaSwitchVisibleCruce] = useState<boolean>(
    subSector?.vistasVisualizadas.cruce_variable ?? false)
  const [activaSwitchVisibleGeorrefencia, seActivaSwitchVisibleGeorreferencia] = useState<boolean>(
    subSector?.vistasVisualizadas.georreferenciacion ?? false)
  const [activaSwitchVisibleReporte, seActivaSwitchVisibleReporte] = useState<boolean>(
      subSector?.vistasVisualizadas.reporte ?? false)
  
  const [loadingModal, setLoadingModal] = useState<boolean>(false)
  const { Alerta } = useAlerts()
  const { sesionPeticion } = useSession()

  const [todosIconos, setTodosIconos] = useState<CustomOptionType<any>[]>([]);
  const [iconosFiltrados, setIconosFiltrados] = useState<CustomOptionType<any>[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const { handleSubmit, control,watch } = useForm<CrearEditarSubSectorType>({
    defaultValues: {
      id: subSector?.id,
      nombre: subSector?.nombre,
      nombreCorto:subSector?.nombreCorto,
      codigoSubSector:subSector?.codigoSubSector,
      icono: subSector?.icono
      ? {
          value: subSector?.icono,
          label: subSector?.icono,
          key: subSector?.icono,
        }
      : undefined,
      //tipoDatoGeneral:subSector?.tipoDatoGeneral,
      vistasVisualizadas:
          {
            general:subSector?.vistasVisualizadas.general,
            sectorial:subSector?.vistasVisualizadas.sectorial,
            comparativa:subSector?.vistasVisualizadas.comparativa,
            cruce_variable:subSector?.vistasVisualizadas.cruce_variable,
            georreferenciacion:subSector?.vistasVisualizadas.georreferenciacion,
            reporte:subSector?.vistasVisualizadas.reporte,
          },
      idSector: initialFicha?.id //subSector?.sector.id,
    },
  })


  const guardarActualizarSubSector = async (data: CrearEditarSubSectorType) => {
    //data.tipoDatoGeneral=activaSwitchVisible
    data.vistasVisualizadas.general=activaSwitchVisibleGeneral
    data.vistasVisualizadas.sectorial=activaSwitchVisibleSectorial
    data.vistasVisualizadas.comparativa=activaSwitchVisibleComparativa
    data.vistasVisualizadas.cruce_variable=activaSwitchVisibleCruce
    data.vistasVisualizadas.georreferenciacion=activaSwitchVisibleGeorrefencia
    data.vistasVisualizadas.reporte=activaSwitchVisibleReporte

    console.log('va al front',data)

    await guardarActualizarSubSectorPeticion({
      id: data.id,
      nombre: data.nombre,
      nombreCorto: data.nombreCorto,
      codigoSubSector: data.codigoSubSector,
      vistasVisualizadas:{
        general:data.vistasVisualizadas.general,
        sectorial:data.vistasVisualizadas.sectorial,
        comparativa:data.vistasVisualizadas.comparativa,
        cruce_variable:data.vistasVisualizadas.cruce_variable,
        georreferenciacion:data.vistasVisualizadas.georreferenciacion,
        reporte:data.vistasVisualizadas.reporte
      },
      icono: data.icono?.value,
      //tipoDatoGeneral:data.tipoDatoGeneral,
      idSector: data.idSector,  
    })
  }

  const guardarActualizarSubSectorPeticion = async (
    subSector: GuardarSubSectorType
  ) => {
    try {
      setLoadingModal(true)
      await delay(1000)
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/subsector${
          subSector.id ? `/${subSector.id}` : ''
        }`,
        method: !!subSector.id ? 'patch' : 'post',
        body: {
          ...subSector,
        },
      })
      console.log('despues del reg subsector',respuesta)
      Alerta({
        mensaje: InterpreteMensajes(respuesta),
        variant: 'success',
      })
      accionCorrecta()
    } catch (e) {
      imprimir(`Error al crear o actualizar sub sector: `, e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    } finally {
      setLoadingModal(false)
    }
  }


  const iconoWatch = watch('icono')

  const mostrarIconos = async () => {
    const iconos = await import('material-icons/_data/versions.json')
    
    const opcionesIconos = Object.keys(iconos).map((value) => ({
      key: value,
      label: value,
      value: value,
    }))
    setTodosIconos(opcionesIconos);
    setIconosFiltrados(opcionesIconos.slice(0, 10));
    setLoading(false);

  }

  const handleInputChangeIcon = (event :any, value: any, reason: any) => {
    if (value) {
      const resultadosFiltrados = todosIconos.filter((icono) =>
        icono.label.toLowerCase().includes(value.toLowerCase())
      );
      setIconosFiltrados(resultadosFiltrados.slice(0, 10));
    } else {
      setIconosFiltrados(todosIconos.slice(0, 10));
    }
  };

  useEffect(() => {
    mostrarIconos().finally(() => {})
  }, [])

 
  const marcadorEsVisibleGeneral = () => {
    if (activaSwitchVisibleGeneral)
      seActivaSwitchVisibleGeneral(false)
    else
    seActivaSwitchVisibleGeneral(true)
  }

  const marcadorEsVisibleSectorial = () => {
    if (activaSwitchVisibleSectorial)
      seActivaSwitchVisibleSectorial(false)
    else
    seActivaSwitchVisibleSectorial(true)
  }

  const marcadorEsVisibleComparativa = () => {
    if (activaSwitchVisibleComparativa)
      seActivaSwitchVisibleComparativa(false)
    else
    seActivaSwitchVisibleComparativa(true)
  }

  const marcadorEsVisibleCruce = () => {
    if (activaSwitchVisibleCruce)
      seActivaSwitchVisibleCruce(false)
    else
    seActivaSwitchVisibleCruce(true)
  }

  const marcadorEsVisibleGeorreferencia = () => {
    if (activaSwitchVisibleGeorrefencia)
      seActivaSwitchVisibleGeorreferencia(false)
    else
    seActivaSwitchVisibleGeorreferencia(true)
  }
  const marcadorEsVisibleReporte = () => {
    if (activaSwitchVisibleReporte)
      seActivaSwitchVisibleReporte(false)
    else
    seActivaSwitchVisibleReporte(true)
  }

   
  return (
    <>
    
    <form onSubmit={handleSubmit(guardarActualizarSubSector)}>
      <DialogContent dividers>
        <Grid container direction={'column'} justifyContent="space-evenly">
          <Box height={'5px'} />
          <Grid container direction="row" spacing={{ xs: 2, sm: 1, md: 2 }}>

            <Grid item xs={12} sm={12} md={8}>
              <FormInputText
                id={'nombre'}
                control={control}
                name="nombre"
                label="Nombre"
                rules={{ required: 'Este campo es requerido' }}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={4}>
              <FormInputText
                id={'codigoSubSector'}
                control={control}
                name="codigoSubSector"
                label="Código"
                rules={{ required: 'Este campo es requerido',
                         maxLength:{
                          value:5,
                          message:'Este campo acepta como máximo 5 caracteres'
                         } }}
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6}>
              <FormInputText
                id={'nombreCorto'}
                control={control}
                name="nombreCorto"
                label="Nombre Corto"
                rules={{ required: 'Este campo es requerido' }}
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6}>
              
              <FormInputAutocomplete
                  id={'icono'}
                  control={control}
                  name="icono"
                  label="Icono"
                  rules={
                    { required: 'Este campo es requerido' } 
                  }
                  freeSolo
                  newValues
                  forcePopupIcon
                  options={iconosFiltrados}
                  onInputChange={handleInputChangeIcon}
                  InputProps={{
                    startAdornment: iconoWatch?.value && (
                      <Icono sx={{ ml: 1 }} color={'inherit'}>
                        {iconoWatch?.value}
                      </Icono>
                    ),
                  }}
                  getOptionLabel={(option) => option.label}
                  renderOption={(option) => (
                    <>
                      <Icono>{option.label}</Icono>
                      <Box sx={{ ml: 2 }}>{option.label}</Box>
                    </>
                  )}
                />

            </Grid>
           
           <FormControl sx={{ marginLeft: 4, width: '100%' }} size="small">
             <label htmlFor="tutu">Visualizadas en las vistas:</label>
           </FormControl>
           
            <Grid item xs={12} sm={12} md={4}>
                <CustomSwitch
                    id={'vistasVisualizadas.general'}
                    titulo={activaSwitchVisibleGeneral ? 'Es visible en vistas general' : 'No es visible en vistas general'}
                     accion={() => {
                       marcadorEsVisibleGeneral()
                     }}
                    desactivado={false}
                    color={'success'}
                    marcado={activaSwitchVisibleGeneral}
                    name={'vistasVisualizadas.general'}
                />
                <label htmlFor="Es Visible">General</label>
            </Grid>
            <Grid item xs={12} sm={12} md={4}>
                <CustomSwitch
                    id={'vistasVisualizadas.sectorial'}
                    titulo={activaSwitchVisibleSectorial ? 'Es visible en vistas sectorial' : 'No es visible en vistas sectorial'}
                     accion={() => {
                         marcadorEsVisibleSectorial()
                     }}
                    desactivado={false}
                    color={'success'}
                    marcado={activaSwitchVisibleSectorial}
                    name={'vistasVisualizadas.sectorial'}
                />
                <label htmlFor="Es Visible">Sectorial</label>
            </Grid>
            <Grid item xs={12} sm={12} md={4}>
                <CustomSwitch
                    id={'vistasVisualizadas.comparativa'}
                    titulo={activaSwitchVisibleComparativa ? 'Es visible en vistas comparativa' : 'No es visible en vistas comparativa'}
                     accion={() => {
                         marcadorEsVisibleComparativa()
                     }}
                    desactivado={false}
                    color={'success'}
                    marcado={activaSwitchVisibleComparativa}
                    name={'vistasVisualizadas.comparativa'}
                />
                <label htmlFor="Es Visible">Comparativa</label>
            </Grid>
            <Grid item xs={12} sm={12} md={4}>
                <CustomSwitch
                    id={'vistasVisualizadas.cruce_variable'}
                    titulo={activaSwitchVisibleCruce ? 'Es visible en vistas cruce variable' : 'No es visible en vistas cruce variable'}
                     accion={() => {
                      marcadorEsVisibleCruce()
                     }}
                    desactivado={false}
                    color={'success'}
                    marcado={activaSwitchVisibleCruce}
                    name={'vistasVisualizadas.cruce_variable'}
                />
                <label htmlFor="Es Visible">Cruce de variable</label>
            </Grid>
            <Grid item xs={12} sm={12} md={5}>
                <CustomSwitch
                    id={'vistasVisualizadas.georreferenciacion'}
                    titulo={activaSwitchVisibleGeorrefencia ? 'Es visible en vistas Georreferenciación' : 'No es visible en vistas Georreferenciación'}
                     accion={() => {
                         marcadorEsVisibleGeorreferencia()
                     }}
                    desactivado={false}
                    color={'success'}
                    marcado={activaSwitchVisibleGeorrefencia}
                    name={'vistasVisualizadas.georreferenciacion'}
                />
                <label htmlFor="Es Visible">Georreferenciación</label>
            </Grid>
            <Grid item xs={12} sm={12} md={3}>
                <CustomSwitch
                    id={'vistasVisualizadas.reporte'}
                    titulo={activaSwitchVisibleReporte ? 'Es visible en vistas reporte' : 'No es visible en vistas reporte'}
                     accion={() => {
                         marcadorEsVisibleReporte()
                     }}
                    desactivado={false}
                    color={'success'}
                    marcado={activaSwitchVisibleReporte}
                    name={'vistasVisualizadas.reporte'}
                />
                <label htmlFor="Es Visible">Reporte</label>
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
