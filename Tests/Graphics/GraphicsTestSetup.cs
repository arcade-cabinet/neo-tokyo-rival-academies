using System.Collections;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.TestTools;

#if GRAPHICS_TESTS_ENABLED
using UnityEngine.TestTools.Graphics;
#endif

namespace NeoTokyo.Tests.Graphics
{
    /// <summary>
    /// Graphics tests for visual regression testing.
    /// Uses Unity's Graphics Test Framework for headless visual comparison.
    ///
    /// Reference images stored in: Tests/Graphics/ReferenceImages/
    /// Test scenes stored in: Assets/Scenes/Tests/
    ///
    /// CLI Command:
    /// Unity -batchmode -runTests -testPlatform PlayMode -testFilter "NeoTokyo.Tests.Graphics"
    /// </summary>
    [TestFixture]
    public class GraphicsTestSetup
    {
#if GRAPHICS_TESTS_ENABLED
        /// <summary>
        /// Verify cel-shaded rendering matches reference.
        /// Tests the custom shader and post-processing stack.
        /// </summary>
        [UnityTest]
        [UseGraphicsTestCases]
        public IEnumerator CelShading_MatchesReference(GraphicsTestCase testCase)
        {
            SceneManager.LoadScene(testCase.ScenePath);
            yield return null;

            // Wait for scene to fully load and render
            for (int i = 0; i < 5; i++)
            {
                yield return new WaitForEndOfFrame();
            }

            ImageAssert.AreEqual(
                testCase.ReferenceImage,
                Camera.main,
                testCase.Settings
            );
        }

        /// <summary>
        /// Verify character model rendering.
        /// </summary>
        [UnityTest]
        [UseGraphicsTestCases]
        public IEnumerator CharacterRendering_MatchesReference(GraphicsTestCase testCase)
        {
            SceneManager.LoadScene(testCase.ScenePath);
            yield return null;

            for (int i = 0; i < 5; i++)
            {
                yield return new WaitForEndOfFrame();
            }

            ImageAssert.AreEqual(
                testCase.ReferenceImage,
                Camera.main,
                testCase.Settings
            );
        }

        /// <summary>
        /// Verify hex grid tile rendering.
        /// </summary>
        [UnityTest]
        [UseGraphicsTestCases]
        public IEnumerator HexGridRendering_MatchesReference(GraphicsTestCase testCase)
        {
            SceneManager.LoadScene(testCase.ScenePath);
            yield return null;

            for (int i = 0; i < 5; i++)
            {
                yield return new WaitForEndOfFrame();
            }

            ImageAssert.AreEqual(
                testCase.ReferenceImage,
                Camera.main,
                testCase.Settings
            );
        }
#endif

        /// <summary>
        /// Placeholder test when graphics framework not available.
        /// Ensures test suite runs even without graphics package.
        /// </summary>
        [Test]
        public void GraphicsTestFramework_ConfiguredCorrectly()
        {
#if GRAPHICS_TESTS_ENABLED
            Assert.Pass("Graphics Test Framework is enabled and configured.");
#else
            Assert.Ignore("Graphics Test Framework not installed. Install com.unity.testframework.graphics to enable visual tests.");
#endif
        }
    }
}
