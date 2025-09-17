import React, { useState, useEffect, useRef } from 'react';
import '../MemoryGame.css';
import alphabetData from '../Data/alphabetData';
import mascotQuotes from '../Data/mascotQuotes.json';
import Confetti from 'react-confetti';
import * as FaIcons from 'react-icons/fa';
import * as GiIcons from 'react-icons/gi';
import * as MdIcons from 'react-icons/md';
import * as BsIcons from 'react-icons/bs';

const iconMap = { ...FaIcons, ...GiIcons, ...MdIcons, ...BsIcons };
const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

const MemoryGame = ({ onClose }) => {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showMascot, setShowMascot] = useState(false);
  const [mascotQuote, setMascotQuote] = useState('');
  const [activeAudio, setActiveAudio] = useState(null);
  const audioCache = useRef({});

  const playSound = (file) => {
    if (file === 'correct.mp3') {
      new Audio('/sounds/correct.mp3').play();
      return;
    }

    const path = `/sounds/${file}`;
    const audio = audioCache.current[path];

    if (audio && (!activeAudio || activeAudio.paused)) {
      setActiveAudio(audio);
      audio.currentTime = 0;
      audio.play();
      audio.addEventListener('ended', () => setActiveAudio(null), { once: true });
    }
  };

  // const initializeGame = () => {
  //   const allWords = alphabetData.flatMap(letter =>
  //     letter.words
  //       .filter(word => word.icon && word.games?.includes('MemoryGame'))
  //       .map(word => ({
  //         word: word.word,
  //         disjointed: [...word.word].join(' '),
  //         icon: word.icon || null,
  //         soundFile: word.soundFile || null
  //       }))
  //   );

  //   const selected = shuffleArray(allWords).slice(0, 6);

  //   const pairedCards = selected.flatMap(item => [
  //     {
  //       type: 'cue',
  //       word: item.word,
  //       id: `${item.word}-cue`,
  //       icon: item.icon,
  //       text: item.disjointed,
  //       soundFile: item.soundFile
  //     },
  //     {
  //       type: 'answer',
  //       word: item.word,
  //       id: `${item.word}-answer`,
  //       text: item.word,
  //       soundFile: item.soundFile
  //     }
  //   ]);

  //   setCards(shuffleArray(pairedCards));
  //   setFlippedCards([]);
  //   setMatchedPairs([]);
  //   setScore(0);
  //   setMoves(0);
  //   setShowMascot(false);
  //   setMascotQuote('');
  //   setShowConfetti(false);
  //   setActiveAudio(null);

  //   // 🔊 Preload audio
  //   audioCache.current = {};
  //   selected.forEach(item => {
  //     const path = `/sounds/${item.soundFile}`;
  //     if (item.soundFile && !audioCache.current[path]) {
  //       const audio = new Audio(path);
  //       audioCache.current[path] = audio;
  //     }
  //   });
  // };

const initializeGame = () => {
  const allWords = alphabetData.flatMap(letter =>
    letter.words
      .filter(word => word.icon && word.games?.includes('MemoryGame'))
      .map(word => ({
        word: word.word,
        disjointed: [...word.word].join(' '),
        icon: word.icon || null,
        soundFile: word.soundFile || null
      }))
  );

  const selected = shuffleArray(allWords).slice(0, 6);

  const pairedCards = selected.flatMap(item => [
    {
      type: 'cue',
      word: item.word,
      id: `${item.word}-cue`,
      icon: item.icon,
      text: item.disjointed,
      soundFile: item.soundFile
    },
    {
      type: 'answer',
      word: item.word,
      id: `${item.word}-answer`,
      text: item.word,
      soundFile: item.soundFile
    }
  ]);

  setCards(shuffleArray(pairedCards));
  setFlippedCards([]);
  setMatchedPairs([]);
  setScore(0);
  setMoves(0);
  setShowMascot(false);
  setMascotQuote('');
  setShowConfetti(false);
  setActiveAudio(null);

  // 🔊 Rebuild audio cache with valid sound files
  audioCache.current = {};
  selected.forEach(item => {
    if (item.soundFile && typeof item.soundFile === 'string') {
      const path = `/sounds/${item.soundFile}`;
      const audio = new Audio(path);

      audio.onerror = () => {
        console.warn(`⚠️ Sound file not found: ${path}`);
      };

      audioCache.current[path] = audio;
    }
  });
};

useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (matchedPairs.length > 0 && matchedPairs.length === cards.length) {
      triggerCelebration();
    }
  }, [matchedPairs, cards.length]);

  const triggerCelebration = () => {
    const quote = mascotQuotes[Math.floor(Math.random() * mascotQuotes.length)];
    setMascotQuote(quote);
    setTimeout(() => {
      setShowMascot(true);
      setShowConfetti(true);
      new Audio('/sounds/fanfare.mp3').play();
    }, 500);
    setTimeout(() => setShowConfetti(false), 5000);
  };

  const handleClick = (card) => {
    if (flippedCards.length === 2 || flippedCards.some(c => c.id === card.id)) return;

    if (card.type === 'cue' && card.soundFile) {
      playSound(card.soundFile);
    }

    const newFlipped = [...flippedCards, card];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      if (
        newFlipped[0].word === newFlipped[1].word &&
        newFlipped[0].type !== newFlipped[1].type
      ) {
        const newMatched = [...matchedPairs, newFlipped[0].id, newFlipped[1].id];
        setMatchedPairs(newMatched);
        setScore(prev => prev + 1);

        if (card.soundFile) playSound(card.soundFile);
        playSound('correct.mp3');
      }
      setTimeout(() => setFlippedCards([]), 1000);
    }
  };

  const isFlipped = (card) =>
    flippedCards.some(c => c.id === card.id) || matchedPairs.includes(card.id);

  const renderCard = (card) => {
    const flipped = isFlipped(card);
    return (
      <div
        key={card.id}
        className={`memory-card ${flipped ? 'flipped' : ''}`}
        onClick={() => handleClick(card)}
      >
        {flipped && (
          <>
            {card.type === 'cue' ? (
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
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="game-popup-content" onClick={(e) => e.stopPropagation()}>
      <h2 className="memory-title">یادداشت کا کھیل</h2>

      <div className="memory-score-card">
        <span>اسکور: {score}</span>
        <span>چالیں: {moves}</span>
      </div>

      <div className="memory-grid">
        {cards.map(renderCard)}
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
