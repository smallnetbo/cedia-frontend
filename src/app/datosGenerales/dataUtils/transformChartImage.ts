export const transformChartImage = (chartImage) => {
  let nullEntity = null
  const transformedChartImage = {}

  Object.keys(chartImage).forEach((key) => {
    const entity = key
    const value = chartImage[key]

    if (value === null) {
      nullEntity = entity
      transformedChartImage[entity] = {}
    } else {
      if (nullEntity) {
        transformedChartImage[nullEntity][entity] = value
      } else {
        transformedChartImage[entity] = value
      }
    }
  })

  return transformedChartImage
}
