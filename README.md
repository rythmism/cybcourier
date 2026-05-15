# Cyber Courier: 
#### Pseudo-3D Retro Endless Runner

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
