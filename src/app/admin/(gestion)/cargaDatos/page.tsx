'use client'

import React from 'react'
import { siteName } from '@/utils'

import FormCargaDatosView from './FormCargaDatosView'

import { Grid } from '@mui/material'

export default function GestionCargaDatosPage() {
  return (
    <>
      <title>{`Carga Datos - ${siteName()}`}</title>

      <Grid container alignItems="stretch">
        <Grid item xs={12}>
          <FormCargaDatosView />
        </Grid>
      </Grid>
    </>
  )
}
