# Product Overview

**Neo-Tokyo: Rival Academies** is a 3D Action JRPG set in a futuristic neon-lit Neo-Tokyo where rival academies compete for the Data Core.

## Core Features

- **Action JRPG Combat**: Real-time combat with RPG stat-based damage calculations
- **Stats System**: Structure (health/defense), Ignition (melee damage), Logic (tech/ranged), Flow (speed/evasion)
- **Progression**: XP-based leveling, stat points, and reputation system
- **Narrative**: Visual novel-style dialogue overlays with procedurally generated content
- **3D Graphics**: Cel-shaded anime aesthetic using meshToonMaterial
- **Cross-Platform**: Web and mobile (iOS/Android via Capacitor)

## Game Mechanics

- **Combat Formula**: `Damage = (Attacker.AttackPower * StatMultiplier) - (Defender.Defense / 2)`
- **Break System**: Enemies have stability gauge; depleting it enables critical strikes
- **Data Shards**: Collectibles that unlock lore entries
- **Floating Damage Numbers**: Visual feedback on all combat hits

## Design Philosophy

- Zero stubs policy: all features must be fully implemented
- Production quality: modular, strictly typed, commented code
- Test-driven: write tests before or during implementation
- Visual consistency: maintain cel-shaded anime aesthetic throughout
