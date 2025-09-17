import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import mascotQuotes from '../Data/mascotQuotes.json';
import alphabetData from '../Data/alphabetData';
import '../Khel.css';

function QuickQuiz({ onClose }) {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selected, setSelected] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [mascotQuote, setMascotQuote] = useState('');
  const [activeAudio, setActiveAudio] = useState(null);

  const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

  useEffect(() => {
    const eligibleWords = [];

    alphabetData.forEach(item => {
      item.words.forEach(word => {
        if (word.games && word.games.includes("QuickQuiz")) {
          eligibleWords.push({ ...word, letter: item.letter });
        }
      });
    });

    const selected = shuffleArray(eligibleWords).slice(0, 6).map((word) => {
      const wrongOptions = shuffleArray(
        eligibleWords.filter(w => w.word !== word.word)
      ).slice(0, 2);

      const options = shuffleArray([word, ...wrongOptions]);

      return {
        image: word.imageFile,
        correct: word.word,
        soundFile: word.soundFile,
        options: options.map(opt => ({ word: opt.word, sound: opt.soundFile }))
      };
    });

    setQuestions(selected);
  }, []);

  useEffect(() => {
    return () => {
      if (activeAudio) {
        activeAudio.pause();
        activeAudio.currentTime = 0;
      }
    };
  }, [activeAudio]);

  const handleAnswer = (word) => {
    if (!questions[current] || selected !== null) return;

    const correct = questions[current].correct;
    setSelected(word);
    setIsCorrect(word === correct);

    const clickedOption = questions[current].options.find(o => o.word === word);

    if (activeAudio) {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    }

    if (clickedOption?.sound) {
      const audio = new Audio(`/sounds/${clickedOption.sound}`);
      setActiveAudio(audio);
      audio.play();
    }

    if (word === correct) {
      new Audio('/sounds/correct.mp3').play();
      setScore(prev => prev + 1);
      setTimeout(() => {
        setSelected(null);
        setIsCorrect(null);
        setActiveAudio(null);
        nextQuestion();
      }, 800);
    } else {
      new Audio('/sounds/wrong.mp3').play();
      setTimeout(() => {
        setSelected(null);
        setIsCorrect(null);
        setActiveAudio(null);
      }, 800);
    }
  };

  const nextQuestion = () => {
    if (current + 1 < questions.length) {
      setCurrent(prev => prev + 1);
    } else {
      triggerCelebration();
    }
  };

  const playMainSound = () => {
    if (activeAudio) {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    }
    const audio = new Audio(`/sounds/${questions[current].soundFile}`);
    setActiveAudio(audio);
    audio.play();
  };

  const triggerCelebration = () => {
    setShowConfetti(true);
    const quote = mascotQuotes[Math.floor(Math.random() * mascotQuotes.length)];
    setMascotQuote(quote);
    setShowResult(true);
    new Audio('/sounds/fanfare.mp3').play();
  };

  const restartGame = () => {
    window.location.reload();
  };

  if (!questions.length) return <div className="popup"><p>Loading...</p></div>;

  return (
    <div className="popup">
      {showConfetti && <Confetti />}
      {!showResult ? (
        <div className="quiz-content">
          <h2>لفظ پہچانیں</h2>
          <img
            src={`/images/${questions[current].image}`}
            alt="quiz-img"
            className="quiz-image"
            onClick={playMainSound}
          />
          <div className="quiz-options">
            {questions[current].options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(opt.word)}
                className={`quiz-option ${
                  selected === opt.word
                    ? isCorrect
                      ? 'correct-answer'
                      : 'wrong-answer'
                    : ''
                }`}
              >
                {opt.word}
              </button>
            ))}
          </div>
          <p>سوال {current + 1} / {questions.length}</p>
        </div>
      ) : (
        <div className="quiz-result">
          <p>آپ کے درست جوابات: {score} / {questions.length}</p>
          <div className="mascot-container">
            <img src="/images/mascot.png" alt="mascot" className="mascot" />
            <div className="speech-bubble">{mascotQuote}</div>
          </div>
          <button onClick={restartGame}>دوبارہ کھیلیں</button>
        </div>
      )}

      <style>{`
        .quiz-content {
          text-align: center;
        }
        .quiz-image {
          width: 220px;
          height: auto;
          border-radius: 10px;
          margin: 10px auto;
          cursor: pointer;
          box-shadow: 0 0 10px #ccc;
        }
        .quiz-options {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 15px;
        }
        .quiz-option {
          background-color: #fff;
          border: 2px solid #007bff;
          padding: 10px 20px;
          margin: 10px;
          border-radius: 12px;
          font-size: 24px;
          font-family: 'Jameel Noori Nastaleeq', serif;
          cursor: pointer;
          transition: background-color 0.3s, transform 0.2s;
        }
        .quiz-option:hover {
          background-color: #007bff;
          color: white;
          transform: scale(1.05);
        }
        .correct-answer {
          border-color: green !important;
          background-color: #e6ffe6;
          transition: 0.3s;
        }
        .wrong-answer {
          border-color: red !important;
          background-color: #ffeaea;
          animation: shake 0.3s ease-in-out;
        }
        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
          100% { transform: translateX(0); }
        }
        .quiz-result {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .quiz-result p {
          font-size: 20px;
          margin: 15px 0;
          text-align: center;
        }
        .quiz-result button {
          padding: 10px 20px;
          font-size: 18px;
          border: none;
          background-color: #28a745;
          color: white;
          border-radius: 10px;
          cursor: pointer;
        }
        .mascot-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin-top: 10px;
          width: 100%;
        }
        .mascot {
          width: 120px;
          margin-top: 10px;
        }
        .speech-bubble {
          position: relative;
          background: #fff3cd;
          border: 2px solid #ffc107;
          border-radius: 10px;
          padding: 10px 15px;
          font-size: 16px;
          max-width: 300px;
          text-align: center;
          box-shadow: 0 0 5px rgba(0,0,0,0.1);
          display: inline-block;
          bottom: 10px;
        }
      `}</style>
    </div>
  );
}

export default QuickQuiz;
