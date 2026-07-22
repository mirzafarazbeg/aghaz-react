import { useState, useCallback } from 'react';
import { getRandomQuote } from '../utils/gameUtils';
import { playSound } from '../utils/audio';

/**
 * Manages the end-of-game celebration state shared by all games:
 * confetti, mascot popup, and a random quote.
 *
 * Usage:
 *   const { showConfetti, showMascot, mascotQuote, celebrate, reset } = useCelebration();
 *   // Call celebrate() when the player wins.
 *   // Call reset() when restarting the game.
 */
export function useCelebration() {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showMascot, setShowMascot] = useState(false);
  const [mascotQuote, setMascotQuote] = useState('');

  const celebrate = useCallback(() => {
    setMascotQuote(getRandomQuote());
    setShowConfetti(true);
    playSound('fanfare.mp3');
    setTimeout(() => setShowMascot(true), 500);
    setTimeout(() => setShowConfetti(false), 5000);
  }, []);

  const reset = useCallback(() => {
    setShowConfetti(false);
    setShowMascot(false);
    setMascotQuote('');
  }, []);

  return { showConfetti, showMascot, mascotQuote, celebrate, reset };
}
