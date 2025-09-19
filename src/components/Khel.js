import React, { useState, useEffect, useRef } from 'react';
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

    const gridRef = useRef(null);

    useEffect(() => {
        const grid = gridRef.current;
        if (!grid) return;

        const updateSize = () => {
            const host = grid.parentElement;
            const hostWidth = host ? host.clientWidth : window.innerWidth;
            const columnGap = parseFloat(getComputedStyle(grid).columnGap || '0');
            const totalGap = columnGap * 2; // between 3 columns = 2 gaps
            const widthBased = (hostWidth - totalGap) / 3;

            const rect = grid.getBoundingClientRect();
            const availableHeight = Math.max(0, window.innerHeight - rect.top - 24);
            const heightBased = availableHeight / 2;

            const size = Math.max(100, Math.min(widthBased, heightBased));
            grid.style.setProperty('--card-size', `${size}px`);
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        window.addEventListener('orientationchange', updateSize);

        let ro;
        if (typeof ResizeObserver !== 'undefined') {
            ro = new ResizeObserver(updateSize);
            ro.observe(grid);
            if (grid.parentElement) {
                ro.observe(grid.parentElement);
            }
        }

        return () => {
            window.removeEventListener('resize', updateSize);
            window.removeEventListener('orientationchange', updateSize);
            if (ro) ro.disconnect();
        };
    }, []);

    return (
        <div className="khel">
            <div ref={gridRef} className="game-grid">
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
