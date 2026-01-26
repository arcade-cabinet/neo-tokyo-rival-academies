using NUnit.Framework;
using Unity.Collections;
using Unity.Entities;
using NeoTokyo.Components.Faction;
using NeoTokyo.Systems.Progression;

namespace NeoTokyo.Tests.EditMode
{
    /// <summary>
    /// Unit tests for ReputationSystem.
    /// Equivalent to TypeScript tests in ReputationSystem.test.ts
    ///
    /// These tests run in EditMode without requiring the Unity Editor.
    /// Command: Unity -batchmode -runTests -testPlatform EditMode
    /// </summary>
    [TestFixture]
    public class ReputationSystemTests
    {
        [Test]
        public void DefaultReputation_StartsAtNeutral()
        {
            var reputation = Reputation.Default;

            Assert.AreEqual(50, reputation.Kurenai);
            Assert.AreEqual(50, reputation.Azure);
        }

        [Test]
        public void GetKurenaiLevel_ReturnsCorrectLevel()
        {
            Assert.AreEqual(ReputationLevel.Hated, GetLevelForValue(0));
            Assert.AreEqual(ReputationLevel.Hated, GetLevelForValue(10));
            Assert.AreEqual(ReputationLevel.Hostile, GetLevelForValue(11));
            Assert.AreEqual(ReputationLevel.Hostile, GetLevelForValue(25));
            Assert.AreEqual(ReputationLevel.Unfriendly, GetLevelForValue(26));
            Assert.AreEqual(ReputationLevel.Unfriendly, GetLevelForValue(40));
            Assert.AreEqual(ReputationLevel.Neutral, GetLevelForValue(41));
            Assert.AreEqual(ReputationLevel.Neutral, GetLevelForValue(60));
            Assert.AreEqual(ReputationLevel.Friendly, GetLevelForValue(61));
            Assert.AreEqual(ReputationLevel.Friendly, GetLevelForValue(75));
            Assert.AreEqual(ReputationLevel.Honored, GetLevelForValue(76));
            Assert.AreEqual(ReputationLevel.Honored, GetLevelForValue(90));
            Assert.AreEqual(ReputationLevel.Revered, GetLevelForValue(91));
            Assert.AreEqual(ReputationLevel.Revered, GetLevelForValue(100));
        }

        private static ReputationLevel GetLevelForValue(int value)
        {
            var reputation = new Reputation { Kurenai = value, Azure = 50 };
            return reputation.GetKurenaiLevel();
        }

        [Test]
        public void GetAggressionMultiplier_ReturnsCorrectValues()
        {
            // Hated/Hostile: 2.0x
            var hatedRep = new Reputation { Kurenai = 10, Azure = 50 };
            Assert.AreEqual(2.0f, hatedRep.GetAggressionMultiplier(FactionType.Kurenai));

            // Unfriendly: 1.5x
            var unfriendlyRep = new Reputation { Kurenai = 35, Azure = 50 };
            Assert.AreEqual(1.5f, unfriendlyRep.GetAggressionMultiplier(FactionType.Kurenai));

            // Neutral: 1.0x
            var neutralRep = new Reputation { Kurenai = 50, Azure = 50 };
            Assert.AreEqual(1.0f, neutralRep.GetAggressionMultiplier(FactionType.Kurenai));

            // Friendly: 0.75x
            var friendlyRep = new Reputation { Kurenai = 70, Azure = 50 };
            Assert.AreEqual(0.75f, friendlyRep.GetAggressionMultiplier(FactionType.Kurenai));

            // Honored/Revered: 0.5x
            var honoredRep = new Reputation { Kurenai = 95, Azure = 50 };
            Assert.AreEqual(0.5f, honoredRep.GetAggressionMultiplier(FactionType.Kurenai));
        }

        [Test]
        public void IsQuestUnlocked_ChecksRequirements()
        {
            var reputation = new Reputation { Kurenai = 60, Azure = 40 };

            // No requirements - always unlocked
            Assert.IsTrue(ReputationHelpers.IsQuestUnlocked(reputation));

            // Meets Kurenai requirement
            Assert.IsTrue(ReputationHelpers.IsQuestUnlocked(reputation, kurenaiRequired: 50));

            // Fails Kurenai requirement
            Assert.IsFalse(ReputationHelpers.IsQuestUnlocked(reputation, kurenaiRequired: 70));

            // Meets Azure requirement
            Assert.IsTrue(ReputationHelpers.IsQuestUnlocked(reputation, azureRequired: 30));

            // Fails Azure requirement
            Assert.IsFalse(ReputationHelpers.IsQuestUnlocked(reputation, azureRequired: 50));

            // Both requirements - passes both
            Assert.IsTrue(ReputationHelpers.IsQuestUnlocked(
                reputation,
                kurenaiRequired: 50,
                azureRequired: 30
            ));

            // Both requirements - fails one
            Assert.IsFalse(ReputationHelpers.IsQuestUnlocked(
                reputation,
                kurenaiRequired: 50,
                azureRequired: 50
            ));
        }

        [Test]
        public void GetDialogueOptions_ReturnsCorrectOptionsForLevel()
        {
            using var options = new NativeList<FixedString32Bytes>(Allocator.Temp);

            // Hated - should have Threaten option
            var hatedRep = new Reputation { Kurenai = 5, Azure = 50 };
            ReputationHelpers.GetDialogueOptions(hatedRep, FactionType.Kurenai, ref options);

            Assert.AreEqual(3, options.Length);
            Assert.AreEqual("Talk", options[0].ToString());
            Assert.AreEqual("Leave", options[1].ToString());
            Assert.AreEqual("Threaten", options[2].ToString());

            // Friendly - should have Ask for Help and Trade
            var friendlyRep = new Reputation { Kurenai = 70, Azure = 50 };
            ReputationHelpers.GetDialogueOptions(friendlyRep, FactionType.Kurenai, ref options);

            Assert.AreEqual(4, options.Length);
            Assert.AreEqual("Talk", options[0].ToString());
            Assert.AreEqual("Leave", options[1].ToString());
            Assert.AreEqual("Ask for Help", options[2].ToString());
            Assert.AreEqual("Trade", options[3].ToString());

            // Neutral - just base options
            var neutralRep = new Reputation { Kurenai = 50, Azure = 50 };
            ReputationHelpers.GetDialogueOptions(neutralRep, FactionType.Kurenai, ref options);

            Assert.AreEqual(2, options.Length);
        }

        [Test]
        public void ReputationChanges_HaveCorrectValues()
        {
            // Verify constants match TypeScript values
            Assert.AreEqual(-5, ReputationChanges.DEFEAT_ENEMY);
            Assert.AreEqual(-15, ReputationChanges.DEFEAT_BOSS);
            Assert.AreEqual(10, ReputationChanges.COMPLETE_QUEST);
            Assert.AreEqual(5, ReputationChanges.HELP_CIVILIAN);
            Assert.AreEqual(-25, ReputationChanges.BETRAY_FACTION);
            Assert.AreEqual(3, ReputationChanges.SPARE_ENEMY);
            Assert.AreEqual(-10, ReputationChanges.DESTROY_PROPERTY);
        }
    }
}
