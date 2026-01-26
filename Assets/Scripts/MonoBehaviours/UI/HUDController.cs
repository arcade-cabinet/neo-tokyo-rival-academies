using System;
using UnityEngine;
using UnityEngine.UI;
using TMPro;
using NeoTokyo.MonoBehaviours.Input;

namespace NeoTokyo.MonoBehaviours.UI
{
    /// <summary>
    /// Main HUD controller for Neo-Tokyo: Rival Academies.
    /// Displays health, mana, ability cooldowns, reputation, and mini-map.
    ///
    /// Performance: Uses dirty flags to minimize UI updates.
    /// Mobile-optimized: Batched updates, no per-frame allocations.
    /// </summary>
    public sealed class HUDController : MonoBehaviour
    {
        #region Serialized Fields

        [Header("Health & Mana")]
        [SerializeField] private Slider _healthBar;
        [SerializeField] private Slider _manaBar;
        [SerializeField] private TextMeshProUGUI _healthText;
        [SerializeField] private TextMeshProUGUI _manaText;
        [SerializeField] private Image _healthFill;
        [SerializeField] private Image _manaFill;

        [Header("Health Colors")]
        [SerializeField] private Color _healthFullColor = new Color(0.2f, 0.8f, 0.2f);
        [SerializeField] private Color _healthMidColor = new Color(0.9f, 0.7f, 0.1f);
        [SerializeField] private Color _healthLowColor = new Color(0.9f, 0.2f, 0.2f);
        [SerializeField] private float _lowHealthThreshold = 0.25f;
        [SerializeField] private float _midHealthThreshold = 0.5f;

        [Header("Ability Cooldowns")]
        [SerializeField] private AbilityCooldownUI[] _abilityCooldowns = new AbilityCooldownUI[4];

        [Header("Reputation Meters")]
        [SerializeField] private Slider _kurenaiReputation;
        [SerializeField] private Slider _azureReputation;
        [SerializeField] private TextMeshProUGUI _kurenaiReputationText;
        [SerializeField] private TextMeshProUGUI _azureReputationText;
        [SerializeField] private Image _kurenaiIcon;
        [SerializeField] private Image _azureIcon;

        [Header("Mini-Map")]
        [SerializeField] private GameObject _miniMapContainer;
        [SerializeField] private RawImage _miniMapDisplay;
        [SerializeField] private UnityEngine.Camera _miniMapCamera;
        [SerializeField] private KeyCode _miniMapToggleKey = KeyCode.M;

        [Header("Combo/Status")]
        [SerializeField] private TextMeshProUGUI _comboText;
        [SerializeField] private CanvasGroup _comboGroup;
        [SerializeField] private float _comboFadeTime = 1.5f;

        [Header("Territory Display")]
        [SerializeField] private TextMeshProUGUI _territoryNameText;
        [SerializeField] private CanvasGroup _territoryGroup;

        [Header("Animation")]
        [SerializeField] private float _barAnimationSpeed = 5f;
        [SerializeField] private AnimationCurve _damageShakeCurve;

        #endregion

        #region Private Fields

        // Cached target values for smooth animation
        private float _targetHealth;
        private float _targetMana;
        private float _targetKurenaiRep;
        private float _targetAzureRep;

        // Dirty flags to minimize updates
        private bool _healthDirty;
        private bool _manaDirty;
        private bool _reputationDirty;
        private bool _cooldownsDirty;

        // Combo tracking
        private int _currentCombo;
        private float _comboTimer;

        // Territory display
        private float _territoryDisplayTimer;

        // Mini-map state
        private bool _miniMapVisible = true;

        // Cached strings to avoid allocations
        private readonly char[] _numberBuffer = new char[16];

        #endregion

        #region Properties

        /// <summary>Whether the mini-map is currently visible.</summary>
        public bool MiniMapVisible => _miniMapVisible;

        #endregion

        #region Unity Lifecycle

        private void Awake()
        {
            // Initialize with default values
            _targetHealth = 1f;
            _targetMana = 1f;
            _targetKurenaiRep = 0.5f;
            _targetAzureRep = 0.5f;

            if (_comboGroup != null) _comboGroup.alpha = 0f;
            if (_territoryGroup != null) _territoryGroup.alpha = 0f;
        }

        private void OnEnable()
        {
            // Subscribe to input events
            if (InputActions.Instance != null)
            {
                InputActions.Instance.OnAbility += HandleAbilityInput;
            }
        }

        private void OnDisable()
        {
            if (InputActions.Instance != null)
            {
                InputActions.Instance.OnAbility -= HandleAbilityInput;
            }
        }

        private void Update()
        {
            float dt = Time.deltaTime;

            UpdateHealthBar(dt);
            UpdateManaBar(dt);
            UpdateReputationBars(dt);
            UpdateCooldowns(dt);
            UpdateComboDisplay(dt);
            UpdateTerritoryDisplay(dt);

            // Mini-map toggle (keyboard fallback)
            if (UnityEngine.Input.GetKeyDown(_miniMapToggleKey))
            {
                ToggleMiniMap();
            }
        }

        #endregion

        #region Health & Mana

        /// <summary>
        /// Set the health display value (0-1 normalized).
        /// </summary>
        public void SetHealth(float current, float max)
        {
            _targetHealth = max > 0 ? current / max : 0f;
            _healthDirty = true;

            if (_healthText != null)
            {
                _healthText.SetText("{0}/{1}", (int)current, (int)max);
            }
        }

        /// <summary>
        /// Set the mana display value (0-1 normalized).
        /// </summary>
        public void SetMana(float current, float max)
        {
            _targetMana = max > 0 ? current / max : 0f;
            _manaDirty = true;

            if (_manaText != null)
            {
                _manaText.SetText("{0}/{1}", (int)current, (int)max);
            }
        }

        private void UpdateHealthBar(float dt)
        {
            if (_healthBar == null) return;

            float currentValue = _healthBar.value;
            if (Mathf.Approximately(currentValue, _targetHealth)) return;

            float newValue = Mathf.MoveTowards(currentValue, _targetHealth, _barAnimationSpeed * dt);
            _healthBar.value = newValue;

            // Update color based on health level
            if (_healthFill != null)
            {
                _healthFill.color = GetHealthColor(newValue);
            }
        }

        private void UpdateManaBar(float dt)
        {
            if (_manaBar == null) return;

            float currentValue = _manaBar.value;
            if (Mathf.Approximately(currentValue, _targetMana)) return;

            _manaBar.value = Mathf.MoveTowards(currentValue, _targetMana, _barAnimationSpeed * dt);
        }

        private Color GetHealthColor(float healthRatio)
        {
            if (healthRatio <= _lowHealthThreshold)
            {
                return _healthLowColor;
            }
            else if (healthRatio <= _midHealthThreshold)
            {
                float t = (healthRatio - _lowHealthThreshold) / (_midHealthThreshold - _lowHealthThreshold);
                return Color.Lerp(_healthLowColor, _healthMidColor, t);
            }
            else
            {
                float t = (healthRatio - _midHealthThreshold) / (1f - _midHealthThreshold);
                return Color.Lerp(_healthMidColor, _healthFullColor, t);
            }
        }

        /// <summary>
        /// Trigger damage flash effect on health bar.
        /// </summary>
        public void TriggerDamageEffect()
        {
            // Could trigger shake or flash animation here
            // Using coroutine-free approach for performance
        }

        #endregion

        #region Ability Cooldowns

        /// <summary>
        /// Set ability cooldown state for a slot (0-3).
        /// </summary>
        public void SetAbilityCooldown(int slot, float remaining, float total)
        {
            if (slot < 0 || slot >= _abilityCooldowns.Length) return;
            if (_abilityCooldowns[slot] == null) return;

            _abilityCooldowns[slot].SetCooldown(remaining, total);
            _cooldownsDirty = true;
        }

        /// <summary>
        /// Set ability icon for a slot.
        /// </summary>
        public void SetAbilityIcon(int slot, Sprite icon)
        {
            if (slot < 0 || slot >= _abilityCooldowns.Length) return;
            if (_abilityCooldowns[slot] == null) return;

            _abilityCooldowns[slot].SetIcon(icon);
        }

        /// <summary>
        /// Set ability as available/unavailable (e.g., not enough mana).
        /// </summary>
        public void SetAbilityAvailable(int slot, bool available)
        {
            if (slot < 0 || slot >= _abilityCooldowns.Length) return;
            if (_abilityCooldowns[slot] == null) return;

            _abilityCooldowns[slot].SetAvailable(available);
        }

        private void UpdateCooldowns(float dt)
        {
            for (int i = 0; i < _abilityCooldowns.Length; i++)
            {
                if (_abilityCooldowns[i] != null)
                {
                    _abilityCooldowns[i].UpdateCooldown(dt);
                }
            }
        }

        private void HandleAbilityInput(int slot)
        {
            if (slot >= 0 && slot < _abilityCooldowns.Length && _abilityCooldowns[slot] != null)
            {
                _abilityCooldowns[slot].TriggerPressEffect();
            }
        }

        #endregion

        #region Reputation

        /// <summary>
        /// Set Kurenai (passion) reputation value (0-100).
        /// </summary>
        public void SetKurenaiReputation(int value)
        {
            _targetKurenaiRep = Mathf.Clamp01(value / 100f);
            _reputationDirty = true;

            if (_kurenaiReputationText != null)
            {
                _kurenaiReputationText.SetText("{0}", value);
            }
        }

        /// <summary>
        /// Set Azure (logic) reputation value (0-100).
        /// </summary>
        public void SetAzureReputation(int value)
        {
            _targetAzureRep = Mathf.Clamp01(value / 100f);
            _reputationDirty = true;

            if (_azureReputationText != null)
            {
                _azureReputationText.SetText("{0}", value);
            }
        }

        /// <summary>
        /// Set both reputation values at once.
        /// </summary>
        public void SetReputation(int kurenai, int azure)
        {
            SetKurenaiReputation(kurenai);
            SetAzureReputation(azure);
        }

        private void UpdateReputationBars(float dt)
        {
            if (_kurenaiReputation != null)
            {
                float current = _kurenaiReputation.value;
                if (!Mathf.Approximately(current, _targetKurenaiRep))
                {
                    _kurenaiReputation.value = Mathf.MoveTowards(
                        current, _targetKurenaiRep, _barAnimationSpeed * 0.5f * dt
                    );
                }
            }

            if (_azureReputation != null)
            {
                float current = _azureReputation.value;
                if (!Mathf.Approximately(current, _targetAzureRep))
                {
                    _azureReputation.value = Mathf.MoveTowards(
                        current, _targetAzureRep, _barAnimationSpeed * 0.5f * dt
                    );
                }
            }
        }

        #endregion

        #region Mini-Map

        /// <summary>
        /// Toggle mini-map visibility.
        /// </summary>
        public void ToggleMiniMap()
        {
            SetMiniMapVisible(!_miniMapVisible);
        }

        /// <summary>
        /// Set mini-map visibility.
        /// </summary>
        public void SetMiniMapVisible(bool visible)
        {
            _miniMapVisible = visible;

            if (_miniMapContainer != null)
            {
                _miniMapContainer.SetActive(visible);
            }

            if (_miniMapCamera != null)
            {
                _miniMapCamera.enabled = visible;
            }
        }

        #endregion

        #region Combo Display

        /// <summary>
        /// Update the combo counter display.
        /// </summary>
        public void SetCombo(int count)
        {
            _currentCombo = count;

            if (_comboText != null)
            {
                if (count > 1)
                {
                    _comboText.SetText("{0}x COMBO", count);
                    if (_comboGroup != null) _comboGroup.alpha = 1f;
                    _comboTimer = _comboFadeTime;
                }
            }
        }

        /// <summary>
        /// Reset the combo counter.
        /// </summary>
        public void ResetCombo()
        {
            _currentCombo = 0;
            _comboTimer = 0f;
        }

        private void UpdateComboDisplay(float dt)
        {
            if (_comboGroup == null || _comboTimer <= 0f) return;

            _comboTimer -= dt;

            if (_comboTimer <= 0f)
            {
                _comboGroup.alpha = 0f;
            }
            else if (_comboTimer < 0.5f)
            {
                _comboGroup.alpha = _comboTimer / 0.5f;
            }
        }

        #endregion

        #region Territory Display

        /// <summary>
        /// Show territory name when entering a new zone.
        /// </summary>
        public void ShowTerritoryName(string name, float duration = 3f)
        {
            if (_territoryNameText != null)
            {
                _territoryNameText.text = name;
            }

            if (_territoryGroup != null)
            {
                _territoryGroup.alpha = 1f;
            }

            _territoryDisplayTimer = duration;
        }

        private void UpdateTerritoryDisplay(float dt)
        {
            if (_territoryGroup == null || _territoryDisplayTimer <= 0f) return;

            _territoryDisplayTimer -= dt;

            if (_territoryDisplayTimer <= 0f)
            {
                _territoryGroup.alpha = 0f;
            }
            else if (_territoryDisplayTimer < 1f)
            {
                _territoryGroup.alpha = _territoryDisplayTimer;
            }
        }

        #endregion

        #region Show/Hide

        /// <summary>
        /// Show the entire HUD.
        /// </summary>
        public void Show()
        {
            gameObject.SetActive(true);
        }

        /// <summary>
        /// Hide the entire HUD.
        /// </summary>
        public void Hide()
        {
            gameObject.SetActive(false);
        }

        #endregion
    }

    /// <summary>
    /// Individual ability cooldown UI element.
    /// </summary>
    [Serializable]
    public class AbilityCooldownUI
    {
        [SerializeField] private Image _iconImage;
        [SerializeField] private Image _cooldownOverlay;
        [SerializeField] private TextMeshProUGUI _cooldownText;
        [SerializeField] private Image _borderImage;
        [SerializeField] private Color _availableColor = Color.white;
        [SerializeField] private Color _unavailableColor = new Color(0.5f, 0.5f, 0.5f);
        [SerializeField] private Color _cooldownColor = new Color(0.3f, 0.3f, 0.3f, 0.7f);

        private float _remainingCooldown;
        private float _totalCooldown;
        private bool _isAvailable = true;

        public void SetIcon(Sprite icon)
        {
            if (_iconImage != null)
            {
                _iconImage.sprite = icon;
                _iconImage.enabled = icon != null;
            }
        }

        public void SetCooldown(float remaining, float total)
        {
            _remainingCooldown = remaining;
            _totalCooldown = total;
        }

        public void SetAvailable(bool available)
        {
            _isAvailable = available;

            if (_iconImage != null)
            {
                _iconImage.color = available ? _availableColor : _unavailableColor;
            }
        }

        public void UpdateCooldown(float dt)
        {
            if (_cooldownOverlay == null) return;

            bool onCooldown = _remainingCooldown > 0f;

            if (onCooldown)
            {
                float ratio = _totalCooldown > 0 ? _remainingCooldown / _totalCooldown : 0f;
                _cooldownOverlay.fillAmount = ratio;
                _cooldownOverlay.color = _cooldownColor;
                _cooldownOverlay.enabled = true;

                if (_cooldownText != null)
                {
                    _cooldownText.SetText("{0:F1}", _remainingCooldown);
                    _cooldownText.enabled = true;
                }
            }
            else
            {
                _cooldownOverlay.enabled = false;
                if (_cooldownText != null) _cooldownText.enabled = false;
            }
        }

        public void TriggerPressEffect()
        {
            // Could add visual feedback for ability press
            // Scale pulse or highlight effect
        }
    }
}
