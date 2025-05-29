export const isLowEndDevice = (): boolean => {
  // Verificar si estamos en el navegador
  if (typeof window === 'undefined') return false;

  // Detectar características del dispositivo
  const memory = (navigator as any).deviceMemory;
  const hardwareConcurrency = navigator.hardwareConcurrency;
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Verificar si es un dispositivo móvil
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  
  // Criterios para considerar un dispositivo de baja gama:
  // 1. Memoria RAM menor a 4GB
  // 2. Menos de 4 núcleos de CPU
  // 3. Es un dispositivo móvil con características limitadas
  const hasLowMemory = memory && memory < 4;
  const hasLowCPU = hardwareConcurrency && hardwareConcurrency < 4;
  
  // Detectar si el dispositivo tiene soporte para animaciones CSS
  const supportsAnimations = 'animation' in document.documentElement.style;
  
  // Detectar si el dispositivo tiene soporte para WebGL
  const supportsWebGL = (() => {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  })();

  return (hasLowMemory || hasLowCPU || (isMobile && (!supportsAnimations || !supportsWebGL)));
}; 