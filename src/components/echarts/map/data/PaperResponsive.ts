export const getResponsiveFontSize = (baseSize: number) => {
  const screenWidth = window.innerWidth
  if (screenWidth < 600) return baseSize * 0.7
  if (screenWidth < 960) return baseSize * 0.85
  return baseSize
}
