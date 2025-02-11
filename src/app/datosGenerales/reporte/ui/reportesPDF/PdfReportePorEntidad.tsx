/* eslint-disable jsx-a11y/alt-text */
import React from 'react'
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'
import { Constantes } from '@/config/Constantes'

interface Parametros {
  titulo: string
  subTitulo: string
  colorPrimario: string
  colorSecundario: string
  categorias: {
    titulo: string
    color: string
    entidades: { nombre: string }[]
  }[]
}

const PdfReportePorEntidad: React.FC<{
  parametros: Parametros
  imagen: string | null
}> = ({ parametros, imagen }) => {
  const { titulo, subTitulo, colorPrimario, colorSecundario, categorias } =
    parametros

  return (
    <Document>
      <Page size="LETTER" orientation="landscape" style={styles.page} wrap>
        {/* Encabezado */}
        <View style={[styles.headerRow, { backgroundColor: colorPrimario }]}>
          <View style={styles.logoContainer}>
            <Image
              style={styles.logo}
              src={`${Constantes.sitePath}/logo_blanco.png`}
            />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.mainTitle}>{titulo}</Text>
            <View style={styles.divider} />
            <Text style={styles.subTitle}>{subTitulo}</Text>
          </View>
        </View>

        {/* Imagen Principal */}
        {imagen && (
          <View style={styles.imageContainer}>
            <Image style={styles.fullWidthImage} src={imagen} />
          </View>
        )}

        {/* Contenido principal */}
        <View style={styles.content}>
          {/* Categorías y Entidades */}
          <View style={styles.categoriesContainer} wrap>
            {categorias.map((categoria, index) => (
              <View key={index} style={styles.categoriaContainer} wrap>
                {/* Título de la categoría */}
                <View style={styles.categoriaHeader}>
                  <View
                    style={[
                      styles.colorBox,
                      { backgroundColor: categoria.color },
                    ]}
                  />
                  <Text
                    style={[styles.categoriaTitulo, { color: colorSecundario }]}
                  >
                    {categoria.titulo}
                  </Text>
                </View>
                {/* Lista de entidades */}
                <View style={styles.entidadesContainer}>
                  {categoria.entidades.map((entidad, idx) => (
                    <Text key={idx} style={styles.entidadNombre}>
                      {entidad.nombre}
                    </Text>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Pie de página con numeración */}
        <View fixed style={styles.footer}>
          <Text style={styles.footerText}>
            Reporte generado automáticamente - {new Date().getFullYear()}
          </Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) =>
              `Página ${pageNumber} de ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  )
}

Font.register({
  family: 'Oswald',
  src: 'https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf',
})

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: 'Oswald',
    backgroundColor: '#f8f9fa',
  },
  // HEADER
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
  },
  logoContainer: {
    width: 80,
    height: 80,
  },
  logo: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  headerText: {
    flex: 1,
    paddingLeft: 10,
    textAlign: 'center',
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  subTitle: {
    fontSize: 16,
    color: '#D5E2C8',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#fff',
    marginVertical: 5,
  },
  imageContainer: {
    marginVertical: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  fullWidthImage: {
    width: '100%',
    height: 280,
  },
  content: {
    marginTop: 10,
  },
  categoriesContainer: {
    padding: 10,
  },
  categoriaContainer: {
    marginBottom: 15,
  },
  categoriaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  colorBox: {
    width: 15,
    height: 15,
    borderRadius: 3,
    marginRight: 10,
  },
  categoriaTitulo: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  entidadesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  entidadNombre: {
    fontSize: 12,
    backgroundColor: '#f4f4f4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 5,
    marginBottom: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 10,
    left: 30,
    right: 30,
    textAlign: 'center',
  },
  footerText: {
    fontSize: 10,
    color: '#7f8c8d',
  },
  pageNumber: {
    fontSize: 10,
    color: '#7f8c8d',
  },
})

export default PdfReportePorEntidad
