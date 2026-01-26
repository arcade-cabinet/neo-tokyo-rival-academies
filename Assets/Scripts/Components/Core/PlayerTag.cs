using Unity.Entities;

namespace NeoTokyo.Components.Core
{
    /// <summary>
    /// Tag component to identify the player entity.
    /// Equivalent to TypeScript: isPlayer?: boolean in ECSEntity
    /// </summary>
    public struct PlayerTag : IComponentData { }

    /// <summary>
    /// Tag component to identify enemy entities.
    /// Equivalent to TypeScript: isEnemy?: boolean in ECSEntity
    /// </summary>
    public struct EnemyTag : IComponentData { }

    /// <summary>
    /// Tag component to identify boss entities.
    /// Equivalent to TypeScript: isBoss?: boolean in ECSEntity
    /// </summary>
    public struct BossTag : IComponentData { }

    /// <summary>
    /// Tag component to identify ally entities.
    /// Equivalent to TypeScript: isAlly?: boolean in ECSEntity
    /// </summary>
    public struct AllyTag : IComponentData { }
}
