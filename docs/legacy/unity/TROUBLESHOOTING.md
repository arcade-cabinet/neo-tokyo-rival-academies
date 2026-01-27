# Troubleshooting Guide

**Version**: 1.0.0
**Last Updated**: January 26, 2026

Common issues and solutions for Neo-Tokyo: Rival Academies development.

---

## Table of Contents

1. [Unity Installation Issues](#unity-installation-issues)
2. [Package Resolution Issues](#package-resolution-issues)
3. [Compilation Errors](#compilation-errors)
4. [Test Failures](#test-failures)
5. [Runtime Errors](#runtime-errors)
6. [Mobile Build Issues](#mobile-build-issues)
7. [Performance Issues](#performance-issues)
8. [Version Control Issues](#version-control-issues)

---

## Unity Installation Issues

### Unity Editor Not Found

**Symptom:** `./scripts/run-tests.sh` reports "Unity Editor not found."

**Solutions:**

1. **Verify Unity 6000.3.5f1 is installed:**
   ```bash
   # Check installed versions
   ls /Applications/Unity/Hub/Editor/  # macOS
   ls ~/Unity/Hub/Editor/              # Linux
   dir "C:\Program Files\Unity\Hub\Editor"  # Windows
   ```

2. **Set UNITY_PATH environment variable:**
   ```bash
   # macOS
   export UNITY_PATH="/Applications/Unity/Hub/Editor/6000.3.5f1/Unity.app/Contents/MacOS/Unity"

   # Linux
   export UNITY_PATH="$HOME/Unity/Hub/Editor/6000.3.5f1/Editor/Unity"

   # Windows (Git Bash)
   export UNITY_PATH="/c/Program Files/Unity/Hub/Editor/6000.3.5f1/Editor/Unity.exe"
   ```

3. **Install correct Unity version:**
   - Open Unity Hub
   - Go to **Installs** tab
   - Click **Install Editor**
   - Select **6000.3.5f1** (use Archive if not listed)

### Unity Hub Connection Issues

**Symptom:** Unity Hub can't download or update.

**Solutions:**

1. Check firewall/proxy settings
2. Try VPN if in restricted region
3. Download offline installer from Unity Archive

---

## Package Resolution Issues

### Invalid Package Signatures

**Symptom:** Console shows "package has an invalid signature" warnings.

**Solutions:**

1. **Run batch mode resolution:**
   ```bash
   ./scripts/resolve-packages.sh
   ```

2. **Delete Library folder:**
   ```bash
   rm -rf Library/
   # Reopen project in Unity
   ```

3. **Manual package manager update:**
   - Open Unity Editor
   - Window > Package Manager
   - Click "Update" on flagged packages

### Package Not Found

**Symptom:** `Package 'com.unity.xxx' not found` error.

**Solutions:**

1. **Check manifest.json:**
   ```bash
   cat Packages/manifest.json | grep "com.unity.xxx"
   ```

2. **Add missing package:**
   ```bash
   # Using openupm-cli
   openupm add com.unity.xxx
   ```

3. **Verify scoped registry:**
   ```json
   // Packages/manifest.json
   "scopedRegistries": [
     {
       "name": "OpenUPM",
       "url": "https://package.openupm.com",
       "scopes": ["com.cysharp", "com.neuecc"]
     }
   ]
   ```

### Assembly Reference Missing

**Symptom:** `The type or namespace 'X' could not be found`

**Solutions:**

1. **Check asmdef references:**
   ```json
   // Assets/Scripts/NeoTokyo.asmdef
   "references": [
     "Unity.Entities",
     "Unity.Mathematics",
     // Add missing reference
   ]
   ```

2. **Reimport assemblies:**
   - Right-click `Assets/Scripts` folder
   - Select **Reimport**

3. **Refresh Visual Studio/Rider:**
   - Close IDE
   - Delete `.csproj` and `.sln` files
   - Reopen Unity (regenerates solutions)

---

## Compilation Errors

### Burst Compilation Errors

**Symptom:** `Burst error BC1016: The managed type 'X' is not supported`

**Cause:** Using managed types (string, class) in Burst-compiled code.

**Solutions:**

```csharp
// BAD: Using string
public struct MyComponent : IComponentData
{
    public string Name;  // Not supported
}

// GOOD: Use FixedString
public struct MyComponent : IComponentData
{
    public FixedString64Bytes Name;
}

// BAD: Using Vector3
public struct Position : IComponentData
{
    public Vector3 Value;  // Use float3 instead
}

// GOOD: Use float3
public struct Position : IComponentData
{
    public float3 Value;
}
```

### Partial Struct Missing

**Symptom:** `'SystemState' does not contain a definition for 'X'`

**Cause:** ISystem structs must be declared `partial`.

**Solution:**

```csharp
// BAD
public struct MySystem : ISystem { }

// GOOD
public partial struct MySystem : ISystem { }
```

### EntityManager Access in Job

**Symptom:** `EntityManager cannot be used inside a job`

**Cause:** Accessing EntityManager from within a parallel job.

**Solution:**

```csharp
// BAD: Using EntityManager in job
[BurstCompile]
partial struct BadJob : IJobEntity
{
    public EntityManager EM;  // Won't work
    void Execute(Entity entity)
    {
        EM.DestroyEntity(entity);  // Error!
    }
}

// GOOD: Use EntityCommandBuffer
[BurstCompile]
partial struct GoodJob : IJobEntity
{
    public EntityCommandBuffer.ParallelWriter ECB;
    void Execute([EntityIndexInQuery] int index, Entity entity)
    {
        ECB.DestroyEntity(index, entity);
    }
}
```

### Duplicate Component Definition

**Symptom:** `The type 'X' already contains a definition for 'Y'`

**Cause:** Same component defined in multiple files.

**Solution:**
1. Search for duplicates: `grep -r "public struct Health" Assets/`
2. Remove duplicate definition
3. Consolidate in correct location

---

## Test Failures

### EditMode Tests Not Running

**Symptom:** No tests discovered or "0 tests run."

**Solutions:**

1. **Check assembly definition:**
   ```json
   // Tests/EditMode/NeoTokyo.Tests.EditMode.asmdef
   {
     "name": "NeoTokyo.Tests.EditMode",
     "references": [
       "NeoTokyo",
       "Unity.Entities"
     ],
     "optionalUnityReferences": [
       "TestAssemblies"
     ],
     "includePlatforms": ["Editor"]
   }
   ```

2. **Verify test attribute:**
   ```csharp
   [TestFixture]
   public class MyTests
   {
       [Test]  // Must have this attribute
       public void MyTest() { }
   }
   ```

3. **Check testables in manifest:**
   ```json
   // Packages/manifest.json
   "testables": [
     "com.unity.test-framework",
     "com.unity.entities"
   ]
   ```

### PlayMode Tests Timing Out

**Symptom:** `Test exceeded maximum allowed time of 60000ms`

**Solutions:**

1. **Increase timeout:**
   ```csharp
   [UnityTest]
   [Timeout(120000)]  // 2 minutes
   public IEnumerator LongRunningTest()
   {
       // ...
   }
   ```

2. **Check for infinite loops:**
   - Add debug logging
   - Verify exit conditions

3. **Use WaitForSeconds with timeout:**
   ```csharp
   float elapsed = 0f;
   while (!condition && elapsed < 10f)
   {
       elapsed += Time.deltaTime;
       yield return null;
   }
   Assert.IsTrue(condition, "Condition not met within timeout");
   ```

### Test World Leaks

**Symptom:** `World 'X' was leaked. Did you forget to dispose it?`

**Solution:**

```csharp
private World _testWorld;

[SetUp]
public void SetUp()
{
    _testWorld = new World("TestWorld");
}

[TearDown]
public void TearDown()
{
    // Always dispose!
    if (_testWorld != null && _testWorld.IsCreated)
    {
        _testWorld.Dispose();
    }
}
```

### NativeArray Leaks

**Symptom:** `A Native Collection has not been disposed`

**Solution:**

```csharp
[Test]
public void MyTest()
{
    var array = new NativeArray<int>(10, Allocator.TempJob);
    try
    {
        // Test code
    }
    finally
    {
        array.Dispose();  // Always dispose
    }
}

// Or use using statement
[Test]
public void MyTest()
{
    using var array = new NativeArray<int>(10, Allocator.TempJob);
    // Array disposed automatically
}
```

---

## Runtime Errors

### System Not Running

**Symptom:** System's `OnUpdate` never called.

**Debugging steps:**

1. **Check RequireForUpdate:**
   ```csharp
   public void OnCreate(ref SystemState state)
   {
       // System won't run until Health component exists
       state.RequireForUpdate<Health>();
   }
   ```

2. **Verify entities exist:**
   - Open Window > Entities > Systems
   - Check entity count in queries

3. **Check system group:**
   ```csharp
   [UpdateInGroup(typeof(SimulationSystemGroup))]  // Correct group?
   ```

4. **Enable system manually:**
   - Window > Entities > Systems
   - Find system and check "Enabled"

### Entity Not Found

**Symptom:** `Entity does not exist` or `HasComponent returns false`

**Solutions:**

1. **Check entity is valid:**
   ```csharp
   if (state.EntityManager.Exists(entity))
   {
       // Safe to access
   }
   ```

2. **Check component was added:**
   ```csharp
   if (state.EntityManager.HasComponent<Health>(entity))
   {
       var health = state.EntityManager.GetComponentData<Health>(entity);
   }
   ```

3. **Verify ECB execution:**
   - ECB changes apply at sync point
   - Don't query entity same frame as creation

### Invalid Buffer Access

**Symptom:** `The DynamicBuffer has not been initialized` or crash on buffer access.

**Solutions:**

1. **Add buffer in authoring:**
   ```csharp
   class Baker : Baker<MyAuthoring>
   {
       public override void Bake(MyAuthoring authoring)
       {
           var entity = GetEntity(TransformUsageFlags.Dynamic);
           AddBuffer<DamageEvent>(entity);  // Initialize buffer
       }
   }
   ```

2. **Check buffer exists before access:**
   ```csharp
   if (state.EntityManager.HasBuffer<DamageEvent>(entity))
   {
       var buffer = state.EntityManager.GetBuffer<DamageEvent>(entity);
   }
   ```

---

## Mobile Build Issues

### Android Build Fails

**Symptom:** Build fails with NDK/SDK errors.

**Solutions:**

1. **Install Android modules:**
   - Unity Hub > Installs > 6000.3.5f1 > Add Modules
   - Add "Android Build Support"
   - Add "Android SDK & NDK Tools"

2. **Configure SDK path:**
   - Edit > Preferences > External Tools
   - Set Android SDK path
   - Set Android NDK path

3. **Check minimum API level:**
   - Edit > Project Settings > Player > Android
   - Minimum API Level: 24 (Android 7.0)

### iOS Build Fails

**Symptom:** Xcode build errors.

**Solutions:**

1. **Install iOS modules:**
   - Unity Hub > Installs > Add Modules
   - Add "iOS Build Support"

2. **Set bundle identifier:**
   - Edit > Project Settings > Player > iOS
   - Set "Bundle Identifier" (com.company.game)

3. **Check signing:**
   - Requires Apple Developer account
   - Set Team ID in Xcode

### Out of Memory on Device

**Symptom:** App crashes or shows black screen on mobile.

**Solutions:**

1. **Reduce texture sizes:**
   - Use compressed formats (ETC2, ASTC)
   - Enable mipmaps

2. **Reduce entity count:**
   ```csharp
   // Limit active entities
   if (activeEntityCount > 5000)
   {
       CullDistantEntities();
   }
   ```

3. **Enable LOD:**
   - Use LOD Groups on prefabs
   - Reduce draw distance

4. **Profile on device:**
   - Build with Development Build enabled
   - Attach Profiler to device

---

## Performance Issues

### Low Frame Rate

**Symptom:** FPS drops below 60.

**Debugging steps:**

1. **Open Profiler:**
   - Window > Analysis > Profiler
   - Check CPU and GPU times

2. **Identify bottlenecks:**
   - Look for long-running systems
   - Check for GC allocations (red spikes)

3. **Enable Burst:**
   ```csharp
   [BurstCompile]  // Must have this!
   public partial struct ExpensiveSystem : ISystem
   ```

4. **Use Jobs for heavy work:**
   ```csharp
   new HeavyJob { }.ScheduleParallel();
   ```

### GC Allocations in Systems

**Symptom:** Profiler shows memory allocations in game code.

**Common causes and fixes:**

```csharp
// BAD: String concatenation
Debug.Log("Health: " + health);

// GOOD: Use interpolation or avoid in hot path
#if UNITY_EDITOR
Debug.Log($"Health: {health}");
#endif

// BAD: LINQ in hot path
var enemies = entities.Where(e => e.IsEnemy).ToList();

// GOOD: Use native containers
var enemies = new NativeList<Entity>(Allocator.TempJob);

// BAD: GetAllEntities
var all = EntityManager.GetAllEntities();

// GOOD: Use queries
foreach (var entity in SystemAPI.Query<RefRO<Health>>().WithEntityAccess())
```

### Systems Running Too Often

**Symptom:** Systems processing when not needed.

**Solution:**

```csharp
public void OnCreate(ref SystemState state)
{
    // Only run when combat is active
    state.RequireForUpdate<CombatActiveTag>();
}

public void OnUpdate(ref SystemState state)
{
    // Early out if nothing to process
    if (SystemAPI.QueryBuilder().WithAll<DamageEvent>().Build().IsEmpty)
        return;
}
```

---

## Version Control Issues

### Library Folder Changes

**Symptom:** Git shows many changes in Library folder.

**Solution:** Library should be gitignored. Check `.gitignore`:

```gitignore
# Unity
/[Ll]ibrary/
/[Tt]emp/
/[Oo]bj/
/[Bb]uild/
/[Bb]uilds/
/[Ll]ogs/
/[Mm]emoryCaptures/
```

### Large Files Blocking Push

**Symptom:** Push fails due to file size limit.

**Solutions:**

1. **Use Git LFS:**
   ```bash
   git lfs track "*.fbx"
   git lfs track "*.png"
   ```

2. **Remove from history:**
   ```bash
   git filter-branch --tree-filter 'rm -f path/to/large/file' HEAD
   ```

3. **Use Addressables for large assets**

### Merge Conflicts in .meta Files

**Symptom:** Conflicts in Unity's .meta files.

**Solution:**

1. **Accept "theirs" for .meta:**
   ```bash
   git checkout --theirs *.meta
   ```

2. **Reimport in Unity:**
   - Open Unity
   - Right-click Assets > Reimport All

3. **Use UnityYAMLMerge:**
   ```gitconfig
   # .gitconfig
   [merge]
     tool = unityyamlmerge
   [mergetool "unityyamlmerge"]
     cmd = 'Unity.app/Contents/Tools/UnityYAMLMerge' merge -p "$BASE" "$REMOTE" "$LOCAL" "$MERGED"
   ```

---

## Getting Additional Help

### Logs

| Log Location | Content |
|--------------|---------|
| `TestResults/editmode-log.txt` | EditMode test logs |
| `TestResults/playmode-log.txt` | PlayMode test logs |
| `Logs/Editor.log` | Unity Editor log |
| `~/Library/Logs/Unity/` | All Unity logs (macOS) |

### Debug Commands

```bash
# Verbose test output
UNITY_PATH=/path/to/unity ./scripts/run-tests.sh editmode 2>&1 | tee test.log

# Unity batch mode with detailed logging
Unity -batchmode -projectPath . -logFile - 2>&1
```

### Resources

- [Unity DOTS Documentation](https://docs.unity3d.com/Packages/com.unity.entities@1.3/manual/)
- [Unity Test Framework](https://docs.unity3d.com/6000.3/Documentation/Manual/testing-editortestsrunner.html)
- [Burst Compiler](https://docs.unity3d.com/Packages/com.unity.burst@1.8/manual/)

---

**Last Updated**: January 26, 2026
