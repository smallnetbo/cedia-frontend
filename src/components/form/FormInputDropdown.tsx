import {
  Control,
  Controller,
  FieldValues,
  Path,
  PathValue,
} from 'react-hook-form'
import {
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material'
import { RegisterOptions } from 'react-hook-form/dist/types/validator'
import React from 'react'
import { Variant } from '@mui/material/styles/createTypography'
import { Icono } from '@/components/Icono'
import FormControl from '@mui/material/FormControl'

export interface optionType {
  key: string
  value: string
  label: string
}

type FormInputDropdownProps<T extends FieldValues> = {
  id: string
  name: Path<T>
  control: Control<T, object>
  label: string
  size?: 'small' | 'medium'
  rules?: RegisterOptions
  disabled?: boolean
  onChange?: (event: SelectChangeEvent) => void
  clearable?: boolean
  bgcolor?: string
  options: optionType[]
  labelVariant?: Variant
}

export const FormInputDropdown = <T extends FieldValues>({
  id,
  name,
  control,
  label,
  size = 'small',
  rules,
  disabled,
  onChange,
  options,
  clearable,
  bgcolor,
  labelVariant = 'subtitle2',
}: FormInputDropdownProps<T>) => {
  const generateSelectOptions = () =>
    options.map((option) => (
      <MenuItem key={option.key} value={option.value}>
        {option.label}
      </MenuItem>
    ))

  return (
    <div>
      {/* <InputLabel htmlFor={id}>
        <Typography
          variant={labelVariant}
          sx={{ pb: 1, color: 'text.primary', fontWeight: '600' }}
        >
          {label}
        </Typography>
      </InputLabel> */}
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <>
          <FormControl sx={{ m: 1, width: '100%' }} size="small"> 
          <InputLabel id="demo-select-small-label">{label}</InputLabel>
            <Select
              id={id}
              name={name}
              label={label}
              sx={{
                width: '100%',
                bgcolor: bgcolor,
                '& .MuiSelect-iconOutlined': {
                  display: field.value && clearable ? 'none' : '',
                },
                '&.Mui-focused .MuiIconButton-root': { color: 'primary.main' },
              }}
              size={size}
              error={!!error}
              disabled={disabled}
              onChange={(event) => {
                if (onChange) {
                  onChange(event)
                }
                field.onChange(event)
              }}
              inputRef={field.ref}
              value={field.value ?? ''}
              endAdornment={
                field.value && clearable ? (
                  <IconButton
                    sx={{ display: field.value ? '' : 'none' }}
                    onClick={() => {
                      field.onChange('')
                    }}
                    color={'primary'}
                  >
                    <Icono color={'primary'}>clear</Icono>
                  </IconButton>
                ) : undefined
              }
            >
              {generateSelectOptions()}
            </Select>
            </FormControl> 
            {!!error && <FormHelperText error>{error?.message}</FormHelperText>}
          </>
        )}
        defaultValue={'' as PathValue<T, Path<T>>}
        rules={rules}
      />
    </div>
  )
}
