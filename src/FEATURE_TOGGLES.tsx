/**
 * An object containing feature toggle flags.
 * @typedef {Object.<string, boolean>} FeatureToggles
 */

/**
 * A map of feature toggle flags.
 * @type {FeatureToggles}
 */
// get value from query string
function getDNDSupport() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has("dnd");
}

export const FEATURE_TOGGLES: { [key: string]: boolean } = {
  dnd: getDNDSupport(),
};
