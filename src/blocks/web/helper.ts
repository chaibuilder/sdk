export const addForcedClasses = (styles, forcedClasses) => {
  return {
    ...styles,
    className: `${styles.className} ${forcedClasses}`,
  };
};
