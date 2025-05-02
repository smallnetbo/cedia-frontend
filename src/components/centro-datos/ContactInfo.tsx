import React from 'react';
import Image from 'next/image';
import styles from './styles.module.css';

const ContactInfo: React.FC = () => {
  const contactData = [
    {
      label: "Teléfono",
      value: "(591-2) 2141444 - (591-2) 2141393",
      icon: "📞",
      className: styles.text1
    },
    {
      label: "Email",
      value: "contacto@sea.gob.bo",
      icon: "✉️",
      className: styles.text2
    },
    {
      label: "Dirección",
      value: "Plaza España, Calle Víctor Sanjinez #2678 Edificio Barcelona - Tercer Piso La Paz - Bolivia",
      icon: "🏢",
      className: styles.text3
    },
    {
      label: "Horario",
      value: "Lunes a Viernes 8:30 - 16:30",
      icon: "⏰",
      className: styles.text1
    }
  ];

  return (
    <div className={styles.topSection}>
      <div className={styles.topContent}>
        <div className={styles.seaFooterLogo}>
          <Image 
            src="/assets/images/logo-sea-outline.png" 
            alt="Logo SEA" 
            width={170} 
            height={95.5}
            quality={100}
          />
        </div>
        <div className={styles.contactInfo}>
          <h2 className={styles.sectionTitle}>Información de Contacto</h2>
          <div className={styles.contactList}>
            {contactData.map((item, index) => (
              <div key={`contact-${index}`} className={item.className}>
                <span className={styles.contactIcon} aria-hidden="true">{item.icon}</span>
                <div>
                  <strong>{item.label}:</strong>
                  <p>{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;