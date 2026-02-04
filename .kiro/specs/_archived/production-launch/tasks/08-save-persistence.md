# 8. Save System & Persistence

**Parent:** [tasks.md](../tasks.md)
**Validates:** Requirements 17, 18

## Overview
Implements comprehensive save/load system with cloud sync, auto-save, and cross-device support.

## Prerequisites
- All game systems operational
- Player progression tracking functional
- Quest and dialogue systems complete

## Tasks

### 8.1. Save Data Schema

**Validates:** Requirement 17.1

- [ ] 8.1.1. Define save file schema
  - Player data: stats, level, XP, inventory
  - Progress data: stage completion, quest states, reputation
  - Metadata: save_date, play_time, version
  - _File: `packages/game/src/types/save-data.ts`_
  - _Validates: Requirements 17.1_

- [ ] 8.1.2. Implement save data serialization
  - Convert ECS state to JSON
  - Compress save data (gzip)
  - Encrypt sensitive data (optional)
  - _File: `packages/game/src/systems/SaveSerializer.ts`_

- [ ]* 8.1.3. Write property test for serialization
  - **Property 38: Serialization round-trip**
  - **Validates: Requirements 17.1**
  - For any game state, serializing then deserializing should produce equivalent state
  - No data loss during round-trip

### 8.2. Local Storage System

**Validates:** Requirement 17.2

- [ ] 8.2.1. Implement localStorage save backend
  - Save to browser localStorage
  - Support multiple save slots (3 slots)
  - Handle storage quota errors
  - _File: `packages/game/src/systems/LocalStorageBackend.ts`_
  - _Validates: Requirements 17.2_

- [ ] 8.2.2. Create save slot management
  - List all save slots
  - Load specific slot
  - Delete slot
  - _File: `packages/game/src/systems/SaveSlotManager.ts`_

- [ ]* 8.2.3. Write property test for save slots
  - **Property 39: Save slot isolation**
  - **Validates: Requirements 17.2**
  - For any save operation, only target slot should be modified
  - Other slots should remain unchanged

### 8.3. Auto-Save System

**Validates:** Requirement 17.3

- [ ] 8.3.1. Implement auto-save triggers
  - Auto-save on stage completion
  - Auto-save every 5 minutes during gameplay
  - Auto-save before boss fights
  - _File: `packages/game/src/systems/AutoSave.ts`_
  - _Validates: Requirements 17.3_

- [ ] 8.3.2. Create auto-save indicator
  - Visual indicator when saving
  - Non-intrusive toast notification
  - Error notification if save fails
  - _File: `packages/game/src/components/react/ui/SaveIndicator.tsx`_

- [ ]* 8.3.3. Write property test for auto-save timing
  - **Property 40: Auto-save frequency**
  - **Validates: Requirements 17.3**
  - For any gameplay session, auto-save should trigger at correct intervals
  - No duplicate saves within interval

### 8.4. Cloud Save Integration

**Validates:** Requirement 18.1, 18.2

- [ ] 8.4.1. Implement cloud save backend
  - Use Firebase/Supabase for cloud storage
  - Authenticate users (anonymous or account)
  - Upload/download save files
  - _File: `packages/game/src/systems/CloudSaveBackend.ts`_
  - _Validates: Requirements 18.1_

- [ ] 8.4.2. Create sync conflict resolution
  - Compare timestamps of local vs cloud saves
  - Prompt user to choose version on conflict
  - Merge saves when possible
  - _File: `packages/game/src/systems/SaveConflictResolver.ts`_
  - _Validates: Requirements 18.2_

- [ ] 8.4.3. Implement offline queue
  - Queue save operations when offline
  - Sync when connection restored
  - Retry failed uploads
  - _File: `packages/game/src/systems/OfflineSaveQueue.ts`_

- [ ]* 8.4.4. Write property test for cloud sync
  - **Property 41: Cloud sync consistency**
  - **Validates: Requirements 18.1**
  - For any save uploaded to cloud, downloading should return identical data
  - Sync should not corrupt save files

### 8.5. Save Migration System

**Validates:** Requirement 17.4

- [ ] 8.5.1. Implement version migration
  - Detect save file version
  - Apply migrations to update schema
  - Support backward compatibility (1 version back)
  - _File: `packages/game/src/systems/SaveMigration.ts`_
  - _Validates: Requirements 17.4_

- [ ] 8.5.2. Create migration registry
  - Register migrations per version
  - Execute migrations in sequence
  - Validate migrated data
  - _File: `packages/game/src/systems/MigrationRegistry.ts`_

- [ ]* 8.5.3. Write property test for migrations
  - **Property 42: Migration idempotency**
  - **Validates: Requirements 17.4**
  - For any save file, applying migration twice should produce same result
  - Migrations should never corrupt data

### 8.6. Save UI Components

**Validates:** Requirement 17.5

- [ ] 8.6.1. Create save/load menu
  - Display all save slots with metadata
  - Show save date, play time, stage
  - Confirm before overwriting
  - _File: `packages/game/src/components/react/ui/SaveLoadMenu.tsx`_
  - _Validates: Requirements 17.5_

- [ ] 8.6.2. Implement save slot preview
  - Show character portrait
  - Display key stats (level, stage, play time)
  - Indicate cloud sync status
  - _File: `packages/game/src/components/react/ui/SaveSlotPreview.tsx`_

- [ ] 8.6.3. Add settings for auto-save
  - Toggle auto-save on/off
  - Configure auto-save interval
  - Choose default save slot
  - _File: `packages/game/src/components/react/ui/SaveSettings.tsx`_

### 8.7. Mobile Persistence

**Validates:** Requirement 18.3

- [ ] 8.7.1. Implement Capacitor storage plugin
  - Use Capacitor Preferences API for mobile
  - Fallback to localStorage on web
  - Handle platform differences
  - _File: `packages/game/src/systems/MobileStorageBackend.ts`_
  - _Validates: Requirements 18.3_

- [ ] 8.7.2. Create app lifecycle handlers
  - Save on app backgrounding
  - Restore on app foregrounding
  - Handle app termination
  - _File: `packages/game/src/systems/AppLifecycle.ts`_

- [ ]* 8.7.3. Write property test for mobile persistence
  - **Property 43: Mobile save reliability**
  - **Validates: Requirements 18.3**
  - For any save operation on mobile, data should persist across app restarts
  - No data loss on app termination

## Verification

After completing this section:
- [ ] Save files serialize/deserialize correctly
- [ ] Multiple save slots work independently
- [ ] Auto-save triggers at correct times
- [ ] Cloud sync uploads and downloads
- [ ] Conflict resolution handles edge cases
- [ ] Save migrations update old files
- [ ] Save UI displays all information
- [ ] Mobile persistence works on iOS/Android
- [ ] All property tests pass (100+ iterations each)
- [ ] TypeScript compiles without errors
- [ ] Linting passes (`pnpm check`)
- [ ] Save operations don't cause frame drops

## Common Commands

```bash
# Development
pnpm --filter @neo-tokyo/game dev

# Test save systems
pnpm --filter @neo-tokyo/game test SaveSerializer
pnpm --filter @neo-tokyo/game test SaveSlotManager
pnpm --filter @neo-tokyo/game test CloudSaveBackend

# Test on mobile
pnpm --filter @neo-tokyo/game build
npx cap sync
npx cap run android
npx cap run ios

# Lint
pnpm --filter @neo-tokyo/game check
```
