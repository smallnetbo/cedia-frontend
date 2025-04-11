// FormInputTextWithIcon.tsx
import React from 'react'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Icon from '@mui/material/Icon'
import { Variant } from '@mui/material/styles/createTypography'
import { Controller, Control, FieldValues, Path } from 'react-hook-form'
import FormControl from '@mui/material/FormControl'
import { InputLabel, Typography } from '@mui/material'

type FormInputTextWithIconProps<T extends FieldValues> = {
  id: string
  name: Path<T>
  control: Control<T, object>
  label: string
  disabled?: boolean
  bgcolor?: string
  labelVariant?: Variant
  icon: string
  colorLabel?: string
  onIconClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

export const FormInputTextWithIcon = <T extends FieldValues>({
  id,
  name,
  control,
  label,
  icon,
  disabled,
  bgcolor,
  labelVariant = 'subtitle2',
  colorLabel = 'primary.main',
  onIconClick,
}: FormInputTextWithIconProps<T>) => {
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
          <FormControl sx={{ width: '100%' }} size="small">
            <TextField
              {...field}
              id={id}
              name={name}
              variant="outlined"
              sx={{
                margin: 0,
                width: '100%',
                '& .MuiOutlinedInput-root': {
                  backgroundColor: bgcolor ? bgcolor : 'background.paper',
                  borderRadius: '15px',
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
              disabled={disabled}
              fullWidth
              error={!!error}
              helperText={error ? error.message : null}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton edge="end" onClick={onIconClick}>
                      <Icon>{icon}</Icon>
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </FormControl>
        )}
      />
    </div>
  )
}
