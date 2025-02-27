import { Box, Button, DialogActions, DialogContent, Grid } from '@mui/material'
import {
  CategoriaType,
  CrearEditarEntidadType,
  EntidadCRUDType,
  NivelGobiernoType,
  DepartamentosType,
} from '../types/entidadCRUDTypes'
import { FormInputDropdown, FormInputText } from '@/components/form'
import { AlertDialog } from '@/components/modales/AlertDialog'
import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useAlerts, useSession } from '@/hooks'
import { delay, InterpreteMensajes } from '@/utils'
import { Constantes } from '@/config/Constantes'
import { imprimir } from '@/utils/imprimir'
import * as XLSX from 'xlsx'
import { IconoTooltip } from '@/components/botones/IconoTooltip'

import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'

export interface ModalEntidadType {
  entidad?: EntidadCRUDType | undefined | null
  categoria: CategoriaType[]
  nivelGobierno: NivelGobiernoType[]
  departamentos: DepartamentosType[]
  accionCorrecta: () => void
  accionCancelar: () => void
}

export const VistaModalEntidad = ({
  entidad,
  categoria,
  nivelGobierno,
  departamentos,
  accionCorrecta,
  accionCancelar,
}: ModalEntidadType) => {
  // Flag que índica que hay un proceso en ventana modal cargando visualmente
  const [loadingModal, setLoadingModal] = useState<boolean>(false)
  const { Alerta } = useAlerts()
  const { sesionPeticion } = useSession()

  const { handleSubmit, control, setValue } = useForm<CrearEditarEntidadType>({
    defaultValues: {
      id: entidad?.id,
      codigoEntidad: entidad?.codigoEntidad,
      codigoDepartamento: entidad?.codigoDepartamento,
      nombre: entidad?.nombre,
      coordenadasGeograficas: entidad?.coordenadasGeograficas,
      nombreGam: entidad?.nombreGam,
      idCategoria: entidad?.categoria ? entidad?.categoria.id : null,
      idNivelGobierno: entidad?.nivelGobierno.id,
      filecoordenadas: '',
    },
  })

  const [mostrarAlertaInfoCargaArchivo, setMostrarAlertaInfoCargaArchivo] =
    useState(false)
  const [isDisabled, setIsDisabled] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [nombreNivelGobierno, setNombreNivelGobierno] = useState('')
  const [isVisibleCategoria, setIsVisibleCategoria] = useState(true)
  const [mensajeAlert, setMensajeAlert] = useState<string>('')
  const [showAlert, setShowAlert] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const guardarActualizarEntidad = async (data: CrearEditarEntidadType) => {
    /*Se cargara desde el excel solo cuando haya datos (en un nuevo registro o cuando se modifiquen las coordenadas) */
    if (excelRowsString.length > 1) {
      data.coordenadasGeograficas = excelRowsString
    }

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

  let excelRowsString: string = ''
  let excelRows2: any = []

  function Upload() {
    const fileUpload = document.getElementById('fileUpload') as HTMLInputElement
    const dirextension = fileUpload?.value?.toLowerCase()
    const regex = /^([a-zA-Z0-9\s_\\.\-:])+(.xls|.xlsx)$/

    if (regex.test(fileUpload?.value?.toLowerCase())) {
      if (typeof FileReader !== 'undefined') {
        const reader = new FileReader()
        reader.onload = () => {
          const arrayBuffer = reader.result as ArrayBuffer
          processExcel(arrayBuffer)
        }

        if (fileUpload && fileUpload.files && fileUpload.files[0]) {
          reader.readAsArrayBuffer(fileUpload.files[0])
        }
      }
    } else {
      if (dirextension) {
        setMensajeAlert(
          `Archivo incorrecto, los tipos de archivos permitidos son: .xls, .xlsx`
        )
        setShowAlert(true)
        limpiarInputCampoCargaExcel()
      }
    }
  }

  function processExcel(data: any) {
    const workbook = XLSX.read(data, { type: 'binary' })
    const firstSheet = workbook.SheetNames[0]

    const sheet = workbook.Sheets[firstSheet]
    const excelRows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 })
    const columnKeys = Object.keys(sheet)

    const extractedColumnNames = columnKeys
      .filter((key) => key.match(/\w+1$/)) // Ajustar la expresión regular
      .map((key) => sheet[key].v.toString().trim())

    const processedExcelRows = excelRows.slice(1).map((row: any[]) => {
      const processedRow: { [key: string]: any } = {}
      extractedColumnNames.forEach((colName, index) => {
        processedRow[colName] = row[index]
      })
      return processedRow
    })

    excelRows2.value = excelRows
    const dataString = JSON.stringify(processedExcelRows)
    const newString = dataString.replace(/"Latitud":/g, '')
    const newString2 = newString.replace(/"Longitud":/g, '')
    const newString3 = newString2.replace(/{/g, '[')
    const newString4 = newString3.replace(/}/g, ']')
    const newString5 = newString4.replace(/"/g, '')

    excelRowsString = newString5
  }

  useEffect(() => {
    if (entidad) {
      if (entidad.nivelGobierno.id === '1') {
        setValue('codigoDepartamento', '')
        setIsVisible(false)
      }
      const nombreNivelGobEdit = entidad.nivelGobierno.nombre + ' de '
      setNombreNivelGobierno(nombreNivelGobEdit)

      switch (entidad.nivelGobierno.id) {
        case '1':
          setValue('idCategoria', '')
          setIsVisibleCategoria(false)

          break
        case '2':
          setValue('idCategoria', '')
          setIsVisibleCategoria(false)

          break
        case '3':
          setIsVisibleCategoria(true)
          break
        case '4':
          setIsVisibleCategoria(true)
          break
      }
    }
  }, [])

  const cargarNombreCompletoOnSelectNivelGob = (valorSeleccionado: any) => {
    const idNivelgob: string = valorSeleccionado.target.value

    var nombreNivelGob: string = ''
    const componentes = Object.entries(nivelGobierno).map(([clave, valor]) => {
      if (valor.id === idNivelgob) {
        var valorNombre = (
          document.getElementById('nombre') as HTMLInputElement
        ).value

        nombreNivelGob = valor.nombre + ' de ' + valorNombre
        setValue('nombreGam', nombreNivelGob)

        const subnombreGam = valor.nombre + ' de '
        setNombreNivelGobierno(subnombreGam)
      }
    })

    if (idNivelgob === '1') {
      setValue('codigoDepartamento', '')
      setIsDisabled(true)
      setIsVisible(false)
    } else {
      setIsDisabled(false)
      setIsVisible(true)
    }

    switch (idNivelgob) {
      case '1':
        setValue('idCategoria', '')
        setIsVisibleCategoria(false)
        break
      case '2':
        setIsVisibleCategoria(true)
        break
      case '3':
        setValue('idCategoria', '')
        setIsVisibleCategoria(false)
        break
      case '4':
        setIsVisibleCategoria(true)
        break
    }
  }

  const completarNombreGamOnNombreCorto = () => {
    var valorNombre = (document.getElementById('nombre') as HTMLInputElement)
      .value
    setValue('nombreGam', nombreNivelGobierno + valorNombre)
  }
  const infoCargaArchivoModal = () => {
    setMostrarAlertaInfoCargaArchivo(true)
  }
  const aceptarAlertaInfoCargaArchivo = () => {
    setMostrarAlertaInfoCargaArchivo(false)
  }

  const infoUploadExcel = (
    <>
      <div>
        Cargar un archivo excel con el siguiente formato:
        <br />
        <TableContainer component={Paper}>
          <Table
            sx={{
              minWidth: 450,
              '&:last-child td, &:last-child th': { border: 1 },
            }}
            aria-label="simple table"
          >
            <TableHead>
              <TableRow>
                <TableCell align="left">Latitud</TableCell>
                <TableCell align="left">Longitud</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell align="left">{'-66.93279366978281'}</TableCell>
                <TableCell align="left">{'-17.618028490249383'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left">{'-66.9434534534544'}</TableCell>
                <TableCell align="left">{'-17.622323434343443'}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <br />
        <Button variant={'contained'} onClick={aceptarAlertaInfoCargaArchivo}>
          Aceptar
        </Button>
      </div>
    </>
  )
  const aceptarAlerta = () => {
    setShowAlert(false)
  }
  const limpiarInputCampoCargaExcel = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '' // Limpia el valor del input
    }
  }

  return (
    <>
      <AlertDialog
        isOpen={mostrarAlertaInfoCargaArchivo}
        titulo={'Informacion del formato para el archivo'}
        texto={''}
      >
        {infoUploadExcel}
      </AlertDialog>

      <AlertDialog isOpen={showAlert} titulo={'Alerta'} texto={mensajeAlert}>
        <Button variant={'contained'} onClick={aceptarAlerta}>
          Aceptar
        </Button>
      </AlertDialog>

      <form onSubmit={handleSubmit(guardarActualizarEntidad)}>
        <DialogContent dividers>
          <Grid container direction={'column'} justifyContent="space-evenly">
            <Box height={'5px'} />
            <Grid container direction="row" spacing={{ xs: 2, sm: 1, md: 2 }}>
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
                  onChange={(selectedValue) =>
                    cargarNombreCompletoOnSelectNivelGob(selectedValue)
                  }
                />
              </Grid>

              {isVisibleCategoria && (
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
              )}

              <Grid item xs={12} sm={12} md={6}>
                <FormInputText
                  id={'codigoEntidad'}
                  control={control}
                  name="codigoEntidad"
                  label="Codigo Entidad"
                  type="number"
                  rules={{
                    required: 'Este campo es requerido',
                    min: {
                      value: 1,
                      message:
                        'Como mínimo debe introducir un número mayor a cero',
                    },
                  }}
                />
              </Grid>
              {isVisible && (
                <Grid item xs={12} sm={12} md={6} sx={{ marginTop: 1 }}>
                  <FormInputDropdown
                    id={'codigoDepartamento'}
                    name="codigoDepartamento"
                    control={control}
                    label="Departamento"
                    disabled={isDisabled}
                    options={departamentos.map((dpto) => ({
                      key: dpto.id,
                      value: dpto.id,
                      label: dpto.nombre,
                    }))}
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
                  onChange={completarNombreGamOnNombreCorto}
                />
              </Grid>

              <Grid item xs={12} sm={12} md={12}>
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
                <input
                  type="file"
                  id="fileUpload"
                  ref={fileInputRef}
                  onChange={Upload}
                />
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
