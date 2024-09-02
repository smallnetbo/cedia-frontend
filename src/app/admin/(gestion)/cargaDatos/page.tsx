'use client'
import React from 'react'
import { siteName } from '@/utils'

import FormCargaDatosView from './FormCargaDatosView'

import { Grid } from '@mui/material'

export default function GestionCargaDatosPage() {
  return (
    <>
      <title>{`Carga Datos - ${siteName()}`}</title>

      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={12} sm={12} md={12}>
          <FormCargaDatosView />
        </Grid>
      </Grid>
    </>
  )
}
