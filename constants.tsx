
import React from 'react';

export const COLORS = {
  primary: '#2D6A4F',
  secondary: '#40916C',
  background: '#F8F9FA',
  text: '#1C1C1C',
  accent: '#FFC300',
  cta: '#1B4332'
};

// Gebruik het geüploade logo bestand met relatief pad
export const LOGO_URL = './logo.png';

export const PLANS = [
  {
    name: 'Gratis',
    price: '€0',
    limit: 10,
    features: [
      '10 antwoorden per maand',
      'Standaard AI-model',
      '1 communicatiestijl',
      'Geen historiek'
    ],
    priceId: 'free_tier'
  },
  {
    name: 'Starter',
    price: '€29',
    limit: 100,
    features: [
      '100 antwoorden per maand',
      'Sneller AI-model',
      '3 communicatiestijlen',
      'Historiek tot 30 dagen'
    ],
    priceId: 'price_1SniMZCbUGYN5zBLDP36rUqz',
    isRecommended: false
  },
  {
    name: 'Pro',
    price: '€79',
    limit: 500,
    features: [
      '500 antwoorden per maand',
      'Nog sneller AI-model',
      'Alle communicatiestijlen',
      'Onbeperkte historiek'
    ],
    priceId: 'price_1SniNOCbUGYN5zBLtXwNJ4qb',
    isRecommended: true
  },
  {
    name: 'Unlimited',
    price: '€99',
    limit: 999999,
    features: [
      'Onbeperkte antwoorden',
      'Snelste AI-model',
      'Alle communicatiestijlen + Custom',
      'Onbeperkte historiek'
    ],
    priceId: 'price_1SniOQCbUGYN5zBLbWKCHnLK'
  }
];

interface KoalaIconProps {
  className?: string;
  noShadow?: boolean;
}

export const KoalaIcon: React.FC<KoalaIconProps> = ({ className = "w-12 h-12", noShadow = false }) => (
  <img 
    src={LOGO_URL} 
    className={`${className} object-contain transition-transform duration-300 ${noShadow ? '' : 'logo-shadow'}`} 
    alt="Koala AI Logo" 
    onError={(e) => {
      // Fallback als logo.png nog niet geüpload is of niet gevonden wordt
      (e.target as HTMLImageElement).src = "https://cdn-icons-png.flaticon.com/512/3069/3069172.png";
    }}
  />
);