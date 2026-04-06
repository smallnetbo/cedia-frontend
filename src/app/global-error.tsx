'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: 'system-ui, sans-serif',
        background: '#1a1a2e',
        color: '#fff',
        padding: 40,
        margin: 0,
      }}>
        <h2 style={{ fontSize: 24, marginBottom: 16, color: '#08B0A7' }}>
          Error del sistema
        </h2>
        <p style={{ fontSize: 14, color: '#999', marginBottom: 24, textAlign: 'center', maxWidth: 400 }}>
          {error.message || 'Ha ocurrido un error crítico.'}
        </p>
        <button
          onClick={reset}
          style={{
            padding: '10px 24px',
            background: '#08B0A7',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          Intentar de nuevo
        </button>
      </body>
    </html>
  )
}
