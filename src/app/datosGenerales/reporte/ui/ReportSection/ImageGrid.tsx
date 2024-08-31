import React from 'react'
import { View, Image, StyleSheet } from '@react-pdf/renderer'

interface ImageGridProps {
  images?: { [key: string]: string[] | {} }
}

const ImageGrid: React.FC<ImageGridProps> = ({ images }) => {
  if (!images || Object.keys(images).length === 0) {
    return null
  }

  return (
    <View style={styles.imageContainer}>
      {Object.keys(images).map((key) => {
        const imageData = images[key]
        return (
          <View key={key} style={styles.imageItem}>
            {Object.values(imageData).map((imageSrc, index) => {
              if (
                typeof imageSrc === 'string' &&
                (imageSrc.startsWith('data:image') ||
                  imageSrc.startsWith('http'))
              ) {
                return (
                  <Image
                    key={index}
                    src={imageSrc}
                    style={styles.imageDatoGeneral}
                  />
                )
              }
              return null
            })}
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 0,
  },
  imageItem: {
    marginBottom: 0,
    width: '100%',
    padding: 0,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  imageDatoGeneral: {
    width: '100%',
    height: 190,
    marginVertical: 2,
    maxWidth: '100%',
    borderRadius: 4,
  },
})

export default ImageGrid
