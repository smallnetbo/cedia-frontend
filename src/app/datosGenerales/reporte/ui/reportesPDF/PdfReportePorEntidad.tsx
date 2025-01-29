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

        {/* Contenido principal */}
        <View style={styles.content}>
          {/* Imagen del Mapa */}
          <View style={styles.leftColumn}>
            {imagen ? (
              <Image style={styles.mapa} src={imagen} />
            ) : (
              <Text style={styles.noImageText}>No hay imagen disponible</Text>
            )}
          </View>

          {/* Categorías y Entidades */}
          <View style={styles.rightColumn} wrap>
            {categorias.map((categoria, index) => (
              <View key={index} style={styles.categoriaContainer}>
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
                {categoria.entidades.map((entidad, idx) => (
                  <Text key={idx} style={styles.entidadNombre}>
                    {entidad.nombre}
                  </Text>
                ))}
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
  },
  // HEADER
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ddd',
    paddingBottom: 5,
    marginBottom: 10, // Ajuste para evitar el corte del contenido en la siguiente página
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
  content: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
    marginTop: 20, // Espacio para que no quede pegado al encabezado
  },
  leftColumn: {
    width: '70%',
    height: 400, // Altura fija para la imagen
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
  },
  mapa: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
  },
  noImageText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#999',
  },
  rightColumn: {
    width: '30%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
    marginBottom: 20, // Agregado para dejar espacio entre la columna y el pie de página
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
  entidadNombre: {
    fontSize: 12,
    marginLeft: 20,
    marginVertical: 2,
    color: '#555',
  },
  footer: {
    borderTopWidth: 1,
    borderColor: '#ddd',
    paddingTop: 10,
    alignItems: 'center',
    marginTop: 10, // Evitar que quede demasiado cerca del contenido
    position: 'absolute',
    bottom: 10, // Fijar el pie de página en la parte inferior
    left: 20,
    right: 20,
  },
  footerText: {
    fontSize: 10,
    color: '#7f8c8d',
  },
  pageNumber: {
    fontSize: 10,
    marginTop: 5,
    color: '#7f8c8d',
  },
})

export default PdfReportePorEntidad
