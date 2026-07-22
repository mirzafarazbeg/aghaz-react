/**
 * Returns a new array with elements in random order.
 * Uses the Fisher-Yates-inspired sort approach.
 */
export const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);
