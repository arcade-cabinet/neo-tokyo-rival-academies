using NUnit.Framework;
using Unity.Collections;
using Unity.Entities;
using Unity.Mathematics;
using NeoTokyo.Components.AI;
using NeoTokyo.Systems.AI;

namespace NeoTokyo.Tests.EditMode
{
    /// <summary>
    /// Unit tests for AI systems.
    /// Tests enemy AI state transitions, threat calculations, and perception.
    /// Command: Unity -batchmode -runTests -testPlatform EditMode
    /// </summary>
    [TestFixture]
    public class AISystemTests
    {
        #region EnemyAIState Enum Tests

        [Test]
        public void EnemyAIState_HasCorrectEnumValues()
        {
            Assert.AreEqual((byte)0, (byte)EnemyAIState.Idle);
            Assert.AreEqual((byte)1, (byte)EnemyAIState.Patrolling);
            Assert.AreEqual((byte)2, (byte)EnemyAIState.Chasing);
            Assert.AreEqual((byte)3, (byte)EnemyAIState.Attacking);
            Assert.AreEqual((byte)4, (byte)EnemyAIState.Retreating);
            Assert.AreEqual((byte)5, (byte)EnemyAIState.Stunned);
        }

        #endregion

        #region EnemyAI Component Tests

        [Test]
        public void EnemyAI_DefaultValues()
        {
            var ai = new EnemyAI
            {
                State = EnemyAIState.Idle,
                StateTimer = 0f,
                AggroRange = 10f,
                AttackRange = 2f,
                AttackCooldown = 1.5f,
                CurrentCooldown = 0f,
                PatrolOrigin = float3.zero,
                PatrolRadius = 5f
            };

            Assert.AreEqual(EnemyAIState.Idle, ai.State);
            Assert.AreEqual(10f, ai.AggroRange);
            Assert.AreEqual(2f, ai.AttackRange);
        }

        [Test]
        public void EnemyAI_PatrolConfiguration()
        {
            var ai = new EnemyAI
            {
                PatrolOrigin = new float3(10, 0, 20),
                PatrolRadius = 8f,
                CurrentPatrolTarget = new float3(15, 0, 22)
            };

            Assert.AreEqual(10f, ai.PatrolOrigin.x);
            Assert.AreEqual(20f, ai.PatrolOrigin.z);
            Assert.AreEqual(8f, ai.PatrolRadius);
        }

        #endregion

        #region State Transition Tests

        [Test]
        public void StateTransition_IdleToChasing_WhenPlayerInRange()
        {
            var ai = new EnemyAI
            {
                State = EnemyAIState.Idle,
                AggroRange = 10f
            };
            float playerDistance = 8f;

            if (playerDistance <= ai.AggroRange)
            {
                ai.State = EnemyAIState.Chasing;
                ai.StateTimer = 10f;
            }

            Assert.AreEqual(EnemyAIState.Chasing, ai.State);
            Assert.AreEqual(10f, ai.StateTimer);
        }

        [Test]
        public void StateTransition_IdleToPatrolling_WhenTimerExpires()
        {
            var ai = new EnemyAI
            {
                State = EnemyAIState.Idle,
                StateTimer = 0f,
                AggroRange = 10f
            };
            float playerDistance = 15f; // Outside aggro range

            if (playerDistance > ai.AggroRange && ai.StateTimer <= 0f)
            {
                ai.State = EnemyAIState.Patrolling;
                ai.StateTimer = 5f;
            }

            Assert.AreEqual(EnemyAIState.Patrolling, ai.State);
        }

        [Test]
        public void StateTransition_ChasingToAttacking_WhenInRange()
        {
            var ai = new EnemyAI
            {
                State = EnemyAIState.Chasing,
                AttackRange = 2f,
                CurrentCooldown = 0f
            };
            float playerDistance = 1.5f;

            if (playerDistance <= ai.AttackRange && ai.CurrentCooldown <= 0f)
            {
                ai.State = EnemyAIState.Attacking;
                ai.StateTimer = 0.5f;
            }

            Assert.AreEqual(EnemyAIState.Attacking, ai.State);
            Assert.AreEqual(0.5f, ai.StateTimer);
        }

        [Test]
        public void StateTransition_ChasingToRetreating_WhenPlayerEscapes()
        {
            var ai = new EnemyAI
            {
                State = EnemyAIState.Chasing,
                AggroRange = 10f,
                StateTimer = 0f
            };
            float playerDistance = 20f; // Beyond 1.5x aggro range

            if (playerDistance > ai.AggroRange * 1.5f || ai.StateTimer <= 0f)
            {
                ai.State = EnemyAIState.Retreating;
                ai.StateTimer = 3f;
            }

            Assert.AreEqual(EnemyAIState.Retreating, ai.State);
        }

        [Test]
        public void StateTransition_AttackingToChasing_AfterCooldown()
        {
            var ai = new EnemyAI
            {
                State = EnemyAIState.Attacking,
                StateTimer = 0f,
                AttackCooldown = 1.5f
            };

            if (ai.StateTimer <= 0f)
            {
                ai.CurrentCooldown = ai.AttackCooldown;
                ai.State = EnemyAIState.Chasing;
                ai.StateTimer = 10f;
            }

            Assert.AreEqual(EnemyAIState.Chasing, ai.State);
            Assert.AreEqual(1.5f, ai.CurrentCooldown);
        }

        [Test]
        public void StateTransition_StunnedToIdle_WhenStunEnds()
        {
            var ai = new EnemyAI
            {
                State = EnemyAIState.Stunned,
                StateTimer = 0f
            };

            if (ai.StateTimer <= 0f)
            {
                ai.State = EnemyAIState.Idle;
                ai.StateTimer = 0.5f;
            }

            Assert.AreEqual(EnemyAIState.Idle, ai.State);
        }

        [Test]
        public void StateTransition_NoChange_WhenCooldownActive()
        {
            var ai = new EnemyAI
            {
                State = EnemyAIState.Chasing,
                AttackRange = 2f,
                CurrentCooldown = 0.5f // Still on cooldown
            };
            float playerDistance = 1f;

            bool canAttack = playerDistance <= ai.AttackRange && ai.CurrentCooldown <= 0f;

            Assert.IsFalse(canAttack);
            Assert.AreEqual(EnemyAIState.Chasing, ai.State);
        }

        #endregion

        #region EnemyAIHelpers Tests

        [Test]
        public void StunEnemy_SetsCorrectState()
        {
            var ai = new EnemyAI
            {
                State = EnemyAIState.Chasing,
                StateTimer = 5f
            };

            EnemyAIHelpers.StunEnemy(ref ai, 2.0f);

            Assert.AreEqual(EnemyAIState.Stunned, ai.State);
            Assert.AreEqual(2.0f, ai.StateTimer);
        }

        [Test]
        public void ForceRetreat_SetsCorrectState()
        {
            var ai = new EnemyAI
            {
                State = EnemyAIState.Attacking,
                StateTimer = 0.5f
            };

            EnemyAIHelpers.ForceRetreat(ref ai);

            Assert.AreEqual(EnemyAIState.Retreating, ai.State);
            Assert.AreEqual(5f, ai.StateTimer);
        }

        #endregion

        #region ThreatType Enum Tests

        [Test]
        public void ThreatType_HasCorrectEnumValues()
        {
            Assert.AreEqual((byte)0, (byte)ThreatType.Damage);
            Assert.AreEqual((byte)1, (byte)ThreatType.Healing);
            Assert.AreEqual((byte)2, (byte)ThreatType.Taunt);
            Assert.AreEqual((byte)3, (byte)ThreatType.Proximity);
        }

        #endregion

        #region Threat Calculation Tests

        [Test]
        public void ThreatCalculation_DamageType_ReturnsFullAmount()
        {
            float amount = 50f;
            ThreatType type = ThreatType.Damage;

            float threat = CalculateThreatAmount(amount, type);

            Assert.AreEqual(50f, threat);
        }

        [Test]
        public void ThreatCalculation_HealingType_ReturnsHalfAmount()
        {
            float amount = 50f;
            ThreatType type = ThreatType.Healing;

            float threat = CalculateThreatAmount(amount, type);

            Assert.AreEqual(25f, threat);
        }

        [Test]
        public void ThreatCalculation_TauntType_ReturnsDoubleAmount()
        {
            float amount = 50f;
            ThreatType type = ThreatType.Taunt;

            float threat = CalculateThreatAmount(amount, type);

            Assert.AreEqual(100f, threat);
        }

        [Test]
        public void ThreatCalculation_ProximityType_ReturnsTenPercent()
        {
            float amount = 50f;
            ThreatType type = ThreatType.Proximity;

            float threat = CalculateThreatAmount(amount, type);

            Assert.AreEqual(5f, threat);
        }

        private float CalculateThreatAmount(float amount, ThreatType type)
        {
            float multiplier = type switch
            {
                ThreatType.Damage => 1.0f,
                ThreatType.Healing => 0.5f,
                ThreatType.Taunt => 2.0f,
                ThreatType.Proximity => 0.1f,
                _ => 1.0f
            };
            return amount * multiplier;
        }

        #endregion

        #region ThreatTable Tests

        [Test]
        public void ThreatTable_DefaultValues()
        {
            var threatTable = new ThreatTable
            {
                CurrentTarget = Entity.Null,
                AggroRange = 10f,
                DeaggroRange = 15f,
                ThreatDecayRate = 5f,
                InCombat = false
            };

            Assert.AreEqual(Entity.Null, threatTable.CurrentTarget);
            Assert.IsFalse(threatTable.InCombat);
        }

        [Test]
        public void ThreatTable_InCombat_TracksCorrectly()
        {
            var threatTable = new ThreatTable
            {
                InCombat = true
            };

            Assert.IsTrue(threatTable.InCombat);
        }

        [Test]
        public void ThreatTable_DecayRate_IsPositive()
        {
            var threatTable = new ThreatTable
            {
                ThreatDecayRate = 5f
            };

            Assert.Greater(threatTable.ThreatDecayRate, 0f);
        }

        #endregion

        #region ThreatEntry Tests

        [Test]
        public void ThreatEntry_CanStoreData()
        {
            var entry = new ThreatEntry
            {
                TargetEntity = Entity.Null,
                ThreatValue = 75f,
                LastUpdateTime = 10.5f
            };

            Assert.AreEqual(75f, entry.ThreatValue);
            Assert.AreEqual(10.5f, entry.LastUpdateTime);
        }

        [Test]
        public void ThreatEntry_AddingThreat_Accumulates()
        {
            var entry = new ThreatEntry
            {
                ThreatValue = 50f
            };

            entry.ThreatValue += 25f;

            Assert.AreEqual(75f, entry.ThreatValue);
        }

        [Test]
        public void ThreatEntry_DecayingThreat_Decreases()
        {
            var entry = new ThreatEntry
            {
                ThreatValue = 100f,
                LastUpdateTime = 10f
            };

            float currentTime = 12f;
            float decayRate = 5f;
            float timeSinceUpdate = currentTime - entry.LastUpdateTime;
            entry.ThreatValue -= decayRate * timeSinceUpdate;
            entry.LastUpdateTime = currentTime;

            Assert.AreEqual(90f, entry.ThreatValue);
            Assert.AreEqual(12f, entry.LastUpdateTime);
        }

        [Test]
        public void ThreatEntry_ShouldBeRemoved_WhenZeroOrLess()
        {
            var entry = new ThreatEntry
            {
                ThreatValue = 5f
            };

            entry.ThreatValue -= 10f;

            Assert.LessOrEqual(entry.ThreatValue, 0f);
        }

        #endregion

        #region Perception Component Tests

        [Test]
        public void Perception_DefaultConfiguration()
        {
            var perception = new Perception
            {
                SightRange = 15f,
                SightAngle = 120f,
                HearingRange = 25f,
                CanSeeTarget = false,
                CanHearTarget = false
            };

            Assert.AreEqual(15f, perception.SightRange);
            Assert.AreEqual(120f, perception.SightAngle);
            Assert.AreEqual(25f, perception.HearingRange);
        }

        [Test]
        public void Perception_CanSee_UpdatesCorrectly()
        {
            var perception = new Perception
            {
                CanSeeTarget = false
            };

            perception.CanSeeTarget = true;
            perception.LastKnownTargetPosition = new float3(10, 0, 15);

            Assert.IsTrue(perception.CanSeeTarget);
            Assert.AreEqual(10f, perception.LastKnownTargetPosition.x);
        }

        [Test]
        public void Perception_CanHear_UpdatesCorrectly()
        {
            var perception = new Perception
            {
                CanHearTarget = false
            };

            perception.CanHearTarget = true;

            Assert.IsTrue(perception.CanHearTarget);
        }

        #endregion

        #region Perception Range Tests

        [Test]
        public void PerceptionCheck_InHearingRange_DetectsTarget()
        {
            float hearingRange = 25f;
            float3 aiPosition = float3.zero;
            float3 targetPosition = new float3(20, 0, 0);

            float distance = math.length(targetPosition - aiPosition);
            bool canHear = distance <= hearingRange;

            Assert.IsTrue(canHear);
        }

        [Test]
        public void PerceptionCheck_OutsideHearingRange_NoDetection()
        {
            float hearingRange = 25f;
            float3 aiPosition = float3.zero;
            float3 targetPosition = new float3(30, 0, 0);

            float distance = math.length(targetPosition - aiPosition);
            bool canHear = distance <= hearingRange;

            Assert.IsFalse(canHear);
        }

        [Test]
        public void PerceptionCheck_InSightRange_WithinAngle_Detects()
        {
            float sightRange = 15f;
            float sightAngle = 90f;
            float3 aiPosition = float3.zero;
            float3 aiForward = new float3(1, 0, 0); // Facing +X
            float3 targetPosition = new float3(10, 0, 2); // Slightly off-center

            float3 toTarget = targetPosition - aiPosition;
            float distance = math.length(toTarget);

            bool inRange = distance <= sightRange;

            float3 dirToTarget = math.normalize(toTarget);
            float dot = math.dot(aiForward, dirToTarget);
            float angle = math.degrees(math.acos(dot));
            bool inAngle = angle <= sightAngle * 0.5f;

            Assert.IsTrue(inRange && inAngle);
        }

        [Test]
        public void PerceptionCheck_InSightRange_OutsideAngle_NoDetection()
        {
            float sightRange = 15f;
            float sightAngle = 90f;
            float3 aiPosition = float3.zero;
            float3 aiForward = new float3(1, 0, 0); // Facing +X
            float3 targetPosition = new float3(-5, 0, 0); // Behind AI

            float3 toTarget = targetPosition - aiPosition;
            float distance = math.length(toTarget);

            bool inRange = distance <= sightRange;

            float3 dirToTarget = math.normalize(toTarget);
            float dot = math.dot(aiForward, dirToTarget);
            float angle = math.degrees(math.acos(dot));
            bool inAngle = angle <= sightAngle * 0.5f;

            Assert.IsTrue(inRange);
            Assert.IsFalse(inAngle);
        }

        [Test]
        public void PerceptionCheck_ExactlyAtSightAngleBoundary()
        {
            float sightAngle = 90f; // 45 degrees each side
            float3 aiForward = new float3(1, 0, 0);
            float3 targetDir = math.normalize(new float3(1, 0, 1)); // 45 degrees

            float dot = math.dot(aiForward, targetDir);
            float angle = math.degrees(math.acos(dot));

            Assert.AreEqual(45f, angle, 0.1f);
            Assert.IsTrue(angle <= sightAngle * 0.5f);
        }

        #endregion

        #region Distance Calculation Tests

        [Test]
        public void DistanceCalculation_SamePosition_ReturnsZero()
        {
            float3 a = new float3(5, 0, 5);
            float3 b = new float3(5, 0, 5);

            float distance = math.length(b - a);

            Assert.AreEqual(0f, distance);
        }

        [Test]
        public void DistanceCalculation_SimpleDistance_Correct()
        {
            float3 a = new float3(0, 0, 0);
            float3 b = new float3(3, 0, 4);

            float distance = math.length(b - a);

            Assert.AreEqual(5f, distance);
        }

        [Test]
        public void DistanceCalculation_3D_IncludesY()
        {
            float3 a = new float3(0, 0, 0);
            float3 b = new float3(0, 5, 0);

            float distance = math.length(b - a);

            Assert.AreEqual(5f, distance);
        }

        #endregion

        #region Patrol Point Generation Tests

        [Test]
        public void PatrolPoint_WithinRadius()
        {
            float3 origin = new float3(10, 0, 20);
            float radius = 5f;
            var random = new Unity.Mathematics.Random(12345);

            float3 patrolPoint = GetRandomPatrolPoint(origin, radius, ref random);
            float distance = math.length(patrolPoint - origin);

            Assert.LessOrEqual(distance, radius);
        }

        [Test]
        public void PatrolPoint_MaintainsYPosition()
        {
            float3 origin = new float3(10, 5, 20);
            float radius = 5f;
            var random = new Unity.Mathematics.Random(12345);

            float3 patrolPoint = GetRandomPatrolPoint(origin, radius, ref random);

            Assert.AreEqual(origin.y, patrolPoint.y);
        }

        private float3 GetRandomPatrolPoint(float3 origin, float radius, ref Unity.Mathematics.Random random)
        {
            float2 offset = random.NextFloat2Direction() * random.NextFloat(0f, radius);
            return origin + new float3(offset.x, 0f, offset.y);
        }

        #endregion

        #region Timer Behavior Tests

        [Test]
        public void Timer_Decrements_Correctly()
        {
            float stateTimer = 5f;
            float deltaTime = 0.016f; // ~60fps

            stateTimer -= deltaTime;

            Assert.AreEqual(4.984f, stateTimer, 0.001f);
        }

        [Test]
        public void Cooldown_Decrements_Correctly()
        {
            float cooldown = 1.5f;
            float deltaTime = 0.5f;

            cooldown -= deltaTime;

            Assert.AreEqual(1.0f, cooldown);
        }

        [Test]
        public void Timer_Expiration_DetectedCorrectly()
        {
            float stateTimer = 0.01f;
            float deltaTime = 0.016f;

            stateTimer -= deltaTime;

            Assert.LessOrEqual(stateTimer, 0f);
        }

        #endregion
    }
}
