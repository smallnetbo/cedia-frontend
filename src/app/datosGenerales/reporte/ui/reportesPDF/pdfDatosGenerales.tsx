import React from 'react'
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  Image,
} from '@react-pdf/renderer'
import { SubSector } from '../../../types/datosGeneralesType'
import { Constantes } from '@/config/Constantes'
import { Gobiernos } from '@/types/map/entidad.interface'

interface PdfDatosGeneralesProps {
  parametros: {
    nombre: string
    title?: string
    date: string
    time: string
    imageSrc: string | null
    tipoGobierno: Gobiernos
    data: SubSector[]
  }
}

const Table: React.FC<{ items: any[] }> = ({ items }) => (
  <View style={styles.table}>
    {/* Encabezado de la tabla */}
    <View style={styles.tableRow}>
      <View style={styles.columnHeader}>
        <Text style={styles.columnHeaderText}>Nombre</Text>
      </View>
      <View style={styles.columnHeader}>
        <Text style={styles.columnHeaderText}>Valor</Text>
      </View>
    </View>
    {/* Datos de la tabla */}
    {items.map((item, index) => (
      <View key={index} style={styles.tableRow}>
        {Object.entries(item.datoRegistro || {}).map(([, value], i) => (
          <View key={i} style={styles.tableCell}>
            <Text style={styles.tableItemValue}>{String(value)}</Text>
          </View>
        ))}
      </View>
    ))}
  </View>
)

const SectorData: React.FC<{ sector: SubSector }> = ({ sector }) => (
  <View style={styles.sectorContainer}>
    <Text style={styles.sectorTitle}>{sector.nombre}</Text>
    {sector.variables.map((variable) => (
      <View key={variable.id} style={styles.variableContainer}>
        <Text style={styles.variableTitle}>{variable.nombre}</Text>
        <Table items={variable.items} />
      </View>
    ))}
  </View>
)

const PdfDatosGenerales: React.FC<PdfDatosGeneralesProps> = ({
  parametros,
}) => {
  const { nombre, date, time, imageSrc, tipoGobierno, data } = parametros

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap={false}>
        {/* Encabezado */}
        <View style={styles.header}>
          <Image style={styles.logo} src={`${Constantes.sitePath}/logo.png`} />
          <View style={styles.titleContainerPrincipal}>
            <Text style={styles.mainTitle}>Centro de</Text>
            <Text style={styles.subTitle}>Datos Autonómicos</Text>
          </View>
        </View>

        {/* Contenido */}
        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <View>
              <Text style={styles.contentTitle}>Reporte Estadístico</Text>
              <Text style={styles.contentTitle}>Datos Generales</Text>
            </View>
            <View style={styles.dateContainer}>
              <Text style={styles.fechaHora}>{date}</Text>
              <Text style={styles.fechaHora}>{time}</Text>
            </View>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>
              Nivel de Gobierno: {tipoGobierno.name}
            </Text>
            <Text style={styles.infoTitle}>Gobierno Autónomo: {nombre}</Text>
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
          <Text style={styles.footerText}>
            Reporte generado por el Centro de Datos Autonómicos
          </Text>
          <Image
            style={styles.logoFooter}
            src={`${Constantes.sitePath}/ministerio_logo.png`}
          />
        </View>
      </Page>
    </Document>
  )
}

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
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#50C0B2',
  },
  logo: {
    width: 80,
    height: 45,
    marginTop: 5,
  },
  logoFooter: {
    width: 70,
    height: 50,
    marginRight: 20,
  },
  contenedorMapa: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  imagenMapa: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  titleContainerPrincipal: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainTitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 2,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#50C0B2',
  },
  content: {
    marginTop: 20,
    marginBottom: 30,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dateContainer: {
    alignItems: 'flex-end',
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  fechaHora: {
    fontSize: 12,
    textAlign: 'right',
  },
  sectorContainer: {
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#50C0B2',
    borderRadius: 10,
  },
  sectorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#50C0B2',
  },
  variableContainer: {
    marginBottom: 10,
  },
  variableTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#00796b',
  },
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#50C0B2',
    borderRadius: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#50C0B2',
  },
  columnHeader: {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#50C0B2',
  },
  columnHeaderText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRightColor: '#50C0B2',
    borderRightWidth: 1,
  },
  tableItemValue: {
    flex: 1,
    fontSize: 12,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#50C0B2',
    borderRadius: 10,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 2,
    borderTopColor: '#50C0B2',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    width: '100%',
  },
})

export default PdfDatosGenerales
