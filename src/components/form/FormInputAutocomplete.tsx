import {
  Control,
  Controller,
  FieldValues,
  Path,
  PathValue,
} from 'react-hook-form'
import {
  Autocomplete,
  AutocompleteValue,
  Box,
  CircularProgress,
  FilterOptionsState,
  FormHelperText,
  InputLabel,
  TextField,
  Typography,
} from '@mui/material'
import { RegisterOptions } from 'react-hook-form/dist/types/validator'
import {
  Fragment,
  ReactNode,
  SyntheticEvent,
  useState,
  KeyboardEvent,
} from 'react'
import { Variant } from '@mui/material/styles/createTypography'
import { AutocompleteInputChangeReason } from '@mui/base/useAutocomplete/useAutocomplete'
import { Icono } from '../Icono'
import { OutlinedInputProps } from '@mui/material/OutlinedInput'
import { optionType } from './FormInputDropdown'
import { imprimir } from '../../utils/imprimir'

export type CustomOptionType<K> = K & { key: string }

type FormInputDropdownAutocompleteProps<K, TFieldValues extends FieldValues> = {
  id: string
  name: Path<TFieldValues>
  control: Control<TFieldValues>
  label: string
  multiple?: boolean
  freeSolo?: boolean
  forcePopupIcon?: boolean
  searchIcon?: boolean
  colorLabel?: string
  size?: 'small' | 'medium'
  rules?: Omit<
    RegisterOptions<TFieldValues, Path<TFieldValues>>,
    'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
  >
  disabled?: boolean
  onChange?: (keys: AutocompleteValue<unknown, false, false, false>) => void
  InputProps?: Partial<OutlinedInputProps>
  filterOptions?: (
    options: CustomOptionType<K>[],
    state: FilterOptionsState<CustomOptionType<K>>
  ) => CustomOptionType<K>[]
  onInputChange?: (
    event: SyntheticEvent,
    value: string,
    reason: AutocompleteInputChangeReason
  ) => void
  isOptionEqualToValue?: (
    option: CustomOptionType<K>,
    value: CustomOptionType<K>
  ) => boolean
  getOptionLabel: (option: CustomOptionType<K>) => string
  renderOption: (option: CustomOptionType<K>) => ReactNode
  newValues?: boolean
  clearable?: boolean
  bgcolor?: string
  loading?: boolean
  selectOnFocus?: boolean
  options: CustomOptionType<K>[]
  labelVariant?: Variant
  disableCloseOnSelect?: boolean
}

export const FormInputAutocomplete = <K, TFieldValues extends FieldValues>({
  id,
  name,
  control,
  label,
  multiple,
  freeSolo,
  forcePopupIcon,
  searchIcon,
  size = 'small',
  rules,
  disabled,
  onChange,
  InputProps,
  filterOptions,
  onInputChange,
  isOptionEqualToValue,
  getOptionLabel,
  renderOption,
  newValues,
  options,
  bgcolor,
  loading,
  selectOnFocus,
  disableCloseOnSelect,
  colorLabel = 'primary.main',
  labelVariant = 'subtitle2',
}: FormInputDropdownAutocompleteProps<K, TFieldValues>) => {
  const [open, setOpen] = useState<boolean>(false)
  const [inputValue, setInputValue] = useState<string>('')

  return (
    <>
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
        rules={rules}
        defaultValue={[] as PathValue<TFieldValues, Path<TFieldValues>>}
        render={({ field, fieldState: { error } }) => (
          <>
            <Autocomplete
              id={id}
              multiple={multiple}
              freeSolo={freeSolo}
              forcePopupIcon={forcePopupIcon}
              size={size}
              disabled={disabled}
              options={options}
              open={open}
              value={field.value}
              onOpen={() => setOpen(true)}
              onClose={() => setOpen(false)}
              selectOnFocus={selectOnFocus}
              filterSelectedOptions
              filterOptions={filterOptions}
              inputValue={inputValue}
              disableCloseOnSelect={disableCloseOnSelect}
              isOptionEqualToValue={isOptionEqualToValue}
              onChange={(_event, newValue) => {
                if (onChange) {
                  onChange(newValue)
                }
                field.onChange(newValue)
              }}
              onInputChange={(event, newInputValue, reason) => {
                // Pasar el cambio a quien lo necesite
                if (onInputChange) {
                  onInputChange(event, newInputValue, reason)
                }
                // Actualizar nuestro state local
                setInputValue(newInputValue)
              }}
              getOptionLabel={(option) => {
                // Manejo de strings vs objetos
                if (typeof option === 'string') return option
                return getOptionLabel(option) ?? ''
              }}
              renderOption={(props, option) => {
                return (
                  <li {...props} key={`option.key-${option.key}`}>
                    {renderOption(option)}
                  </li>
                )
              }}
              renderInput={(params) => {
                // Aquí sobrescribimos el onKeyDown, pero evitando romper la selección con Enter
                params.inputProps.onKeyDown = (
                  event: KeyboardEvent<HTMLInputElement>
                ) => {
                  if (!newValues) return

                  const { key } = event

                  if (open) {
                    if (key === 'Enter') return
                  } else {
                    if (key === 'Enter' || key === ',') {
                      event.preventDefault()
                      event.stopPropagation()

                      // Lógica de crear nuevo item
                      const trimmed = event.currentTarget.value.trim()
                      if (trimmed) {
                        const newOption: optionType = {
                          key: trimmed,
                          label: trimmed,
                          value: trimmed,
                        }
                        imprimir('newOption', newOption)
                        // Si es multiple:
                        if (multiple) {
                          const prevValue = Array.isArray(field.value)
                            ? field.value
                            : []
                          // Para no tener elementos duplicados
                          const alreadyExists = prevValue.some(
                            (o) => o['value'] === trimmed
                          )
                          if (!alreadyExists) {
                            field.onChange([...prevValue, newOption])
                          }
                        } else {
                          field.onChange(newOption)
                        }
                        setInputValue('')
                      }
                    }
                  }
                }

                return (
                  <TextField
                    {...params}
                    error={!!error}
                    inputRef={field.ref}
                    sx={{
                      margin: '0',
                      width: '100%',
                      borderRadius: '15px',
                      backgroundColor: bgcolor ? bgcolor : 'background.paper',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '15px',
                        backgroundColor: bgcolor ? bgcolor : 'background.paper',
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
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <Fragment>
                          {loading ? (
                            <CircularProgress color="inherit" size={20} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </Fragment>
                      ),
                      startAdornment: (
                        <Fragment>
                          {searchIcon && (
                            <Box
                              sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                pl: 1,
                              }}
                            >
                              <Icono color="secondary" fontSize="small">
                                search
                              </Icono>
                            </Box>
                          )}
                          {params.InputProps.startAdornment}
                        </Fragment>
                      ),
                      ...InputProps,
                    }}
                  />
                )
              }}
            />
            {!!error && <FormHelperText error>{error?.message}</FormHelperText>}
          </>
        )}
      />
    </>
  )
}
