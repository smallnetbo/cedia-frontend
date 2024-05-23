// FormInputTextWithIcon.tsx
import React from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Icon from '@mui/material/Icon';
import Typography from '@mui/material/Typography'
import { Variant } from '@mui/material/styles/createTypography'
import {
    FormHelperText,   
    InputLabel,
  } from '@mui/material'
import { Controller, Control, FieldValues, Path } from 'react-hook-form';

type FormInputTextWithIconProps<T extends FieldValues> = {
  id: string;
  name: Path<T>;
  control: Control<T, object>;
  label: string;
  labelVariant?: Variant
  icon:string
  onIconClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

export const FormInputTextWithIcon = <T extends FieldValues>({
  id,
  name,
  control,
  label,
  labelVariant = 'subtitle2',
  icon,
  onIconClick,
}: FormInputTextWithIconProps<T>) => {
  return (
    <div>
        <InputLabel htmlFor={id}>
        <Typography
          variant={labelVariant}
          sx={{ color: 'text.primary', fontWeight: '500' }}
        >
          {label}
        </Typography>
      </InputLabel>
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          id={id}
         // label={label}
          variant="outlined"
          fullWidth
          error={!!error}
          helperText={error ? error.message : null}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end" >
                <IconButton edge="end" onClick={onIconClick}>
                  <Icon>{icon}</Icon> 
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      )}
    />
  </div>
  );
};
