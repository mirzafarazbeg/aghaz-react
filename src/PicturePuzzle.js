import React, { useState, useEffect, useCallback } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import Confetti from 'react-confetti';
import alphabetData from '../Data/alphabetData';
import { playSound } from '../utils/audio';
import { useCelebration } from '../hooks/useCelebration';
import { shuffleArray } from '../utils/shuffle';

// Derived once at module level — no need to recompute each render
const UrduAlphabet = alphabetData
  .filter(letter => !letter.isCompound)
  .map(l => l.harf)
  .filter(Boolean);

const DraggableLetter = React.memo(function DraggableLetter({ letter, moveLetter }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'LETTER',
    item: { letter },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }), [letter]);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'LETTER',
    drop: (dragged) => moveLetter(dragged.letter, letter),
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  }), [letter, moveLetter]);

  return (
    <div
      ref={node => drag(drop(node))}
      className="letter-card"
      style={{ opacity: isDragging ? 0.5 : 1, backgroundColor: isOver ? '#f0f8ff' : '#fff' }}
    >
      {letter}
    </div>
  );
});

function AlphabetOrdering() {
  const [shuffled, setShuffled] = useState([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const { showConfetti, mascotQuote, showMascot, celebrate, reset: resetCelebration } = useCelebration();

  const initGame = useCallback(() => {
    setShuffled(shuffleArray(UrduAlphabet).slice(0, 6));
    setIsCorrect(false);
    resetCelebration();
  }, [resetCelebration]);

  useEffect(() => { initGame(); }, [initGame]);

  const moveLetter = useCallback((fromLetter, toLetter) => {
    setShuffled(prev => {
      const fromIdx = prev.indexOf(fromLetter);
      const toIdx   = prev.indexOf(toLetter);
      if (fromIdx === -1 || toIdx === -1) return prev;

      const updated = [...prev];
      const [moved] = updated.splice(fromIdx, 1);
      updated.splice(toIdx, 0, moved);

      const original = [...updated].sort((a, b) => UrduAlphabet.indexOf(a) - UrduAlphabet.indexOf(b));
      const success  = updated.every((val, i) => val === original[i]);

      if (success) {
        setIsCorrect(true);
        celebrate();
        playSound('fanfare.mp3');
      }

      return updated;
    });
  }, [celebrate]);

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

      {showMascot && (
        <div className="mascot-quote">
          <div className="mascot-bubble">🌟 {mascotQuote}</div>
          <img src="/images/mascot.png" alt="Mascot" className="mascot" />
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
            <button
              type="button"
              onClick={initGame}
              style={{ padding: '8px 18px', backgroundColor: '#444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
            >
              {/* Fixed: was "Play Again" — now consistently in Urdu */}
              دوبارہ کھیلیں
            </button>
          </div>
        </div>
      )}

      {showConfetti && <Confetti />}

      <style>{`
        .popup { height: 90vh; }
        .letter-grid { display: flex; justify-content: center; flex-wrap: wrap; margin: 20px 0; }
        .letter-card {
          width: 60px; height: 60px; border: 2px solid #ccc; margin: 10px;
          font-size: 30px; display: flex; align-items: center; justify-content: center;
          border-radius: 10px; font-family: 'Jameel Noori Nastaleeq', serif;
          cursor: move; transition: all 0.2s;
        }
        .mascot-quote {
          margin-top: 0; text-align: center; position: absolute;
          top: 50%; left: 50%; transform: translate(-50%, -50%);
        }
        .mascot-bubble {
          background: #fff3cd; border: 2px solid #ffc107; border-radius: 10px;
          padding: 10px 20px; display: inline-block; margin-bottom: 10px;
        }
        .mascot { width: 100px; }
      `}</style>
    </div>
  );
}

export default AlphabetOrdering;
