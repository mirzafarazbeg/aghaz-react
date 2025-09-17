import React, { useState, useEffect, useRef } from 'react';
import '../index.css';
import '../pages.css';

function CardsPage({ data }) {
  const isQaida = data[0]?.letter !== undefined;
  const [popupSequence, setPopupSequence] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [audioEnded, setAudioEnded] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);

  const popupRef = useRef(null);
  const audioRef = useRef(null);
  const videoRef = useRef(null);

  const handleThumbnailClick = (group) => {
    if (!group.words?.length) return;
    setPopupSequence(group);
    setCurrentIndex(0);
    setIsVideoPlaying(false);
    setShowConfirmDialog(false);
  };

  const handleNext = () => {
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
  };

  const confirmAdvance = () => {
    const nextGroupIndex = data.findIndex(d => d === popupSequence) + 1;
    if (nextGroupIndex < data.length) {
      setShowConfirmDialog(false);
      setTimeout(() => handleThumbnailClick(data[nextGroupIndex]), 100);
    } else {
      closePopup();
    }
  };

  const closePopup = () => {
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
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') closePopup();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'ArrowLeft' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsVideoPlaying(false);
    }
  };

  useEffect(() => {
    if (popupSequence && popupRef.current) {
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
        if (videoRef.current) {
          videoRef.current.muted = false;
        }
      };

      if (word.videoFile) {
        setIsVideoPlaying(true);
      }
    }
  }, [popupSequence, currentIndex]);

  useEffect(() => {
    if (audioEnded && videoEnded) {
      setTimeout(() => handleNext(), 1500);
    }
  }, [audioEnded, videoEnded]);

  const word = popupSequence?.words[currentIndex];
  const nextWord = popupSequence?.words[currentIndex + 1];

  const overlayStyles = {
    mediaContainer: {
      position: 'relative',
      marginBottom: '20px',
      borderRadius: '12px',
    },
    wordBadge: {
      position: 'absolute',
      top: '12px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      color: '#fff',
      padding: '8px 18px',
      borderRadius: '999px',
      fontSize: '32px',
      fontWeight: '700',
      whiteSpace: 'nowrap',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
      zIndex: 2,
      maxWidth: '70%',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      pointerEvents: 'none',
    },
    letterBadge: {
      position: 'absolute',
      top: '12px',
      left: '12px',
      backgroundColor: 'rgba(255, 255, 255, 0.85)',
      color: '#333',
      padding: '6px 14px',
      borderRadius: '999px',
      fontSize: '22px',
      fontWeight: '600',
      whiteSpace: 'nowrap',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
      zIndex: 2,
      pointerEvents: 'none',
    },
    nextButton: {
      position: 'absolute',
      top: '50%',
      right: '12px',
      transform: 'translateY(-50%)',
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      color: '#fff',
      padding: '10px 16px',
      borderRadius: '999px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontSize: '18px',
      fontWeight: '600',
      cursor: 'pointer',
      border: 'none',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
      zIndex: 2,
      maxWidth: '55%',
      whiteSpace: 'nowrap',
    },
    nextButtonText: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    }
  };

  const handleVideoError = () => {
    setIsVideoPlaying(false);
    setVideoEnded(true);
    if (videoRef.current) {
      try {
        videoRef.current.pause();
      } catch (err) {
        // no-op if pause fails
      }
      videoRef.current = null;
    }
  };

  return (
    <div className="page-container">
      <div className="items-grid">
        {data.map((item, idx) => (
          <div key={idx} className="item-card" onClick={() => handleThumbnailClick(item)}>
            <div className="harf-display">{item.harf || item.title}</div>
            {/* <img src={`/images/${item.letter || item.imageFile || 'default'}_01.jpg`} alt={item.harf || item.title} /> */}
            <img
            src={`/images/${(item.letter || item.imageFile || 'default')}_${String(Math.floor(Math.random() * 6) + 1).padStart(2, '0')}.jpg`}
            alt={item.harf || item.title}
            />
            <button className="sound-button" onClick={(e) => {
              e.stopPropagation();
              const wordAudio = new Audio('/sounds/' + (item.soundFile || ''));
              wordAudio.play();
            }}>🔊</button>
          </div>
        ))}
      </div>

      {popupSequence && word && (
        <div
          ref={popupRef}
          tabIndex="0"
          onClick={closePopup}
          onKeyDown={handleKeyDown}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#fff',
              borderRadius: '20px',
              padding: '25px 30px',
              maxWidth: '80%',
              width: '100%',
              maxHeight: '90%',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
              textAlign: 'center',
              fontFamily: 'Jameel Noori Nastaleeq',
              position: 'relative',
            }}
          >
            <div style={overlayStyles.mediaContainer}>
              {isVideoPlaying && word.videoFile ? (
                <>
                  <video
                    ref={videoRef}
                    muted
                    autoPlay
                    controls
                    onEnded={() => setVideoEnded(true)}
                    onError={handleVideoError}
                    src={`/videos/${word.videoFile}`}
                    style={{
                      width: '100%',
                      maxHeight: '65vh',
                      objectFit: 'fill',
                      borderRadius: '12px',
                      display: 'block',
                    }}
                  />
                  <img
                    src={`/images/${word.imageFile}`}
                    alt=""
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      right: '10px',
                      width: '30%',
                      height: '35%',
                      border: '2px solid #fff',
                      borderRadius: '8px',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                      backgroundColor: '#fff',
                      objectFit: 'cover',
                      zIndex: 1,
                    }}
                  />
                </>
              ) : (
                <img
                  src={`/images/${word.imageFile}`}
                  alt={word.word}
                  style={{
                    width: '100%',
                    maxHeight: '50vh',
                    objectFit: 'contain',
                    borderRadius: '12px',
                    display: 'block',
                  }}
                />
              )}

              <div style={overlayStyles.wordBadge}>{word.word}</div>

              {popupSequence.harf && (
                <div style={overlayStyles.letterBadge}>{popupSequence.harf}</div>
              )}

              {nextWord && (
                <button
                  type="button"
                  style={overlayStyles.nextButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                >
                  <span role="img" aria-label="Next word">➡️</span>
                  <span style={overlayStyles.nextButtonText}>اگلا لفظ: {nextWord.word}</span>
                </button>
              )}
            </div>

          </div>

          {/* Confirm dialog */}
          {showConfirmDialog && (
            <div style={{
              position: 'absolute',
              backgroundColor: '#fff',
              border: '2px solid #ddd',
              borderRadius: '15px',
              padding: '20px',
              maxWidth: '80%',
              textAlign: 'center',
              boxShadow: '0 5px 20px rgba(0,0,0,0.3)',
              zIndex: 99999
            }}>
              <p style={{ fontSize: '20px', marginBottom: '15px' }}>تمام الفاظ مکمل ہوگئے۔ کیا اگلے حرف پر چلیں؟</p>
              <button onClick={confirmAdvance} style={{ ...btnStyle, backgroundColor: '#28a745', color: 'white' }}>ہاں</button>
              <button onClick={closePopup} style={{ ...btnStyle, backgroundColor: '#dc3545', color: 'white' }}>نہیں</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const btnStyle = {
  fontSize: '28px',
  width: '60px',
  height: '60px',
  background: '#f7f7f7',
  border: '2px solid #ddd',
  borderRadius: '50%',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

export default CardsPage;
