import React from 'react'
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  Image,
} from '@react-pdf/renderer'
import { SubSector } from '../../types/datosGeneralesType'
import { Constantes } from '@/config/Constantes'
import { Icono } from '@/components/Icono'

// Componente reutilizable para cada ítem de la lista
const ListItem: React.FC<{ item: any }> = ({ item }) => (
  <View style={styles.listItem}>
    <View style={styles.textContainer}>
      <Text style={styles.itemName}>{item.nombre}</Text>
      <Text style={styles.itemValue}>{item.datoRegistro?.ejecucion}</Text>
    </View>
  </View>
)

// Componente reutilizable para mostrar una lista de ítems
const List: React.FC<{ items: any[] }> = ({ items }) => (
  <View style={styles.list}>
    {items.map((item, index) => (
      <ListItem key={index} item={item} />
    ))}
  </View>
)

// Componente reutilizable para renderizar los datos del sector
const SectorData: React.FC<{ sector: SubSector }> = ({ sector }) => (
  <View style={styles.sectorContainer}>
    <Text style={styles.sectorTitle}>{sector.nombre}</Text>
    {sector.variables.map((variable, index) => (
      <List key={index} items={variable.items} />
    ))}
  </View>
)

// Componente principal del documento PDF
const DocumentoPdf: React.FC<{
  title: string
  date: string
  time: string
  imageSrc: string
  data: SubSector[]
}> = ({ title, date, time, imageSrc, data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Image style={styles.logo} src={`${Constantes.sitePath}/logo.png`} />
        <Text style={styles.title}>Reporte PDF</Text>
        <Image style={styles.logo} src={`${Constantes.sitePath}/logo.png`} />
      </View>

      {/* Contenido */}
      <View style={styles.content}>
        <Text style={styles.contentTitle}>{title}</Text>
        <Text style={styles.subtitle}>{`${date} - ${time}`}</Text>

        {/* Renderizar datos de los sectores */}
        {data.map((sector, index) => (
          <SectorData key={index} sector={sector} />
        ))}
      </View>

      {/* Pie de página */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Pie de página</Text>
      </View>
    </Page>
  </Document>
)

// Estilos
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    padding: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    paddingBottom: 10,
  },
  logo: {
    width: 40,
    height: 30,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    marginBottom: 20,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 10,
  },
  sectorContainer: {
    marginBottom: 20,
  },
  sectorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  list: {
    backgroundColor: '#f0f0f0',
    padding: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  icon: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  itemValue: {
    fontSize: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    borderTopWidth: 1,
    borderTopColor: '#000',
    paddingTop: 10,
    textAlign: 'center',
  },
  footerText: {
    fontSize: 12,
  },
})

export default DocumentoPdf
