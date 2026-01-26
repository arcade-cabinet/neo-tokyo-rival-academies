using System;
using UnityEngine;
using UnityEngine.InputSystem;

namespace NeoTokyo.MonoBehaviours.Input
{
    /// <summary>
    /// Central input action references for Neo-Tokyo: Rival Academies.
    /// Wraps Unity Input System actions with gamepad, keyboard, and touch support.
    ///
    /// Attach to a persistent GameObject (e.g., GameManager).
    /// Other systems subscribe to events rather than polling.
    /// </summary>
    public sealed class InputActions : MonoBehaviour
    {
        #region Singleton

        private static InputActions _instance;
        public static InputActions Instance => _instance;

        #endregion

        #region Events

        // Movement
        public event Action<Vector2> OnMove;
        public event Action<Vector2> OnLook;

        // Actions
        public event Action OnAttack;
        public event Action OnAttackReleased;
        public event Action OnInteract;
        public event Action OnJump;
        public event Action OnSprint;
        public event Action OnSprintReleased;
        public event Action OnCrouch;

        // Navigation
        public event Action OnPrevious;
        public event Action OnNext;

        // UI
        public event Action<Vector2> OnNavigate;
        public event Action OnSubmit;
        public event Action OnCancel;
        public event Action<Vector2> OnPoint;
        public event Action OnClick;
        public event Action<Vector2> OnScroll;

        // Abilities (mapped to 1-4 or D-pad)
        public event Action<int> OnAbility;

        // Pause/Menu
        public event Action OnPause;

        #endregion

        #region Serialized Fields

        [Header("Input Asset")]
        [SerializeField] private InputActionAsset _inputActions;

        [Header("Action Map Names")]
        [SerializeField] private string _playerMapName = "Player";
        [SerializeField] private string _uiMapName = "UI";

        #endregion

        #region Private Fields

        // Player actions
        private InputAction _moveAction;
        private InputAction _lookAction;
        private InputAction _attackAction;
        private InputAction _interactAction;
        private InputAction _jumpAction;
        private InputAction _sprintAction;
        private InputAction _crouchAction;
        private InputAction _previousAction;
        private InputAction _nextAction;

        // UI actions
        private InputAction _navigateAction;
        private InputAction _submitAction;
        private InputAction _cancelAction;
        private InputAction _pointAction;
        private InputAction _clickAction;
        private InputAction _scrollAction;

        // Action maps
        private InputActionMap _playerMap;
        private InputActionMap _uiMap;

        // State tracking
        private bool _isInitialized;
        private bool _isPlayerInputEnabled = true;

        // Cached values to avoid allocations
        private Vector2 _cachedMoveInput;
        private Vector2 _cachedLookInput;

        #endregion

        #region Properties

        /// <summary>Current movement input vector.</summary>
        public Vector2 MoveInput => _cachedMoveInput;

        /// <summary>Current look/camera input vector.</summary>
        public Vector2 LookInput => _cachedLookInput;

        /// <summary>Whether player input is currently enabled.</summary>
        public bool IsPlayerInputEnabled => _isPlayerInputEnabled;

        /// <summary>The underlying InputActionAsset.</summary>
        public InputActionAsset ActionAsset => _inputActions;

        #endregion

        #region Unity Lifecycle

        private void Awake()
        {
            if (_instance != null && _instance != this)
            {
                Destroy(gameObject);
                return;
            }

            _instance = this;
            DontDestroyOnLoad(gameObject);

            InitializeActions();
        }

        private void OnEnable()
        {
            if (_isInitialized)
            {
                EnablePlayerInput();
            }
        }

        private void OnDisable()
        {
            DisableAllInput();
        }

        private void OnDestroy()
        {
            UnsubscribeFromActions();

            if (_instance == this)
            {
                _instance = null;
            }
        }

        private void Update()
        {
            if (!_isInitialized) return;

            // Cache continuous input values (no allocations)
            if (_moveAction != null)
            {
                _cachedMoveInput = _moveAction.ReadValue<Vector2>();
            }

            if (_lookAction != null)
            {
                _cachedLookInput = _lookAction.ReadValue<Vector2>();
            }
        }

        #endregion

        #region Initialization

        private void InitializeActions()
        {
            if (_inputActions == null)
            {
                Debug.LogError("[InputActions] No InputActionAsset assigned!");
                return;
            }

            // Get action maps
            _playerMap = _inputActions.FindActionMap(_playerMapName);
            _uiMap = _inputActions.FindActionMap(_uiMapName);

            if (_playerMap == null)
            {
                Debug.LogError($"[InputActions] Player action map '{_playerMapName}' not found!");
                return;
            }

            // Cache player actions
            _moveAction = _playerMap.FindAction("Move");
            _lookAction = _playerMap.FindAction("Look");
            _attackAction = _playerMap.FindAction("Attack");
            _interactAction = _playerMap.FindAction("Interact");
            _jumpAction = _playerMap.FindAction("Jump");
            _sprintAction = _playerMap.FindAction("Sprint");
            _crouchAction = _playerMap.FindAction("Crouch");
            _previousAction = _playerMap.FindAction("Previous");
            _nextAction = _playerMap.FindAction("Next");

            // Cache UI actions
            if (_uiMap != null)
            {
                _navigateAction = _uiMap.FindAction("Navigate");
                _submitAction = _uiMap.FindAction("Submit");
                _cancelAction = _uiMap.FindAction("Cancel");
                _pointAction = _uiMap.FindAction("Point");
                _clickAction = _uiMap.FindAction("Click");
                _scrollAction = _uiMap.FindAction("ScrollWheel");
            }

            SubscribeToActions();
            _isInitialized = true;
        }

        private void SubscribeToActions()
        {
            // Player actions - performed
            if (_moveAction != null) _moveAction.performed += HandleMove;
            if (_moveAction != null) _moveAction.canceled += HandleMoveCanceled;
            if (_lookAction != null) _lookAction.performed += HandleLook;
            if (_lookAction != null) _lookAction.canceled += HandleLookCanceled;
            if (_attackAction != null) _attackAction.performed += HandleAttack;
            if (_attackAction != null) _attackAction.canceled += HandleAttackReleased;
            if (_interactAction != null) _interactAction.performed += HandleInteract;
            if (_jumpAction != null) _jumpAction.performed += HandleJump;
            if (_sprintAction != null) _sprintAction.performed += HandleSprint;
            if (_sprintAction != null) _sprintAction.canceled += HandleSprintReleased;
            if (_crouchAction != null) _crouchAction.performed += HandleCrouch;
            if (_previousAction != null) _previousAction.performed += HandlePrevious;
            if (_nextAction != null) _nextAction.performed += HandleNext;

            // UI actions
            if (_navigateAction != null) _navigateAction.performed += HandleNavigate;
            if (_submitAction != null) _submitAction.performed += HandleSubmit;
            if (_cancelAction != null) _cancelAction.performed += HandleCancel;
            if (_pointAction != null) _pointAction.performed += HandlePoint;
            if (_clickAction != null) _clickAction.performed += HandleClick;
            if (_scrollAction != null) _scrollAction.performed += HandleScroll;
        }

        private void UnsubscribeFromActions()
        {
            if (_moveAction != null) _moveAction.performed -= HandleMove;
            if (_moveAction != null) _moveAction.canceled -= HandleMoveCanceled;
            if (_lookAction != null) _lookAction.performed -= HandleLook;
            if (_lookAction != null) _lookAction.canceled -= HandleLookCanceled;
            if (_attackAction != null) _attackAction.performed -= HandleAttack;
            if (_attackAction != null) _attackAction.canceled -= HandleAttackReleased;
            if (_interactAction != null) _interactAction.performed -= HandleInteract;
            if (_jumpAction != null) _jumpAction.performed -= HandleJump;
            if (_sprintAction != null) _sprintAction.performed -= HandleSprint;
            if (_sprintAction != null) _sprintAction.canceled -= HandleSprintReleased;
            if (_crouchAction != null) _crouchAction.performed -= HandleCrouch;
            if (_previousAction != null) _previousAction.performed -= HandlePrevious;
            if (_nextAction != null) _nextAction.performed -= HandleNext;

            if (_navigateAction != null) _navigateAction.performed -= HandleNavigate;
            if (_submitAction != null) _submitAction.performed -= HandleSubmit;
            if (_cancelAction != null) _cancelAction.performed -= HandleCancel;
            if (_pointAction != null) _pointAction.performed -= HandlePoint;
            if (_clickAction != null) _clickAction.performed -= HandleClick;
            if (_scrollAction != null) _scrollAction.performed -= HandleScroll;
        }

        #endregion

        #region Action Handlers

        private void HandleMove(InputAction.CallbackContext ctx)
        {
            Vector2 value = ctx.ReadValue<Vector2>();
            OnMove?.Invoke(value);
        }

        private void HandleMoveCanceled(InputAction.CallbackContext ctx)
        {
            OnMove?.Invoke(Vector2.zero);
        }

        private void HandleLook(InputAction.CallbackContext ctx)
        {
            Vector2 value = ctx.ReadValue<Vector2>();
            OnLook?.Invoke(value);
        }

        private void HandleLookCanceled(InputAction.CallbackContext ctx)
        {
            OnLook?.Invoke(Vector2.zero);
        }

        private void HandleAttack(InputAction.CallbackContext ctx) => OnAttack?.Invoke();
        private void HandleAttackReleased(InputAction.CallbackContext ctx) => OnAttackReleased?.Invoke();
        private void HandleInteract(InputAction.CallbackContext ctx) => OnInteract?.Invoke();
        private void HandleJump(InputAction.CallbackContext ctx) => OnJump?.Invoke();
        private void HandleSprint(InputAction.CallbackContext ctx) => OnSprint?.Invoke();
        private void HandleSprintReleased(InputAction.CallbackContext ctx) => OnSprintReleased?.Invoke();
        private void HandleCrouch(InputAction.CallbackContext ctx) => OnCrouch?.Invoke();

        private void HandlePrevious(InputAction.CallbackContext ctx)
        {
            OnPrevious?.Invoke();
            OnAbility?.Invoke(0);
        }

        private void HandleNext(InputAction.CallbackContext ctx)
        {
            OnNext?.Invoke();
            OnAbility?.Invoke(1);
        }

        private void HandleNavigate(InputAction.CallbackContext ctx)
        {
            OnNavigate?.Invoke(ctx.ReadValue<Vector2>());
        }

        private void HandleSubmit(InputAction.CallbackContext ctx) => OnSubmit?.Invoke();
        private void HandleCancel(InputAction.CallbackContext ctx)
        {
            OnCancel?.Invoke();
            OnPause?.Invoke();
        }

        private void HandlePoint(InputAction.CallbackContext ctx)
        {
            OnPoint?.Invoke(ctx.ReadValue<Vector2>());
        }

        private void HandleClick(InputAction.CallbackContext ctx) => OnClick?.Invoke();

        private void HandleScroll(InputAction.CallbackContext ctx)
        {
            OnScroll?.Invoke(ctx.ReadValue<Vector2>());
        }

        #endregion

        #region Public Control Methods

        /// <summary>
        /// Enable player gameplay input.
        /// </summary>
        public void EnablePlayerInput()
        {
            _playerMap?.Enable();
            _isPlayerInputEnabled = true;
        }

        /// <summary>
        /// Disable player gameplay input (for menus, cutscenes, etc.).
        /// </summary>
        public void DisablePlayerInput()
        {
            _playerMap?.Disable();
            _isPlayerInputEnabled = false;
            _cachedMoveInput = Vector2.zero;
            _cachedLookInput = Vector2.zero;
        }

        /// <summary>
        /// Enable UI input for menu navigation.
        /// </summary>
        public void EnableUIInput()
        {
            _uiMap?.Enable();
        }

        /// <summary>
        /// Disable UI input.
        /// </summary>
        public void DisableUIInput()
        {
            _uiMap?.Disable();
        }

        /// <summary>
        /// Switch to UI mode (disable player, enable UI).
        /// </summary>
        public void SwitchToUIMode()
        {
            DisablePlayerInput();
            EnableUIInput();
        }

        /// <summary>
        /// Switch to gameplay mode (enable player, disable UI).
        /// </summary>
        public void SwitchToGameplayMode()
        {
            DisableUIInput();
            EnablePlayerInput();
        }

        /// <summary>
        /// Disable all input.
        /// </summary>
        public void DisableAllInput()
        {
            _playerMap?.Disable();
            _uiMap?.Disable();
            _isPlayerInputEnabled = false;
            _cachedMoveInput = Vector2.zero;
            _cachedLookInput = Vector2.zero;
        }

        /// <summary>
        /// Trigger ability by slot (0-3).
        /// </summary>
        public void TriggerAbility(int slot)
        {
            OnAbility?.Invoke(Mathf.Clamp(slot, 0, 3));
        }

        /// <summary>
        /// Get the current control scheme (Keyboard, Gamepad, Touch).
        /// </summary>
        public string GetCurrentControlScheme()
        {
            if (_inputActions == null) return "Unknown";

            var devices = InputSystem.devices;
            foreach (var device in devices)
            {
                if (device is Gamepad && device.lastUpdateTime > 0)
                    return "Gamepad";
                if (device is Touchscreen && device.lastUpdateTime > 0)
                    return "Touch";
            }

            return "Keyboard&Mouse";
        }

        #endregion
    }
}
