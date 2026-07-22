import React, { useEffect, useState, useCallback } from 'react';
import Confetti from 'react-confetti';
import '../Khel.css';
import { shuffleArray } from '../utils/shuffle';
import { filterGameWords } from '../utils/gameUtils';
import { useAudio } from '../hooks/useAudio';
import { useCelebration } from '../hooks/useCelebration';

function QuickQuiz({ onClose }) {
  const [questions, setQuestions]   = useState([]);
  const [current, setCurrent]       = useState(0);
  const [score, setScore]           = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selected, setSelected]     = useState(null);
  const [isCorrect, setIsCorrect]   = useState(null);

  const { play, stop } = useAudio();
  const { showConfetti, mascotQuote, celebrate, reset: resetCelebration } = useCelebration();

  const buildQuestions = useCallback(() => {
    const eligible = filterGameWords('QuickQuiz');
    return shuffleArray(eligible).slice(0, 6).map(word => {
      const wrongOptions = shuffleArray(eligible.filter(w => w.word !== word.word)).slice(0, 2);
      const options = shuffleArray([word, ...wrongOptions]);
      return {
        image: word.imageFile,
        correct: word.word,
        soundFile: word.soundFile,
        options: options.map(opt => ({ word: opt.word, sound: opt.soundFile })),
      };
    });
  }, []);

  const initGame = useCallback(() => {
    stop();
    setQuestions(buildQuestions());
    setCurrent(0);
    setScore(0);
    setShowResult(false);
    setSelected(null);
    setIsCorrect(null);
    resetCelebration();
  }, [buildQuestions, stop, resetCelebration]);

  useEffect(() => { initGame(); }, [initGame]);

  const handleAnswer = useCallback((word) => {
    if (!questions[current] || selected !== null) return;

    const correct = questions[current].correct;
    setSelected(word);
    setIsCorrect(word === correct);

    const clicked = questions[current].options.find(o => o.word === word);
    if (clicked?.sound) play(clicked.sound);

    if (word === correct) {
      new Audio('/sounds/correct.mp3').play().catch(() => {});
      setScore(prev => prev + 1);
      setTimeout(() => {
        setSelected(null);
        setIsCorrect(null);
        if (current + 1 < questions.length) {
          setCurrent(prev => prev + 1);
        } else {
          celebrate();
          setShowResult(true);
        }
      }, 800);
    } else {
      new Audio('/sounds/wrong.mp3').play().catch(() => {});
      setTimeout(() => {
        setSelected(null);
        setIsCorrect(null);
      }, 800);
    }
  }, [questions, current, selected, play, celebrate]);

  const playMainSound = useCallback(() => {
    if (questions[current]?.soundFile) play(questions[current].soundFile);
  }, [questions, current, play]);

  if (!questions.length) return <div className="popup"><p>Loading...</p></div>;

  return (
    <div className="popup">
      {showConfetti && <Confetti />}
      {!showResult ? (
        <div className="quiz-content">
          <div style={{
            position: 'absolute', top: '50%', right: '5vw',
            backgroundColor: '#999', color: 'white',
            border: '0.25vmin solid #000', padding: '0.5vmin 1vmin',
            borderRadius: '25%', fontSize: '5vmin',
          }}>
            سوال {current + 1} / {questions.length}
          </div>
          <img
            src={`/images/${questions[current].image}`}
            alt="quiz-img"
            className="quiz-image"
            loading="lazy"
            onClick={playMainSound}
          />
          <div className="quiz-options">
            {questions[current].options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(opt.word)}
                className={`quiz-option ${
                  selected === opt.word
                    ? isCorrect ? 'correct-answer' : 'wrong-answer'
                    : ''
                }`}
              >
                {opt.word}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="quiz-result">
          <p>آپ کے درست جوابات: {score} / {questions.length}</p>
          <div className="mascot-container">
            <img src="/images/mascot.png" alt="mascot" className="mascot" />
            <div className="speech-bubble">{mascotQuote}</div>
          </div>
          {/* Fixed: was window.location.reload() — now uses proper state reset */}
          <button onClick={initGame}>دوبارہ کھیلیں</button>
        </div>
      )}

      <style>{`
        .quiz-content { text-align: center; }
        .quiz-image {
          width: 45vw; height: auto; border-radius: 10px;
          margin: 10px auto; cursor: pointer; box-shadow: 0 0 10px #ccc;
        }
        .quiz-options { display: flex; flex-wrap: wrap; justify-content: center; margin-top: 15px; }
        .quiz-option {
          background-color: #fff; border: 2px solid #007bff;
          padding: 10px 20px; margin: 10px; border-radius: 12px;
          font-size: 24px; font-family: 'Jameel Noori Nastaleeq', serif;
          cursor: pointer; transition: background-color 0.3s, transform 0.2s;
        }
        .quiz-option:hover { transform: scale(1.05); }
        .correct-answer { border-color: green !important; transition: 0.3s; }
        .wrong-answer { border-color: red !important; animation: shake 0.3s ease-in-out; }
        @keyframes shake {
          0% { transform: translateX(0); } 25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); } 75% { transform: translateX(-5px); }
          100% { transform: translateX(0); }
        }
        .quiz-result { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
        .quiz-result p { font-size: 20px; margin: 0; text-align: center; }
        .quiz-result button {
          padding: 10px 20px; font-size: 18px; border: none;
          background-color: #28a745; color: white; border-radius: 10px; cursor: pointer;
        }
        .mascot-container { display: flex; flex-direction: column; align-items: center; justify-content: center; margin-top: 10px; width: 100%; }
        .mascot { width: 120px; margin-top: 10px; }
        .speech-bubble {
          position: relative; background: #fff3cd; border: 2px solid #ffc107;
          border-radius: 10px; padding: 10px 15px; font-size: 16px;
          max-width: 300px; text-align: center; box-shadow: 0 0 5px rgba(0,0,0,0.1);
          display: inline-block; bottom: 10px;
        }
      `}</style>
    </div>
  );
}

export default QuickQuiz;
