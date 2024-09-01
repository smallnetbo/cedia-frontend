import React from 'react'
import { View, Image, StyleSheet } from '@react-pdf/renderer'

interface ImageGridProps {
  images?: { [key: string]: string[] | {} }
}

const ImageGrid: React.FC<ImageGridProps> = ({ images }) => {
  if (!images || Object.keys(images).length === 0) {
    return null
  }

  const imageArray = Object.values(images).flatMap((imageData) =>
    Object.values(imageData).filter(
      (src: any) =>
        typeof src === 'string' &&
        (src.startsWith('data:image') || src.startsWith('http'))
    )
  )

  return (
    <View style={styles.imageContainer}>
      {imageArray.map((imageSrc, index) => (
        <View key={index} style={styles.imageItem}>
          <Image src={imageSrc} style={styles.imageDatoGeneral} />
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  imageContainer: {
    flexDirection: 'row',

    justifyContent: 'space-between',
    marginTop: 0,
  },
  imageItem: {
    marginBottom: 5,
    width: '50%',
    padding: 0,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  imageDatoGeneral: {
    width: '100%',
    height: 220,
    borderRadius: 4,
  },
})

export default ImageGrid
