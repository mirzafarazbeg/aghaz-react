import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../MemoryGame.css';
import Confetti from 'react-confetti';
// NOTE: wildcard imports are needed here because icons are data-driven from alphabetData.
// To optimize bundle size, audit alphabetData.js and replace with named imports.
import * as FaIcons from 'react-icons/fa';
import * as GiIcons from 'react-icons/gi';
import * as MdIcons from 'react-icons/md';
import * as BsIcons from 'react-icons/bs';
import { shuffleArray } from '../utils/shuffle';
import { filterGameWords } from '../utils/gameUtils';
import { useCelebration } from '../hooks/useCelebration';

// Built once at module level — not recreated on every render
const iconMap = { ...FaIcons, ...GiIcons, ...MdIcons, ...BsIcons };

const MemoryCard = React.memo(function MemoryCard({ card, isFlipped, onClick }) {
  return (
    <div
      className={`memory-card ${isFlipped ? 'flipped' : ''}`}
      onClick={() => onClick(card)}
    >
      {isFlipped && (
        card.type === 'cue' ? (
          <div className="cue-card">
            {card.icon && iconMap[card.icon] && (
              <div className="cue-icon">
                {React.createElement(iconMap[card.icon], { size: 36 })}
              </div>
            )}
            <div className="cue-text">{card.text}</div>
          </div>
        ) : (
          <div className="card-text">{card.text}</div>
        )
      )}
    </div>
  );
});

const MemoryGame = ({ onClose }) => {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);

  const timeoutRef  = useRef(null);
  const audioCache  = useRef({});
  const { showConfetti, showMascot, mascotQuote, celebrate, reset: resetCelebration } = useCelebration();

  const initializeGame = useCallback(() => {
    const allWords = filterGameWords('MemoryGame')
      .filter(w => w.icon)
      .map(w => ({
        word: w.word,
        disjointed: [...w.word].join(' '),
        icon: w.icon,
        soundFile: w.soundFile || null,
      }));

    const selected = shuffleArray(allWords).slice(0, 6);

    const pairedCards = selected.flatMap(item => [
      { type: 'cue',    word: item.word, id: `${item.word}-cue`,    icon: item.icon, text: item.disjointed, soundFile: item.soundFile },
      { type: 'answer', word: item.word, id: `${item.word}-answer`,                  text: item.word,       soundFile: item.soundFile },
    ]);

    setCards(shuffleArray(pairedCards));
    setFlippedCards([]);
    setMatchedPairs([]);
    setScore(0);
    setMoves(0);
    resetCelebration();

    // Preload audio files
    audioCache.current = {};
    selected.forEach(item => {
      if (item.soundFile) {
        const path = `/sounds/${item.soundFile}`;
        const audio = new Audio(path);
        audio.onerror = () => console.warn(`Sound not found: ${path}`);
        audioCache.current[path] = audio;
      }
    });
  }, [resetCelebration]);

  useEffect(() => {
    initializeGame();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [initializeGame]);

  // Trigger celebration when all pairs are matched
  useEffect(() => {
    if (cards.length > 0 && matchedPairs.length === cards.length) {
      celebrate();
    }
  }, [matchedPairs.length, cards.length, celebrate]);

  const playCardSound = useCallback((file) => {
    if (!file) return;
    if (file === 'correct.mp3') {
      new Audio('/sounds/correct.mp3').play().catch(() => {});
      return;
    }
    const path = `/sounds/${file}`;
    const audio = audioCache.current[path];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  }, []);

  const handleClick = useCallback((card) => {
    if (flippedCards.length === 2 || flippedCards.some(c => c.id === card.id)) return;

    if (card.type === 'cue' && card.soundFile) playCardSound(card.soundFile);

    const newFlipped = [...flippedCards, card];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = newFlipped;
      if (a.word === b.word && a.type !== b.type) {
        setMatchedPairs(mp => [...mp, a.id, b.id]);
        setScore(s => s + 1);
        playCardSound('correct.mp3');
        if (card.soundFile) playCardSound(card.soundFile);
      }
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setFlippedCards([]), 1000);
    }
  }, [flippedCards, playCardSound]);

  return (
    <div className="game-popup-content" onClick={e => e.stopPropagation()}>
      <h2 className="memory-title">یادداشت کا کھیل</h2>

      <div className="memory-score-card">
        <span>اسکور: {score}</span>
        <span>چالیں: {moves}</span>
      </div>

      <div className="memory-grid">
        {cards.map(card => (
          <MemoryCard
            key={card.id}
            card={card}
            isFlipped={flippedCards.some(c => c.id === card.id) || matchedPairs.includes(card.id)}
            onClick={handleClick}
          />
        ))}
      </div>

      {showMascot && (
        <div className="mascot-popup">
          <img src="/images/mascot.png" alt="Mascot" className="mascot-image" />
          <p className="mascot-quote">{mascotQuote}</p>
          <button className="replay-button" onClick={initializeGame}>دوبارہ کھیلیں</button>
        </div>
      )}

      {showConfetti && <Confetti />}
    </div>
  );
};

export default MemoryGame;
