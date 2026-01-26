using Unity.Entities;

namespace NeoTokyo.Components.Combat
{
    /// <summary>
    /// Invincibility state for damage immunity frames.
    /// Equivalent to TypeScript: InvincibilityState in HitDetection.ts
    /// </summary>
    public struct InvincibilityState : IComponentData
    {
        public bool IsActive;
        public float RemainingTime;
        public float Duration;

        public static InvincibilityState Create(float duration) => new InvincibilityState
        {
            IsActive = true,
            RemainingTime = duration,
            Duration = duration
        };
    }

    /// <summary>
    /// Stability state for stagger/knockback resistance.
    /// Equivalent to TypeScript: StabilityState in BreakSystem.ts
    /// </summary>
    public struct StabilityState : IComponentData
    {
        public int Current;
        public int Max;
        public float RecoveryRate;  // Points recovered per second

        public float Ratio => Max > 0 ? (float)Current / Max : 1f;
        public bool IsBroken => Current <= 0;

        public static StabilityState Default => new StabilityState
        {
            Current = 100,
            Max = 100,
            RecoveryRate = 10f
        };
    }

    /// <summary>
    /// Break state for stagger mechanics.
    /// Equivalent to TypeScript: BreakState in BreakSystem.ts
    /// </summary>
    public struct BreakState : IComponentData
    {
        public bool IsBroken;
        public float BreakDuration;
        public float RemainingBreakTime;
        public int BreakCount;  // Number of times broken this encounter

        public static BreakState Default => new BreakState
        {
            IsBroken = false,
            BreakDuration = 2f,
            RemainingBreakTime = 0f,
            BreakCount = 0
        };
    }

    /// <summary>
    /// Character combat state machine.
    /// Equivalent to TypeScript: CharacterState in @neo-tokyo/core
    /// </summary>
    public enum CharacterState : byte
    {
        Idle = 0,
        Walking = 1,
        Running = 2,
        Jumping = 3,
        Falling = 4,
        Attacking = 5,
        Blocking = 6,
        Staggered = 7,
        Stunned = 8,
        Dead = 9,
        Interacting = 10
    }

    /// <summary>
    /// Component tracking current character state.
    /// </summary>
    public struct CharacterStateComponent : IComponentData
    {
        public CharacterState Current;
        public CharacterState Previous;
        public float StateTime;  // Time in current state

        public static CharacterStateComponent Default => new CharacterStateComponent
        {
            Current = CharacterState.Idle,
            Previous = CharacterState.Idle,
            StateTime = 0f
        };
    }

    /// <summary>
    /// Damage event buffer for hit processing.
    /// </summary>
    public struct DamageEvent : IBufferElementData
    {
        public Entity Source;
        public int Amount;
        public bool IsCritical;
        public float StabilityDamage;
    }
}
