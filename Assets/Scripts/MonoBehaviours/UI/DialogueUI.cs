using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;
using NeoTokyo.MonoBehaviours.Input;

namespace NeoTokyo.MonoBehaviours.UI
{
    /// <summary>
    /// Dialogue system UI for Neo-Tokyo: Rival Academies.
    /// Handles text display, choice buttons, and speaker portraits.
    ///
    /// Performance: Object pooling for choice buttons, minimal allocations.
    /// Mobile-optimized: Large touch targets, clear typography.
    /// </summary>
    public sealed class DialogueUI : MonoBehaviour
    {
        #region Events

        /// <summary>Fired when a dialogue choice is selected. Int is choice index.</summary>
        public event Action<int> OnChoiceSelected;

        /// <summary>Fired when dialogue is advanced (continue/skip).</summary>
        public event Action OnAdvance;

        /// <summary>Fired when dialogue is closed.</summary>
        public event Action OnClose;

        #endregion

        #region Serialized Fields

        [Header("Main Container")]
        [SerializeField] private CanvasGroup _dialogueContainer;
        [SerializeField] private float _fadeSpeed = 5f;

        [Header("Speaker")]
        [SerializeField] private Image _speakerPortrait;
        [SerializeField] private TextMeshProUGUI _speakerNameText;
        [SerializeField] private Image _speakerNameBackground;

        [Header("Dialogue Text")]
        [SerializeField] private TextMeshProUGUI _dialogueText;
        [SerializeField] private float _typewriterSpeed = 40f;
        [SerializeField] private bool _useTypewriter = true;

        [Header("Continue Indicator")]
        [SerializeField] private GameObject _continueIndicator;
        [SerializeField] private float _continueBlinkSpeed = 2f;

        [Header("Choice Buttons")]
        [SerializeField] private Transform _choiceContainer;
        [SerializeField] private DialogueChoiceButton _choiceButtonPrefab;
        [SerializeField] private int _initialPoolSize = 4;

        [Header("Portrait Position")]
        [SerializeField] private RectTransform _portraitLeft;
        [SerializeField] private RectTransform _portraitRight;

        [Header("Speaker Colors")]
        [SerializeField] private Color _kurenaiColor = new Color(0.9f, 0.2f, 0.3f);
        [SerializeField] private Color _azureColor = new Color(0.2f, 0.4f, 0.9f);
        [SerializeField] private Color _neutralColor = new Color(0.7f, 0.7f, 0.7f);

        [Header("Audio")]
        [SerializeField] private AudioSource _audioSource;
        [SerializeField] private AudioClip _typeSound;
        [SerializeField] private AudioClip _advanceSound;
        [SerializeField] private AudioClip _choiceSound;

        #endregion

        #region Private Fields

        // Object pool for choice buttons
        private readonly List<DialogueChoiceButton> _choicePool = new List<DialogueChoiceButton>();
        private readonly List<DialogueChoiceButton> _activeChoices = new List<DialogueChoiceButton>();

        // Typewriter state
        private string _fullText;
        private int _visibleCharCount;
        private float _typewriterTimer;
        private bool _isTyping;
        private bool _skipRequested;

        // Visibility state
        private bool _isVisible;
        private bool _isTransitioning;
        private float _targetAlpha;

        // Continue indicator animation
        private float _blinkTimer;

        // Input handling
        private bool _canAdvance;
        private bool _hasChoices;

        #endregion

        #region Properties

        /// <summary>Whether dialogue UI is currently visible.</summary>
        public bool IsVisible => _isVisible;

        /// <summary>Whether text is currently being typed.</summary>
        public bool IsTyping => _isTyping;

        /// <summary>Whether dialogue has pending choices.</summary>
        public bool HasChoices => _hasChoices;

        #endregion

        #region Unity Lifecycle

        private void Awake()
        {
            InitializePool();

            if (_dialogueContainer != null)
            {
                _dialogueContainer.alpha = 0f;
                _dialogueContainer.interactable = false;
                _dialogueContainer.blocksRaycasts = false;
            }
        }

        private void OnEnable()
        {
            if (InputActions.Instance != null)
            {
                InputActions.Instance.OnSubmit += HandleAdvanceInput;
                InputActions.Instance.OnCancel += HandleCloseInput;
            }
        }

        private void OnDisable()
        {
            if (InputActions.Instance != null)
            {
                InputActions.Instance.OnSubmit -= HandleAdvanceInput;
                InputActions.Instance.OnCancel -= HandleCloseInput;
            }
        }

        private void Update()
        {
            float dt = Time.deltaTime;

            UpdateFadeTransition(dt);
            UpdateTypewriter(dt);
            UpdateContinueIndicator(dt);
        }

        #endregion

        #region Public API

        /// <summary>
        /// Show the dialogue UI with fade-in.
        /// </summary>
        public void Show()
        {
            _isVisible = true;
            _targetAlpha = 1f;
            _isTransitioning = true;

            if (_dialogueContainer != null)
            {
                _dialogueContainer.interactable = true;
                _dialogueContainer.blocksRaycasts = true;
            }

            // Disable player input during dialogue
            if (InputActions.Instance != null)
            {
                InputActions.Instance.SwitchToUIMode();
            }
        }

        /// <summary>
        /// Hide the dialogue UI with fade-out.
        /// </summary>
        public void Hide()
        {
            _isVisible = false;
            _targetAlpha = 0f;
            _isTransitioning = true;

            if (_dialogueContainer != null)
            {
                _dialogueContainer.interactable = false;
                _dialogueContainer.blocksRaycasts = false;
            }

            // Re-enable player input
            if (InputActions.Instance != null)
            {
                InputActions.Instance.SwitchToGameplayMode();
            }

            OnClose?.Invoke();
        }

        /// <summary>
        /// Set the speaker information (name, portrait, faction).
        /// </summary>
        public void SetSpeaker(string name, Sprite portrait = null, SpeakerFaction faction = SpeakerFaction.Neutral, bool isLeftSide = true)
        {
            if (_speakerNameText != null)
            {
                _speakerNameText.text = name;
            }

            if (_speakerPortrait != null)
            {
                _speakerPortrait.sprite = portrait;
                _speakerPortrait.enabled = portrait != null;

                // Position portrait
                RectTransform portraitRect = _speakerPortrait.rectTransform;
                if (isLeftSide && _portraitLeft != null)
                {
                    portraitRect.anchoredPosition = _portraitLeft.anchoredPosition;
                    portraitRect.localScale = new Vector3(1f, 1f, 1f);
                }
                else if (!isLeftSide && _portraitRight != null)
                {
                    portraitRect.anchoredPosition = _portraitRight.anchoredPosition;
                    portraitRect.localScale = new Vector3(-1f, 1f, 1f); // Flip for right side
                }
            }

            // Set name background color based on faction
            if (_speakerNameBackground != null)
            {
                _speakerNameBackground.color = faction switch
                {
                    SpeakerFaction.Kurenai => _kurenaiColor,
                    SpeakerFaction.Azure => _azureColor,
                    _ => _neutralColor
                };
            }
        }

        /// <summary>
        /// Set the dialogue text (with optional typewriter effect).
        /// </summary>
        public void SetDialogue(string text)
        {
            _fullText = text ?? string.Empty;
            _hasChoices = false;

            ClearChoices();

            if (_useTypewriter)
            {
                _visibleCharCount = 0;
                _isTyping = true;
                _skipRequested = false;
                _canAdvance = false;

                if (_dialogueText != null)
                {
                    _dialogueText.text = string.Empty;
                    _dialogueText.maxVisibleCharacters = 0;
                    _dialogueText.text = _fullText;
                }

                if (_continueIndicator != null)
                {
                    _continueIndicator.SetActive(false);
                }
            }
            else
            {
                ShowFullText();
            }
        }

        /// <summary>
        /// Set dialogue choices.
        /// </summary>
        public void SetChoices(string[] choices)
        {
            if (choices == null || choices.Length == 0)
            {
                _hasChoices = false;
                return;
            }

            _hasChoices = true;
            _canAdvance = false;

            ClearChoices();

            for (int i = 0; i < choices.Length; i++)
            {
                DialogueChoiceButton button = GetPooledButton();
                button.Setup(i, choices[i], OnChoiceButtonClicked);
                button.gameObject.SetActive(true);
                _activeChoices.Add(button);
            }

            if (_continueIndicator != null)
            {
                _continueIndicator.SetActive(false);
            }
        }

        /// <summary>
        /// Skip typewriter effect and show full text immediately.
        /// </summary>
        public void SkipTypewriter()
        {
            if (_isTyping)
            {
                _skipRequested = true;
            }
        }

        /// <summary>
        /// Advance the dialogue (skip typewriter or trigger advance event).
        /// </summary>
        public void Advance()
        {
            if (_isTyping)
            {
                SkipTypewriter();
            }
            else if (_canAdvance && !_hasChoices)
            {
                PlaySound(_advanceSound);
                OnAdvance?.Invoke();
            }
        }

        #endregion

        #region Update Methods

        private void UpdateFadeTransition(float dt)
        {
            if (!_isTransitioning || _dialogueContainer == null) return;

            float currentAlpha = _dialogueContainer.alpha;
            float newAlpha = Mathf.MoveTowards(currentAlpha, _targetAlpha, _fadeSpeed * dt);
            _dialogueContainer.alpha = newAlpha;

            if (Mathf.Approximately(newAlpha, _targetAlpha))
            {
                _isTransitioning = false;
            }
        }

        private void UpdateTypewriter(float dt)
        {
            if (!_isTyping || _dialogueText == null) return;

            if (_skipRequested)
            {
                ShowFullText();
                return;
            }

            _typewriterTimer += dt;
            float charDelay = 1f / _typewriterSpeed;

            while (_typewriterTimer >= charDelay && _visibleCharCount < _fullText.Length)
            {
                _typewriterTimer -= charDelay;
                _visibleCharCount++;
                _dialogueText.maxVisibleCharacters = _visibleCharCount;

                // Play type sound (throttled)
                if (_visibleCharCount % 2 == 0)
                {
                    PlaySound(_typeSound, 0.3f);
                }
            }

            if (_visibleCharCount >= _fullText.Length)
            {
                ShowFullText();
            }
        }

        private void UpdateContinueIndicator(float dt)
        {
            if (_continueIndicator == null || !_canAdvance || _hasChoices) return;

            _blinkTimer += dt * _continueBlinkSpeed;
            float alpha = (Mathf.Sin(_blinkTimer * Mathf.PI * 2f) + 1f) * 0.5f;

            // Apply blink effect (could use CanvasGroup or Image)
            var image = _continueIndicator.GetComponent<Image>();
            if (image != null)
            {
                Color c = image.color;
                c.a = 0.5f + alpha * 0.5f;
                image.color = c;
            }
        }

        #endregion

        #region Private Methods

        private void ShowFullText()
        {
            _isTyping = false;
            _skipRequested = false;

            if (_dialogueText != null)
            {
                _dialogueText.maxVisibleCharacters = _fullText.Length;
            }

            if (!_hasChoices)
            {
                _canAdvance = true;
                if (_continueIndicator != null)
                {
                    _continueIndicator.SetActive(true);
                }
            }
        }

        private void InitializePool()
        {
            if (_choiceButtonPrefab == null || _choiceContainer == null) return;

            for (int i = 0; i < _initialPoolSize; i++)
            {
                DialogueChoiceButton button = Instantiate(_choiceButtonPrefab, _choiceContainer);
                button.gameObject.SetActive(false);
                _choicePool.Add(button);
            }
        }

        private DialogueChoiceButton GetPooledButton()
        {
            // Find inactive button in pool
            foreach (var button in _choicePool)
            {
                if (!button.gameObject.activeInHierarchy)
                {
                    return button;
                }
            }

            // Expand pool if needed
            if (_choiceButtonPrefab != null && _choiceContainer != null)
            {
                DialogueChoiceButton newButton = Instantiate(_choiceButtonPrefab, _choiceContainer);
                _choicePool.Add(newButton);
                return newButton;
            }

            return null;
        }

        private void ClearChoices()
        {
            foreach (var button in _activeChoices)
            {
                button.gameObject.SetActive(false);
            }
            _activeChoices.Clear();
        }

        private void OnChoiceButtonClicked(int choiceIndex)
        {
            PlaySound(_choiceSound);
            ClearChoices();
            _hasChoices = false;
            OnChoiceSelected?.Invoke(choiceIndex);
        }

        private void HandleAdvanceInput()
        {
            if (_isVisible)
            {
                Advance();
            }
        }

        private void HandleCloseInput()
        {
            if (_isVisible && !_hasChoices)
            {
                Hide();
            }
        }

        private void PlaySound(AudioClip clip, float volume = 1f)
        {
            if (_audioSource != null && clip != null)
            {
                _audioSource.PlayOneShot(clip, volume);
            }
        }

        #endregion
    }

    /// <summary>
    /// Speaker faction for color coding.
    /// </summary>
    public enum SpeakerFaction
    {
        Neutral,
        Kurenai,
        Azure
    }

    /// <summary>
    /// Individual choice button for dialogue.
    /// </summary>
    public class DialogueChoiceButton : MonoBehaviour
    {
        [SerializeField] private Button _button;
        [SerializeField] private TextMeshProUGUI _text;
        [SerializeField] private Image _background;
        [SerializeField] private Color _normalColor = Color.white;
        [SerializeField] private Color _highlightColor = new Color(0.9f, 0.9f, 0.5f);

        private int _choiceIndex;
        private Action<int> _callback;

        public void Setup(int index, string text, Action<int> callback)
        {
            _choiceIndex = index;
            _callback = callback;

            if (_text != null)
            {
                _text.text = text;
            }

            if (_button != null)
            {
                _button.onClick.RemoveAllListeners();
                _button.onClick.AddListener(OnClick);
            }

            if (_background != null)
            {
                _background.color = _normalColor;
            }
        }

        private void OnClick()
        {
            _callback?.Invoke(_choiceIndex);
        }

        public void SetHighlighted(bool highlighted)
        {
            if (_background != null)
            {
                _background.color = highlighted ? _highlightColor : _normalColor;
            }
        }
    }
}
