import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import {
  Control,
  Controller,
  FieldPath,
  FieldValues,
  PathValue,
} from 'react-hook-form'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import {
  FormHelperText,
  IconButton,
  InputLabel,
  TextField,
  Typography,
} from '@mui/material'
import { RegisterOptions } from 'react-hook-form/dist/types/validator'
import esMX from 'dayjs/locale/es-mx'
import { validarFechaFormato } from '@/utils/fechas'
import { Variant } from '@mui/material/styles/createTypography'
import { Dayjs } from 'dayjs'
import { Icono } from '../Icono'

type FormDatePickerProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  id: string
  name: TName
  control: Control<TFieldValues>
  label: string
  size?: 'small' | 'medium'
  format?: string
  disabled?: boolean
  rules?: Omit<
    RegisterOptions<TFieldValues, TName>,
    'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
  >
  bgcolor?: string
  minDate?: Dayjs
  maxDate?: Dayjs
  labelVariant?: Variant
  desktopModeMediaQuery?: string
  clearable?: boolean
  colorLabel?: string
}

export const FormInputDate = <
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  id,
  name,
  control,
  label,
  size = 'small',
  format = 'DD/MM/YYYY',
  disabled,
  rules,
  bgcolor,
  minDate,
  maxDate,
  colorLabel = 'primary.main',
  labelVariant = 'subtitle2',
  desktopModeMediaQuery = '',
  clearable,
}: FormDatePickerProps<TFieldValues, TName>) => {
  return (
    <div>
      <InputLabel htmlFor={id}>
        <Typography
          variant={labelVariant}
          sx={{ color: colorLabel, fontWeight: '600' }}
        >
          {label}
        </Typography>
      </InputLabel>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={esMX}>
            <DatePicker
              onChange={field.onChange}
              value={field.value}
              ref={field.ref}
              mask="__/__/____"
              inputFormat={format}
              minDate={minDate}
              maxDate={maxDate}
              disabled={disabled}
              desktopModeMediaQuery={desktopModeMediaQuery}
              renderInput={(params) => (
                <>
                  <TextField
                    id={id}
                    name={name}
                    sx={{
                      margin: '0',
                      borderRadius: '15px',
                      width: '100%',
                      bgcolor: bgcolor ? bgcolor : 'background.paper',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '15px',
                        bgcolor: bgcolor ? bgcolor : 'background.paper',
                        '& fieldset': {
                          borderColor: 'text.primary',
                        },
                        '&:hover fieldset': {
                          borderColor: 'primary.main',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'primary.main',
                          borderWidth: '2px',
                        },
                      },
                    }}
                    size={size}
                    {...params}
                    error={!!error}
                    // Limpiar campo
                    InputProps={{
                      endAdornment:
                        field.value && clearable ? (
                          <IconButton
                            sx={{ marginRight: '-12px' }}
                            color="primary"
                            onClick={() => {
                              field.onChange(null)
                            }}
                          >
                            <Icono
                              color="primary"
                              sx={{ color: 'text.disabled' }}
                            >
                              clear
                            </Icono>
                          </IconButton>
                        ) : (
                          <>{params.InputProps?.endAdornment}</>
                        ),
                    }}
                    // Fin limpiar campo
                  />
                  {!!error && (
                    <FormHelperText error>{error?.message}</FormHelperText>
                  )}
                </>
              )}
            />
          </LocalizationProvider>
        )}
        rules={{
          ...{
            validate: (val?: string) => {
              if (val && !validarFechaFormato(val, format)) {
                return 'La fecha no es válida'
              }
            },
          },
          ...rules,
        }}
        defaultValue={'' as PathValue<TFieldValues, TName>}
      />
    </div>
  )
}
