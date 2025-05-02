import React, { ReactNode, Suspense } from 'react'
import ThemeRegistry from '@/themes/ThemeRegistry'
import { FullScreenLoadingProvider } from '@/context/FullScreenLoadingProvider'
import AlertProvider from '@/context/AlertProvider'
import { AuthProvider } from '@/context/AuthProvider'
import { FullScreenLoading } from '@/components/progreso/FullScreenLoading'
import 'material-icons/iconfont/material-icons.css'
import '../global.css'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <ThemeRegistry>
          <FullScreenLoadingProvider>
            <AlertProvider>
              <AuthProvider>
                <Suspense
                  fallback={<FullScreenLoading mensaje={'Cargando...'} />}
                >
                  {children}
                </Suspense>
              </AuthProvider>
            </AlertProvider>
          </FullScreenLoadingProvider>
        </ThemeRegistry>
      </body>
    </html>
  )
}
