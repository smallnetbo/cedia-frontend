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
import { Gobiernos } from '@/types/map/entidad.interface'

// Componente reutilizable para mostrar una tabla de ítems
const Table: React.FC<{ items: any[] }> = ({ items }) => (
  <View style={styles.table}>
    {items.map((item, index) => (
      <View key={index} style={styles.tableRow}>
        <View style={styles.tableCell}>
          <Text style={styles.tableItem}>
            {item.nombre}: {item.datoRegistro?.ejecucion}
          </Text>
        </View>
      </View>
    ))}
  </View>
)

// Componente reutilizable para renderizar los datos del sector en una tabla
const SectorData: React.FC<{ sector: SubSector }> = ({ sector }) => (
  <View style={styles.sectorContainer}>
    <Text style={styles.sectorTitle}>{sector.nombre}</Text>
    <Table items={sector.variables.flatMap((variable) => variable.items)} />
  </View>
)

// Componente principal del documento PDF
const DocumentoPdf: React.FC<{
  title: string
  date: string
  time: string
  imageSrc: string
  tipoGobierno: Gobiernos
  data: SubSector[]
}> = ({ title, date, time, imageSrc, data, tipoGobierno }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Image style={styles.logo} src={`${Constantes.sitePath}/logo.png`} />
        <View style={styles.titleContainerPrincipal}>
          <Text style={styles.mainTitle}>Centro de</Text>{' '}
          {/* Título principal */}
          <Text style={styles.subTitle}>Datos Autonómicos</Text>{' '}
          {/* Subtítulo */}
        </View>
      </View>

      {/* Contenido */}
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.contentTitle}>
            Reporte Estadístico{'\n'}Datos Generales
          </Text>
          <Text style={styles.fechaHora}>
            fecha de reporte: {date} {'\n'}
            hora: {time}
          </Text>
        </View>
        {/* Nivel de gobierno y gobierno autónomo */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>
            Nivel de Gobierno: {tipoGobierno.name}
          </Text>
          <Text style={styles.infoTitle}>Gobierno Autónomo: La Paz</Text>
        </View>

        {imageSrc && (
          <View style={styles.contenedorMapa}>
            <Image style={styles.imagenMapa} src={imageSrc} />
          </View>
        )}

        {/* Renderizar datos de los sectores */}
        {data.map((sector, index) => (
          <SectorData key={index} sector={sector} />
        ))}
      </View>

      {/* Pie de página */}
      <View style={styles.footer}>
        <Image
          style={styles.logoFooter}
          src={`${Constantes.sitePath}/ministerio_logo.png`}
        />
      </View>
    </Page>
  </Document>
)

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    padding: 30,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    backgroundColor: '#EEEEEE',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  logo: {
    width: 60,
    height: 35,
    marginTop: 5,
    marginLeft: 10,
  },
  logoFooter: {
    width: 110,
    height: 50,
    marginTop: 5,
    marginLeft: 10,
  },
  contenedorMapa: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    padding: 5,
  },
  imagenMapa: {
    flex: 1,
    height: 250,

    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },

  titleContainerPrincipal: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  mainTitle: {
    fontSize: 12, // Tamaño del título principal
    textAlign: 'center',
    marginBottom: 2,
  },

  subTitle: {
    fontSize: 18, // Tamaño del subtítulo
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#50C0B2',
  },
  content: {
    marginBottom: 30,
    marginTop: 30,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  fechaHora: {
    fontSize: 11,
    textAlign: 'right',
    fontWeight: 'bold',
    marginTop: 5,
  },
  sectorContainer: {
    marginBottom: 20,
  },
  sectorTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'left',
    backgroundColor: '#EEEEEE',
    color: '#000',
    padding: 5,
    marginBottom: 0,
  },
  table: {
    width: '100%',
    marginTop: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    borderLeftWidth: 1,
    borderLeftColor: '#ddd',
  },
  tableRow: {
    width: '33.33%',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  tableCell: {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 5,
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tableItem: {
    fontSize: 10,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    backgroundColor: '#EEEEEE',
    color: '#000',
    padding: 5,
  },
  infoTitle: {
    fontWeight: 'bold',
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#EEEEEE',
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  footerText: {
    fontSize: 12,
    textAlign: 'center',
    width: '100%',
  },
})

export default DocumentoPdf
