import mascotQuotes from '../Data/mascotQuotes.json';
import alphabetData from '../Data/alphabetData';

/**
 * Returns a random mascot quote string.
 * Single source of truth — replaces the 6 inline copies across components.
 */
export const getRandomQuote = () =>
  mascotQuotes[Math.floor(Math.random() * mascotQuotes.length)];

/**
 * Filters alphabetData to words tagged for a specific game.
 * Returns an array of full word objects (word, imageFile, soundFile, icon, etc.)
 *
 * @param {string} gameName - Must match the string used in the 'games' array in alphabetData
 */
export const filterGameWords = (gameName) => {
  const results = [];
  alphabetData.forEach(letter => {
    letter.words?.forEach(wordObj => {
      if (wordObj.games?.includes(gameName)) {
        results.push(wordObj);
      }
    });
  });
  return results;
};
