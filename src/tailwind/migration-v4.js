/**
 * Tailwind CSS v4 Migration Helper Script
 * 
 * This script helps identify and potentially replace classes that need to be updated
 * for Tailwind CSS v4 compatibility.
 */

// Class mapping for Tailwind v4 changes
const classMapping = {
  // Shadow scale updates
  'shadow-sm': 'shadow-xs',
  'shadow': 'shadow-sm',
  'drop-shadow-sm': 'drop-shadow-xs',
  'drop-shadow': 'drop-shadow-sm',
  
  // Blur scale updates
  'blur-sm': 'blur-xs',
  'blur': 'blur-sm',
  'backdrop-blur-sm': 'backdrop-blur-xs',
  'backdrop-blur': 'backdrop-blur-sm',
  
  // Rounded scale updates
  'rounded-sm': 'rounded-xs',
  'rounded': 'rounded-sm',
  
  // Outline utilities updates
  'outline-none': 'outline-hidden',
  
  // Ring width change
  'ring': 'ring-3'
};

// Removed utilities that need to be replaced
const removedUtilities = {
  // Opacity utilities now use the slash syntax
  'bg-opacity-': (value) => `bg-black/${value}`,
  'text-opacity-': (value) => `text-black/${value}`,
  'border-opacity-': (value) => `border-black/${value}`,
  'divide-opacity-': (value) => `divide-black/${value}`,
  'ring-opacity-': (value) => `ring-black/${value}`,
  'placeholder-opacity-': (value) => `placeholder-black/${value}`,
  
  // Flex utilities are renamed
  'flex-shrink-': (value) => `shrink-${value}`,
  'flex-grow-': (value) => `grow-${value}`,
  
  // Other renamed utilities
  'overflow-ellipsis': 'text-ellipsis',
  'decoration-slice': 'box-decoration-slice',
  'decoration-clone': 'box-decoration-clone',
};

// Helper function to check a class against the mapping and return the v4 equivalent
function getMigratedClass(className) {
  // Direct mapping check
  if (classMapping[className]) {
    return {
      original: className,
      updated: classMapping[className],
      type: 'direct'
    };
  }
  
  // Check for removed utilities that use patterns
  for (const [prefix, replacementFn] of Object.entries(removedUtilities)) {
    if (className.startsWith(prefix)) {
      const value = className.substring(prefix.length);
      return {
        original: className,
        updated: replacementFn(value),
        type: 'pattern'
      };
    }
  }
  
  // No changes needed
  return null;
}

// Example usage
// const classesToCheck = 'shadow-sm p-4 text-opacity-50 outline-none';
// const classes = classesToCheck.split(' ');
// const updates = classes
//   .map(getMigratedClass)
//   .filter(update => update !== null);

// console.log('Classes that need updating:', updates);
// console.log('Updated class string:', classes
//   .map(cls => getMigratedClass(cls)?.updated || cls)
//   .join(' '));

export { getMigratedClass, classMapping, removedUtilities };
