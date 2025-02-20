/**
 * A map of feature toggle flags.
 * @type {FeatureToggles}
 */
// get value from query string
function getFromQueryParams(key: string) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("flags")?.includes(key);
}

export const FEATURE_TOGGLES: { [key: string]: boolean } = {
  dnd: getFromQueryParams("dnd"),
};
