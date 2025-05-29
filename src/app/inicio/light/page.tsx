'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Button, Modal, Box, Typography } from '@mui/material'

interface SVGOption {
  label: string;
  subtitle: string;
  iconSrc: string;
}

interface ImageIconProps {
  src: string;
  alt: string;
}

const ImageIcon: React.FC<ImageIconProps> = ({ src, alt }) => (
  <Image src={src} alt={alt} width={32} height={32} />
)

const svgOptions: SVGOption[] = [
  {
    label: 'Datos Generales y Sectoriales',
    subtitle: 'Electoral (2015-2021) / Fiscal / Género / Política de cuidado',
    iconSrc: 'svg/ico_datos.svg',
  },
  {
    label: 'Comparativas entre Gobiernos Autónomos',
    subtitle: 'Según: GAD / Categoría municipal y GAM/GAIOC/GAR',
    iconSrc: 'svg/ico_comparativas.svg',
  },
  {
    label: 'Cruce de variables Sectoriales',
    subtitle: 'Según: GAD / Grupos de municipios por Depto. / Grupos de municipios por Categoría municipal / GAIOC',
    iconSrc: 'svg/ico_variables.svg',
  },
  {
    label: 'Georeferenciación de variables sectoriales',
    subtitle: 'Según nivel de gobierno',
    iconSrc: 'svg/ico_georeferenciacion.svg',
  },
  {
    label: 'Índices e Indicadores',
    subtitle: 'Evaluación del ejercicio efectivo de competencias',
    iconSrc: 'svg/ico_indices.svg',
  },
]

export default function InicioPageLight(): JSX.Element {
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [activeButton, setActiveButton] = useState<number | null>(null)

  const handleOpenModal = () => setOpenModal(true)
  const handleCloseModal = () => setOpenModal(false)

  return (
    <section className="heroSection">
      <style jsx>{`
        .heroSection {
          background: #f5f5f5;
          min-height: 100vh;
          padding: 20px;
        }

        .header {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .fixedLogo {
          margin-bottom: 20px;
        }

        .mainTitle {
          text-align: center;
          margin: 20px 0;
        }

        .mainTitle h1 {
          font-size: 24px;
          margin: 0;
          color: #333;
        }

        .mainTitle span {
          font-size: 20px;
          color: #666;
        }

        .contenedorEnlacesInferior {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-top: 30px;
        }

        .botonEnlacesInferior {
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 15px;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }

        .botonEnlacesInferior:hover {
          background: #f0f0f0;
        }

        .botonEnlacesInferior.active {
          background: #e0e0e0;
        }

        .muiButton {
          position: fixed;
          z-index: 9999;
          background: rgba(0, 0, 0, 0.5);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
        }

        .legalButton {
          top: 20px;
          right: 20px;
        }

        .adminButton {
          top: 20px;
          right: 130px;
        }
      `}</style>

      {/* Botón de información legal */}
      <Button
        className="muiButton legalButton"
        onClick={handleOpenModal}
        aria-label="Ver información legal"
        size="small"
      >
        Legal
      </Button>

      {/* Modal de Material-UI */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 370,
          bgcolor: '#fff',
          boxShadow: 24,
          borderRadius: 3,
          p: 2,
        }}>
          <Typography id="modal-title" variant="h6" component="h2">
            LEY N° 031, Art. 129
          </Typography>
          <Typography id="modal-description" sx={{ mt: 2 }}>
            <ol>
              <li>
                Procesar, sistematizar y evaluar periódicamente el desarrollo y evolución del proceso autonómico y la situación de las entidades territoriales autónomas.
              </li>
              <li>
                Poner a disposición de la población toda la información relacionada a las entidades territoriales.
              </li>
            </ol>
          </Typography>
          <Button onClick={handleCloseModal} sx={{ mt: 2 }}>
            Cerrar
          </Button>
        </Box>
      </Modal>

      {/* Botón de administración */}
      <Button
        className="muiButton adminButton"
        aria-label="Acceso administrador"
        size="small"
      >
        Admin
      </Button>

      <div className="header">
        {/* Logo */}
        <div className="fixedLogo">
          <a href="http://www.sea.gob.bo" target="_blank" rel="noopener noreferrer">
            <Image
              src="svg/logo_sea_svg.svg"
              alt="Logo SEA Bolivia"
              width={52}
              height={52}
              priority
            />
          </a>
        </div>

        {/* Título principal */}
        <div className="mainTitle">
          <h1>Centro de</h1>
          <span>Datos Autonómicos</span>
        </div>

        {/* Botones de acceso directo */}
        <div className="contenedorEnlacesInferior">
          {svgOptions.map((opt, idx) => (
            <button
              key={opt.label}
              className={`botonEnlacesInferior${activeButton === idx ? ' active' : ''}`}
              onMouseEnter={() => setActiveButton(idx)}
              onMouseLeave={() => setActiveButton(null)}
              aria-label={opt.label}
            >
              <ImageIcon src={opt.iconSrc} alt={opt.label} />
              <div>
                <div style={{ fontWeight: 'bold' }}>{opt.label}</div>
                <div style={{ fontSize: '0.8em', color: '#666' }}>{opt.subtitle}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
} 