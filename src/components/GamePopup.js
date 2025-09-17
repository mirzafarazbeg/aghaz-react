import React from 'react';
import '../Khel.css';
import WordMatching from './WordMatching';
import MemoryGame from './MemoryGame';
import PicturePuzzle from './PicturePuzzle';
import SoundMatching from './SoundMatching';
import QuickQuiz from './QuickQuiz';
import AlphabetOrdering from './AlphabetOrdering';

const components = {
    WordMatching: WordMatching,
    MemoryGame: MemoryGame,
    PicturePuzzle: PicturePuzzle,
    SoundMatching: SoundMatching,
    QuickQuiz: QuickQuiz,
    AlphabetOrdering: AlphabetOrdering
};

function GamePopup({ selectedGame, onClose }) {
    // Get the correct component based on the selected game title
    const GameComponent = components[selectedGame];

    if (!GameComponent) return null;

    return (
        <div className="game-popup" onClick={onClose}>
            <div className="game-popup-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>X</button>
                <GameComponent onClose={onClose} />
            </div>
        </div>
    );
}

export default GamePopup;
