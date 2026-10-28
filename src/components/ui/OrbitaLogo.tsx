import React from 'react';

export const OrbitaLogo = ({ size = 24, className = "" }: { size?: number | string, className?: string, strokeWidth?: number | string }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width={size} height={size} className={className}>
      <defs>
        {/* Fondo */}
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2a75bb"/>
          <stop offset="100%" stopColor="#071940"/>
        </linearGradient>

        {/* Moneda pequeña */}
        <linearGradient id="c1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff"/>
          <stop offset="100%" stopColor="#559fdb"/>
        </linearGradient>

        {/* Moneda grande */}
        <linearGradient id="c2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff"/>
          <stop offset="100%" stopColor="#cda85c"/>
        </linearGradient>
      </defs>

      <rect width="512" height="512" rx="115" fill="url(#bg)"/>

      <g transform="translate(256, 256) rotate(-35)">
        {/* Mitad trasera de la órbita */}
        <path d="M -150 0 A 150 65 0 0 1 150 0" fill="none" stroke="#7eb5d6" strokeWidth="4" strokeOpacity="0.5"/>

        {/* Planeta / Moneda 1 */}
        <circle cx="-150" cy="0" r="55" fill="url(#c1)"/>
        <circle cx="-150" cy="0" r="45" fill="none" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.6"/>

        {/* Planeta / Moneda 2 */}
        <circle cx="150" cy="0" r="75" fill="url(#c2)"/>
        <circle cx="150" cy="0" r="62" fill="none" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.8"/>

        {/* Mitad delantera de la órbita cruzando exactamente por el centro de ambas monedas */}
        <path d="M -150 0 A 150 65 0 0 0 150 0" fill="none" stroke="#ffffff" strokeWidth="8" strokeLinecap="round"/>
      </g>
    </svg>
  );
};
