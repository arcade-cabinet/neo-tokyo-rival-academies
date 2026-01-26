using NUnit.Framework;
using Unity.Collections;
using Unity.Entities;
using NeoTokyo.Components.Abilities;

namespace NeoTokyo.Tests.EditMode
{
    /// <summary>
    /// Unit tests for AbilitySystem components and logic.
    /// Tests run in EditMode without requiring the Unity Editor.
    /// Command: Unity -batchmode -runTests -testPlatform EditMode
    /// </summary>
    [TestFixture]
    public class AbilitySystemTests
    {
        [Test]
        public void AbilityCooldown_IsOnCooldown_ReturnsTrueWhenRemaining()
        {
            var cooldown = new AbilityCooldown
            {
                RemainingTime = 5f,
                TotalDuration = 10f
            };

            Assert.IsTrue(cooldown.IsOnCooldown);
        }

        [Test]
        public void AbilityCooldown_IsOnCooldown_ReturnsFalseWhenZero()
        {
            var cooldown = new AbilityCooldown
            {
                RemainingTime = 0f,
                TotalDuration = 10f
            };

            Assert.IsFalse(cooldown.IsOnCooldown);
        }

        [Test]
        public void AbilityCooldown_CooldownPercent_CalculatesCorrectly()
        {
            var cooldown = new AbilityCooldown
            {
                RemainingTime = 5f,
                TotalDuration = 10f
            };

            Assert.AreEqual(0.5f, cooldown.CooldownPercent);
        }

        [Test]
        public void ResourcePool_CanAfford_ReturnsTrueWhenSufficient()
        {
            var resources = new ResourcePool
            {
                Current = 50,
                Maximum = 100,
                RegenRate = 1f
            };

            Assert.IsTrue(resources.CanAfford(50));
            Assert.IsTrue(resources.CanAfford(25));
        }

        [Test]
        public void ResourcePool_CanAfford_ReturnsFalseWhenInsufficient()
        {
            var resources = new ResourcePool
            {
                Current = 30,
                Maximum = 100,
                RegenRate = 1f
            };

            Assert.IsFalse(resources.CanAfford(50));
        }

        [Test]
        public void ResourcePool_Spend_DeductsCorrectAmount()
        {
            var resources = new ResourcePool
            {
                Current = 50,
                Maximum = 100,
                RegenRate = 1f
            };

            resources.Spend(20);

            Assert.AreEqual(30, resources.Current);
        }

        [Test]
        public void ResourcePool_Spend_ClampsToZero()
        {
            var resources = new ResourcePool
            {
                Current = 30,
                Maximum = 100,
                RegenRate = 1f
            };

            resources.Spend(50);

            Assert.AreEqual(0, resources.Current);
        }

        [Test]
        public void AbilitySlots_GetAbility_ReturnsCorrectSlot()
        {
            // Create mock entity references (Entity.Null for testing)
            var slots = new AbilitySlots
            {
                Ability0 = Entity.Null,
                Ability1 = Entity.Null,
                Ability2 = Entity.Null,
                Ability3 = Entity.Null
            };

            // Verify slot access doesn't throw
            Assert.DoesNotThrow(() => slots.GetAbility(0));
            Assert.DoesNotThrow(() => slots.GetAbility(1));
            Assert.DoesNotThrow(() => slots.GetAbility(2));
            Assert.DoesNotThrow(() => slots.GetAbility(3));
        }

        [Test]
        public void AbilitySlots_GetAbility_ReturnsNullForInvalidSlot()
        {
            var slots = new AbilitySlots();

            Assert.AreEqual(Entity.Null, slots.GetAbility(-1));
            Assert.AreEqual(Entity.Null, slots.GetAbility(4));
            Assert.AreEqual(Entity.Null, slots.GetAbility(100));
        }

        [Test]
        public void AbilityEffectType_HasCorrectValues()
        {
            // Verify enum values match expected constants
            Assert.AreEqual(0, (byte)AbilityEffectType.Damage);
            Assert.AreEqual(1, (byte)AbilityEffectType.Heal);
            Assert.AreEqual(2, (byte)AbilityEffectType.Buff);
            Assert.AreEqual(3, (byte)AbilityEffectType.Debuff);
            Assert.AreEqual(4, (byte)AbilityEffectType.Utility);
        }

        [Test]
        public void AbilityData_CanStoreFixedStrings()
        {
            var ability = new AbilityData
            {
                Id = new FixedString64Bytes("fireball"),
                Name = new FixedString64Bytes("Fireball"),
                Cost = 25,
                CooldownDuration = 3.0f,
                EffectType = AbilityEffectType.Damage,
                EffectValue = 100
            };

            Assert.AreEqual("fireball", ability.Id.ToString());
            Assert.AreEqual("Fireball", ability.Name.ToString());
            Assert.AreEqual(25, ability.Cost);
            Assert.AreEqual(3.0f, ability.CooldownDuration);
            Assert.AreEqual(AbilityEffectType.Damage, ability.EffectType);
            Assert.AreEqual(100, ability.EffectValue);
        }
    }
}
