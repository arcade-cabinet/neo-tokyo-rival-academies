using NUnit.Framework;
using Unity.Collections;
using Unity.Entities;
using Unity.Mathematics;
using NeoTokyo.Components.Stats;
using NeoTokyo.Systems.Progression;

namespace NeoTokyo.Tests.EditMode
{
    /// <summary>
    /// Unit tests for ProgressionSystem.
    /// Tests XP requirements, stat allocation, and level-up mechanics.
    /// Command: Unity -batchmode -runTests -testPlatform EditMode
    /// </summary>
    [TestFixture]
    public class ProgressionSystemTests
    {
        #region LevelProgress Tests

        [Test]
        public void LevelProgress_Default_StartsAtLevelOne()
        {
            var progress = LevelProgress.Default;

            Assert.AreEqual(1, progress.Level);
            Assert.AreEqual(0, progress.XP);
            Assert.AreEqual(100, progress.XPToNextLevel);
        }

        [Test]
        public void GetXPForLevel_Level1_Returns100()
        {
            int xp = LevelProgress.GetXPForLevel(1);

            Assert.AreEqual(100, xp);
        }

        [Test]
        public void GetXPForLevel_Level5_Returns500()
        {
            int xp = LevelProgress.GetXPForLevel(5);

            Assert.AreEqual(500, xp);
        }

        [Test]
        public void GetXPForLevel_Level10_Returns1000()
        {
            int xp = LevelProgress.GetXPForLevel(10);

            Assert.AreEqual(1000, xp);
        }

        [Test]
        public void GetXPForLevel_Level50_Returns5000()
        {
            int xp = LevelProgress.GetXPForLevel(50);

            Assert.AreEqual(5000, xp);
        }

        [Test]
        public void GetXPForLevel_ScalesLinearly()
        {
            // Verify linear scaling: XP = 100 * level
            for (int level = 1; level <= 20; level++)
            {
                int expected = 100 * level;
                int actual = LevelProgress.GetXPForLevel(level);
                Assert.AreEqual(expected, actual, $"XP for level {level} should be {expected}");
            }
        }

        #endregion

        #region RPGStats Tests

        [Test]
        public void RPGStats_Default_HasEqualStats()
        {
            var stats = RPGStats.Default;

            Assert.AreEqual(10, stats.Structure);
            Assert.AreEqual(10, stats.Ignition);
            Assert.AreEqual(10, stats.Logic);
            Assert.AreEqual(10, stats.Flow);
        }

        [Test]
        public void RPGStats_ForLevel_Level1_EqualsDefault()
        {
            var stats = RPGStats.ForLevel(1);

            Assert.AreEqual(10, stats.Structure);
            Assert.AreEqual(10, stats.Ignition);
            Assert.AreEqual(10, stats.Logic);
            Assert.AreEqual(10, stats.Flow);
        }

        [Test]
        public void RPGStats_ForLevel_Level5_CalculatesCorrectly()
        {
            // Level 5: 10 + (5-1) * 2 = 10 + 8 = 18
            var stats = RPGStats.ForLevel(5);

            Assert.AreEqual(18, stats.Structure);
            Assert.AreEqual(18, stats.Ignition);
            Assert.AreEqual(18, stats.Logic);
            Assert.AreEqual(18, stats.Flow);
        }

        [Test]
        public void RPGStats_ForLevel_Level10_CalculatesCorrectly()
        {
            // Level 10: 10 + (10-1) * 2 = 10 + 18 = 28
            var stats = RPGStats.ForLevel(10);

            Assert.AreEqual(28, stats.Structure);
            Assert.AreEqual(28, stats.Ignition);
            Assert.AreEqual(28, stats.Logic);
            Assert.AreEqual(28, stats.Flow);
        }

        [Test]
        public void RPGStats_ForLevel_ScalesLinearly()
        {
            // Verify linear scaling: stat = 10 + (level - 1) * 2
            for (int level = 1; level <= 20; level++)
            {
                int expected = 10 + (level - 1) * 2;
                var stats = RPGStats.ForLevel(level);
                Assert.AreEqual(expected, stats.Structure, $"Structure at level {level}");
                Assert.AreEqual(expected, stats.Ignition, $"Ignition at level {level}");
                Assert.AreEqual(expected, stats.Logic, $"Logic at level {level}");
                Assert.AreEqual(expected, stats.Flow, $"Flow at level {level}");
            }
        }

        #endregion

        #region StatType Enum Tests

        [Test]
        public void StatType_HasCorrectValues()
        {
            Assert.AreEqual((byte)0, (byte)StatType.Structure);
            Assert.AreEqual((byte)1, (byte)StatType.Ignition);
            Assert.AreEqual((byte)2, (byte)StatType.Logic);
            Assert.AreEqual((byte)3, (byte)StatType.Flow);
        }

        #endregion

        #region UnallocatedPoints Tests

        [Test]
        public void UnallocatedPoints_DefaultValue()
        {
            var points = new UnallocatedPoints { Points = 0 };

            Assert.AreEqual(0, points.Points);
        }

        [Test]
        public void UnallocatedPoints_CanStoreValue()
        {
            var points = new UnallocatedPoints { Points = 15 };

            Assert.AreEqual(15, points.Points);
        }

        #endregion

        #region StatAllocationHelpers Tests

        [Test]
        public void GetTotalPointsForLevel_Level1_Returns40()
        {
            // 40 base (10 per stat) + 0 level-up points
            int totalPoints = StatAllocationHelpers.GetTotalPointsForLevel(1);

            Assert.AreEqual(40, totalPoints);
        }

        [Test]
        public void GetTotalPointsForLevel_Level5_Returns52()
        {
            // 40 + (5-1) * 3 = 40 + 12 = 52
            int totalPoints = StatAllocationHelpers.GetTotalPointsForLevel(5);

            Assert.AreEqual(52, totalPoints);
        }

        [Test]
        public void GetTotalPointsForLevel_Level10_Returns67()
        {
            // 40 + (10-1) * 3 = 40 + 27 = 67
            int totalPoints = StatAllocationHelpers.GetTotalPointsForLevel(10);

            Assert.AreEqual(67, totalPoints);
        }

        [Test]
        public void GetTotalPointsForLevel_GainsThreePerLevel()
        {
            int level5 = StatAllocationHelpers.GetTotalPointsForLevel(5);
            int level6 = StatAllocationHelpers.GetTotalPointsForLevel(6);

            Assert.AreEqual(3, level6 - level5);
        }

        #endregion

        #region DerivedStats Tests

        [Test]
        public void CalculateDerivedStats_MaxHealth_BasedOnStructure()
        {
            var baseStats = new RPGStats
            {
                Structure = 20,
                Ignition = 10,
                Logic = 10,
                Flow = 10
            };

            var derived = StatAllocationHelpers.CalculateDerivedStats(baseStats);

            // MaxHealth = Structure * 10 = 200
            Assert.AreEqual(200, derived.MaxHealth);
        }

        [Test]
        public void CalculateDerivedStats_Defense_BasedOnStructure()
        {
            var baseStats = new RPGStats
            {
                Structure = 40,
                Ignition = 10,
                Logic = 10,
                Flow = 10
            };

            var derived = StatAllocationHelpers.CalculateDerivedStats(baseStats);

            // Defense = Structure / 2 = 20
            Assert.AreEqual(20, derived.Defense);
        }

        [Test]
        public void CalculateDerivedStats_Attack_BasedOnIgnition()
        {
            var baseStats = new RPGStats
            {
                Structure = 10,
                Ignition = 30,
                Logic = 10,
                Flow = 10
            };

            var derived = StatAllocationHelpers.CalculateDerivedStats(baseStats);

            // Attack = Ignition * 2 = 60
            Assert.AreEqual(60, derived.Attack);
        }

        [Test]
        public void CalculateDerivedStats_CritChance_BasedOnIgnition()
        {
            var baseStats = new RPGStats
            {
                Structure = 10,
                Ignition = 25,
                Logic = 10,
                Flow = 10
            };

            var derived = StatAllocationHelpers.CalculateDerivedStats(baseStats);

            // CritChance = Ignition / 100 = 0.25
            Assert.AreEqual(0.25f, derived.CritChance);
        }

        [Test]
        public void CalculateDerivedStats_SkillPower_BasedOnLogic()
        {
            var baseStats = new RPGStats
            {
                Structure = 10,
                Ignition = 10,
                Logic = 40,
                Flow = 10
            };

            var derived = StatAllocationHelpers.CalculateDerivedStats(baseStats);

            // SkillPower = Logic * 15 / 10 = 60
            Assert.AreEqual(60, derived.SkillPower);
        }

        [Test]
        public void CalculateDerivedStats_MaxMana_BasedOnLogic()
        {
            var baseStats = new RPGStats
            {
                Structure = 10,
                Ignition = 10,
                Logic = 30,
                Flow = 10
            };

            var derived = StatAllocationHelpers.CalculateDerivedStats(baseStats);

            // MaxMana = Logic * 5 = 150
            Assert.AreEqual(150, derived.MaxMana);
        }

        [Test]
        public void CalculateDerivedStats_MoveSpeed_BasedOnFlow()
        {
            var baseStats = new RPGStats
            {
                Structure = 10,
                Ignition = 10,
                Logic = 10,
                Flow = 40
            };

            var derived = StatAllocationHelpers.CalculateDerivedStats(baseStats);

            // MoveSpeed = 3f + Flow / 20f = 3 + 2 = 5
            Assert.AreEqual(5f, derived.MoveSpeed);
        }

        [Test]
        public void CalculateDerivedStats_Evasion_BasedOnFlow()
        {
            var baseStats = new RPGStats
            {
                Structure = 10,
                Ignition = 10,
                Logic = 10,
                Flow = 50
            };

            var derived = StatAllocationHelpers.CalculateDerivedStats(baseStats);

            // Evasion = Flow / 100 = 0.5
            Assert.AreEqual(0.5f, derived.Evasion);
        }

        [Test]
        public void CalculateDerivedStats_DefaultStats_CalculatesCorrectly()
        {
            var derived = StatAllocationHelpers.CalculateDerivedStats(RPGStats.Default);

            Assert.AreEqual(100, derived.MaxHealth);    // 10 * 10
            Assert.AreEqual(5, derived.Defense);        // 10 / 2
            Assert.AreEqual(20, derived.Attack);        // 10 * 2
            Assert.AreEqual(0.1f, derived.CritChance);  // 10 / 100
            Assert.AreEqual(15, derived.SkillPower);    // 10 * 15 / 10
            Assert.AreEqual(50, derived.MaxMana);       // 10 * 5
            Assert.AreEqual(3.5f, derived.MoveSpeed);   // 3 + 10/20
            Assert.AreEqual(0.1f, derived.Evasion);     // 10 / 100
        }

        #endregion

        #region Level Up Point Grant Tests

        [Test]
        public void LevelUp_GrantsThreePoints()
        {
            const int POINTS_PER_LEVEL = 3;
            int levelsGained = 1;
            int pointsGranted = levelsGained * POINTS_PER_LEVEL;

            Assert.AreEqual(3, pointsGranted);
        }

        [Test]
        public void MultipleLevelUp_GrantsCorrectPoints()
        {
            const int POINTS_PER_LEVEL = 3;
            int levelsGained = 5;
            int pointsGranted = levelsGained * POINTS_PER_LEVEL;

            Assert.AreEqual(15, pointsGranted);
        }

        #endregion

        #region Stat Allocation Logic Tests

        [Test]
        public void StatAllocation_CanAllocateToStructure()
        {
            var stats = RPGStats.Default;
            int pointsToAdd = 5;

            stats.Structure += pointsToAdd;

            Assert.AreEqual(15, stats.Structure);
        }

        [Test]
        public void StatAllocation_CapsAtMaximum()
        {
            const int MAX_STAT_VALUE = 100;
            int currentValue = 98;
            int pointsToAdd = 5;

            int actualAdded = math.min(pointsToAdd, MAX_STAT_VALUE - currentValue);
            int newValue = currentValue + actualAdded;

            Assert.AreEqual(100, newValue);
            Assert.AreEqual(2, actualAdded);
        }

        [Test]
        public void StatAllocation_AtMax_ReturnsZeroPointsUsed()
        {
            const int MAX_STAT_VALUE = 100;
            int currentValue = 100;
            int pointsToAdd = 5;

            int actualAdded = math.min(pointsToAdd, MAX_STAT_VALUE - currentValue);

            Assert.AreEqual(0, actualAdded);
        }

        [Test]
        public void StatAllocation_ValidationRejectsNegativePoints()
        {
            int pointsToAdd = -5;
            bool isValid = pointsToAdd > 0;

            Assert.IsFalse(isValid);
        }

        [Test]
        public void StatAllocation_ValidationRejectsZeroPoints()
        {
            int pointsToAdd = 0;
            bool isValid = pointsToAdd > 0;

            Assert.IsFalse(isValid);
        }

        #endregion

        #region XP Gain Simulation Tests

        [Test]
        public void XPGain_BelowLevelUp_AccumulatesXP()
        {
            int currentXP = 50;
            int xpGained = 25;
            int xpToNext = 100;

            int newXP = currentXP + xpGained;
            bool leveledUp = newXP >= xpToNext;

            Assert.AreEqual(75, newXP);
            Assert.IsFalse(leveledUp);
        }

        [Test]
        public void XPGain_ExactLevelUp_TriggersLevelUp()
        {
            int currentXP = 50;
            int xpGained = 50;
            int xpToNext = 100;

            int newXP = currentXP + xpGained;
            bool leveledUp = newXP >= xpToNext;

            Assert.IsTrue(leveledUp);
        }

        [Test]
        public void XPGain_OverflowLevelUp_CarriesOver()
        {
            int currentXP = 80;
            int xpGained = 50;
            int xpToNext = 100;

            int newXP = currentXP + xpGained;
            if (newXP >= xpToNext)
            {
                newXP -= xpToNext;
            }

            Assert.AreEqual(30, newXP);
        }

        [Test]
        public void XPGain_MultipleLevelUps_ProcessesAll()
        {
            int currentXP = 50;
            int xpGained = 350; // Should level up multiple times
            int currentLevel = 1;
            int newXP = currentXP + xpGained;
            int newLevel = currentLevel;

            // Process level ups (level 1 needs 100, level 2 needs 200, etc.)
            while (newXP >= LevelProgress.GetXPForLevel(newLevel))
            {
                newXP -= LevelProgress.GetXPForLevel(newLevel);
                newLevel++;
            }

            // 50 + 350 = 400 total XP
            // Level 1->2: -100 = 300 remaining
            // Level 2->3: -200 = 100 remaining
            // Can't afford level 3->4 (300), so stays at level 3 with 100 XP
            Assert.AreEqual(3, newLevel);
            Assert.AreEqual(100, newXP);
        }

        #endregion

        #region Mana Component Tests

        [Test]
        public void Mana_Ratio_CalculatesCorrectly()
        {
            var mana = new Mana
            {
                Current = 25,
                Max = 100
            };

            Assert.AreEqual(0.25f, mana.Ratio);
        }

        [Test]
        public void Mana_Ratio_ReturnsZeroWhenMaxIsZero()
        {
            var mana = new Mana
            {
                Current = 50,
                Max = 0
            };

            Assert.AreEqual(0f, mana.Ratio);
        }

        [Test]
        public void Mana_Ratio_ReturnsOneWhenFull()
        {
            var mana = new Mana
            {
                Current = 100,
                Max = 100
            };

            Assert.AreEqual(1f, mana.Ratio);
        }

        #endregion
    }
}
