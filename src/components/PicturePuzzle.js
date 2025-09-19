import React, { useEffect, useState, useCallback, useRef } from 'react';
import alphabetData from '../Data/alphabetData';
import mascotQuotes from '../Data/mascotQuotes.json';
import Confetti from 'react-confetti';
import { useDrag, useDrop } from 'react-dnd';

const GRID_SIZE = 3;
const TILE_TYPE = 'PUZZLE_TILE';

// Arrow icons & positions
const tileArrows = [
  '↖️','⬆️','↗️',
  '⬅️','✔️','➡️',
  '↙️','⬇️','↘️'
];
const arrowStyles = [
  { top: 2, left: 2 },
  { top: 2, left: '50%', transform: 'translateX(-50%)' },
  { top: 2, right: 2 },
  { top: '50%', left: 2, transform: 'translateY(-50%)' },
  { top: '50%', left: '50%', transform: 'translate(-50%,-50%)' },
  { top: '50%', right: 2, transform: 'translateY(-50%)' },
  { bottom: 2, left: 2 },
  { bottom: 2, left: '50%', transform: 'translateX(-50%)' },
  { bottom: 2, right: 2 }
];

function Tile({ tile, row, col, tileSize, onSwap }) {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: TILE_TYPE,
      item: { row, col },
      collect: m => ({ isDragging: m.isDragging() })
    }),
    [row, col]
  );
  const [, drop] = useDrop(
    () => ({
      accept: TILE_TYPE,
      drop: d => {
        if (d.row !== row || d.col !== col) {
          onSwap(d.row, d.col, row, col);
        }
      }
    }),
    [row, col]
  );

  const arrow = tileArrows[tile.id];
  const pos   = arrowStyles[tile.id];

  return (
    <div
      ref={n => drag(drop(n))}
      style={{
        width: '100%',
        aspectRatio: '1',
        border: '1px solid #ccc',
        boxSizing: 'border-box',
        position: 'relative',
        opacity: isDragging ? 0.5 : 1,
        overflow: 'hidden'
      }}
    >
      <img
        src={tile.dataUrl}
        alt=""
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '100%', height: '100%',
          objectFit: 'cover'
        }}
      />
      <span
        style={{
          position: 'absolute',
          fontSize: 16,
          pointerEvents: 'none',
          ...pos
        }}
      >
        {arrow}
      </span>
    </div>
  );
}

export default function PicturePuzzle() {
  const [grid, setGrid]                   = useState([]);
  const [originalGrid, setOriginalGrid]   = useState([]);
  const [tileSize, setTileSize]           = useState(100);
  const [showConfetti, setShowConfetti]   = useState(false);
  const [showMascot, setShowMascot]       = useState(false);
  const [mascotQuote, setMascotQuote]     = useState('');
  const [wordSound, setWordSound]         = useState(null);
  const [currentWord, setCurrentWord]     = useState('');
  const [loading, setLoading]             = useState(true);
  const gridWrapRef = useRef(null);

  // Fisher–Yates shuffle
  const shuffle = useCallback(tiles => {
    const a = tiles.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }, []);

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        // 1) build a flat list of all words that include "PicturePuzzle" in their games[]
        const pictureWords = [];
        for (const letterEntry of alphabetData) {
          if (!letterEntry.words) continue;
          for (const w of letterEntry.words) {
            if (Array.isArray(w.games) && w.games.includes("PicturePuzzle")) {
              pictureWords.push(w);
            }
          }
        }

        // 2) pick one at random
        if (!pictureWords.length) {
          throw new Error("No words available for PicturePuzzle");
        }
        const pick = pictureWords[Math.floor(Math.random() * pictureWords.length)];

        // 3) capture word & sound
        setCurrentWord(pick.word);
        if (pick.soundFile) setWordSound(`/sounds/${pick.soundFile}`);

        // 4) load & crop image
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = `/images/${pick.imageFile}`;
        await new Promise((res, rej) => {
          img.onload  = res;
          img.onerror = () => rej("Image load failed");
        });
        const side = Math.min(img.naturalWidth, img.naturalHeight);
        const crop = document.createElement("canvas");
        crop.width  = side;
        crop.height = side;
        crop.getContext("2d").drawImage(img, 0, 0, side, side);

        // 5) compute tile size & slice into GRID_SIZE² pieces
        const ts = Math.floor(side / GRID_SIZE);
        setTileSize(ts);

        const tileCanvas = document.createElement("canvas");
        tileCanvas.width  = ts;
        tileCanvas.height = ts;
        const tctx = tileCanvas.getContext("2d");

        const tiles = [];
        for (let r = 0, id = 0; r < GRID_SIZE; r++) {
          for (let c = 0; c < GRID_SIZE; c++, id++) {
            tctx.clearRect(0, 0, ts, ts);
            tctx.drawImage(crop, c * ts, r * ts, ts, ts, 0, 0, ts, ts);
            tiles.push({ id, dataUrl: tileCanvas.toDataURL() });
          }
        }

        // 6) save original grid BEFORE shuffle
        const orig = [];
        for (let i = 0; i < GRID_SIZE; i++) {
          orig.push(tiles.slice(i * GRID_SIZE, (i + 1) * GRID_SIZE));
        }
        setOriginalGrid(orig);

        // 7) shuffle for play grid
        const shuffled = shuffle(tiles);
        const play     = [];
        for (let i = 0; i < GRID_SIZE; i++) {
          play.push(shuffled.slice(i * GRID_SIZE, (i + 1) * GRID_SIZE));
        }
        setGrid(play);
        setShowConfetti(false);
        setShowMascot(false);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [shuffle]);

  // Resize tiles to ensure all pieces are always visible, even on first landscape load
  useEffect(() => {
    function computeTileSize() {
      const gap = 4;
      const cols = GRID_SIZE;
      const rows = GRID_SIZE;

      const wrap = gridWrapRef.current;
      if (!wrap) return;

      const availW = wrap.clientWidth || (wrap.getBoundingClientRect()?.width ?? 0);
      const popup = wrap.closest ? wrap.closest('.game-popup-content') : null;
      const popupRect = popup ? popup.getBoundingClientRect() : null;
      const popupH = popupRect ? popupRect.height : Math.round(window.innerHeight * 0.9);
      const availH = Math.max(0, popupH - 32);

      const byW = Math.floor((availW - (cols - 1) * gap) / cols);
      const byH = Math.floor((availH - (rows - 1) * gap) / rows);
      const size = Math.max(50, Math.min(byW, byH));
      if (Number.isFinite(size) && size > 0) setTileSize(size);
    }

    // Run immediately and after layout settles (double RAF) to handle first render in landscape
    computeTileSize();
    const raf1 = requestAnimationFrame(() => requestAnimationFrame(computeTileSize));
    const t300 = setTimeout(computeTileSize, 300);
    const t600 = setTimeout(computeTileSize, 600);

    window.addEventListener('resize', computeTileSize);
    window.addEventListener('orientationchange', computeTileSize);
    const vv = window.visualViewport;
    if (vv && vv.addEventListener) vv.addEventListener('resize', computeTileSize);
    // no pageshow/load listeners; RAF + timeouts already cover first paint

    // Observe popup container size changes
    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      const popup = gridWrapRef.current?.closest && gridWrapRef.current.closest('.game-popup-content');
      if (popup) {
        ro = new ResizeObserver(computeTileSize);
        ro.observe(popup);
      }
    }

    return () => {
      cancelAnimationFrame(raf1);
      clearTimeout(t300);
      clearTimeout(t600);
      window.removeEventListener('resize', computeTileSize);
      window.removeEventListener('orientationchange', computeTileSize);
      // cleanup handled above
      if (vv && vv.removeEventListener) vv.removeEventListener('resize', computeTileSize);
      if (ro) ro.disconnect();
    };
  }, []);

  const handleSwap = (r1, c1, r2, c2) => {
    setGrid(curr => {
      const copy = curr.map(row => [...row]);
      [copy[r1][c1], copy[r2][c2]] = [copy[r2][c2], copy[r1][c1]];
      const solved = copy.every((row, r) =>
        row.every((tile, c) => tile.id === originalGrid[r][c].id)
      );
      if (solved) onPuzzleSolved();
      return copy;
    });
  };

  const onPuzzleSolved = () => {
    const f = new Audio("/sounds/fanfare.mp3");
    setShowConfetti(true);
    setMascotQuote(mascotQuotes[Math.floor(Math.random() * mascotQuotes.length)]);
    setShowMascot(true);
    f.play();
    if (wordSound) setTimeout(() => new Audio(wordSound).play(), 1000);
  };

  const reset = () => {
    const flat     = originalGrid.flat();
    const shuffled = shuffle(flat);
    const play     = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      play.push(shuffled.slice(i * GRID_SIZE, (i + 1) * GRID_SIZE));
    }
    setGrid(play);
    setShowConfetti(false);
    setShowMascot(false);
  };

  if (loading) return <div>Loading puzzle…</div>;

  return (
    <div className="pp-container" style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%', padding: 12 }}>
      {/* Word overlay: right middle, larger font */}
      <div style={{ position: 'absolute', right: 28, top: '50%', transform: 'translateY(-50%)', zIndex: 1, pointerEvents: 'none' }}>
        <div style={{
          background: 'rgba(255,255,255,0.9)',
          borderRadius: '9999px',
          padding: '6px 14px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          backdropFilter: 'blur(2px)'
        }}>
          <h2 style={{ margin: 0, fontSize: 'clamp(24px, 5.5vmin, 44px)' }}>{currentWord}</h2>
        </div>
      </div>

      {/* Center the grid in available space */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          ref={gridWrapRef}
          style={{
            display: 'grid',
            direction: 'ltr',
            gridTemplateColumns: `repeat(${GRID_SIZE}, ${tileSize}px)`,
            gridAutoRows: `${tileSize}px`,
            justifyContent: 'center',
            width: '100%',
            maxWidth: '100%',
            gap: '4px'
          }}
        >
        {grid.map((row, r) =>
          row.map((tile, c) => (
            <Tile
              key={`t-${r}-${c}-${tile.id}`}
              tile={tile}
              row={r}
              col={c}
              onSwap={handleSwap}
            />
          ))
        )}
        </div>
      </div>

      {showConfetti && <Confetti recycle={false} numberOfPieces={400} />}

      {showMascot && (
        <div
          style={{
            position: "fixed",
            top: "30%",
            left: "50%",
            transform: "translate(-50%, -30%)",
            background: "white",
            border: "2px solid #333",
            borderRadius: 8,
            padding: 20,
            zIndex: 1000,
            textAlign: "center"
          }}
        >
          <img
            src="/images/mascot.png"
            alt="Mascot"
            style={{ width: 100, marginBottom: 10 }}
          />
          <p style={{ fontSize: 18, marginBottom: 20 }}>“{mascotQuote}”</p>
          <button onClick={reset} style={{ padding: "8px 16px" }}>
            دوبارہ کھیلیں
          </button>
        </div>
      )}
    </div>
  );
}
