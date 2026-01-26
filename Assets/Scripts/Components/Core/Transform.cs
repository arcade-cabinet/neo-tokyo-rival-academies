using Unity.Entities;
using Unity.Mathematics;

namespace NeoTokyo.Components.Core
{
    /// <summary>
    /// Position component for entities.
    /// Equivalent to TypeScript: position?: Vector3 in ECSEntity
    /// </summary>
    public struct Position : IComponentData
    {
        public float3 Value;
    }

    /// <summary>
    /// Velocity component for moving entities.
    /// Equivalent to TypeScript: velocity?: Vector3 in ECSEntity
    /// </summary>
    public struct Velocity : IComponentData
    {
        public float3 Value;
    }

    /// <summary>
    /// Flag for entities that can fly (ignore water collision).
    /// Equivalent to TypeScript: isFlying?: boolean in ECSEntity
    /// </summary>
    public struct FlyingTag : IComponentData { }
}
