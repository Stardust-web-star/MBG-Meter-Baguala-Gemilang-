import React from 'react';

/**
 * Official PLN Logo matching the exact geometry of Logo_PLN.png:
 * - Bright Yellow Square
 * - 3 Cyan/Light-Blue Sinusoidal Waves
 * - Red Lightning Bolt
 * - Bold Cyan/Light-Blue "PLN" lettering
 */
export function LogoPLNOfficial({ className = "h-16" }: { className?: string }) {
  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <svg 
        viewBox="0 0 280 380" 
        className="h-full w-auto drop-shadow-xs" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Yellow Square Box */}
        <rect x="25" y="15" width="230" height="230" fill="#FFEB00" />

        {/* 3 Blue Waves */}
        {/* Wave 1 (Top) */}
        <path
          d="M 38 95 C 52 80, 68 80, 82 95 C 96 110, 112 110, 126 95 C 140 80, 156 80, 170 95 C 184 110, 200 110, 214 95 C 228 80, 244 80, 252 88"
          stroke="#00A2E8"
          strokeWidth="15"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Wave 2 (Middle) */}
        <path
          d="M 38 135 C 52 120, 68 120, 82 135 C 96 150, 112 150, 126 135 C 140 120, 156 120, 170 135 C 184 150, 200 150, 214 135 C 228 120, 244 120, 252 128"
          stroke="#00A2E8"
          strokeWidth="15"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Wave 3 (Bottom) */}
        <path
          d="M 38 175 C 52 160, 68 160, 82 175 C 96 190, 112 190, 126 175 C 140 160, 156 160, 170 175 C 184 190, 200 190, 214 175 C 228 160, 244 160, 252 168"
          stroke="#00A2E8"
          strokeWidth="15"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Red Electric Lightning Bolt */}
        <polygon
          points="155,35 100,165 142,148 132,240 188,105 146,120"
          fill="#ED1C24"
          stroke="#ED1C24"
          strokeWidth="2"
          strokeLinejoin="miter"
        />

        {/* Text 'PLN' (Bold Geometric Paths for 100% vector accuracy) */}
        {/* Letter P */}
        <path
          d="M 35 280 L 78 280 C 95 280, 106 290, 106 308 C 106 326, 95 336, 78 336 L 55 336 L 55 365 L 35 365 Z M 55 298 L 55 318 L 76 318 C 83 318, 87 314, 87 308 C 87 302, 83 298, 76 298 Z"
          fill="#00A2E8"
        />
        {/* Letter L */}
        <path
          d="M 122 280 L 142 280 L 142 347 L 180 347 L 180 365 L 122 365 Z"
          fill="#00A2E8"
        />
        {/* Letter N */}
        <path
          d="M 198 280 L 218 280 L 244 332 L 244 280 L 264 280 L 264 365 L 243 365 L 218 314 L 218 365 L 198 365 Z"
          fill="#00A2E8"
        />
      </svg>
    </div>
  );
}

/**
 * Standard horizontal PLN Logo badge for headers / navbars
 */
export function LogoPLN({ className = "h-8" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* PLN Official Emblem Box */}
      <svg 
        viewBox="0 0 280 260" 
        className="h-full w-auto aspect-square drop-shadow-xs shrink-0" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Yellow Square Box */}
        <rect x="15" y="15" width="250" height="230" fill="#FFEB00" />

        {/* 3 Blue Waves */}
        <path
          d="M 28 85 C 42 70, 58 70, 72 85 C 86 100, 102 100, 116 85 C 130 70, 146 70, 160 85 C 174 100, 190 100, 204 85 C 218 70, 234 70, 252 82"
          stroke="#00A2E8"
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M 28 125 C 42 110, 58 110, 72 125 C 86 140, 102 140, 116 125 C 130 110, 146 110, 160 125 C 174 140, 190 140, 204 125 C 218 110, 234 110, 252 122"
          stroke="#00A2E8"
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M 28 165 C 42 150, 58 150, 72 165 C 86 180, 102 180, 116 165 C 130 150, 146 150, 160 165 C 174 180, 190 180, 204 165 C 218 150, 234 150, 252 162"
          stroke="#00A2E8"
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Red Electric Lightning Bolt */}
        <polygon
          points="155,30 98,160 142,144 132,236 190,100 146,116"
          fill="#ED1C24"
          stroke="#ED1C24"
          strokeWidth="2"
          strokeLinejoin="miter"
        />
      </svg>
      <div className="flex flex-col justify-center leading-none">
        <span className="font-black text-[#00A2E8] tracking-tighter text-xl sm:text-2xl font-sans">
          PLN
        </span>
        <span className="text-[9px] font-bold text-slate-700 tracking-wider uppercase">
          ULP BAGUALA
        </span>
      </div>
    </div>
  );
}

export function LogoDanantara({ className = "h-8" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Danantara stylized Garuda/Wings symbol */}
      <svg viewBox="0 0 100 100" className="h-full w-auto aspect-square" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="16" fill="#0A192F" />
        {/* Red Accent Wing */}
        <path d="M18 52 C30 35 50 30 78 28 C65 42 45 52 28 58 Z" fill="#E62129" />
        {/* Platinum/Silver Wing */}
        <path d="M22 64 C35 52 58 48 84 46 C70 60 48 70 32 74 Z" fill="#E2E8F0" />
        {/* Gold Diamond Accent */}
        <polygon points="76,28 88,40 76,52 64,40" fill="#F59E0B" />
      </svg>
      <div className="flex flex-col justify-center leading-tight">
        <span className="font-black text-slate-900 tracking-tight text-sm sm:text-base font-sans uppercase">
          Danantara
        </span>
        <span className="text-[10px] font-bold text-red-600 tracking-widest uppercase">
          INDONESIA
        </span>
      </div>
    </div>
  );
}

export function LogoULPBaguala({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 200 220" className="h-11 w-auto drop-shadow-md shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Outer Shield Outline */}
        <path
          d="M100 10 L168 36 C168 122 142 172 100 188 C58 172 32 122 32 36 Z"
          fill="#0D3B66"
          stroke="#1D609B"
          strokeWidth="4"
        />
        {/* Inner Shield Fill */}
        <path
          d="M100 18 L160 42 C160 116 136 162 100 176 C64 162 40 116 40 42 Z"
          fill="#114B7F"
        />
        
        {/* Building Silhouette */}
        <rect x="110" y="48" width="28" height="58" rx="2" fill="#07223A" />
        <rect x="115" y="55" width="7" height="7" rx="1" fill="#38BDF8" />
        <rect x="125" y="55" width="7" height="7" rx="1" fill="#38BDF8" />
        <rect x="115" y="67" width="7" height="7" rx="1" fill="#38BDF8" />
        <rect x="125" y="67" width="7" height="7" rx="1" fill="#38BDF8" />
        <rect x="115" y="79" width="7" height="7" rx="1" fill="#38BDF8" />
        <rect x="125" y="79" width="7" height="7" rx="1" fill="#38BDF8" />

        {/* Green Leaves / Eco Motif */}
        <path
          d="M48 118 C42 95 65 82 88 92 C83 115 60 128 48 118 Z"
          fill="#10B981"
        />
        <path
          d="M125 110 C148 100 158 118 144 132 C126 137 116 118 125 110 Z"
          fill="#059669"
        />

        {/* Orange Lightning Bolt */}
        <path
          d="M112 22 L62 102 L92 102 L68 165 L132 80 L100 80 Z"
          fill="url(#lightningGrad)"
          stroke="#B45309"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Gradient Defs */}
        <defs>
          <linearGradient id="lightningGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>
      </svg>
      {/* Text ULP BAGUALA */}
      <div className="flex flex-col items-start leading-none text-left">
        <span className="font-extrabold text-white tracking-tight text-base font-sans">
          ULP
        </span>
        <span className="font-black text-sky-400 tracking-wider text-[11px] font-sans uppercase mt-0.5">
          BAGUALA
        </span>
        <div className="w-12 h-0.5 bg-gradient-to-r from-amber-400 via-amber-300 to-transparent mt-1"></div>
      </div>
    </div>
  );
}

export function LogoMBG({ className = "h-9" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="h-full aspect-square bg-gradient-to-br from-cyan-600 to-blue-800 rounded-lg flex items-center justify-center text-white font-black text-base shadow-sm border border-cyan-400/40">
        MBG
      </div>
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold text-slate-900 tracking-tight text-base font-sans">
            METER BAGUALA GEMILANG
          </span>
          <span className="bg-cyan-100 text-cyan-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-cyan-300">
            JTC TE
          </span>
        </div>
        <span className="text-[10px] text-slate-500 font-medium">
          Dashboard Monitoring & Rekap Penggantian kWh Meter
        </span>
      </div>
    </div>
  );
}

/**
 * Official TIM TE BAGUALA Circular Emblem Logo (SUTT Tower + Transaksi Energi):
 * - Circular seal with SUTT Transmission Tower, dynamic golden lightning bolt,
 *   green energy leaves, and sea waves at base.
 * - Text: TIM TE BAGUALA (top arc), TRANSAKSI ENERGI & ULP BAGUALA - PT PLN (PERSERO) (bottom arc).
 */
export function LogoTimTEBaguala({ className = "h-20" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 400 400"
        className="h-full w-auto aspect-square drop-shadow-sm shrink-0"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="suttGoldLightning" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF275" />
            <stop offset="30%" stopColor="#FFB300" />
            <stop offset="85%" stopColor="#F57C00" />
            <stop offset="100%" stopColor="#E65100" />
          </linearGradient>

          <linearGradient id="suttRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0B5C9E" />
            <stop offset="40%" stopColor="#29B6F6" />
            <stop offset="70%" stopColor="#FFCA28" />
            <stop offset="100%" stopColor="#FFA000" />
          </linearGradient>

          <linearGradient id="suttWaveGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0288D1" />
            <stop offset="50%" stopColor="#00ACC1" />
            <stop offset="100%" stopColor="#01579B" />
          </linearGradient>

          <linearGradient id="suttWaveGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#01579B" />
            <stop offset="50%" stopColor="#0277BD" />
            <stop offset="100%" stopColor="#004D40" />
          </linearGradient>

          <linearGradient id="suttLeafGrad1" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2E7D32" />
            <stop offset="100%" stopColor="#81C784" />
          </linearGradient>

          <linearGradient id="suttLeafGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1B5E20" />
            <stop offset="100%" stopColor="#66BB6A" />
          </linearGradient>

          {/* Paths for Circular Curved Texts */}
          {/* Top text: TIM TE BAGUALA */}
          <path
            id="textPathTop"
            d="M 52,200 A 148,148 0 1,1 348,200"
            fill="none"
          />

          {/* Bottom text: TRANSAKSI ENERGI */}
          <path
            id="textPathBottom1"
            d="M 62,200 A 138,138 0 0,0 338,200"
            fill="none"
          />

          {/* Bottom subtext: ULP BAGUALA - PT PLN (PERSERO) */}
          <path
            id="textPathBottom2"
            d="M 40,200 A 160,160 0 0,0 360,200"
            fill="none"
          />

          {/* Center Circular Clip */}
          <clipPath id="suttCenterClip">
            <circle cx="200" cy="200" r="105" />
          </clipPath>
        </defs>

        {/* Outer White Badge Base */}
        <circle cx="200" cy="200" r="194" fill="#FFFFFF" />

        {/* Outer Navy Ring Borders */}
        <circle cx="200" cy="200" r="192" stroke="#083B66" strokeWidth="4.5" fill="none" />
        <circle cx="200" cy="200" r="183" stroke="#0A4D8C" strokeWidth="2" fill="none" />
        <circle cx="200" cy="200" r="115" stroke="#0A4D8C" strokeWidth="2.5" fill="none" />
        <circle cx="200" cy="200" r="108" stroke="#083B66" strokeWidth="3" fill="none" />

        {/* Dynamic Curved Swoosh Ring inside the border (Gold-Cyan Gradient) */}
        <path
          d="M 125,120 A 110,110 0 0,1 306,160"
          stroke="url(#suttRingGrad)"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />

        {/* Dot Separators between Top and Bottom Texts */}
        <circle cx="62" cy="216" r="4.5" fill="#083B66" />
        <circle cx="338" cy="216" r="4.5" fill="#083B66" />

        {/* 1. TOP CURVED TEXT: TIM TE BAGUALA */}
        <text
          fill="#083B66"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="36"
          letterSpacing="4"
        >
          <textPath href="#textPathTop" startOffset="50%" textAnchor="middle">
            TIM TE BAGUALA
          </textPath>
        </text>

        {/* 2. BOTTOM MAIN CURVED TEXT: TRANSAKSI ENERGI */}
        <text
          fill="#083B66"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="24"
          letterSpacing="2.5"
        >
          <textPath href="#textPathBottom1" startOffset="50%" textAnchor="middle">
            TRANSAKSI ENERGI
          </textPath>
        </text>

        {/* 3. BOTTOM SUB CURVED TEXT: ULP BAGUALA - PT PLN (PERSERO) */}
        <text
          fill="#0A4D8C"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="800"
          fontSize="14.5"
          letterSpacing="2"
        >
          <textPath href="#textPathBottom2" startOffset="50%" textAnchor="middle">
            ULP BAGUALA - PT PLN (PERSERO)
          </textPath>
        </text>

        {/* CENTER ARTWORK (Clipped to inner circle) */}
        <g clipPath="url(#suttCenterClip)">
          {/* Inner Light Gradient Sky */}
          <rect x="90" y="90" width="220" height="220" fill="#F8FAFC" />

          {/* Waves at the bottom */}
          <path
            d="M 90 270 Q 130 258 170 272 T 250 272 T 310 270 L 310 310 L 90 310 Z"
            fill="url(#suttWaveGrad1)"
            opacity="0.9"
          />
          <path
            d="M 90 282 Q 140 268 190 282 T 270 282 T 310 285 L 310 310 L 90 310 Z"
            fill="url(#suttWaveGrad2)"
          />
          {/* Stylized wave lines */}
          <path
            d="M 120 282 Q 160 270 200 280 T 280 280"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.8"
          />

          {/* SUTT Transmission Power Lines (Cables) */}
          {/* Left Sagging Lines */}
          <path
            d="M 100 185 Q 140 205 174 165"
            stroke="#083B66"
            strokeWidth="3"
            fill="none"
          />
          <path
            d="M 95 205 Q 135 225 172 195"
            stroke="#083B66"
            strokeWidth="3"
            fill="none"
          />
          <path
            d="M 102 225 Q 140 240 170 225"
            stroke="#083B66"
            strokeWidth="2.5"
            fill="none"
          />

          {/* Right Sagging Lines */}
          <path
            d="M 226 165 Q 260 205 300 185"
            stroke="#083B66"
            strokeWidth="3"
            fill="none"
          />
          <path
            d="M 228 195 Q 265 225 305 205"
            stroke="#083B66"
            strokeWidth="3"
            fill="none"
          />
          <path
            d="M 230 225 Q 260 240 298 225"
            stroke="#083B66"
            strokeWidth="2.5"
            fill="none"
          />

          {/* SUTT Lattice Tower Structure in Deep Navy */}
          {/* Spire / Peak */}
          <polygon points="200,105 197,125 203,125" fill="#083B66" />
          
          {/* Main Tower Body & Legs */}
          <polygon
            points="197,125 186,180 174,235 158,285 168,285 182,235 192,180 197,125"
            fill="#083B66"
          />
          <polygon
            points="203,125 214,180 226,235 242,285 232,285 218,235 208,180 203,125"
            fill="#083B66"
          />

          {/* Tower Horizontal Crossarms */}
          {/* Top Crossarm */}
          <rect x="155" y="152" width="90" height="4.5" rx="1" fill="#083B66" />
          <polygon points="200,135 160,154 240,154" stroke="#083B66" strokeWidth="2.5" fill="none" />
          {/* Top Insulators */}
          <rect x="158" y="156" width="4" height="12" fill="#083B66" />
          <rect x="238" y="156" width="4" height="12" fill="#083B66" />

          {/* Middle Crossarm */}
          <rect x="145" y="185" width="110" height="5" rx="1" fill="#083B66" />
          <polygon points="200,165 150,188 250,188" stroke="#083B66" strokeWidth="2.5" fill="none" />
          {/* Middle Insulators */}
          <rect x="148" y="190" width="4" height="12" fill="#083B66" />
          <rect x="248" y="190" width="4" height="12" fill="#083B66" />

          {/* Lower Crossarm */}
          <rect x="142" y="218" width="116" height="5" rx="1" fill="#083B66" />
          <polygon points="200,198 146,220 254,220" stroke="#083B66" strokeWidth="2.5" fill="none" />
          {/* Lower Insulators */}
          <rect x="144" y="223" width="4" height="12" fill="#083B66" />
          <rect x="252" y="223" width="4" height="12" fill="#083B66" />

          {/* Tower Internal Lattice Bracing (X-pattern) */}
          <line x1="195" y1="130" x2="205" y2="152" stroke="#083B66" strokeWidth="2.5" />
          <line x1="205" y1="130" x2="195" y2="152" stroke="#083B66" strokeWidth="2.5" />
          
          <line x1="191" y1="154" x2="209" y2="185" stroke="#083B66" strokeWidth="2.5" />
          <line x1="209" y1="154" x2="191" y2="185" stroke="#083B66" strokeWidth="2.5" />

          <line x1="187" y1="187" x2="213" y2="218" stroke="#083B66" strokeWidth="2.5" />
          <line x1="213" y1="187" x2="187" y2="218" stroke="#083B66" strokeWidth="2.5" />

          <line x1="182" y1="220" x2="218" y2="255" stroke="#083B66" strokeWidth="3" />
          <line x1="218" y1="220" x2="182" y2="255" stroke="#083B66" strokeWidth="3" />
          <line x1="178" y1="255" x2="222" y2="255" stroke="#083B66" strokeWidth="3" />

          <line x1="178" y1="255" x2="228" y2="285" stroke="#083B66" strokeWidth="3" />
          <line x1="222" y1="255" x2="172" y2="285" stroke="#083B66" strokeWidth="3" />

          {/* Green Energy Leaves / Foliage at Base */}
          {/* Left Leaves */}
          <path
            d="M 170 268 C 150 252 135 258 132 274 C 148 274 162 272 170 268 Z"
            fill="url(#suttLeafGrad1)"
          />
          <path
            d="M 160 265 C 145 238 160 228 172 238 C 172 252 168 260 160 265 Z"
            fill="url(#suttLeafGrad2)"
          />
          {/* Right Leaves */}
          <path
            d="M 230 268 C 250 250 268 258 270 274 C 252 274 238 272 230 268 Z"
            fill="url(#suttLeafGrad1)"
          />
          <path
            d="M 238 262 C 255 235 240 225 228 235 C 228 250 232 258 238 262 Z"
            fill="url(#suttLeafGrad2)"
          />
          <path
            d="M 245 250 C 265 230 278 240 272 258 C 260 256 250 254 245 250 Z"
            fill="url(#suttLeafGrad1)"
          />

          {/* Dynamic Golden Lightning Flash / Energy Swoosh across the Tower */}
          {/* Outer Energy Swoosh Arc */}
          <path
            d="M 140 240 C 180 230 235 190 262 140 C 240 165 200 200 155 222 Z"
            fill="url(#suttGoldLightning)"
            opacity="0.9"
          />

          {/* Sharp Zigzag Lightning Bolt */}
          <polygon
            points="230,135 170,202 214,198 160,250 202,244 148,278 185,232 175,232 215,190 190,192"
            fill="url(#suttGoldLightning)"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </div>
  );
}
