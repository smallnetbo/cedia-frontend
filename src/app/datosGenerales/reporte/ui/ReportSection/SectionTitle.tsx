import React from 'react'
import { View, Text, StyleSheet } from '@react-pdf/renderer'
import DynamicMaterialIcon from '@/components/IconRenderer/DynamicMaterialIcon'

interface SectionTitleProps {
  iconName: string
  title: string
  titleColor: string
}

const SectionTitle: React.FC<SectionTitleProps> = ({
  iconName,
  title,
  titleColor,
}) => (
  <View style={[styles.titleContainer, { backgroundColor: titleColor }]}>
    <View style={styles.iconWrapper}>
      <DynamicMaterialIcon
        iconName={iconName}
        style={{ width: 22, height: 22, color: '#D5E2C8' }}
      />
    </View>
    <Text style={styles.contentTitle}>{title}</Text>
  </View>
)

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
    padding: 5,
  },
  iconWrapper: {
    marginRight: 8,
  },
  contentTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
})

export default SectionTitle
