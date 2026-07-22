import { useState, useCallback } from 'react';
import { filterGameWords } from '../utils/gameUtils';
import { shuffleArray } from '../utils/shuffle';

/**
 * Returns a shuffled subset of words tagged for a specific game,
 * and a reinitialize function to get a fresh random set on restart.
 *
 * Usage:
 *   const [words, reshuffleWords] = useGameWords('WordMatching', 6);
 *
 * @param {string} gameName - Game name to filter by (matches alphabetData 'games' array)
 * @param {number} count    - Number of words to return (default: 6)
 */
export function useGameWords(gameName, count = 6) {
  const getWords = useCallback(
    () => shuffleArray(filterGameWords(gameName)).slice(0, count),
    [gameName, count]
  );

  const [words, setWords] = useState(getWords);

  const reinitialize = useCallback(() => {
    setWords(getWords());
  }, [getWords]);

  return [words, reinitialize];
}
