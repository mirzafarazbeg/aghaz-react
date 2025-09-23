import React, { useState, useEffect, useRef, useCallback } from 'react';
import alphabetData from '../Data/alphabetData';
import mascotQuotes from '../Data/mascotQuotes.json';
import Confetti from 'react-confetti';
import '../Khel.css';

const TOTAL_ROUNDS = 6;

const SoundMatching = () => {
  const [gameWords, setGameWords] = useState([]);
  const [round, setRound] = useState(0);
  const [options, setOptions] = useState([]);
  const [correctWord, setCorrectWord] = useState(null);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [showMascot, setShowMascot] = useState(false);
  const [mascotQuote, setMascotQuote] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  const audioRef = useRef(null);
  const gridRef = useRef(null);

  const playSound = (file) => {
    if (!file) return;

    const path = file.startsWith('/') ? file : `/sounds/${file}`;
    const newAudio = new Audio(path);

    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setTimeout(() => {
        newAudio.play().catch(err => console.warn('🔇 Audio play failed:', err));
      }, 100);
    } else {
      newAudio.play().catch(err => console.warn('🔇 Audio play failed:', err));
    }

    audioRef.current = newAudio;
  };

  const initializeGame = () => {
    const allValidWords = [];

    alphabetData.forEach(letter => {
      letter.words?.forEach(wordObj => {
        if (wordObj.games?.includes('SoundMatching')) {
          allValidWords.push({
            word: wordObj.word,
            imageFile: wordObj.imageFile,
            soundFile: wordObj.soundFile
          });
        }
      });
    });

    const selectedWords = allValidWords.sort(() => 0.5 - Math.random()).slice(0, TOTAL_ROUNDS);
    setGameWords(selectedWords);
    setRound(0);
    setScore(0);
    setShowConfetti(false);
    setShowMascot(false);
    setMascotQuote('');
    setSelectedImage(null);
  };

  const setupRound = useCallback(() => {
    if (round >= TOTAL_ROUNDS) return;

    const current = gameWords[round];
    setCorrectWord(current);

    const others = gameWords
      .filter(w => w.word !== current.word)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    const optionSet = [...others, current].sort(() => 0.5 - Math.random());
    setOptions(optionSet);
    setSelectedImage(null);
    playSound(current.soundFile);
  }, [round, gameWords]);

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (gameWords.length === TOTAL_ROUNDS) {
      setupRound();
    }
  }, [gameWords, round, setupRound]);

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

      const cols = 2;
      const rows = 2;
      const totalGapX = gap * (cols - 1);
      const totalGapY = gap * (rows - 1);

      const hostWidth = popup ? popup.clientWidth : window.innerWidth;
      const widthAvailable = Math.max(0, hostWidth - paddingX - totalGapX);
      const widthBased = widthAvailable / cols;

      let heightAvailable;
      if (popupRect) {
        heightAvailable = popupRect.bottom - gridRect.top - paddingY;
      } else {
        heightAvailable = window.innerHeight - gridRect.top - paddingY - 24;
      }
      const heightBased = Math.max(0, heightAvailable - totalGapY) / rows;

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

  const handleChoice = (item) => {
    if (selectedImage) return;

    const isCorrect = item.word === correctWord.word;
    setSelectedImage({ word: item.word, correct: isCorrect });

    playSound(isCorrect ? 'correct.mp3' : 'wrong.mp3');
    // setMessage(isCorrect ? '✅ صحیح جواب!' : '❌ غلط!');

    setTimeout(() => {
      setMessage('');
      if (isCorrect) {
        if (round + 1 === TOTAL_ROUNDS) {
          const quote = mascotQuotes[Math.floor(Math.random() * mascotQuotes.length)];
          setMascotQuote(quote);
          setShowConfetti(true);
          setShowMascot(true);
          playSound('fanfare.mp3');
        } else {
          setRound(prev => prev + 1);
        }
      } else {
        setSelectedImage(null);
      }
    }, 1500);
  };

  const handleReplaySound = () => {
    if (correctWord?.soundFile) {
      playSound(correctWord.soundFile);
    }
  };

  const handleRestart = () => {
    initializeGame();
  };

  return (
    <div className="game-popup-content" onClick={e => e.stopPropagation()}>
      <div style={{ fontSize: '24px', textAlign: 'center', marginBottom: '10px' }}>{message}</div>

      <div style={{ position:'absolute',right:'2vmin', top:'40%',display:'grid'}}>
        <button onClick={handleReplaySound} style={{
          fontSize: '30px',
          backgroundColor: '#444',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}>🔊</button>
        <div style={{ fontSize: '18px' }}>سوال: {round + 1} / {TOTAL_ROUNDS}</div>
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1vmin',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
      }}>
        {options.map((item, idx) => (
          <div
            key={idx}
            onClick={() => handleChoice(item)}
            style={{
              border: selectedImage?.word === item.word
                ? selectedImage.correct
                  ? '4px solid green'
                  : '4px solid red'
                : '2px solid black',
              borderRadius: '12px',
              padding: '0px',
              transition: 'border 0.2s ease-in-out',
              cursor: 'pointer',
              backgroundColor: '#fff'
            }}
          >
            <img
              src={`/images/${item.imageFile}`}
              alt={item.word}
              style={{
                width: '28vw',
                height: '30vh',
                objectFit: 'cover',
                borderRadius: '8px',
                display: 'block',
                margin: '0 auto'
              }}
            />
          </div>
        ))}
      </div>

      {showMascot && (
        <div className="mascot-popup">
          <img src="/images/mascot.png" alt="Mascot" className="mascot-image" />
          <p className="mascot-quote">{mascotQuote}</p>
          <button className="replay-button" onClick={handleRestart}>دوبارہ کھیلیں</button>
        </div>
      )}

      {showConfetti && <Confetti />}
    </div>
  );
};

export default SoundMatching;
