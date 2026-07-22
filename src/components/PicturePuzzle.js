import React, { useEffect, useState, useCallback, useRef } from 'react';
import Confetti from 'react-confetti';
import { useDrag, useDrop } from 'react-dnd';
import { shuffleArray } from '../utils/shuffle';
import { filterGameWords } from '../utils/gameUtils';
import { useCelebration } from '../hooks/useCelebration';

const GRID_SIZE = 3;
const TILE_TYPE  = 'PUZZLE_TILE';

const tileArrows = ['↖️','⬆️','↗️','⬅️','✔️','➡️','↙️','⬇️','↘️'];
const arrowStyles = [
  { top: 2, left: 2 },
  { top: 2, left: '50%', transform: 'translateX(-50%)' },
  { top: 2, right: 2 },
  { top: '50%', left: 2, transform: 'translateY(-50%)' },
  { top: '50%', left: '50%', transform: 'translate(-50%,-50%)' },
  { top: '50%', right: 2, transform: 'translateY(-50%)' },
  { bottom: 2, left: 2 },
  { bottom: 2, left: '50%', transform: 'translateX(-50%)' },
  { bottom: 2, right: 2 },
];

const Tile = React.memo(function Tile({ tile, row, col, onSwap }) {
  const [{ isDragging }, drag] = useDrag(
    () => ({ type: TILE_TYPE, item: { row, col }, collect: m => ({ isDragging: m.isDragging() }) }),
    [row, col]
  );
  const [, drop] = useDrop(
    () => ({
      accept: TILE_TYPE,
      drop: d => { if (d.row !== row || d.col !== col) onSwap(d.row, d.col, row, col); },
    }),
    [row, col, onSwap]
  );

  return (
    <div
      ref={n => drag(drop(n))}
      style={{ width: '100%', aspectRatio: '1', border: '1px solid #ccc', boxSizing: 'border-box', position: 'relative', opacity: isDragging ? 0.5 : 1, overflow: 'hidden' }}
    >
      <img src={tile.dataUrl} alt="" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <span style={{ position: 'absolute', fontSize: 16, pointerEvents: 'none', ...arrowStyles[tile.id] }}>
        {tileArrows[tile.id]}
      </span>
    </div>
  );
});

export default function PicturePuzzle() {
  const [grid, setGrid]                 = useState([]);
  const [originalGrid, setOriginalGrid] = useState([]);
  const [tileSize, setTileSize]         = useState(100);
  const [wordSound, setWordSound]       = useState(null);
  const [currentWord, setCurrentWord]   = useState('');
  const [loading, setLoading]           = useState(true);
  const gridWrapRef = useRef(null);

  // Renamed to resetPuzzle to avoid conflict with useCelebration's reset
  const { showConfetti, showMascot, mascotQuote, celebrate, reset: resetCelebration } = useCelebration();

  const shuffle = useCallback((arr) => shuffleArray(arr), []);

  // Load a random word image and slice it into tiles
  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const eligible = filterGameWords('PicturePuzzle');
        if (!eligible.length) return;

        const picked    = eligible[Math.floor(Math.random() * eligible.length)];
        const imageSrc  = `/images/${picked.imageFile}`;
        setCurrentWord(picked.word);
        setWordSound(picked.soundFile ? `/sounds/${picked.soundFile}` : null);

        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = imageSrc; });

        const size = Math.min(img.naturalWidth, img.naturalHeight);
        const offX = (img.naturalWidth  - size) / 2;
        const offY = (img.naturalHeight - size) / 2;

        const crop = document.createElement('canvas');
        crop.width = crop.height = size;
        const cctx = crop.getContext('2d');
        cctx.drawImage(img, offX, offY, size, size, 0, 0, size, size);

        const ts = Math.floor(size / GRID_SIZE);
        const tileCanvas = document.createElement('canvas');
        tileCanvas.width = tileCanvas.height = ts;
        const tctx = tileCanvas.getContext('2d');

        const tiles = [];
        for (let r = 0, id = 0; r < GRID_SIZE; r++) {
          for (let c = 0; c < GRID_SIZE; c++, id++) {
            tctx.clearRect(0, 0, ts, ts);
            tctx.drawImage(crop, c * ts, r * ts, ts, ts, 0, 0, ts, ts);
            tiles.push({ id, dataUrl: tileCanvas.toDataURL() });
          }
        }

        const orig = [];
        for (let i = 0; i < GRID_SIZE; i++) orig.push(tiles.slice(i * GRID_SIZE, (i + 1) * GRID_SIZE));
        setOriginalGrid(orig);

        const shuffled = shuffle(tiles);
        const play = [];
        for (let i = 0; i < GRID_SIZE; i++) play.push(shuffled.slice(i * GRID_SIZE, (i + 1) * GRID_SIZE));
        setGrid(play);
        setLoading(false);
        resetCelebration();
      } catch (err) {
        console.error('PicturePuzzle init error:', err);
        setLoading(false);
      }
    }
    init();
  }, [shuffle, resetCelebration]);

  // Responsive tile sizing — kept intact
  useEffect(() => {
    function computeTileSize() {
      const gap  = 4;
      const wrap = gridWrapRef.current;
      if (!wrap) return;
      const availW   = wrap.clientWidth || (wrap.getBoundingClientRect()?.width ?? 0);
      const popup    = wrap.closest ? wrap.closest('.game-popup-content') : null;
      const popupH   = popup ? popup.getBoundingClientRect().height : Math.round(window.innerHeight * 0.9);
      const availH   = Math.max(0, popupH - 32);
      const byW      = Math.floor((availW - (GRID_SIZE - 1) * gap) / GRID_SIZE);
      const byH      = Math.floor((availH - (GRID_SIZE - 1) * gap) / GRID_SIZE);
      const size     = Math.max(50, Math.min(byW, byH));
      if (Number.isFinite(size) && size > 0) setTileSize(size);
    }
    computeTileSize();
    const raf1 = requestAnimationFrame(() => requestAnimationFrame(computeTileSize));
    const t300 = setTimeout(computeTileSize, 300);
    const t600 = setTimeout(computeTileSize, 600);
    window.addEventListener('resize', computeTileSize);
    window.addEventListener('orientationchange', computeTileSize);
    const vv = window.visualViewport;
    if (vv?.addEventListener) vv.addEventListener('resize', computeTileSize);
    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      const popup = gridWrapRef.current?.closest?.('.game-popup-content');
      if (popup) { ro = new ResizeObserver(computeTileSize); ro.observe(popup); }
    }
    return () => {
      cancelAnimationFrame(raf1);
      clearTimeout(t300);
      clearTimeout(t600);
      window.removeEventListener('resize', computeTileSize);
      window.removeEventListener('orientationchange', computeTileSize);
      if (vv?.removeEventListener) vv.removeEventListener('resize', computeTileSize);
      if (ro) ro.disconnect();
    };
  }, []);

  const onPuzzleSolved = useCallback(() => {
    celebrate();
    if (wordSound) setTimeout(() => new Audio(wordSound).play().catch(() => {}), 1000);
  }, [celebrate, wordSound]);

  const handleSwap = useCallback((r1, c1, r2, c2) => {
    setGrid(curr => {
      const copy = curr.map(row => [...row]);
      [copy[r1][c1], copy[r2][c2]] = [copy[r2][c2], copy[r1][c1]];
      const solved = copy.every((row, r) => row.every((tile, c) => tile.id === originalGrid[r][c].id));
      if (solved) onPuzzleSolved();
      return copy;
    });
  }, [originalGrid, onPuzzleSolved]);

  const resetPuzzle = useCallback(() => {
    const flat     = originalGrid.flat();
    const shuffled = shuffle(flat);
    const play     = [];
    for (let i = 0; i < GRID_SIZE; i++) play.push(shuffled.slice(i * GRID_SIZE, (i + 1) * GRID_SIZE));
    setGrid(play);
    resetCelebration();
  }, [originalGrid, shuffle, resetCelebration]);

  if (loading) return <div>Loading puzzle…</div>;

  return (
    <div className="pp-container" style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%', padding: 12 }}>
      <div style={{ position: 'absolute', right: 28, top: '50%', transform: 'translateY(-50%)', zIndex: 1, pointerEvents: 'none' }}>
        <div style={{ background: 'rgba(255,255,255,0.9)', borderRadius: '9999px', padding: '6px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', backdropFilter: 'blur(2px)' }}>
          <h2 style={{ margin: 0, fontSize: 'clamp(24px, 5.5vmin, 44px)' }}>{currentWord}</h2>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          ref={gridWrapRef}
          style={{
            display: 'grid', direction: 'ltr',
            gridTemplateColumns: `repeat(${GRID_SIZE}, ${tileSize}px)`,
            gridAutoRows: `${tileSize}px`,
            justifyContent: 'center', width: '100%', maxWidth: '100%', gap: '4px',
          }}
        >
          {grid.map((row, r) =>
            row.map((tile, c) => (
              <Tile key={`t-${r}-${c}-${tile.id}`} tile={tile} row={r} col={c} onSwap={handleSwap} />
            ))
          )}
        </div>
      </div>

      {showConfetti && <Confetti recycle={false} numberOfPieces={400} />}

      {showMascot && (
        <div style={{ position: 'fixed', top: '30%', left: '50%', transform: 'translate(-50%, -30%)', background: 'white', border: '2px solid #333', borderRadius: 8, padding: 20, zIndex: 1000, textAlign: 'center' }}>
          <img src="/images/mascot.png" alt="Mascot" style={{ width: 100, marginBottom: 10 }} />
          <p style={{ fontSize: 18, marginBottom: 20 }}>"{mascotQuote}"</p>
          <button onClick={resetPuzzle} style={{ padding: '8px 16px' }}>دوبارہ کھیلیں</button>
        </div>
      )}
    </div>
  );
}
