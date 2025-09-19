import React, { useState } from 'react';
import '../Khel.css';
import gamesData from '../Data/Khel.json';
import GamePopup from './GamePopup';

function Khel() {
    const [selectedGame, setSelectedGame] = useState(null);

    const openGame = (game) => {
        // Only open if the game is available
        if (!game.comingSoon) {
            setSelectedGame(game.component);
        }
    };

    const closeGame = () => {
        setSelectedGame(null);
    };

    return (
        <div className="khel">
            <div className="game-grid">
                {gamesData.map((game, index) => (
                    <div
                        key={index}
                        className={`game-card ${game.comingSoon ? "unavailable" : ""}`}
                        onClick={() => openGame(game)}
                    >
                        <img src={game.thumbnail} alt={game.title} />
                        <span>{game.title}</span>
                        {game.comingSoon && <div className="coming-soon-overlay">Coming Soon</div>}
                    </div>
                ))}
            </div>

            {selectedGame && <GamePopup selectedGame={selectedGame} onClose={closeGame} />}
        </div>
    );
}

export default Khel;
