/* eslint-disable jsx-a11y/alt-text */
import React from 'react'
import { View, Text, Image, StyleSheet } from '@react-pdf/renderer'
import { Constantes } from '@/config/Constantes'

interface HeaderProps {
  title: {
    titulo: string
    subTitulo: string
    colorPrimario: string
  }
}

const Header: React.FC<HeaderProps> = ({ title }) => (
  <View style={[styles.headerRow, { backgroundColor: title.colorPrimario }]}>
    <View style={styles.logoContainer}>
      <Image
        style={styles.logo}
        src={`${Constantes.sitePath}/logo_blanco.png`}
      />
    </View>
    <View style={styles.headerText}>
      <Text style={styles.mainTitle}>{title.titulo}</Text>
      <View style={styles.divider} />
      <Text style={styles.subTitle}>{title.subTitulo}</Text>
    </View>
  </View>
)

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ddd',
    paddingBottom: 5,
    marginBottom: 0,
    height: 80,
  },
  logoContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  headerText: {
    flex: 1,
    paddingLeft: 10,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
  },
  subTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#D5E2C8',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#fff',
    marginVertical: 5,
  },
})

export default Header
