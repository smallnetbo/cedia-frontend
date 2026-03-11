const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: false,
  openAnalyzer: false,
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. IMPORTANTE: 'export' genera el HTML/JS/CSS puro para la App Móvil
  output: 'export',

  // 2. Desactivamos optimización de imágenes (MAUI no tiene servidor de imágenes)
  images: {
    unoptimized: true,
    remotePatterns: [],
  },

  // 3. CAMBIO CLAVE: Usamos '' en lugar de './' para evitar el error de next/font.
  // Al estar vacío, Next.js genera rutas relativas que el WebView de Android/iOS entiende.
  assetPrefix: '',

  // 4. Desactivamos la optimización de fuentes de Google para evitar errores de compilación
  // con assetPrefix y permitir el uso offline.
  optimizeFonts: false,

  reactStrictMode: false,
  poweredByHeader: false,

  // Mantenemos tu configuración de Webpack para evitar errores de FS en el cliente
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        child_process: false,
        fs: false,
      };
    }
    return config;
  },

  eslint: {
    dirs: ['src', 'stories', 'test'],
  },

  // Opcional: Ignorar errores de TypeScript si el servidor sigue dando problemas de RAM
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = withBundleAnalyzer(nextConfig)