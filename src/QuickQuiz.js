import React, { useState, useMemo, useCallback, useEffect } from 'react';
import '../WordMatching.css';
import { useDrag, useDrop } from 'react-dnd';
import Confetti from 'react-confetti';
import { shuffleArray } from '../utils/shuffle';
import { playSound } from '../utils/audio';
import { useGameWords } from '../hooks/useGameWords';
import { useCelebration } from '../hooks/useCelebration';

const normalize = (str) => str?.trim().normalize('NFC');

const WordCard = React.memo(function WordCard({ word }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'WORD',
    item: () => ({ word }),
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }), [word]);

  return (
    <div ref={drag} className="word-card" style={{ opacity: isDragging ? 0.5 : 1 }}>
      {word}
    </div>
  );
});

const ImageCard = React.memo(function ImageCard({ item, onDrop }) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'WORD',
    drop: (dragged) => onDrop(dragged.word, item.word),
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  }), [item, onDrop]);

  return (
    <div ref={drop} className={`image-card ${isOver ? 'hover' : ''}`}>
      <img
        src={`/images/${item.imageFile}`}
        alt={item.word}
        draggable={false}
        loading="lazy"
      />
    </div>
  );
});

function WordMatching() {
  const [baseWords, reshuffleWords] = useGameWords('WordMatching', 6);
  const [matched, setMatched] = useState([]);
  const [message, setMessage] = useState('');
  const [score, setScore] = useState(0);
  const { showConfetti, showMascot, mascotQuote, celebrate, reset: resetCelebration } = useCelebration();

  const shuffledImages = useMemo(() => shuffleArray(baseWords), [baseWords]);
  const shuffledWords  = useMemo(() => shuffleArray(baseWords), [baseWords]);

  useEffect(() => {
    if (!message) return;
    const id = setTimeout(() => setMessage(''), 1500);
    return () => clearTimeout(id);
  }, [message]);

  const initGame = useCallback(() => {
    reshuffleWords();
    setMatched([]);
    setScore(0);
    setMessage('');
    resetCelebration();
  }, [reshuffleWords, resetCelebration]);

  const handleDrop = useCallback((draggedWord, targetWord) => {
    const cleanDragged = normalize(draggedWord);
    const cleanTarget  = normalize(targetWord);
    const isCorrect    = cleanDragged === cleanTarget;

    setMatched(prev => {
      if (prev.includes(cleanTarget)) return prev;
      if (isCorrect) {
        const updated = [...prev, cleanTarget];
        setScore(s => s + 1);
        setMessage('✅ صحیح!');
        playSound('correct.mp3');
        if (updated.length === 6) celebrate();
        return updated;
      }
      setMessage('❌ غلط!');
      playSound('wrong.mp3');
      return prev;
    });
  }, [celebrate]);

  return (
    <div className="wm-container">
      <p>ملاؤ لفظ اور تصویر</p>

      <div style={{
        position: 'absolute', top: '10px', left: '10px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: '10px 15px', borderRadius: '8px', zIndex: 10,
      }}>
        اسکور: {score}/6 {message}
        {showMascot && (
          <button className="restart-button" onClick={initGame}>🔄 دوبارہ کھیلیں</button>
        )}
      </div>

      <div className="wm-grid">
        {shuffledWords
          .filter(item => !matched.includes(normalize(item.word)))
          .map(item => (
            <WordCard key={item.word + '-word'} word={item.word} />
          ))}
        {shuffledImages
          .filter(item => !matched.includes(normalize(item.word)))
          .map(item => (
            <ImageCard key={item.word + '-img'} item={item} onDrop={handleDrop} />
          ))}
      </div>

      {showMascot && (
        <div className="mascot-quote">
          <div className="mascot-bubble">🌟 {mascotQuote}</div>
          <img src="/images/mascot.png" alt="Mascot" className="mascot" />
        </div>
      )}

      {showConfetti && <Confetti />}
    </div>
  );
}

export default WordMatching;
