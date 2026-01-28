# Mobile Native Build Guide (Unity 6)

**Last Updated**: January 26, 2026
**Status**: Active
**Core Principle**: Native Unity builds for Android/iOS. Target Pixel 8a baseline (60 FPS).

---

## Architecture Overview

Unity 6 provides native mobile builds without the need for Capacitor or WebView wrappers.

```
Unity 6 Project (ROOT)
       |
       +-- Android Build (APK/AAB)
       |       |
       |       +-- IL2CPP compiled C#
       |       +-- Burst-compiled DOTS systems
       |       +-- Havok Physics (native)
       |
       +-- iOS Build (Xcode Project)
               |
               +-- IL2CPP compiled C#
               +-- Metal rendering (URP)
               +-- Native asset bundles
```

## Performance Targets (Pixel 8a Baseline)

| Metric | Target | Implementation |
|--------|--------|----------------|
| FPS | 60 consistent | DOTS + Burst compilation, URP optimized |
| Boot Time | <2s interactive | Addressables, prewarmed scenes |
| Memory | <200MB heap | Entity pooling, texture compression (ASTC) |
| Input | <16ms latency | Unity Input System |
| Battery | <5% drain/hour | Dynamic resolution, adaptive quality |

## Build Process

### Android Builds

**Local Development Build:**
```bash
# Using Unity batch mode (from repository root)
Unity -batchmode -projectPath . \
  -buildTarget Android \
  -executeMethod BuildScript.BuildAndroid \
  -logFile build.log \
  -quit
```

**CI Build (GitHub Actions):**
See `.github/workflows/unity-build.yml` for automated builds:
- Triggered on push to main/develop
- Uses game-ci/unity-builder@v4
- Produces signed APK artifacts

**Required Secrets for CI:**
| Secret | Purpose |
|--------|---------|
| `UNITY_LICENSE` | Unity license file (base64) |
| `ANDROID_KEYSTORE_BASE64` | Signing keystore (base64) |
| `ANDROID_KEYSTORE_PASS` | Keystore password |
| `ANDROID_KEYALIAS_NAME` | Key alias |
| `ANDROID_KEYALIAS_PASS` | Key password |

### iOS Builds

**Generate Xcode Project:**
```bash
Unity -batchmode -projectPath . \
  -buildTarget iOS \
  -executeMethod BuildScript.BuildiOS \
  -logFile build.log \
  -quit
```

**From Xcode:**
1. Open generated `.xcworkspace`
2. Configure signing team
3. Build for device or archive for distribution

## Build Configuration

### Player Settings (ProjectSettings/ProjectSettings.asset)

Key Android settings:
- **Scripting Backend**: IL2CPP
- **Target Architectures**: ARM64
- **Minimum API Level**: 26 (Android 8.0)
- **Graphics APIs**: Vulkan, OpenGL ES 3.2
- **Managed Stripping Level**: High

Key iOS settings:
- **Scripting Backend**: IL2CPP
- **Architecture**: ARM64
- **Minimum iOS Version**: 14.0
- **Metal Graphics API**: Enabled

### URP Quality Settings

Located in `Assets/Settings/Rendering/`:

| Quality Tier | Resolution Scale | Shadows | MSAA | Target |
|--------------|------------------|---------|------|--------|
| Low | 0.7 | Off | Off | Budget devices |
| Medium | 0.85 | Soft | 2x | Pixel 8a |
| High | 1.0 | Soft | 4x | Flagship |

### Texture Compression

| Platform | Format | Notes |
|----------|--------|-------|
| Android | ASTC 6x6 | Best quality/size ratio |
| iOS | ASTC 6x6 | Native Metal support |

## Testing on Device

### Android (ADB)

```bash
# Install APK
adb install -r build/Android/NeoTokyo.apk

# View logs
adb logcat -s Unity:V

# Profile performance
adb shell dumpsys gfxinfo com.neotokyo.rivalacademies
```

### iOS (Xcode)

1. Connect device via USB
2. Build and run from Xcode
3. Use Instruments for profiling

### Remote Profiling

Unity Profiler can connect to device builds:
1. Build with Development Build + Autoconnect Profiler
2. Install on device
3. Open Unity Profiler, connect to device IP

## Input Handling

Unity Input System configuration for touch:

```csharp
// Assets/Settings/Input/TouchControls.inputactions
{
  "maps": [
    {
      "name": "Gameplay",
      "actions": [
        { "name": "Move", "type": "Value", "control": "Vector2" },
        { "name": "Attack", "type": "Button" },
        { "name": "Dodge", "type": "Button" }
      ]
    }
  ]
}
```

Virtual joystick implementation in MonoBehaviours:
- `Assets/Scripts/MonoBehaviours/UI/VirtualJoystick.cs`
- `Assets/Scripts/MonoBehaviours/UI/TouchButton.cs`

## Memory Management

### Entity Pooling

DOTS entities are recycled rather than destroyed:
```csharp
// Add DisabledTag instead of destroying
ecb.AddComponent<DisabledTag>(entity);
ecb.RemoveComponent<ActiveTag>(entity);

// Re-enable from pool
ecb.RemoveComponent<DisabledTag>(entity);
ecb.AddComponent<ActiveTag>(entity);
```

### Addressables

Large assets loaded on demand:
```csharp
var handle = Addressables.LoadAssetAsync<GameObject>("Characters/Kai");
yield return handle;
Instantiate(handle.Result);
```

## Deprecated: Capacitor (Do Not Use)

The previous Capacitor-based mobile approach is **deprecated**. The following are no longer used:

- `apps/mobile/` - Old React Native + Babylon Native project
- `capacitor.config.ts` - Capacitor configuration
- `android/` and `ios/` folders from Capacitor
- `@babylonjs/react-native` package
- WebView-based rendering

All mobile builds now use Unity's native build pipeline.

## CI/CD Workflows

### Build Workflow

`.github/workflows/unity-build.yml`:
- Builds Linux (validation), Android (on demand), WebGL (on demand)
- Uses GameCI actions
- Caches Unity Library folder

### Test Workflow

`.github/workflows/unity-tests.yml`:
- Runs EditMode and PlayMode tests
- Generates coverage reports
- Runs on every PR

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Black screen on Android | Check URP asset assignment in Quality Settings |
| Low FPS | Enable Burst, verify DOTS systems are compiled |
| Build fails with IL2CPP | Check managed code stripping settings |
| Touch not responding | Verify Input System package, EventSystem in scene |

### Performance Debugging

```bash
# Enable detailed GPU timing
adb shell setprop debug.hwui.profile true

# Force GPU rendering logging
adb shell dumpsys gfxinfo com.neotokyo.rivalacademies framestats
```

---

## References

- [Unity 6 Android Build](https://docs.unity3d.com/6000.3/Documentation/Manual/android-building-and-delivering.html)
- [Unity 6 iOS Build](https://docs.unity3d.com/6000.3/Documentation/Manual/iphone-BuildProcess.html)
- [GameCI Unity Builder](https://github.com/game-ci/unity-builder)
- [UNITY_6_ARCHITECTURE.md](UNITY_6_ARCHITECTURE.md)
- [UNITY_MIGRATION.md](UNITY_MIGRATION.md)

---

*Previous version (Capacitor/React Native approach) is archived in git history.*
