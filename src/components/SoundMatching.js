import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../Khel.css';
import Confetti from 'react-confetti';
import { shuffleArray } from '../utils/shuffle';
import { filterGameWords } from '../utils/gameUtils';
import { useAudio } from '../hooks/useAudio';
import { useCelebration } from '../hooks/useCelebration';

const TOTAL_ROUNDS = 6;

const SoundMatching = () => {
  const [gameWords, setGameWords]       = useState([]);
  const [round, setRound]               = useState(0);
  const [options, setOptions]           = useState([]);
  const [correctWord, setCorrectWord]   = useState(null);
  const [score, setScore]               = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);

  const gridRef = useRef(null);
  const { play } = useAudio();
  const { showConfetti, showMascot, mascotQuote, celebrate, reset: resetCelebration } = useCelebration();

  const initializeGame = useCallback(() => {
    const selected = shuffleArray(filterGameWords('SoundMatching')).slice(0, TOTAL_ROUNDS);
    setGameWords(selected);
    setRound(0);
    setScore(0);
    setSelectedImage(null);
    resetCelebration();
  }, [resetCelebration]);

  const setupRound = useCallback(() => {
    if (round >= TOTAL_ROUNDS || gameWords.length === 0) return;
    const current = gameWords[round];
    setCorrectWord(current);
    const others = gameWords
      .filter(w => w.word !== current.word)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    setOptions(shuffleArray([...others, current]));
    setSelectedImage(null);
    play(current.soundFile);
  }, [round, gameWords, play]);

  useEffect(() => { initializeGame(); }, [initializeGame]);

  useEffect(() => {
    if (gameWords.length === TOTAL_ROUNDS) setupRound();
  }, [gameWords, round, setupRound]);

  // Responsive card sizing — kept intact as it's well-written
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const computeSize = () => {
      const popup = grid.closest('.game-popup-content');
      const popupRect = popup ? popup.getBoundingClientRect() : null;
      const gridRect = grid.getBoundingClientRect();
      const styles = getComputedStyle(grid);
      const gap = parseFloat(styles.gap || styles.rowGap || '0');
      const paddingX = parseFloat(styles.paddingLeft || '0') + parseFloat(styles.paddingRight || '0');
      const paddingY = parseFloat(styles.paddingTop || '0') + parseFloat(styles.paddingBottom || '0');
      const cols = 2, rows = 2;
      const hostWidth = popup ? popup.clientWidth : window.innerWidth;
      const widthAvailable = Math.max(0, hostWidth - paddingX - gap * (cols - 1));
      const widthBased = widthAvailable / cols;
      let heightAvailable;
      if (popupRect) {
        heightAvailable = popupRect.bottom - gridRect.top - paddingY;
      } else {
        heightAvailable = window.innerHeight - gridRect.top - paddingY - 24;
      }
      const heightBased = Math.max(0, heightAvailable - gap * (rows - 1)) / rows;
      const card = Math.max(100, Math.min(widthBased, heightBased));
      grid.style.setProperty('--sm-card', `${card}px`);
    };

    computeSize();
    const raf = requestAnimationFrame(() => requestAnimationFrame(computeSize));
    const t1 = setTimeout(computeSize, 250);
    const t2 = setTimeout(computeSize, 600);
    window.addEventListener('resize', computeSize);
    window.addEventListener('orientationchange', computeSize);
    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(computeSize);
      ro.observe(grid);
      const popup = grid.closest('.game-popup-content');
      if (popup) ro.observe(popup);
    }
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', computeSize);
      window.removeEventListener('orientationchange', computeSize);
      if (ro) ro.disconnect();
    };
  }, []);

  const handleChoice = useCallback((item) => {
    if (selectedImage) return;
    const isCorrect = item.word === correctWord.word;
    setSelectedImage({ word: item.word, correct: isCorrect });
    play(isCorrect ? 'correct.mp3' : 'wrong.mp3');

    setTimeout(() => {
      if (isCorrect) {
        if (round + 1 === TOTAL_ROUNDS) {
          setScore(s => s + 1);
          celebrate();
        } else {
          setScore(s => s + 1);
          setRound(prev => prev + 1);
        }
      } else {
        setSelectedImage(null);
      }
    }, 1500);
  }, [selectedImage, correctWord, round, play, celebrate]);

  const handleReplaySound = useCallback(() => {
    if (correctWord?.soundFile) play(correctWord.soundFile);
  }, [correctWord, play]);

  return (
    <div className="game-popup-content" onClick={e => e.stopPropagation()}>
      <div style={{ position: 'absolute', right: '2vmin', top: '40%', display: 'grid' }}>
        <button
          onClick={handleReplaySound}
          aria-label="آواز دوبارہ سنیں"
          style={{ fontSize: '30px', backgroundColor: '#444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
        >🔊</button>
        <div style={{ fontSize: '18px' }}>سوال: {round + 1} / {TOTAL_ROUNDS}</div>
      </div>

      <div ref={gridRef} style={{ display: 'flex', flexWrap: 'wrap', gap: '1vmin', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
        {options.map((item, idx) => (
          <div
            key={idx}
            onClick={() => handleChoice(item)}
            style={{
              border: selectedImage?.word === item.word
                ? (selectedImage.correct ? '4px solid green' : '4px solid red')
                : '2px solid black',
              borderRadius: '12px',
              padding: '0px',
              transition: 'border 0.2s ease-in-out',
              cursor: 'pointer',
              backgroundColor: '#fff',
            }}
          >
            <img
              src={`/images/${item.imageFile}`}
              alt={item.word}
              loading="lazy"
              style={{ width: '28vw', height: '30vh', objectFit: 'cover', borderRadius: '8px', display: 'block', margin: '0 auto' }}
            />
          </div>
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

export default SoundMatching;
