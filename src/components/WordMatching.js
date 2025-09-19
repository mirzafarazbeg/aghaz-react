import React, { useState, useEffect, useCallback } from 'react';
import '../WordMatching.css';
import alphabetData from '../Data/alphabetData';
import mascotQuotes from '../Data/mascotQuotes.json';
import Confetti from 'react-confetti';
import { useDrag, useDrop } from 'react-dnd';

const normalize = (str) => str?.trim().normalize('NFC');

const playSound = (type) => {
  const file =
    type === 'correct'
      ? '/sounds/correct.mp3'
      : type === 'wrong'
      ? '/sounds/wrong.mp3'
      : '/sounds/fanfare.mp3';
  const audio = new Audio(file);
  audio.play();
};

function WordCard({ word }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'WORD',
    item: () => ({ word }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [word]);

  return (
    <div ref={drag} className="word-card" style={{ opacity: isDragging ? 0.5 : 1 }}>
      {word}
    </div>
  );
}

function ImageCard({ item, onDrop }) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'WORD',
    drop: (dragged) => onDrop(dragged.word, item.word),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div ref={drop} className={`image-card ${isOver ? 'hover' : ''}`}>
      <img src={`/images/${item.imageFile}`} alt={item.word} draggable={false} />
    </div>
  );
}

function WordMatching() {
  const [shuffledImages, setShuffledImages] = useState([]);
  const [shuffledWords, setShuffledWords] = useState([]);
  const [matched, setMatched] = useState([]);
  const [message, setMessage] = useState('');
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [quote, setQuote] = useState('');
  const [confetti, setConfetti] = useState(false);

  const extractGameWords = () => {
    const validWords = [];

    alphabetData.forEach(letter => {
      letter.words?.forEach(wordObj => {
        if (wordObj.games?.includes('WordMatching')) {
          validWords.push({
            word: normalize(wordObj.word),
            imageFile: wordObj.imageFile,
          });
        }
      });
    });

    return validWords;
  };

  const initGame = useCallback(() => {
    const allValid = extractGameWords();
    const base = allValid
      .sort(() => 0.5 - Math.random())
      .slice(0, 6);

    setShuffledImages([...base].sort(() => 0.5 - Math.random()));
    setShuffledWords([...base].sort(() => 0.5 - Math.random()));
    setMatched([]);
    setScore(0);
    setMessage('');
    setStartTime(Date.now());
    setEndTime(null);
    setQuote('');
    setConfetti(false);

    console.clear();
    console.log("🎯 New Game Started:");
    base.forEach((item, i) => {
      console.log(`Item ${i + 1}: ${item.word} (${item.imageFile})`);
    });
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleDrop = (draggedWord, targetWord) => {
    const cleanDragged = normalize(draggedWord);
    const cleanTarget = normalize(targetWord);

    const isCorrect = cleanDragged === cleanTarget;

    setMatched(prev => {
      const alreadyMatched = prev.includes(cleanTarget);

      if (isCorrect && !alreadyMatched) {
        const updated = [...prev, cleanTarget];
        setScore(s => s + 1);
        setMessage(':✅ صحیح!');
        playSound('correct');

        const timestamp = new Date().toLocaleTimeString();
        console.log(`✔️ MATCHED at ${timestamp}`);
        console.log('  Dragged:', cleanDragged);
        console.log('  Target :', cleanTarget);
        console.log('  Matched:', updated);

        if (updated.length === 6) {
          const finishTime = Date.now();
          const duration = Math.floor((finishTime - startTime) / 1000);
          setEndTime(finishTime);
          const quote = mascotQuotes[Math.floor(Math.random() * mascotQuotes.length)];
          setQuote(quote);
          setConfetti(true);
          playSound('fanfare');
          console.log(`🎉 Game Complete! Time taken: ${duration} seconds`);
        }

        return updated;
      }

      if (!isCorrect) {
        setMessage(':❌ غلط!');
        playSound('wrong');
        console.log('❌ NO MATCH');
        console.log('  Dragged:', cleanDragged);
        console.log('  Target :', cleanTarget);
        console.log('  Matched:', prev);
      }

      return prev;
    });

    setTimeout(() => setMessage(''), 1500);
  };

  const secondsElapsed = endTime
    ? Math.floor((endTime - startTime) / 1000)
    : Math.floor((Date.now() - startTime) / 1000);

  return (
    <div className="wm-container">
     <p>ملاؤ لفظ اور تصویر</p>
      


      <div 
            style={{
      position: 'absolute',
      top: '10px',        // adjust vertical position
      left: '10px',     // distance from right
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      padding: '10px 15px',
      borderRadius: '8px',
      zIndex: 10,
      // width or max-width if needed
    }}
>
        Score➡️{score/2}/6{message}
      {quote && (          <button className="restart-button" onClick={initGame}>🔄 دوبارہ کھیلیں</button>
)}
      </div>

      <div className="wm-grid">
        {shuffledWords
          .filter(item => !matched.includes(item.word))
          .map((item) => (
            <WordCard key={item.word + '-word'} word={item.word} />
          ))}
        {shuffledImages
          .filter(item => !matched.includes(item.word))
          .map((item) => (
            <ImageCard key={item.word + '-img'} item={item} onDrop={handleDrop} />
          ))}
      </div>

      {quote && (
        <div className="mascot-quote">
          <div className="mascot-bubble">🌟 {quote}</div>
          <img src="/images/mascot.png" alt="Mascot" className="mascot" />
        </div>
      )}

      {confetti && <Confetti />}
    </div>
  );
}

export default WordMatching;
