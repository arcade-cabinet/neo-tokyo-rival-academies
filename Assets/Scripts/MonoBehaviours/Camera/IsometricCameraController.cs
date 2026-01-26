using UnityEngine;
using UnityEngine.InputSystem;
using NeoTokyo.MonoBehaviours.Input;

namespace NeoTokyo.MonoBehaviours.Camera
{
    /// <summary>
    /// Isometric camera controller for Neo-Tokyo: Rival Academies.
    /// Provides smooth following, zone-based bounds, and pinch-to-zoom for mobile.
    ///
    /// Performance: Uses LateUpdate for camera positioning, avoids allocations.
    /// Mobile-optimized: 60 FPS target on Pixel 8a.
    /// </summary>
    public sealed class IsometricCameraController : MonoBehaviour
    {
        #region Serialized Fields

        [Header("Target Settings")]
        [SerializeField] private Transform _target;
        [SerializeField] private Vector3 _offset = new Vector3(0f, 10f, -10f);

        [Header("Follow Settings")]
        [SerializeField, Range(0.01f, 1f)] private float _smoothTime = 0.15f;
        [SerializeField] private bool _useFixedUpdate;

        [Header("Isometric Angle")]
        [SerializeField, Range(30f, 60f)] private float _isometricAngle = 45f;
        [SerializeField, Range(0f, 360f)] private float _rotationAngle = 45f;

        [Header("Zoom Settings")]
        [SerializeField] private float _defaultZoom = 15f;
        [SerializeField] private float _minZoom = 8f;
        [SerializeField] private float _maxZoom = 25f;
        [SerializeField] private float _zoomSpeed = 2f;
        [SerializeField] private float _zoomSmoothTime = 0.1f;

        [Header("Bounds")]
        [SerializeField] private bool _useBounds;
        [SerializeField] private CameraBounds _currentBounds;

        [Header("Input")]
        [SerializeField] private TouchInputManager _touchInput;

        #endregion

        #region Private Fields

        private Vector3 _velocity;
        private float _currentZoom;
        private float _targetZoom;
        private float _zoomVelocity;
        private UnityEngine.Camera _camera;
        private bool _isInitialized;

        // Cached calculations to avoid per-frame allocations
        private Vector3 _cachedTargetPosition;
        private Quaternion _cachedRotation;

        #endregion

        #region Properties

        /// <summary>Current camera zoom distance.</summary>
        public float CurrentZoom => _currentZoom;

        /// <summary>Target transform the camera follows.</summary>
        public Transform Target
        {
            get => _target;
            set => _target = value;
        }

        /// <summary>Current camera bounds constraint.</summary>
        public CameraBounds CurrentBounds
        {
            get => _currentBounds;
            set => SetBounds(value);
        }

        #endregion

        #region Unity Lifecycle

        private void Awake()
        {
            _camera = GetComponent<UnityEngine.Camera>();
            if (_camera == null)
            {
                _camera = gameObject.AddComponent<UnityEngine.Camera>();
            }

            _currentZoom = _defaultZoom;
            _targetZoom = _defaultZoom;

            CalculateCachedValues();
            _isInitialized = true;
        }

        private void OnEnable()
        {
            if (_touchInput != null)
            {
                _touchInput.OnPinchZoom += HandlePinchZoom;
            }
        }

        private void OnDisable()
        {
            if (_touchInput != null)
            {
                _touchInput.OnPinchZoom -= HandlePinchZoom;
            }
        }

        private void LateUpdate()
        {
            if (!_isInitialized || _target == null) return;
            if (_useFixedUpdate) return;

            UpdateCamera(Time.deltaTime);
        }

        private void FixedUpdate()
        {
            if (!_isInitialized || _target == null) return;
            if (!_useFixedUpdate) return;

            UpdateCamera(Time.fixedDeltaTime);
        }

        #endregion

        #region Camera Update

        private void UpdateCamera(float deltaTime)
        {
            UpdateZoom(deltaTime);
            UpdatePosition(deltaTime);
            UpdateRotation();
        }

        private void UpdateZoom(float deltaTime)
        {
            // Smooth zoom interpolation
            _currentZoom = Mathf.SmoothDamp(
                _currentZoom,
                _targetZoom,
                ref _zoomVelocity,
                _zoomSmoothTime,
                Mathf.Infinity,
                deltaTime
            );

            // Update offset based on zoom
            CalculateCachedValues();
        }

        private void UpdatePosition(float deltaTime)
        {
            Vector3 desiredPosition = _target.position + _cachedTargetPosition;

            // Apply bounds if enabled
            if (_useBounds && _currentBounds != null)
            {
                desiredPosition = _currentBounds.ClampPosition(desiredPosition);
            }

            // Smooth follow
            transform.position = Vector3.SmoothDamp(
                transform.position,
                desiredPosition,
                ref _velocity,
                _smoothTime,
                Mathf.Infinity,
                deltaTime
            );
        }

        private void UpdateRotation()
        {
            transform.rotation = _cachedRotation;
        }

        private void CalculateCachedValues()
        {
            // Calculate isometric offset based on angles and zoom
            float radAngle = _isometricAngle * Mathf.Deg2Rad;
            float radRotation = _rotationAngle * Mathf.Deg2Rad;

            float height = _currentZoom * Mathf.Sin(radAngle);
            float distance = _currentZoom * Mathf.Cos(radAngle);

            _cachedTargetPosition = new Vector3(
                -distance * Mathf.Sin(radRotation),
                height,
                -distance * Mathf.Cos(radRotation)
            );

            // Cache rotation
            _cachedRotation = Quaternion.Euler(_isometricAngle, _rotationAngle, 0f);
        }

        #endregion

        #region Zoom Control

        private void HandlePinchZoom(float delta)
        {
            SetZoom(_targetZoom - delta * _zoomSpeed);
        }

        /// <summary>
        /// Set the target zoom level (clamped to min/max).
        /// </summary>
        public void SetZoom(float zoom)
        {
            _targetZoom = Mathf.Clamp(zoom, _minZoom, _maxZoom);
        }

        /// <summary>
        /// Zoom in by a step amount.
        /// </summary>
        public void ZoomIn(float amount = 1f)
        {
            SetZoom(_targetZoom - amount);
        }

        /// <summary>
        /// Zoom out by a step amount.
        /// </summary>
        public void ZoomOut(float amount = 1f)
        {
            SetZoom(_targetZoom + amount);
        }

        /// <summary>
        /// Reset zoom to default level.
        /// </summary>
        public void ResetZoom()
        {
            SetZoom(_defaultZoom);
        }

        #endregion

        #region Bounds Control

        /// <summary>
        /// Set new camera bounds with optional smooth transition.
        /// </summary>
        public void SetBounds(CameraBounds bounds, bool instant = false)
        {
            if (_currentBounds == bounds) return;

            _currentBounds = bounds;
            _useBounds = bounds != null;

            if (instant && _target != null)
            {
                SnapToTarget();
            }
        }

        /// <summary>
        /// Immediately snap camera to target position.
        /// </summary>
        public void SnapToTarget()
        {
            if (_target == null) return;

            CalculateCachedValues();
            Vector3 targetPos = _target.position + _cachedTargetPosition;

            if (_useBounds && _currentBounds != null)
            {
                targetPos = _currentBounds.ClampPosition(targetPos);
            }

            transform.position = targetPos;
            transform.rotation = _cachedRotation;
            _velocity = Vector3.zero;
            _currentZoom = _targetZoom;
            _zoomVelocity = 0f;
        }

        /// <summary>
        /// Enable or disable camera bounds.
        /// </summary>
        public void EnableBounds(bool enable)
        {
            _useBounds = enable && _currentBounds != null;
        }

        #endregion

        #region Debug

#if UNITY_EDITOR
        private void OnDrawGizmosSelected()
        {
            if (_target != null)
            {
                Gizmos.color = Color.cyan;
                Gizmos.DrawLine(transform.position, _target.position);
                Gizmos.DrawWireSphere(_target.position, 0.5f);
            }

            if (_currentBounds != null)
            {
                _currentBounds.DrawGizmos();
            }
        }
#endif

        #endregion
    }
}
