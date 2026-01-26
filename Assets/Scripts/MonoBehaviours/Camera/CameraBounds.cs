using UnityEngine;

namespace NeoTokyo.MonoBehaviours.Camera
{
    /// <summary>
    /// Defines camera movement limits for a territory/zone.
    /// Supports smooth transitions when transitioning between zones.
    ///
    /// Usage: Attach to an empty GameObject defining the camera area.
    /// The bounds are defined by the transform position and size.
    /// </summary>
    public sealed class CameraBounds : MonoBehaviour
    {
        #region Serialized Fields

        [Header("Bounds Definition")]
        [SerializeField] private Vector3 _center;
        [SerializeField] private Vector3 _size = new Vector3(50f, 20f, 50f);

        [Header("Territory Info")]
        [SerializeField] private string _territoryName = "Unknown Zone";
        [SerializeField] private int _territoryId;

        [Header("Transition Settings")]
        [SerializeField] private float _transitionDuration = 0.5f;
        [SerializeField] private AnimationCurve _transitionCurve = AnimationCurve.EaseInOut(0f, 0f, 1f, 1f);

        [Header("Height Constraints")]
        [SerializeField] private float _minHeight = 5f;
        [SerializeField] private float _maxHeight = 30f;

        #endregion

        #region Private Fields

        private Bounds _bounds;
        private bool _boundsCalculated;

        #endregion

        #region Properties

        /// <summary>Territory identifier for this bounds region.</summary>
        public int TerritoryId => _territoryId;

        /// <summary>Human-readable territory name.</summary>
        public string TerritoryName => _territoryName;

        /// <summary>Duration for camera transitions into this zone.</summary>
        public float TransitionDuration => _transitionDuration;

        /// <summary>World-space bounds for this camera zone.</summary>
        public Bounds WorldBounds
        {
            get
            {
                if (!_boundsCalculated)
                {
                    RecalculateBounds();
                }
                return _bounds;
            }
        }

        #endregion

        #region Unity Lifecycle

        private void Awake()
        {
            RecalculateBounds();
        }

        private void OnValidate()
        {
            RecalculateBounds();
        }

        #endregion

        #region Bounds Calculation

        private void RecalculateBounds()
        {
            Vector3 worldCenter = transform.TransformPoint(_center);
            _bounds = new Bounds(worldCenter, _size);
            _boundsCalculated = true;
        }

        /// <summary>
        /// Clamp a camera position to stay within bounds.
        /// </summary>
        public Vector3 ClampPosition(Vector3 position)
        {
            Bounds b = WorldBounds;

            float clampedX = Mathf.Clamp(position.x, b.min.x, b.max.x);
            float clampedY = Mathf.Clamp(position.y, _minHeight, _maxHeight);
            float clampedZ = Mathf.Clamp(position.z, b.min.z, b.max.z);

            return new Vector3(clampedX, clampedY, clampedZ);
        }

        /// <summary>
        /// Check if a point is within the bounds.
        /// </summary>
        public bool Contains(Vector3 point)
        {
            Bounds b = WorldBounds;
            return point.x >= b.min.x && point.x <= b.max.x &&
                   point.z >= b.min.z && point.z <= b.max.z;
        }

        /// <summary>
        /// Get the interpolated transition factor for smooth zone changes.
        /// </summary>
        public float GetTransitionFactor(float normalizedTime)
        {
            return _transitionCurve.Evaluate(normalizedTime);
        }

        #endregion

        #region Static Utilities

        /// <summary>
        /// Lerp between two bounds for zone transitions.
        /// </summary>
        public static Vector3 LerpClampedPosition(
            Vector3 position,
            CameraBounds from,
            CameraBounds to,
            float t)
        {
            if (from == null) return to != null ? to.ClampPosition(position) : position;
            if (to == null) return from.ClampPosition(position);

            Vector3 clampedFrom = from.ClampPosition(position);
            Vector3 clampedTo = to.ClampPosition(position);

            return Vector3.Lerp(clampedFrom, clampedTo, t);
        }

        #endregion

        #region Debug Visualization

        /// <summary>
        /// Draw bounds gizmos for editor visualization.
        /// </summary>
        public void DrawGizmos()
        {
            Bounds b = WorldBounds;

            Gizmos.color = new Color(0.2f, 0.8f, 1f, 0.3f);
            Gizmos.DrawCube(b.center, b.size);

            Gizmos.color = new Color(0.2f, 0.8f, 1f, 0.8f);
            Gizmos.DrawWireCube(b.center, b.size);
        }

#if UNITY_EDITOR
        private void OnDrawGizmos()
        {
            DrawGizmos();
        }

        private void OnDrawGizmosSelected()
        {
            Bounds b = WorldBounds;

            // Draw height constraints
            Gizmos.color = Color.yellow;
            Vector3 minHeightPos = new Vector3(b.center.x, _minHeight, b.center.z);
            Vector3 maxHeightPos = new Vector3(b.center.x, _maxHeight, b.center.z);
            Gizmos.DrawLine(minHeightPos, maxHeightPos);

            // Draw corner posts
            Gizmos.color = Color.cyan;
            DrawCornerPost(new Vector3(b.min.x, 0, b.min.z));
            DrawCornerPost(new Vector3(b.min.x, 0, b.max.z));
            DrawCornerPost(new Vector3(b.max.x, 0, b.min.z));
            DrawCornerPost(new Vector3(b.max.x, 0, b.max.z));
        }

        private void DrawCornerPost(Vector3 basePosition)
        {
            Vector3 topPosition = basePosition + Vector3.up * _maxHeight;
            Gizmos.DrawLine(basePosition, topPosition);
        }
#endif

        #endregion
    }
}
