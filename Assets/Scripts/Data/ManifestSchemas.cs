using System;
using System.Collections.Generic;
using UnityEngine;

namespace NeoTokyo.Data
{
    /// <summary>
    /// Manifest schema version tracking.
    /// Used to validate compatibility between TypeScript generators and Unity runtime.
    /// </summary>
    public static class ManifestVersion
    {
        public const string CURRENT = "2.0";
        public const int MAJOR = 2;
        public const int MINOR = 0;

        /// <summary>
        /// Check if a manifest version is compatible with the current runtime.
        /// </summary>
        public static bool IsCompatible(string version)
        {
            if (string.IsNullOrEmpty(version)) return false;

            var parts = version.Split('.');
            if (parts.Length < 1) return false;

            if (int.TryParse(parts[0], out int major))
            {
                return major == MAJOR;
            }

            return false;
        }

        /// <summary>
        /// Parse version string into major and minor components.
        /// </summary>
        public static (int major, int minor) Parse(string version)
        {
            if (string.IsNullOrEmpty(version)) return (0, 0);

            var parts = version.Split('.');
            int major = parts.Length > 0 && int.TryParse(parts[0], out int m) ? m : 0;
            int minor = parts.Length > 1 && int.TryParse(parts[1], out int n) ? n : 0;

            return (major, minor);
        }
    }

    #region Root Manifest Types

    /// <summary>
    /// World manifest schema - root container for all territory references.
    /// Matches TypeScript: world-gen output schema.
    /// </summary>
    [Serializable]
    public class WorldManifest
    {
        public string version;
        public string seed;
        public string generatedAt;
        public WorldMetadata metadata;
        public TerritoryReference[] territories;
        public GlobalConnectionDefinition[] connections;
    }

    /// <summary>
    /// World-level metadata for generation parameters.
    /// </summary>
    [Serializable]
    public class WorldMetadata
    {
        public int waterLevel;
        public float hexSize;
        public string theme;
        public string[] activeFactions;
        public WeatherConfig weather;
    }

    /// <summary>
    /// Weather configuration for the world.
    /// </summary>
    [Serializable]
    public class WeatherConfig
    {
        public string defaultWeather;
        public float rainProbability;
        public float fogDensity;
        public bool dynamicTimeOfDay;
    }

    /// <summary>
    /// Reference to a territory for streaming/loading.
    /// Lightweight pointer to full territory data.
    /// </summary>
    [Serializable]
    public class TerritoryReference
    {
        public string id;
        public string type;
        public string faction;
        public BoundsDefinition bounds;
        public string manifestPath;
        public int priority;
        public bool preload;
    }

    /// <summary>
    /// Global connection between territories (used in world manifest).
    /// </summary>
    [Serializable]
    public class GlobalConnectionDefinition
    {
        public string id;
        public string type;
        public string sourceTerritory;
        public string targetTerritory;
        public float[] sourcePosition;
        public float[] targetPosition;
        public bool bidirectional;
    }

    #endregion

    #region Territory Manifest Types

    /// <summary>
    /// Full territory definition - complete data for spawning.
    /// Matches TypeScript: TerritoryManifest from DDL output.
    /// </summary>
    [Serializable]
    public class TerritoryManifest
    {
        public string version;
        public string id;
        public string displayName;
        public string type;
        public string faction;
        public BoundsDefinition bounds;
        public TileDefinition[] tiles;
        public EntityDefinition[] entities;
        public NPCDefinition[] npcs;
        public QuestDefinition[] quests;
        public ConnectionDefinition[] connections;
        public TerritoryMetadata metadata;
    }

    /// <summary>
    /// Territory-specific metadata.
    /// </summary>
    [Serializable]
    public class TerritoryMetadata
    {
        public int dangerLevel;
        public string[] tags;
        public string ambientSound;
        public string music;
        public float lightingIntensity;
        public string skyboxOverride;
    }

    /// <summary>
    /// 2D bounds definition (horizontal plane).
    /// </summary>
    [Serializable]
    public class BoundsDefinition
    {
        public float[] min;
        public float[] max;

        public Vector2 Min => min != null && min.Length >= 2 ? new Vector2(min[0], min[1]) : Vector2.zero;
        public Vector2 Max => max != null && max.Length >= 2 ? new Vector2(max[0], max[1]) : Vector2.zero;
        public Vector2 Size => Max - Min;
        public Vector2 Center => (Min + Max) / 2f;

        public bool Contains(Vector2 point)
        {
            return point.x >= Min.x && point.x <= Max.x &&
                   point.y >= Min.y && point.y <= Max.y;
        }
    }

    #endregion

    #region Tile Definitions

    /// <summary>
    /// Hex tile type enumeration.
    /// Matches TypeScript: TileType from flooded world design.
    /// </summary>
    public enum TileTypeEnum
    {
        Water,
        Shallow,
        Platform,
        Rooftop,
        Bridge,
        Dock,
        Debris,
        Shelter,
        Garden,
        Market
    }

    /// <summary>
    /// Hex tile definition from procedural generation.
    /// Matches TypeScript: HexTile in world-gen.
    /// </summary>
    [Serializable]
    public class TileDefinition
    {
        public HexCoordDefinition hex;
        public string type;
        public float elevation;
        public string variant;
        public string material;
        public TileProperties properties;

        /// <summary>
        /// Parse type string to enum.
        /// </summary>
        public TileTypeEnum GetTileType()
        {
            if (Enum.TryParse<TileTypeEnum>(type, true, out var result))
            {
                return result;
            }
            return TileTypeEnum.Platform;
        }
    }

    /// <summary>
    /// Hex coordinate in axial format.
    /// </summary>
    [Serializable]
    public class HexCoordDefinition
    {
        public int q;
        public int r;

        /// <summary>
        /// Convert to cube coordinates (q, s, r) where s = -q - r.
        /// </summary>
        public Vector3Int ToCube() => new Vector3Int(q, -q - r, r);

        /// <summary>
        /// Convert to world position using flat-top hex layout.
        /// </summary>
        public Vector3 ToWorldPosition(float hexSize = 1f)
        {
            float x = hexSize * (Mathf.Sqrt(3f) * q + Mathf.Sqrt(3f) / 2f * r);
            float z = hexSize * (3f / 2f * r);
            return new Vector3(x, 0f, z);
        }
    }

    /// <summary>
    /// Optional tile-specific properties.
    /// </summary>
    [Serializable]
    public class TileProperties
    {
        public bool isPassable;
        public float movementCost;
        public bool isHazard;
        public string hazardType;
        public float damage;
        public bool blocksLineOfSight;
        public string[] connectedTiles;
    }

    #endregion

    #region Entity Definitions

    /// <summary>
    /// Entity type enumeration.
    /// Matches TypeScript: EntityType from content-gen.
    /// </summary>
    public enum EntityTypeEnum
    {
        // Structures
        Shelter,
        Bridge,
        Dock,
        Boat,
        Tower,
        Shrine,
        Vendor,
        Barricade,
        Generator,
        Terminal,

        // Interactables
        Chest,
        Crate,
        Barrel,
        Door,
        Lever,
        Button,
        Terminal_Interactive,

        // Combat
        Enemy,
        Boss,
        Turret,
        Trap,

        // Props
        Debris,
        Vegetation,
        Sign,
        Light,
        Flag,
        Banner,

        // Vehicles
        Speedboat,
        Raft,
        Jetski
    }

    /// <summary>
    /// Entity spawn definition from world-gen.
    /// </summary>
    [Serializable]
    public class EntityDefinition
    {
        public string id;
        public string type;
        public float[] position;
        public float rotation;
        public float[] scale;
        public string variant;
        public string prefabOverride;
        public EntityProperties properties;

        /// <summary>
        /// Get position as Vector3.
        /// </summary>
        public Vector3 GetPosition()
        {
            if (position == null || position.Length < 3)
                return Vector3.zero;
            return new Vector3(position[0], position[1], position[2]);
        }

        /// <summary>
        /// Get rotation as Quaternion (Y-axis rotation).
        /// </summary>
        public Quaternion GetRotation()
        {
            return Quaternion.Euler(0f, rotation, 0f);
        }

        /// <summary>
        /// Get scale as Vector3.
        /// </summary>
        public Vector3 GetScale()
        {
            if (scale == null || scale.Length < 3)
                return Vector3.one;
            return new Vector3(scale[0], scale[1], scale[2]);
        }

        /// <summary>
        /// Parse type string to enum.
        /// </summary>
        public EntityTypeEnum GetEntityType()
        {
            if (Enum.TryParse<EntityTypeEnum>(type, true, out var result))
            {
                return result;
            }
            Debug.LogWarning($"Unknown entity type: {type}");
            return EntityTypeEnum.Debris;
        }
    }

    /// <summary>
    /// Type-specific entity properties.
    /// </summary>
    [Serializable]
    public class EntityProperties
    {
        // Common
        public int health;
        public bool destructible;
        public string lootTable;

        // Shelter specific
        public int capacity;
        public string shelterType;

        // Enemy specific
        public string aiType;
        public int level;
        public string faction;
        public float aggroRange;
        public string[] abilities;

        // Interactable specific
        public string interactionType;
        public string linkedEntityId;
        public bool requiresKey;
        public string keyItemId;

        // Vendor specific
        public string[] inventory;
        public string[] services;

        // Vehicle specific
        public float speed;
        public int passengerCapacity;
    }

    #endregion

    #region NPC Definitions

    /// <summary>
    /// NPC archetype enumeration.
    /// </summary>
    public enum NPCArchetype
    {
        Civilian,
        Student,
        Teacher,
        Guard,
        Vendor,
        QuestGiver,
        Ally,
        Neutral,
        Hostile
    }

    /// <summary>
    /// NPC definition for character spawning.
    /// </summary>
    [Serializable]
    public class NPCDefinition
    {
        public string id;
        public string name;
        public string archetype;
        public string faction;
        public float[] position;
        public float rotation;
        public string appearance;
        public NPCSchedule schedule;
        public string[] dialogueIds;
        public NPCProperties properties;

        /// <summary>
        /// Get position as Vector3.
        /// </summary>
        public Vector3 GetPosition()
        {
            if (position == null || position.Length < 3)
                return Vector3.zero;
            return new Vector3(position[0], position[1], position[2]);
        }

        /// <summary>
        /// Get rotation as Quaternion.
        /// </summary>
        public Quaternion GetRotation()
        {
            return Quaternion.Euler(0f, rotation, 0f);
        }

        /// <summary>
        /// Parse archetype string to enum.
        /// </summary>
        public NPCArchetype GetArchetype()
        {
            if (Enum.TryParse<NPCArchetype>(archetype, true, out var result))
            {
                return result;
            }
            return NPCArchetype.Civilian;
        }
    }

    /// <summary>
    /// NPC daily schedule for position/behavior changes.
    /// </summary>
    [Serializable]
    public class NPCSchedule
    {
        public ScheduleEntry[] entries;
    }

    /// <summary>
    /// Single schedule entry.
    /// </summary>
    [Serializable]
    public class ScheduleEntry
    {
        public int startHour;
        public int endHour;
        public string location;
        public string behavior;
        public float[] position;
    }

    /// <summary>
    /// NPC-specific properties.
    /// </summary>
    [Serializable]
    public class NPCProperties
    {
        public int level;
        public bool essential;
        public bool merchant;
        public string[] services;
        public string voiceType;
        public string[] patrolPath;
    }

    #endregion

    #region Quest Definitions

    /// <summary>
    /// Quest type enumeration.
    /// </summary>
    public enum QuestType
    {
        Main,
        Side,
        Faction,
        Daily,
        Event,
        Tutorial
    }

    /// <summary>
    /// Quest objective type.
    /// </summary>
    public enum ObjectiveType
    {
        Kill,
        Collect,
        Deliver,
        Talk,
        Explore,
        Escort,
        Defend,
        Survive,
        Craft,
        Custom
    }

    /// <summary>
    /// Quest definition for territory-based quests.
    /// </summary>
    [Serializable]
    public class QuestDefinition
    {
        public string id;
        public string title;
        public string description;
        public string type;
        public string faction;
        public int minLevel;
        public string[] prerequisites;
        public QuestObjective[] objectives;
        public QuestReward[] rewards;
        public QuestTrigger trigger;

        /// <summary>
        /// Parse type string to enum.
        /// </summary>
        public QuestType GetQuestType()
        {
            if (Enum.TryParse<QuestType>(type, true, out var result))
            {
                return result;
            }
            return QuestType.Side;
        }
    }

    /// <summary>
    /// Quest objective definition.
    /// </summary>
    [Serializable]
    public class QuestObjective
    {
        public string id;
        public string description;
        public string type;
        public string target;
        public int count;
        public bool optional;
        public float[] location;
        public float radius;

        /// <summary>
        /// Parse type string to enum.
        /// </summary>
        public ObjectiveType GetObjectiveType()
        {
            if (Enum.TryParse<ObjectiveType>(type, true, out var result))
            {
                return result;
            }
            return ObjectiveType.Custom;
        }
    }

    /// <summary>
    /// Quest reward definition.
    /// </summary>
    [Serializable]
    public class QuestReward
    {
        public string type;
        public string itemId;
        public int amount;
        public string faction;
        public int reputation;
        public int experience;
    }

    /// <summary>
    /// Quest trigger conditions.
    /// </summary>
    [Serializable]
    public class QuestTrigger
    {
        public string type;
        public string npcId;
        public string itemId;
        public float[] location;
        public float radius;
        public string eventId;
    }

    #endregion

    #region Connection Definitions

    /// <summary>
    /// Connection type enumeration.
    /// </summary>
    public enum ConnectionType
    {
        Bridge,
        BoatRoute,
        Cable,
        Tunnel,
        Teleporter,
        Door
    }

    /// <summary>
    /// Connection between territories or areas.
    /// </summary>
    [Serializable]
    public class ConnectionDefinition
    {
        public string id;
        public string type;
        public string targetTerritory;
        public float[] startPosition;
        public float[] endPosition;
        public string variant;
        public bool requiresUnlock;
        public string unlockCondition;
        public ConnectionProperties properties;

        /// <summary>
        /// Get start position as Vector3.
        /// </summary>
        public Vector3 GetStartPosition()
        {
            if (startPosition == null || startPosition.Length < 3)
                return Vector3.zero;
            return new Vector3(startPosition[0], startPosition[1], startPosition[2]);
        }

        /// <summary>
        /// Get end position as Vector3.
        /// </summary>
        public Vector3 GetEndPosition()
        {
            if (endPosition == null || endPosition.Length < 3)
                return Vector3.zero;
            return new Vector3(endPosition[0], endPosition[1], endPosition[2]);
        }

        /// <summary>
        /// Parse type string to enum.
        /// </summary>
        public ConnectionType GetConnectionType()
        {
            if (Enum.TryParse<ConnectionType>(type, true, out var result))
            {
                return result;
            }
            return ConnectionType.Bridge;
        }
    }

    /// <summary>
    /// Connection-specific properties.
    /// </summary>
    [Serializable]
    public class ConnectionProperties
    {
        public float travelTime;
        public int cost;
        public bool bidirectional;
        public string vehicleType;
        public int capacity;
    }

    #endregion

    #region Manifest Load Results

    /// <summary>
    /// Result of a manifest load operation.
    /// </summary>
    public class ManifestLoadResult<T> where T : class
    {
        public bool Success { get; private set; }
        public T Data { get; private set; }
        public string Error { get; private set; }
        public float LoadTime { get; private set; }

        public static ManifestLoadResult<T> Succeeded(T data, float loadTime)
        {
            return new ManifestLoadResult<T>
            {
                Success = true,
                Data = data,
                LoadTime = loadTime
            };
        }

        public static ManifestLoadResult<T> Failed(string error)
        {
            return new ManifestLoadResult<T>
            {
                Success = false,
                Error = error
            };
        }
    }

    /// <summary>
    /// Aggregated result of loading multiple manifests.
    /// </summary>
    public class BatchLoadResult
    {
        public int TotalRequested { get; set; }
        public int Succeeded { get; set; }
        public int Failed { get; set; }
        public float TotalLoadTime { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
        public Dictionary<string, TerritoryManifest> LoadedTerritories { get; set; }
            = new Dictionary<string, TerritoryManifest>();

        public bool AllSucceeded => Failed == 0 && Succeeded == TotalRequested;
    }

    #endregion
}
