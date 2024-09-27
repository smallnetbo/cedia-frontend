import React, { useState, useEffect } from 'react'
import { Controller, Control, FieldValues, Path } from 'react-hook-form'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Icon from '@mui/material/Icon'
import IconPalette from './IconPalette' // Ajusta la ruta según sea necesario

type FormInputAutocompleteWithIconProps<T extends FieldValues> = {
  id: string
  name: Path<T>
  control: Control<T, object>
  label: string
  options: Array<{ key: string; value: string; label: string }>
  rules?: Record<string, any>
}

const FormInputAutocompleteWithIcon = <T extends FieldValues>({
  id,
  name,
  control,
  label,
  options,
  rules,
}: FormInputAutocompleteWithIconProps<T>) => {
  const [selectedIcon, setSelectedIcon] = useState<string>('palette')
  const [iconPaletteOpen, setIconPaletteOpen] = useState(false)
  const [iconOptions, setIconOptions] = useState<
    { key: string; label: string; value: string }[]
  >([])

  useEffect(() => {
    const mostrarIconos = async () => {
      const iconos = await import('material-icons/_data/versions.json')
      setIconOptions(
        Object.keys(iconos).map((value) => ({
          key: value,
          label: value,
          value: value,
        }))
      )
    }
    mostrarIconos()
  }, [])

  const handleIconClick = () => {
    setIconPaletteOpen(true)
  }

  const handleIconSelect = (iconName: string) => {
    setSelectedIcon(iconName)
    setIconPaletteOpen(false)
  }

  return (
    <>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field, fieldState: { error } }) => (
          <Autocomplete
            {...field}
            id={id}
            options={options}
            getOptionLabel={(option) => option.label}
            renderInput={(params) => (
              <TextField
                {...params}
                label={label}
                variant="outlined"
                error={!!error}
                helperText={error ? error.message : null}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleIconClick}>
                        <Icon>{selectedIcon}</Icon>
                      </IconButton>
                      {params.InputProps.endAdornment}
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        )}
      />
      <IconPalette
        open={iconPaletteOpen}
        onClose={() => setIconPaletteOpen(false)}
        onSelect={handleIconSelect}
        iconOptions={iconOptions}
      />
    </>
  )
}

export default FormInputAutocompleteWithIcon
