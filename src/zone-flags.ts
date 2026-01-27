/**
 * Prevents Angular change detection from
 * running with certain Web Component callbacks
 */
type ZoneWindow = Window & {
  // eslint-disable-next-line no-underscore-dangle
  __Zone_disable_customElements?: boolean;
};

(window as ZoneWindow).__Zone_disable_customElements = true;
