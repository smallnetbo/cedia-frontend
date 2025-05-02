import React from 'react';
import Image from 'next/image';
import styles from './styles.module.css';

const GovernmentLogo: React.FC = () => {
  return (
    <div className={styles.bottomSection}>
      <Image
        src="/assets/images/2-IMAGEN-GOBIERNO_HORIZONTAL_PRESIDENCIA-RGB.png"
        alt="Gobierno de Bolivia"
        width={800}
        height={200}
        className={styles.centeredImage}
        priority
      />
    </div>
  );
};

export default GovernmentLogo;