import React, { useState, useEffect, useRef } from 'react';
import '../index.css';
import alphabetData from '../Data/alphabetData';

function Maloomat() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryWords, setCategoryWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const videoRef = useRef(null);
  const loopTimeout = useRef(null);
  const firstWordRef = useRef(null);
  const miscLabel = 'متفرق';

  const urduCategoryMap = {
    animal: 'جانور',
    fruit: 'پھل',
    vehicle: 'گاڑیاں',
    object: 'چیزیں',
    household: 'گھریلو اشیاء',
    color: 'رنگ',
    body: 'جسم',
    food: 'خوراک',
    shape: 'اشکال',
    tool: 'اوزار',
    nature: 'قدرت',
    place: 'جگہیں',
    concept: 'تصورات',
    vegetable: 'سبزیاں',
    occupation: 'پیشے',
    insect: 'کیڑے مکوڑے',
    person: 'شخصیات',
    plant: 'پودے',
    transport: 'ذرائع آمد و رفت'
  };

  const getUrduLabel = (key) => urduCategoryMap[key] || key;

  const styles = {
    container: {
      textAlign: 'center',
      padding: '0px',
    },
    categoryGrid: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: '5vmin',
    },
    categoryCard: {
      backgroundColor: '#333',
      border: '2px solid #ddd',
      borderRadius: '10px',
      fontSize: '5vmin',
      cursor: 'pointer',
      transition: 'transform 0.2s',
      width: '20vw',
      textAlign: 'center',
      color: 'white',
    },
    categoryImage: {
      width: '20vw',
      height: 'auto',
      objectFit: 'cover',
      borderRadius: '10px',
      marginBottom: '0',
      border: '1px solid #ccc',
    },
    popup: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '95vw',
      height: '95vh',
      backgroundColor: 'rgba(10, 10, 10, 0.9)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      borderRadius: '10px',
    },
    popupWord: {
      textAlign: 'center',
      position: 'relative',
      width: '100%',
    },
    mediaContainer: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)', 
      width: '90vw',
      height: '90vh',
      aspectRatio: '4/3',
      margin: 'auto',
    },
    video: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)', 

      width: '90vw',
      height: '90vh',
      objectFit: 'cover',
      border: '1px solid #666',
      borderRadius: '10px',
    },
    image: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)', 
      width: '85vw',
      height: '90vh',
      objectFit: 'cover',
      border: '1px solid #666',
      borderRadius: '10px',
    },
    overlayImage: {
      position: 'absolute',
      bottom: '0vh',
      right: '0px',
      width: '30vw',
      height: 'auto',
      border: '1px solid #111',
      zIndex: 10,
      borderRadius: '4px',
      objectFit: 'cover',
    },
  };

  const getGroupedCategories = () => {
    const cacheKey = 'maloomatThumbnails';
    let cachedThumbs = {};

    try {
      cachedThumbs = JSON.parse(localStorage.getItem(cacheKey)) || {};
    } catch (e) {
      cachedThumbs = {};
    }

    const categoryMap = {};
    alphabetData.forEach((letterObj) => {
      letterObj.words.forEach((wordObj) => {
        wordObj.categories?.forEach((cat) => {
          if (!categoryMap[cat]) categoryMap[cat] = [];
          categoryMap[cat].push(wordObj);
        });
      });
    });

    const grouped = {};
    const misc = [];

    Object.entries(categoryMap).forEach(([key, words]) => {
      if (words.length < 4) {
        misc.push(...words);
      } else {
        if (!cachedThumbs[key]) {
          const img = words[Math.floor(Math.random() * words.length)].imageFile;
          cachedThumbs[key] = img;
        }
        grouped[key] = { words, thumbnail: cachedThumbs[key] };
      }
    });

    if (misc.length > 0) {
      if (!cachedThumbs[miscLabel]) {
        const img = misc[Math.floor(Math.random() * misc.length)]?.imageFile;
        cachedThumbs[miscLabel] = img || null;
      }
      grouped[miscLabel] = { words: misc, thumbnail: cachedThumbs[miscLabel] };
    }

    localStorage.setItem(cacheKey, JSON.stringify(cachedThumbs));
    return grouped;
  };

  const groupedCategories = getGroupedCategories();

  const handleCategoryClick = (categoryKey) => {
    const group = groupedCategories[categoryKey];
    setCategoryWords(group.words);
    setSelectedCategory(categoryKey);
    setCurrentIndex(0);
    firstWordRef.current = group.words[0]?.word || null;
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    clearTimeout(loopTimeout.current);
  };

  const speakWord = (word) => {
    const audio = new Audio(`/sounds/${word.soundFile}`);
    audio.play();
  };

  useEffect(() => {
    if (!isPopupOpen || categoryWords.length === 0) return;

    const word = categoryWords[currentIndex];
    speakWord(word);

    const next = () => {
      const nextIndex = (currentIndex + 1) % categoryWords.length;
      const nextWord = categoryWords[nextIndex]?.word;
      if (nextWord === firstWordRef.current) {
        setTimeout(closePopup, 2000);
        return;
      }
      setCurrentIndex(nextIndex);
    };

    if (word.videoFile) {
      loopTimeout.current = setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.onended = () => {
            loopTimeout.current = setTimeout(next, 1500);
          };
          videoRef.current.play();
        }
      }, 1000);
    } else {
      loopTimeout.current = setTimeout(next, 3000);
    }

    return () => clearTimeout(loopTimeout.current);
  }, [currentIndex, categoryWords, isPopupOpen]);

  useEffect(() => {
    if (!isPopupOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') closePopup();
      if (e.key === 'ArrowLeft') setCurrentIndex(i => (i + 1) % categoryWords.length);
      if (e.key === 'ArrowRight') setCurrentIndex(i => (i - 1 + categoryWords.length) % categoryWords.length);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isPopupOpen, categoryWords.length]);

  return (
    <div style={styles.container}>
      {!isPopupOpen && (
        <div style={styles.categoryGrid}>
          {Object.keys(groupedCategories).map((key, idx) => (
            <div key={idx} style={styles.categoryCard} onClick={() => handleCategoryClick(key)}>
              <img src={`/images/${groupedCategories[key].thumbnail}`} alt={key} style={styles.categoryImage} />
              <div>{getUrduLabel(key)}</div>
            </div>
          ))}
        </div>
      )}
      {isPopupOpen && categoryWords.length > 0 && (
        <div style={styles.popup}>
<div style={{
  position: 'absolute',
  top: '2vh',
  right: '2vw',
  backgroundColor: '#222',
  color: '#fff',
  fontSize: 'min(6vw, 28px)', // scales down on small screens
  padding: '4px 5vw',
  borderRadius: '12px',
  boxShadow: '0 0 6px rgba(0,0,0,0.4)',
  zIndex: 999,
  whiteSpace: 'nowrap'
}}>
{getUrduLabel(selectedCategory)}⬅️  {categoryWords[currentIndex].word}
</div>
            <div style={{ width: '1vw',position:'absolute',left:'0vw',top:'2vh'  }}>
              <div style={{ height: '90vh', backgroundColor: '#444', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{
                  height: `${((currentIndex + 1) / categoryWords.length) * 100}%`,
                  width: '100%',
                  backgroundColor: '#4caf50',
                  transition: 'width 0.5s ease'
                }} />
              </div>
            </div>

          <div style={styles.popupWord}>
            <div style={styles.mediaContainer}>
              {categoryWords[currentIndex].videoFile ? (
                <>
                  <video ref={videoRef} src={`/videos/${categoryWords[currentIndex].videoFile}`} style={styles.video} controls={true} />
                  <img src={`/images/${categoryWords[currentIndex].imageFile}`} alt={categoryWords[currentIndex].word} style={styles.overlayImage} />
                </>
              ) : (
                <img src={`/images/${categoryWords[currentIndex].imageFile}`} alt={categoryWords[currentIndex].word} style={styles.image} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Maloomat;
