using System;
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.InputSystem.EnhancedTouch;
using Touch = UnityEngine.InputSystem.EnhancedTouch.Touch;
using TouchPhase = UnityEngine.InputSystem.TouchPhase;

namespace NeoTokyo.MonoBehaviours.Input
{
    /// <summary>
    /// Unified touch input manager for Neo-Tokyo: Rival Academies.
    /// Handles virtual joystick, tap-to-interact, swipe for abilities, and pinch-to-zoom.
    ///
    /// Uses Unity's new Input System with EnhancedTouch for mobile support.
    /// Performance optimized: no allocations in Update(), cached calculations.
    /// </summary>
    public sealed class TouchInputManager : MonoBehaviour
    {
        #region Events

        /// <summary>Fired when movement input changes. Vector2 is normalized direction.</summary>
        public event Action<Vector2> OnMoveInput;

        /// <summary>Fired when tap/interact is detected. Vector2 is screen position.</summary>
        public event Action<Vector2> OnTap;

        /// <summary>Fired when swipe is detected. SwipeDirection indicates direction.</summary>
        public event Action<SwipeDirection> OnSwipe;

        /// <summary>Fired when pinch zoom changes. Float is delta (positive = zoom in).</summary>
        public event Action<float> OnPinchZoom;

        /// <summary>Fired when ability slot is triggered (1-4).</summary>
        public event Action<int> OnAbilityTriggered;

        #endregion

        #region Enums

        public enum SwipeDirection
        {
            None,
            Up,
            Down,
            Left,
            Right
        }

        #endregion

        #region Serialized Fields

        [Header("Virtual Joystick")]
        [SerializeField] private RectTransform _joystickArea;
        [SerializeField] private RectTransform _joystickHandle;
        [SerializeField] private float _joystickRadius = 100f;
        [SerializeField] private float _joystickDeadzone = 0.1f;
        [SerializeField] private bool _joystickDynamicPosition = true;

        [Header("Tap Detection")]
        [SerializeField] private float _tapMaxDuration = 0.3f;
        [SerializeField] private float _tapMaxDistance = 20f;

        [Header("Swipe Detection")]
        [SerializeField] private float _swipeMinDistance = 100f;
        [SerializeField] private float _swipeMaxDuration = 0.5f;
        [SerializeField] private float _swipeMinVelocity = 500f;

        [Header("Pinch Zoom")]
        [SerializeField] private float _pinchSensitivity = 0.01f;

        [Header("Ability Zones")]
        [SerializeField] private RectTransform[] _abilityZones = new RectTransform[4];

        [Header("Input Actions (Fallback)")]
        [SerializeField] private InputActionReference _moveAction;
        [SerializeField] private InputActionReference _interactAction;

        #endregion

        #region Private Fields

        // Touch state tracking
        private int _joystickTouchId = -1;
        private Vector2 _joystickStartPosition;
        private Vector2 _joystickCurrentPosition;
        private Vector2 _lastMoveInput;

        // Tap tracking
        private float _touchStartTime;
        private Vector2 _touchStartPosition;

        // Pinch tracking
        private float _lastPinchDistance;

        // Cached values
        private bool _isInitialized;
        private UnityEngine.Camera _mainCamera;

        #endregion

        #region Properties

        /// <summary>Current normalized movement input.</summary>
        public Vector2 MoveInput => _lastMoveInput;

        /// <summary>Whether touch is currently active on joystick.</summary>
        public bool IsJoystickActive => _joystickTouchId >= 0;

        #endregion

        #region Unity Lifecycle

        private void Awake()
        {
            _mainCamera = UnityEngine.Camera.main;
        }

        private void OnEnable()
        {
            EnhancedTouchSupport.Enable();

            if (_moveAction != null && _moveAction.action != null)
            {
                _moveAction.action.Enable();
            }
            if (_interactAction != null && _interactAction.action != null)
            {
                _interactAction.action.Enable();
                _interactAction.action.performed += HandleInteractAction;
            }

            _isInitialized = true;
        }

        private void OnDisable()
        {
            if (_interactAction != null && _interactAction.action != null)
            {
                _interactAction.action.performed -= HandleInteractAction;
            }

            EnhancedTouchSupport.Disable();
            _isInitialized = false;
        }

        private void Update()
        {
            if (!_isInitialized) return;

            // Process touch input on mobile
            if (Touchscreen.current != null)
            {
                ProcessTouchInput();
            }
            // Fallback to action-based input (gamepad/keyboard)
            else if (_moveAction != null && _moveAction.action != null)
            {
                ProcessActionInput();
            }
        }

        #endregion

        #region Touch Processing

        private void ProcessTouchInput()
        {
            int touchCount = Touch.activeTouches.Count;

            // Handle pinch zoom with two fingers
            if (touchCount >= 2)
            {
                ProcessPinchZoom();
            }
            else
            {
                _lastPinchDistance = 0f;
            }

            // Process individual touches
            foreach (var touch in Touch.activeTouches)
            {
                switch (touch.phase)
                {
                    case TouchPhase.Began:
                        HandleTouchBegan(touch);
                        break;

                    case TouchPhase.Moved:
                    case TouchPhase.Stationary:
                        HandleTouchMoved(touch);
                        break;

                    case TouchPhase.Ended:
                    case TouchPhase.Canceled:
                        HandleTouchEnded(touch);
                        break;
                }
            }
        }

        private void HandleTouchBegan(Touch touch)
        {
            Vector2 screenPos = touch.screenPosition;

            // Check if touch is in joystick area
            if (_joystickArea != null && IsInRect(screenPos, _joystickArea))
            {
                if (_joystickTouchId < 0)
                {
                    _joystickTouchId = touch.touchId;

                    if (_joystickDynamicPosition)
                    {
                        _joystickStartPosition = screenPos;
                        if (_joystickHandle != null)
                        {
                            _joystickHandle.position = screenPos;
                        }
                    }
                    else
                    {
                        _joystickStartPosition = _joystickArea.position;
                    }

                    _joystickCurrentPosition = screenPos;
                }
            }
            // Check ability zones
            else
            {
                for (int i = 0; i < _abilityZones.Length; i++)
                {
                    if (_abilityZones[i] != null && IsInRect(screenPos, _abilityZones[i]))
                    {
                        OnAbilityTriggered?.Invoke(i);
                        return;
                    }
                }
            }

            // Track for tap/swipe detection
            _touchStartTime = Time.time;
            _touchStartPosition = screenPos;
        }

        private void HandleTouchMoved(Touch touch)
        {
            if (touch.touchId == _joystickTouchId)
            {
                _joystickCurrentPosition = touch.screenPosition;
                UpdateJoystickInput();
            }
        }

        private void HandleTouchEnded(Touch touch)
        {
            Vector2 screenPos = touch.screenPosition;
            float duration = Time.time - _touchStartTime;
            float distance = Vector2.Distance(screenPos, _touchStartPosition);

            // Release joystick
            if (touch.touchId == _joystickTouchId)
            {
                _joystickTouchId = -1;
                _lastMoveInput = Vector2.zero;
                OnMoveInput?.Invoke(Vector2.zero);

                if (_joystickHandle != null)
                {
                    _joystickHandle.anchoredPosition = Vector2.zero;
                }
            }

            // Check for tap
            if (duration <= _tapMaxDuration && distance <= _tapMaxDistance)
            {
                // Ignore if it was a joystick touch
                if (_joystickArea == null || !IsInRect(_touchStartPosition, _joystickArea))
                {
                    OnTap?.Invoke(screenPos);
                }
            }
            // Check for swipe
            else if (duration <= _swipeMaxDuration && distance >= _swipeMinDistance)
            {
                float velocity = distance / duration;
                if (velocity >= _swipeMinVelocity)
                {
                    SwipeDirection direction = DetermineSwipeDirection(
                        screenPos - _touchStartPosition
                    );
                    if (direction != SwipeDirection.None)
                    {
                        OnSwipe?.Invoke(direction);
                    }
                }
            }
        }

        private void UpdateJoystickInput()
        {
            Vector2 delta = _joystickCurrentPosition - _joystickStartPosition;
            float magnitude = delta.magnitude;

            // Clamp to radius
            if (magnitude > _joystickRadius)
            {
                delta = delta.normalized * _joystickRadius;
            }

            // Update handle visual
            if (_joystickHandle != null)
            {
                _joystickHandle.anchoredPosition = delta;
            }

            // Calculate normalized input with deadzone
            Vector2 normalizedInput = delta / _joystickRadius;
            if (normalizedInput.magnitude < _joystickDeadzone)
            {
                normalizedInput = Vector2.zero;
            }
            else
            {
                // Remap from deadzone to 1
                normalizedInput = normalizedInput.normalized *
                    ((normalizedInput.magnitude - _joystickDeadzone) / (1f - _joystickDeadzone));
            }

            if (normalizedInput != _lastMoveInput)
            {
                _lastMoveInput = normalizedInput;
                OnMoveInput?.Invoke(normalizedInput);
            }
        }

        private void ProcessPinchZoom()
        {
            if (Touch.activeTouches.Count < 2) return;

            var touch0 = Touch.activeTouches[0];
            var touch1 = Touch.activeTouches[1];

            float currentDistance = Vector2.Distance(
                touch0.screenPosition,
                touch1.screenPosition
            );

            if (_lastPinchDistance > 0f)
            {
                float delta = (currentDistance - _lastPinchDistance) * _pinchSensitivity;
                OnPinchZoom?.Invoke(delta);
            }

            _lastPinchDistance = currentDistance;
        }

        #endregion

        #region Action Input (Fallback)

        private void ProcessActionInput()
        {
            if (_moveAction == null || _moveAction.action == null) return;

            Vector2 input = _moveAction.action.ReadValue<Vector2>();

            if (input.magnitude < _joystickDeadzone)
            {
                input = Vector2.zero;
            }

            if (input != _lastMoveInput)
            {
                _lastMoveInput = input;
                OnMoveInput?.Invoke(input);
            }
        }

        private void HandleInteractAction(InputAction.CallbackContext context)
        {
            // Use screen center for keyboard/gamepad interact
            Vector2 screenCenter = new Vector2(Screen.width * 0.5f, Screen.height * 0.5f);
            OnTap?.Invoke(screenCenter);
        }

        #endregion

        #region Utilities

        private bool IsInRect(Vector2 screenPosition, RectTransform rect)
        {
            if (rect == null) return false;
            return RectTransformUtility.RectangleContainsScreenPoint(rect, screenPosition, null);
        }

        private SwipeDirection DetermineSwipeDirection(Vector2 delta)
        {
            float absX = Mathf.Abs(delta.x);
            float absY = Mathf.Abs(delta.y);

            // Determine dominant axis
            if (absX > absY)
            {
                return delta.x > 0 ? SwipeDirection.Right : SwipeDirection.Left;
            }
            else
            {
                return delta.y > 0 ? SwipeDirection.Up : SwipeDirection.Down;
            }
        }

        /// <summary>
        /// Convert screen position to world position for interactions.
        /// </summary>
        public Vector3 ScreenToWorldPoint(Vector2 screenPosition, float depth = 10f)
        {
            if (_mainCamera == null)
            {
                _mainCamera = UnityEngine.Camera.main;
            }

            if (_mainCamera != null)
            {
                Vector3 screenPos = new Vector3(screenPosition.x, screenPosition.y, depth);
                return _mainCamera.ScreenToWorldPoint(screenPos);
            }

            return Vector3.zero;
        }

        /// <summary>
        /// Cast a ray from screen position for interaction detection.
        /// </summary>
        public bool RaycastFromScreen(Vector2 screenPosition, out RaycastHit hit, float maxDistance = 100f, int layerMask = -1)
        {
            if (_mainCamera == null)
            {
                _mainCamera = UnityEngine.Camera.main;
            }

            if (_mainCamera != null)
            {
                Ray ray = _mainCamera.ScreenPointToRay(screenPosition);
                return Physics.Raycast(ray, out hit, maxDistance, layerMask);
            }

            hit = default;
            return false;
        }

        #endregion
    }
}
