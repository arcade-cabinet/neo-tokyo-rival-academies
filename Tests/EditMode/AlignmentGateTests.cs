using NUnit.Framework;
using Unity.Collections;
using NeoTokyo.Components.Dialogue;
using NeoTokyo.Components.Faction;

namespace NeoTokyo.Tests.EditMode
{
    /// <summary>
    /// Unit tests for AlignmentGateSystem components and logic.
    /// Tests gate requirements, unlock conditions.
    /// Command: Unity -batchmode -runTests -testPlatform EditMode
    /// </summary>
    [TestFixture]
    public class AlignmentGateTests
    {
        #region AlignmentRequirement Tests

        [Test]
        public void AlignmentRequirement_AllTypesExist()
        {
            Assert.AreEqual((byte)0, (byte)AlignmentRequirement.None);
            Assert.AreEqual((byte)1, (byte)AlignmentRequirement.KurenaiStrong);
            Assert.AreEqual((byte)2, (byte)AlignmentRequirement.KurenaiExtreme);
            Assert.AreEqual((byte)3, (byte)AlignmentRequirement.AzureStrong);
            Assert.AreEqual((byte)4, (byte)AlignmentRequirement.AzureExtreme);
            Assert.AreEqual((byte)5, (byte)AlignmentRequirement.Neutral);
        }

        #endregion

        #region AlignmentGateHelpers Tests

        [Test]
        public void MeetsRequirement_None_AlwaysTrue()
        {
            var reputation = Reputation.Default;
            reputation.KurenaiAzureAxis = 0f;

            bool result = AlignmentGateHelpers.MeetsRequirement(reputation, AlignmentRequirement.None);

            Assert.IsTrue(result);
        }

        [Test]
        public void MeetsRequirement_KurenaiStrong()
        {
            var reputation = Reputation.Default;

            // Not enough for strong Kurenai
            reputation.KurenaiAzureAxis = -0.4f;
            Assert.IsFalse(AlignmentGateHelpers.MeetsRequirement(reputation, AlignmentRequirement.KurenaiStrong));

            // Exactly at threshold
            reputation.KurenaiAzureAxis = -0.5f;
            Assert.IsTrue(AlignmentGateHelpers.MeetsRequirement(reputation, AlignmentRequirement.KurenaiStrong));

            // Well past threshold
            reputation.KurenaiAzureAxis = -0.8f;
            Assert.IsTrue(AlignmentGateHelpers.MeetsRequirement(reputation, AlignmentRequirement.KurenaiStrong));
        }

        [Test]
        public void MeetsRequirement_KurenaiExtreme()
        {
            var reputation = Reputation.Default;

            // Not enough for extreme Kurenai
            reputation.KurenaiAzureAxis = -0.7f;
            Assert.IsFalse(AlignmentGateHelpers.MeetsRequirement(reputation, AlignmentRequirement.KurenaiExtreme));

            // Exactly at threshold
            reputation.KurenaiAzureAxis = -0.8f;
            Assert.IsTrue(AlignmentGateHelpers.MeetsRequirement(reputation, AlignmentRequirement.KurenaiExtreme));

            // Maximum Kurenai
            reputation.KurenaiAzureAxis = -1f;
            Assert.IsTrue(AlignmentGateHelpers.MeetsRequirement(reputation, AlignmentRequirement.KurenaiExtreme));
        }

        [Test]
        public void MeetsRequirement_AzureStrong()
        {
            var reputation = Reputation.Default;

            // Not enough for strong Azure
            reputation.KurenaiAzureAxis = 0.4f;
            Assert.IsFalse(AlignmentGateHelpers.MeetsRequirement(reputation, AlignmentRequirement.AzureStrong));

            // Exactly at threshold
            reputation.KurenaiAzureAxis = 0.5f;
            Assert.IsTrue(AlignmentGateHelpers.MeetsRequirement(reputation, AlignmentRequirement.AzureStrong));

            // Well past threshold
            reputation.KurenaiAzureAxis = 0.8f;
            Assert.IsTrue(AlignmentGateHelpers.MeetsRequirement(reputation, AlignmentRequirement.AzureStrong));
        }

        [Test]
        public void MeetsRequirement_AzureExtreme()
        {
            var reputation = Reputation.Default;

            // Not enough for extreme Azure
            reputation.KurenaiAzureAxis = 0.7f;
            Assert.IsFalse(AlignmentGateHelpers.MeetsRequirement(reputation, AlignmentRequirement.AzureExtreme));

            // Exactly at threshold
            reputation.KurenaiAzureAxis = 0.8f;
            Assert.IsTrue(AlignmentGateHelpers.MeetsRequirement(reputation, AlignmentRequirement.AzureExtreme));

            // Maximum Azure
            reputation.KurenaiAzureAxis = 1f;
            Assert.IsTrue(AlignmentGateHelpers.MeetsRequirement(reputation, AlignmentRequirement.AzureExtreme));
        }

        [Test]
        public void MeetsRequirement_Neutral()
        {
            var reputation = Reputation.Default;

            // Perfectly neutral
            reputation.KurenaiAzureAxis = 0f;
            Assert.IsTrue(AlignmentGateHelpers.MeetsRequirement(reputation, AlignmentRequirement.Neutral));

            // Slightly leaning
            reputation.KurenaiAzureAxis = 0.2f;
            Assert.IsTrue(AlignmentGateHelpers.MeetsRequirement(reputation, AlignmentRequirement.Neutral));

            reputation.KurenaiAzureAxis = -0.3f;
            Assert.IsTrue(AlignmentGateHelpers.MeetsRequirement(reputation, AlignmentRequirement.Neutral));

            // Too far Kurenai
            reputation.KurenaiAzureAxis = -0.5f;
            Assert.IsFalse(AlignmentGateHelpers.MeetsRequirement(reputation, AlignmentRequirement.Neutral));

            // Too far Azure
            reputation.KurenaiAzureAxis = 0.5f;
            Assert.IsFalse(AlignmentGateHelpers.MeetsRequirement(reputation, AlignmentRequirement.Neutral));
        }

        #endregion

        #region AlignmentGate Component Tests

        [Test]
        public void AlignmentGate_DefaultLocked()
        {
            var gate = new AlignmentGate
            {
                Requirement = AlignmentRequirement.KurenaiStrong,
                IsUnlocked = false,
                UnlockedAtTime = 0f
            };

            Assert.IsFalse(gate.IsUnlocked);
            Assert.AreEqual(0f, gate.UnlockedAtTime);
        }

        [Test]
        public void AlignmentGate_UnlockTracksTime()
        {
            var gate = new AlignmentGate
            {
                Requirement = AlignmentRequirement.KurenaiStrong,
                IsUnlocked = false
            };

            // Simulate unlock
            double currentTime = 123.456;
            gate.IsUnlocked = true;
            gate.UnlockedAtTime = currentTime;

            Assert.IsTrue(gate.IsUnlocked);
            Assert.AreEqual(123.456, gate.UnlockedAtTime, 0.001);
        }

        #endregion

        #region DialogueGate Tests

        [Test]
        public void DialogueGate_Properties()
        {
            var gate = new DialogueGate
            {
                DialogueId = 42,
                Requirement = AlignmentRequirement.AzureStrong,
                PermanentUnlock = true,
                LockedAlternativeId = 43
            };

            Assert.AreEqual(42, gate.DialogueId);
            Assert.AreEqual(AlignmentRequirement.AzureStrong, gate.Requirement);
            Assert.IsTrue(gate.PermanentUnlock);
            Assert.AreEqual(43, gate.LockedAlternativeId);
        }

        [Test]
        public void DialogueGate_PermanentUnlock()
        {
            var gate = new DialogueGate
            {
                DialogueId = 100,
                Requirement = AlignmentRequirement.KurenaiExtreme,
                PermanentUnlock = true
            };

            var alignmentGate = new AlignmentGate
            {
                Requirement = gate.Requirement,
                IsUnlocked = true
            };

            // Once unlocked, stays unlocked if PermanentUnlock
            var newReputation = Reputation.Default;
            newReputation.KurenaiAzureAxis = 0f; // Neutral now

            bool meetsRequirement = AlignmentGateHelpers.MeetsRequirement(
                newReputation,
                gate.Requirement
            );

            bool shouldStayUnlocked = meetsRequirement || (gate.PermanentUnlock && alignmentGate.IsUnlocked);

            Assert.IsTrue(shouldStayUnlocked);
        }

        [Test]
        public void DialogueGate_NonPermanentRelocks()
        {
            var gate = new DialogueGate
            {
                DialogueId = 100,
                Requirement = AlignmentRequirement.AzureExtreme,
                PermanentUnlock = false
            };

            var alignmentGate = new AlignmentGate
            {
                Requirement = gate.Requirement,
                IsUnlocked = true
            };

            // Simulate alignment shifting away
            var newReputation = Reputation.Default;
            newReputation.KurenaiAzureAxis = 0.5f; // Not extreme anymore

            bool meetsRequirement = AlignmentGateHelpers.MeetsRequirement(
                newReputation,
                gate.Requirement
            );

            bool shouldStayUnlocked = meetsRequirement || (gate.PermanentUnlock && alignmentGate.IsUnlocked);

            Assert.IsFalse(shouldStayUnlocked);
        }

        #endregion

        #region QuestGate Tests

        [Test]
        public void QuestGate_Properties()
        {
            var gate = new QuestGate
            {
                QuestId = 1001,
                Requirement = AlignmentRequirement.KurenaiExtreme,
                RequiredFaction = FactionType.Kurenai,
                MinFactionReputation = 75,
                IsMainStory = false,
                PermanentUnlock = true
            };

            Assert.AreEqual(1001, gate.QuestId);
            Assert.AreEqual(AlignmentRequirement.KurenaiExtreme, gate.Requirement);
            Assert.AreEqual(FactionType.Kurenai, gate.RequiredFaction);
            Assert.AreEqual(75, gate.MinFactionReputation);
            Assert.IsFalse(gate.IsMainStory);
            Assert.IsTrue(gate.PermanentUnlock);
        }

        [Test]
        public void QuestGate_KurenaiCoupQuestline()
        {
            // Test the special Kurenai coup questline from Golden Record
            var gate = new QuestGate
            {
                QuestId = 2001,
                Requirement = AlignmentRequirement.KurenaiExtreme,
                RequiredFaction = FactionType.Kurenai,
                MinFactionReputation = 75
            };

            var reputation = Reputation.Default;
            reputation.KurenaiAzureAxis = -0.9f;
            reputation.Kurenai = 80;

            bool meetsAlignment = AlignmentGateHelpers.MeetsRequirement(
                reputation,
                gate.Requirement
            );
            bool meetsFaction = reputation.Kurenai >= gate.MinFactionReputation;

            Assert.IsTrue(meetsAlignment);
            Assert.IsTrue(meetsFaction);
        }

        [Test]
        public void QuestGate_AzureTakeoverQuestline()
        {
            // Test the special Azure takeover questline from Golden Record
            var gate = new QuestGate
            {
                QuestId = 2002,
                Requirement = AlignmentRequirement.AzureExtreme,
                RequiredFaction = FactionType.Azure,
                MinFactionReputation = 75
            };

            var reputation = Reputation.Default;
            reputation.KurenaiAzureAxis = 0.85f;
            reputation.Azure = 90;

            bool meetsAlignment = AlignmentGateHelpers.MeetsRequirement(
                reputation,
                gate.Requirement
            );
            bool meetsFaction = reputation.Azure >= gate.MinFactionReputation;

            Assert.IsTrue(meetsAlignment);
            Assert.IsTrue(meetsFaction);
        }

        #endregion

        #region AreaGate Tests

        [Test]
        public void AreaGate_Properties()
        {
            var gate = new AreaGate
            {
                TerritoryId = new FixedString64Bytes("KurenaiInnerSanctum"),
                Requirement = AlignmentRequirement.KurenaiStrong,
                ControllingFaction = FactionType.Kurenai,
                RequiresFactionPermission = true,
                MinReputationForEntry = 60,
                HostileEntryTriggersCombat = true
            };

            Assert.AreEqual("KurenaiInnerSanctum", gate.TerritoryId.ToString());
            Assert.AreEqual(FactionType.Kurenai, gate.ControllingFaction);
            Assert.IsTrue(gate.RequiresFactionPermission);
            Assert.AreEqual(60, gate.MinReputationForEntry);
            Assert.IsTrue(gate.HostileEntryTriggersCombat);
        }

        [Test]
        public void AreaGate_HostileEntry()
        {
            var gate = new AreaGate
            {
                ControllingFaction = FactionType.Kurenai,
                RequiresFactionPermission = true,
                MinReputationForEntry = 50,
                HostileEntryTriggersCombat = true
            };

            var reputation = Reputation.Default;
            reputation.Kurenai = 30; // Below required

            bool hasPermission = reputation.Kurenai >= gate.MinReputationForEntry;

            Assert.IsFalse(hasPermission);
            Assert.IsTrue(gate.HostileEntryTriggersCombat);
        }

        #endregion

        #region StoryBranch Tests

        [Test]
        public void StoryBranch_Properties()
        {
            var branch = new StoryBranch
            {
                BranchId = 3001,
                BranchName = new FixedString64Bytes("Path of Fire"),
                UnlockRequirement = AlignmentRequirement.KurenaiExtreme,
                ActNumber = 2,
                IsMainStory = true,
                IsStarted = false,
                IsCompleted = false,
                Progress = 0
            };

            Assert.AreEqual(3001, branch.BranchId);
            Assert.AreEqual("Path of Fire", branch.BranchName.ToString());
            Assert.AreEqual(2, branch.ActNumber);
            Assert.IsTrue(branch.IsMainStory);
            Assert.IsFalse(branch.IsStarted);
        }

        [Test]
        public void StoryBranch_ProgressTracking()
        {
            var branch = new StoryBranch
            {
                BranchId = 3001,
                IsStarted = true,
                Progress = 0
            };

            // Simulate progress
            branch.Progress = 25;
            Assert.AreEqual(25, branch.Progress);

            branch.Progress = 100;
            branch.IsCompleted = true;

            Assert.AreEqual(100, branch.Progress);
            Assert.IsTrue(branch.IsCompleted);
        }

        [Test]
        public void StoryBranch_StaysUnlockedOnceStarted()
        {
            var branch = new StoryBranch
            {
                UnlockRequirement = AlignmentRequirement.KurenaiExtreme,
                IsStarted = true
            };

            var alignmentGate = new AlignmentGate
            {
                Requirement = branch.UnlockRequirement,
                IsUnlocked = true
            };

            // Even if player drifts neutral, started branch stays unlocked
            var reputation = Reputation.Default;
            reputation.KurenaiAzureAxis = 0f;

            bool meetsRequirement = AlignmentGateHelpers.MeetsRequirement(
                reputation,
                branch.UnlockRequirement
            );
            bool shouldBeUnlocked = meetsRequirement || branch.IsStarted;

            Assert.IsFalse(meetsRequirement);
            Assert.IsTrue(shouldBeUnlocked);
        }

        #endregion

        #region UnlockedBranchElement Tests

        [Test]
        public void UnlockedBranchElement_Tracking()
        {
            var element = new UnlockedBranchElement
            {
                BranchId = 3001,
                UnlockedAtTime = 1000.5,
                IsCompleted = false,
                Progress = 50
            };

            Assert.AreEqual(3001, element.BranchId);
            Assert.AreEqual(1000.5, element.UnlockedAtTime, 0.01);
            Assert.IsFalse(element.IsCompleted);
            Assert.AreEqual(50, element.Progress);
        }

        #endregion

        #region GateUnlockedEvent Tests

        [Test]
        public void GateUnlockedEvent_DialogueType()
        {
            var evt = new GateUnlockedEvent
            {
                Requirement = AlignmentRequirement.KurenaiStrong,
                ContentName = new FixedString64Bytes("Dialogue 42"),
                Type = GateType.Dialogue
            };

            Assert.AreEqual(GateType.Dialogue, evt.Type);
            Assert.AreEqual("Dialogue 42", evt.ContentName.ToString());
        }

        [Test]
        public void GateUnlockedEvent_QuestType()
        {
            var evt = new GateUnlockedEvent
            {
                Requirement = AlignmentRequirement.KurenaiExtreme,
                ContentName = new FixedString64Bytes("Kurenai Coup Questline"),
                Type = GateType.Quest
            };

            Assert.AreEqual(GateType.Quest, evt.Type);
            Assert.AreEqual("Kurenai Coup Questline", evt.ContentName.ToString());
        }

        [Test]
        public void GateUnlockedEvent_AllTypesExist()
        {
            Assert.AreEqual((byte)0, (byte)GateType.Dialogue);
            Assert.AreEqual((byte)1, (byte)GateType.Quest);
            Assert.AreEqual((byte)2, (byte)GateType.Area);
            Assert.AreEqual((byte)3, (byte)GateType.StoryBranch);
        }

        #endregion

        #region Golden Record Alignment Effects Tests

        [Test]
        public void AlignmentEffects_ExtremeKurenai_StatsBonus()
        {
            var reputation = Reputation.Default;
            reputation.KurenaiAzureAxis = -0.9f; // Extreme Kurenai

            // Per Golden Record: Extreme Kurenai = +2 Ignition
            int ignitionBonus = GetAlignmentStatBonus(reputation);

            Assert.AreEqual(2, ignitionBonus);
        }

        [Test]
        public void AlignmentEffects_StrongKurenai_StatsBonus()
        {
            var reputation = Reputation.Default;
            reputation.KurenaiAzureAxis = -0.6f; // Strong Kurenai

            // Per Golden Record: Strong Kurenai = +1 Ignition
            int ignitionBonus = GetAlignmentStatBonus(reputation);

            Assert.AreEqual(1, ignitionBonus);
        }

        [Test]
        public void AlignmentEffects_ExtremeAzure_StatsBonus()
        {
            var reputation = Reputation.Default;
            reputation.KurenaiAzureAxis = 0.9f; // Extreme Azure

            // Per Golden Record: Extreme Azure = +2 Logic
            int logicBonus = GetAlignmentStatBonus(reputation);

            Assert.AreEqual(-2, logicBonus); // Negative indicates Azure (Logic) bonus
        }

        [Test]
        public void AlignmentEffects_Neutral_NoBonus()
        {
            var reputation = Reputation.Default;
            reputation.KurenaiAzureAxis = 0.1f; // Neutral

            int statBonus = GetAlignmentStatBonus(reputation);

            Assert.AreEqual(0, statBonus);
        }

        #endregion

        #region Helper Methods

        /// <summary>
        /// Calculate stat bonus based on alignment per Golden Record.
        /// Positive = Ignition (Kurenai), Negative = Logic (Azure)
        /// </summary>
        private static int GetAlignmentStatBonus(Reputation reputation)
        {
            float axis = reputation.KurenaiAzureAxis;

            if (axis <= -0.8f) return 2;  // Extreme Kurenai: +2 Ignition
            if (axis <= -0.5f) return 1;  // Strong Kurenai: +1 Ignition
            if (axis >= 0.8f) return -2;  // Extreme Azure: +2 Logic (negative convention)
            if (axis >= 0.5f) return -1;  // Strong Azure: +1 Logic (negative convention)
            return 0; // Neutral
        }

        #endregion
    }
}
