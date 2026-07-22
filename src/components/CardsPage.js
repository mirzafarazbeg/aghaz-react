import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import '../index.css';
import '../pages.css';

function CardsPage({ data }) {
  // Fixed: use React Router instead of window.location.href string slicing
  const location = useLocation();
  const isQaida  = location.pathname.toLowerCase().endsWith('qaida');

  // All state declared at the top (fixes mid-component hook declaration)
  const [popupSequence, setPopupSequence]     = useState(null);
  const [currentIndex, setCurrentIndex]       = useState(0);
  const [isVideoPlaying, setIsVideoPlaying]   = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [audioEnded, setAudioEnded]           = useState(false);
  const [videoEnded, setVideoEnded]           = useState(false);
  const [secondsLeft, setSecondsLeft]         = useState(5);

  const popupRef = useRef(null);
  const audioRef = useRef(null);
  const videoRef = useRef(null);

  // Fixed: Math.random() was called inside JSX on every render, causing images to
  // randomly swap whenever unrelated state changed. Now computed once per data change.
  const imageIndices = useMemo(
    () => data.map(() => String(Math.floor(Math.random() * 6) + 1).padStart(2, '0')),
    [data]
  );

  const closePopup = useCallback(() => {
    setPopupSequence(null);
    setCurrentIndex(0);
    setIsVideoPlaying(false);
    setShowConfirmDialog(false);
    setAudioEnded(false);
    setVideoEnded(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  const handleThumbnailClick = useCallback((group) => {
    if (!group.words?.length) return;
    setPopupSequence(group);
    setCurrentIndex(0);
    setIsVideoPlaying(false);
    setShowConfirmDialog(false);
  }, []);

  const handleNext = useCallback(() => {
    if (!popupSequence) return;
    const nextIndex = currentIndex + 1;
    if (nextIndex >= popupSequence.words.length) {
      const nextGroupIndex = data.findIndex(d => d === popupSequence) + 1;
      if (nextGroupIndex < data.length) {
        setShowConfirmDialog(true);
      } else {
        closePopup();
      }
    } else {
      setCurrentIndex(nextIndex);
      setIsVideoPlaying(false);
    }
  }, [popupSequence, currentIndex, data, closePopup]);

  const confirmAdvance = useCallback(() => {
    const nextGroupIndex = data.findIndex(d => d === popupSequence) + 1;
    if (nextGroupIndex < data.length) {
      setShowConfirmDialog(false);
      setSecondsLeft(5);
      setTimeout(() => handleThumbnailClick(data[nextGroupIndex]), 100);
    } else {
      closePopup();
    }
  }, [data, popupSequence, closePopup, handleThumbnailClick]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape')     closePopup();
    if (e.key === 'ArrowLeft')  handleNext();
    if (e.key === 'ArrowRight' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsVideoPlaying(false);
    }
  }, [closePopup, handleNext, currentIndex]);

  // Play audio when popup opens or word changes
  useEffect(() => {
    if (!popupSequence || !popupRef.current) return;
    popupRef.current.focus();
    const word = popupSequence.words[currentIndex];
    setAudioEnded(false);
    setVideoEnded(!word.videoFile);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const wordAudio = new Audio('/sounds/' + word.soundFile);
    audioRef.current = wordAudio;

    if (isQaida && popupSequence.letter) {
      const letterAudio = new Audio(`/sounds/${popupSequence.letter}_00.mp3`);
      letterAudio.play();
      letterAudio.onended = () => wordAudio.play();
      letterAudio.onerror = () => wordAudio.play();
    } else {
      wordAudio.play();
    }

    wordAudio.onended = () => {
      setAudioEnded(true);
      if (videoRef.current) videoRef.current.muted = false;
    };

    if (word.videoFile) setIsVideoPlaying(true);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [popupSequence, currentIndex, isQaida]);

  // Auto-advance when both audio and video have ended
  useEffect(() => {
    if (!audioEnded || !videoEnded) return;
    const id = setTimeout(() => handleNext(), 1500);
    return () => clearTimeout(id);
  }, [audioEnded, videoEnded, handleNext]);

  // Countdown for confirm dialog
  useEffect(() => {
    if (showConfirmDialog) setSecondsLeft(5);
  }, [showConfirmDialog]);

  useEffect(() => {
    if (!showConfirmDialog || secondsLeft <= 0) return;
    const id = setTimeout(() => setSecondsLeft(prev => prev - 1), 1000);
    return () => clearTimeout(id);
  }, [showConfirmDialog, secondsLeft]);

  useEffect(() => {
    if (showConfirmDialog && secondsLeft === 0) confirmAdvance();
  }, [showConfirmDialog, secondsLeft, confirmAdvance]);

  const word     = popupSequence?.words[currentIndex];
  const nextWord = popupSequence?.words[currentIndex + 1];

  const handleVideoError = useCallback(() => {
    setIsVideoPlaying(false);
    setVideoEnded(true);
    if (videoRef.current) {
      try { videoRef.current.pause(); } catch (_) {}
      videoRef.current = null;
    }
  }, []);

  const overlayStyles = {
    wordBadge: {
      position: 'absolute', top: '0vh', right: '0vw',
      backgroundColor: 'rgba(0, 0, 0, 0.65)', color: '#fff',
      padding: '5px 10px', borderRadius: '999px', fontSize: '32px',
      fontWeight: '700', whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
      zIndex: 2, maxWidth: '70%', overflow: 'hidden', textOverflow: 'ellipsis', pointerEvents: 'none',
    },
    nextButton: {
      position: 'absolute', top: '5vh', left: '1vh', transform: 'translateY(-50%)',
      backgroundColor: 'rgba(0, 0, 0, 0.65)', color: '#888', padding: '2px 4px',
      borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '10px',
      fontSize: '18px', fontWeight: '600', cursor: 'pointer', border: 'none',
      boxShadow: '0 4px 12px rgba(0,0,0,0.25)', zIndex: 2, maxWidth: '55%', whiteSpace: 'nowrap',
    },
  };

  return (
    <div className="page-container">
      <div className="items-grid">
        {data.map((item, idx) => (
          <div key={idx} className="item-card" onClick={() => handleThumbnailClick(item)}>
            <div className="harf-display">{item.harf || item.title}</div>
            {/* Fixed: imageIndices[idx] is stable — no longer randomized on every render */}
            <img
              src={`/images/${(item.letter || item.imageFile || 'default')}_${imageIndices[idx]}.jpg`}
              alt={item.harf || item.title}
              loading="lazy"
            />
            <button
              className="sound-button"
              aria-label={`${item.harf || item.title} کی آواز سنیں`}
              onClick={e => {
                e.stopPropagation();
                new Audio('/sounds/' + (item.soundFile || '')).play().catch(() => {});
              }}
            >🔊</button>
          </div>
        ))}
      </div>

      {popupSequence && word && (
        <div
          ref={popupRef}
          tabIndex="0"
          onClick={closePopup}
          onKeyDown={handleKeyDown}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ backgroundColor: '#000', borderRadius: '10px', padding: '15px', width: '90vw', height: '90vh', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', textAlign: 'center', fontFamily: 'Jameel Noori Nastaleeq', position: 'relative' }}
          >
            <div style={{ position: 'relative', marginBottom: '20px', borderRadius: '12px', height: '90vh' }}>
              {isVideoPlaying && word.videoFile && isQaida ? (
                <>
                  <video
                    ref={videoRef}
                    muted autoPlay controls
                    src={`/videos/${word.videoFile}`}
                    onEnded={() => setVideoEnded(true)}
                    onError={handleVideoError}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px', display: 'block', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid #aaa' }}
                  />
                  <img
                    src={`/images/${word.imageFile}`}
                    alt=""
                    loading="lazy"
                    style={{ position: 'absolute', bottom: '0vh', right: '0vw', width: '33vw', height: 'auto', border: '2px solid #fff', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.3)', backgroundColor: '#fff', objectFit: 'cover', zIndex: 1 }}
                  />
                </>
              ) : (
                <img
                  src={`/images/${word.imageFile}`}
                  alt={word.word}
                  loading="lazy"
                  style={{ width: '85vw', height: '90vh', objectFit: 'cover', borderRadius: '20px', display: 'block', border: '2px solid #444', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
                />
              )}

              <div style={overlayStyles.wordBadge}>{popupSequence.harf}⬅️{word.word}</div>

              {nextWord && (
                <button type="button" style={overlayStyles.nextButton} onClick={e => { e.stopPropagation(); handleNext(); }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>اگلا لفظ: {nextWord.word}</span>
                  <span role="img" aria-label="Next word">⬅️</span>
                </button>
              )}
            </div>
          </div>

          {showConfirmDialog && (
            <div style={{ position: 'absolute', backgroundColor: '#fff', border: '2px solid #ddd', borderRadius: '15px', padding: '20px', maxWidth: '80%', textAlign: 'center', boxShadow: '0 5px 20px rgba(0,0,0,0.3)', zIndex: 99999 }}>
              <p style={{ fontSize: '20px', marginBottom: '15px' }}>تمام الفاظ مکمل ہوگئے۔ کیا اگلے حرف پر چلیں؟</p>
              <button onClick={confirmAdvance} style={{ ...btnStyle, backgroundColor: '#28a745', color: 'white' }}>
                {secondsLeft > 0 ? `${secondsLeft}` : ''}
              </button>
              <button onClick={closePopup} style={{ ...btnStyle, backgroundColor: '#dc3545', color: 'white' }}>نہیں</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const btnStyle = {
  fontSize: '28px', width: '60px', height: '60px',
  background: '#f7f7f7', border: '2px solid #ddd',
  borderRadius: '50%', cursor: 'pointer', transition: 'all 0.2s ease',
};

export default CardsPage;
