```html
<svg xmlns="http://w3.org" viewBox="0 0 800 500" width="100%" height="100%">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#050510"/>
      <stop offset="50%" stop-color="#15002a"/>
      <stop offset="100%" stop-color="#050510"/>
    </linearGradient>

    <!-- Retro Sun Gradient -->
    <linearGradient id="sunGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ff007f"/>
      <stop offset="40%" stop-color="#ff5500"/>
      <stop offset="100%" stop-color="#ffcc00"/>
    </linearGradient>

    <!-- Chrome Text Gradient -->
    <linearGradient id="chromeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="40%" stop-color="#d30074"/>
      <stop offset="50%" stop-color="#4a004f"/>
      <stop offset="60%" stop-color="#00f0ff"/>
      <stop offset="100%" stop-color="#ffffff"/>
    </linearGradient>

    <!-- Neon Cyan Glow -->
    <filter id="glowCyan" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <!-- Neon Pink Glow -->
    <filter id="glowPink" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <!-- Grid Perspective Mask -->
    <linearGradient id="gridFade" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#00f0ff" stop-opacity="1"/>
      <stop offset="80%" stop-color="#00f0ff" stop-opacity="0.1"/>
      <stop offset="100%" stop-color="#00f0ff" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <!-- Dark Base Backdrop -->
  <rect width="800" height="500" fill="url(#bgGrad)"/>

  <!-- RETRO SYNTHWAVE SUN -->
  <g transform="translate(400, 200)">
    <circle r="130" fill="url(#sunGrad)" />
    <!-- Horizon Cutout Bars -->
    <rect x="-140" y="15" width="280" height="6" fill="#15002a"/>
    <rect x="-140" y="33" width="280" height="9" fill="#110022"/>
    <rect x="-140" y="54" width="280" height="13" fill="#0c001c"/>
    <rect x="-140" y="80" width="280" height="18" fill="#070014"/>
    <rect x="-140" y="110" width="280" height="25" fill="#050510"/>
  </g>

  <!-- PERSPECTIVE NEON GRID ROAD -->
  <g opacity="0.7">
    <!-- Horizon line -->
    <line x1="0" y1="330" x2="800" y2="330" stroke="#ff007f" stroke-width="2" filter="url(#glowPink)"/>
    
    <!-- Perspective Rays disappearing into center horizon -->
    <g stroke="url(#gridFade)" stroke-width="2">
      <line x1="400" y1="330" x2="-200" y2="500"/>
      <line x1="400" y1="330" x2="0" y2="500"/>
      <line x1="400" y1="330" x2="200" y2="500"/>
      <line x1="400" y1="330" x2="350" y2="500"/>
      <line x1="400" y1="330" x2="450" y2="500"/>
      <line x1="400" y1="330" x2="600" y2="500"/>
      <line x1="400" y1="330" x2="800" y2="500"/>
      <line x1="400" y1="330" x2="1000" y2="500"/>
    </g>

    <!-- Horizontal Lines scaling down towards horizon -->
    <g stroke="#00f0ff" stroke-width="1.5" opacity="0.6">
      <line x1="0" y1="340" x2="800" y2="340"/>
      <line x1="0" y1="355" x2="800" y2="355"/>
      <line x1="0" y1="375" x2="800" y2="375"/>
      <line x1="0" y1="402" x2="800" y2="402"/>
      <line x1="0" y1="440" x2="800" y2="440"/>
      <line x1="0" y1="490" x2="800" y2="490"/>
    </g>
  </g>

  <!-- LOGO GRAPHICS SHARDS & SPEED LINES -->
  <g filter="url(#glowCyan)" stroke="#00f0ff" stroke-width="3" opacity="0.8">
    <line x1="120" y1="140" x2="220" y2="140"/>
    <line x1="80" y1="180" x2="180" y2="180"/>
    <line x1="680" y1="140" x2="580" y2="140"/>
    <line x1="720" y1="180" x2="620" y2="180"/>
  </g>

  <!-- TYPOGRAPHY LAYER 1: "CYBER" -->
  <text x="400" y="165" 
        font-family="'Montserrat', 'Arial Black', sans-serif" 
        font-size="95" 
        font-weight="900" 
        letter-spacing="18" 
        text-anchor="middle" 
        fill="#050510" 
        stroke="#00f0ff" 
        stroke-width="3" 
        filter="url(#glowCyan)">CYBER</text>
  
  <text x="400" y="165" 
        font-family="'Montserrat', 'Arial Black', sans-serif" 
        font-size="95" 
        font-weight="900" 
        letter-spacing="18" 
        text-anchor="middle" 
        fill="#ffffff">CYBER</text>

  <!-- TYPOGRAPHY LAYER 2: "COURIER" (ITALICIZED CHROME WITH GLOW) -->
  <text x="405" y="275" 
        font-family="'Impact', 'Arial Black', sans-serif" 
        font-size="115" 
        font-style="italic" 
        letter-spacing="4" 
        text-anchor="middle" 
        fill="#000000" 
        stroke="#ff007f" 
        stroke-width="8" 
        filter="url(#glowPink)">COURIER</text>

  <text x="400" y="270" 
        font-family="'Impact', 'Arial Black', sans-serif" 
        font-size="115" 
        font-style="italic" 
        letter-spacing="4" 
        text-anchor="middle" 
        fill="url(#chromeGrad)">COURIER</text>

  <!-- SUBTEXT SATELLITE SYSTEM TAG -->
  <text x="400" y="320" 
        font-family="monospace" 
        font-size="14" 
        letter-spacing="12" 
        text-anchor="middle" 
        fill="#00f0ff" 
        opacity="0.9" 
        filter="url(#glowCyan)">ENDLESS RUNNER ENGINE</text>
</svg>
```


# Cyber Courier: Pseudo-3D Retro Endless Runner

An Outrun-inspired arcade game framework built with pure canvas technology, integrated with an internal custom mathematical audio synthesizer engine, and a hardened backend tracking layer.

## System Matrix Features
* **Math Road Engine:** 3D-to-2D horizontal curve vector accumulator calculations.
* **Web Audio Synthesis:** Dynamic pitch-sweep sound generation loops without file dependencies.
* **Anti-Cheat Validation:** Inbound HMAC-SHA256 request payload verification.
* **Mobile-Responsive Matrix:** CSS transformation viewports paired with mobile touch zone arrays.

## Quick Installation & Launch Setup

### Hardware Requirements
* Docker Engine / Docker Compose Cluster Runtime Engine
* Python 3.x (Optional for testing script routines)

### Fast Deployment Utility Execution
```bash
# Clone the repository and navigate inside
git clone https://github.com
cd cyber-courier

# Fire off automated initialization and deployment scripts
chmod +x setup.sh
./setup.sh
```

### Manual Service Steps
If you prefer running services outside of isolated container setups, execute these terminal commands sequentially:
```bash
# 1. Initialize data tables
cd backend && python3 init_leaderboard.py

# 2. Fire up multi-network Go routing services
go mod init cyber-courier-backend && go get ://github.com
go run server.go
```

## Network Vector Router Matrix
* **Frontend Web Application View:** `http://localhost:80`
* **Score Capture API Vector:** `POST http://localhost:80/api/score`
* **Administrative Ledger Console:** `http://localhost:80/admin`

## Development Metrics
* Enforce **HMAC Verification checks** during manual high-score mutations.
* Debug hitboxes visually inside canvas workspaces by keeping the `renderDebugHitboxes()` line open.
