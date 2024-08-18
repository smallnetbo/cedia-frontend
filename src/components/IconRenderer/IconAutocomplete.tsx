import React from 'react'
import SvgIcon from '@mui/material/SvgIcon'
import * as Icons from '@/iconosSvg/iconosSvg'

const DynamicIcon = ({ iconName }: { iconName: string }) => {
  const IconComponent = Icons[iconName as keyof typeof Icons]

  if (!IconComponent) {
    console.error(`Icon ${iconName} not found in Icons`)
    return null
  }

  return <SvgIcon component={IconComponent} inheritViewBox />
}

export default DynamicIcon
