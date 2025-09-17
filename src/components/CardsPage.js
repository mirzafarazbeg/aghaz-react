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
            {/* Main Word */}
            <div style={{
              fontSize: '42px',
              color: '#333',
              marginBottom: '10px',
              fontWeight: 'bold',
              borderBottom: '2px solid #eee',
              paddingBottom: '10px',
            }}>
              {word.word}
            </div>

            {/* Optional label below */}
            <div style={{
              fontSize: '24px',
              color: '#777',
              marginBottom: '20px',
            }}>
              {/* {word.label || word.word} */}
              {popupSequence.harf}
            </div>

            {/* Media */}
            {isVideoPlaying && word.videoFile ? (
              <div style={{ position: 'relative', marginBottom: '20px' }}>
                <video
                  ref={videoRef}
                  muted
                  autoPlay
                  controls
                  onEnded={() => setVideoEnded(true)}
                  src={`/videos/${word.videoFile}`}
                  style={{
                    width: '100%',
                    maxHeight: '65vh',
                    objectFit: 'fill',
                    borderRadius: '12px',
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
                    backgroundColor: '#fff'
                  }}
                />
              </div>
            ) : (
              <img
                src={`/images/${word.imageFile}`}
                alt={word.word}
                style={{
                  width: '100%',
                  maxHeight: '50vh',
                  objectFit: 'contain',
                  borderRadius: '12px',
                  marginBottom: '20px',
                }}
              />
            )}

            {/* Control Buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '20px',
              marginTop: '10px'
            }}>
              {/* <button style={btnStyle} onClick={(e) => {
                e.stopPropagation();
                const audio = new Audio('/sounds/' + word.soundFile);
                audio.play();
              }}>🔊</button>

              {word.videoFile && !isVideoPlaying && (
                <button style={btnStyle} onClick={(e) => {
                  e.stopPropagation();
                  setIsVideoPlaying(true);
                }}>🎥</button>
              )}

              <button style={btnStyle} onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}>➡</button> */}
            {/* Next word preview */}
            {nextWord && (
              <div style={{
                position: 'relative',
                top: '5px',
                right: '50px',
                fontSize: '26px',
                backgroundColor: '#fff',
                padding: '6px 10px',
                borderRadius: '10px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                color: '#444',
                cursor: 'pointer'
              }}  onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}>
                ➡️اگلا لفظ: {nextWord.word}
              </div>
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
