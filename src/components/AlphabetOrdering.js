import React, { useState, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import Confetti from 'react-confetti';
import alphabetData from '../Data/alphabetData';
import mascotQuotes from '../Data/mascotQuotes.json';

const UrduAlphabet = alphabetData.map(l => l.harf).filter(Boolean);

const DraggableLetter = ({ letter, moveLetter }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'LETTER',
    item: { letter },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }), [letter]);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'LETTER',
    drop: (dragged) => moveLetter(dragged.letter, letter),
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  }), [letter]);

  return (
    <div
      ref={node => drag(drop(node))}
      className="letter-card"
      style={{
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: isOver ? '#f0f8ff' : '#fff'
      }}
    >
      {letter}
    </div>
  );
};

function AlphabetOrdering() {
  const [shuffled, setShuffled] = useState([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [quote, setQuote] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const subset = [...UrduAlphabet].sort(() => 0.5 - Math.random()).slice(0, 6);
    setShuffled(subset);
  }, []);

  const moveLetter = (fromLetter, toLetter) => {
    const fromIdx = shuffled.indexOf(fromLetter);
    const toIdx = shuffled.indexOf(toLetter);
    if (fromIdx === -1 || toIdx === -1) return;

    const updated = [...shuffled];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    setShuffled(updated);

    const original = [...updated].sort((a, b) => UrduAlphabet.indexOf(a) - UrduAlphabet.indexOf(b));
    const success = updated.every((val, i) => val === original[i]);

    if (success) {
      setIsCorrect(true);
      setQuote(mascotQuotes[Math.floor(Math.random() * mascotQuotes.length)]);
      setShowConfetti(true);
      new Audio('/sounds/fanfare.mp3').play();
    }
  };

  return (
    <div className="popup">
      <h2>ترتیب دیں: حروفِ تہجی</h2>
      <div className="letter-grid">
        {shuffled.map((letter, idx) => (
          <DraggableLetter
            key={letter + idx}
            letter={letter}
            moveLetter={moveLetter}
          />
        ))}
      </div>

      {isCorrect && (
        <div className="mascot-quote">
          <div className="mascot-bubble">🌟 {quote}</div>
          <img src="/images/mascot.png" alt="Mascot" className="mascot" />
        </div>
      )}
      {showConfetti && <Confetti />}

      <style>{`
        .letter-grid {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          margin: 20px 0;
        }
        .letter-card {
          width: 60px;
          height: 60px;
          border: 2px solid #ccc;
          margin: 10px;
          font-size: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          font-family: 'Jameel Noori Nastaleeq', serif;
          cursor: move;
          transition: all 0.2s;
        }
        .mascot-quote {
          margin-top: 20px;
          text-align: center;
        }
        .mascot-bubble {
          background: #fff3cd;
          border: 2px solid #ffc107;
          border-radius: 10px;
          padding: 10px 20px;
          display: inline-block;
          margin-bottom: 10px;
        }
        .mascot {
          width: 100px;
        }
      `}</style>
    </div>
  );
}

export default AlphabetOrdering;
