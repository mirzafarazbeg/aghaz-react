// src/Mascot.js
import React, { useEffect, useState, useRef } from 'react';

function Mascot() {
    const [introComplete, setIntroComplete] = useState(false);
    const [quotes, setQuotes] = useState([]);
    const [currentQuote, setCurrentQuote] = useState('');
    const [showSpeechBubble, setShowSpeechBubble] = useState(false);
    const [position, setPosition] = useState({ x: null, y: null });

    const mascotRef = useRef(null);
    const isDragging = useRef(false);
    const offset = useRef({ x: 0, y: 0 });

    // Inject keyframes once
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes mascotIntro {
                0% { transform: translate(-50%, -50%) scale(3); }
                100% { transform: translateY(110%) scale(1); }
            }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    // Load quotes and start intro
    useEffect(() => {
        setTimeout(() => setIntroComplete(true), 2000);
        fetch('/quotes.json')
            .then((res) => res.json())
            .then((data) => setQuotes(data))
            .catch((err) => console.error('Error fetching quotes:', err));
    }, []);

    // Hide speech bubble on outside click
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (mascotRef.current && !mascotRef.current.contains(e.target)) {
                setShowSpeechBubble(false);
            }
        };
        document.addEventListener('click', handleOutsideClick);
        return () => document.removeEventListener('click', handleOutsideClick);
    }, []);

    // Mouse and touch drag
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging.current) return;
            setPosition({
                x: e.clientX - offset.current.x,
                y: e.clientY - offset.current.y,
            });
        };

        const handleTouchMove = (e) => {
            if (!isDragging.current) return;
            const touch = e.touches[0];
            setPosition({
                x: touch.clientX - offset.current.x,
                y: touch.clientY - offset.current.y,
            });
        };

        const stopDrag = () => {
            isDragging.current = false;
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', stopDrag);
        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('touchend', stopDrag);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', stopDrag);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', stopDrag);
        };
    }, []);

    const startDrag = (e) => {
        e.preventDefault();
        isDragging.current = true;

        const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
        const rect = mascotRef.current.getBoundingClientRect();
        offset.current = {
            x: clientX - rect.left,
            y: clientY - rect.top,
        };
    };

    const handleClick = (e) => {
        e.stopPropagation();
        if (quotes.length > 0) {
            const quote = quotes[Math.floor(Math.random() * quotes.length)];
            setCurrentQuote(quote);
            setShowSpeechBubble(true);
            // speakQuote(quote);
        }
    };

    // const speakQuote = (text) => {
    //     if ('speechSynthesis' in window) {
    //         const utterance = new SpeechSynthesisUtterance(text);
    //         utterance.lang = 'ur-PK';
    //         utterance.pitch = 1;
    //         utterance.rate = 1;
    //         speechSynthesis.cancel();
    //         speechSynthesis.speak(utterance);
    //     }
    // };

    // Determine positioning style

    
    

    const getMascotStyle = () => {
        if (!introComplete) {
            return {
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) scale(3)',
                zIndex: 1000,
                animation: 'mascotIntro 3.5s ease-out forwards',
                cursor: 'grab',
            };
        } else if (position.x !== null && position.y !== null) {
            return {
                position: 'fixed',
                left: `${position.x}px`,
                top: `${position.y}px`,
                zIndex: 1000,
                cursor: 'grab',
            };
        } else {
            // default after intro
            return {
                position: 'fixed',
                bottom: '10%',
                right: '20px',
                transform: 'scale(1)',
                zIndex: 10,
                cursor: 'grab',
            };
        }
    };

//     return (
//         <div
//             ref={mascotRef}
//             onMouseDown={startDrag}
//             onTouchStart={startDrag}
//             onClick={handleClick}
//             style={getMascotStyle()}
//         >
//             <img
//                 src="/images/mascot.png"
//                 alt="Mascot"
//                 style={{
//                     width: '100px',
//                     userSelect: 'none',
//                     pointerEvents: 'none',
//                 }}
//             />
//             {/* {showSpeechBubble && currentQuote && (
//                 <div
//                     style={{
//                         position: 'absolute',
//                         bottom: '140px',
//                         right: '40px',
//                         backgroundColor: '#f5f5f5',
//                         padding: '10px 15px',
//                         borderRadius: '10px',
//                         fontFamily: 'Jameel Noori Nastaleeq',
//                         fontSize: '16px',
//                         color: '#333',
//                         boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
//                         zIndex: 20,
//                     }}
//                 >
//                     {currentQuote}
//                 </div>
//             )} */}
// {showSpeechBubble && currentQuote && (
//     <div
//         style={{
//             position: 'absolute',
//             bottom: '150px',
//             right: '0px',
//             backgroundColor: '#f5f5f5',
//             padding: '10px 15px',
//             borderRadius: '10px',
//             fontFamily: 'Jameel Noori Nastaleeq',
//             fontSize: '16px',
//             color: '#333',
//             boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
//             zIndex: 20,
//             maxWidth: '200px',
//             lineHeight: 1.5,
//             position: 'relative',
//             display: 'inline-block',
//         }}
//     >
//         {currentQuote}
//         <div
//             style={{
//                 content: '""',
//                 position: 'absolute',
//                 bottom: '-10px',
//                 right: '20px',
//                 width: 0,
//                 height: 0,
//                 borderLeft: '10px solid transparent',
//                 borderRight: '10px solid transparent',
//                 borderTop: '10px solid #f5f5f5',
//             }}
//         ></div>
//     </div>
// )}

//         </div>
//     );

return (
    <div
        ref={mascotRef}
        onMouseDown={startDrag}
        onTouchStart={startDrag}
        onClick={handleClick}
        style={{
            position: 'fixed',
            left: position.x !== null ? `${position.x}px` : 'auto',
            top: position.y !== null ? `${position.y}px` : 'auto',
            bottom: position.x === null ? '10%' : 'auto',
            right: position.x === null ? '20px' : 'auto',
            zIndex: 1000,
            cursor: 'grab',
        }}
    >
        {showSpeechBubble && currentQuote && (
            <div
style={{
  position: 'absolute',
  bottom: '140px',
  right: '20',
  backgroundColor: '#f5f5f5',
  padding: '12px 18px',
  borderRadius: '10px',
  fontFamily: 'Jameel Noori Nastaleeq',
  fontSize: '16px',
  color: '#333',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
  width: '200px',
  maxWidth: '30vw',         // ⬅️ previously ~200-220px
  lineHeight: 1.6,
  display: 'inline-block',
  zIndex: 20,
}}
            >
                {currentQuote}
                <div
                    style={{
                        content: '""',
                        position: 'absolute',
                        bottom: '-10px',
                        right: '40px',
                        width: 0,
                        height: 0,
                        borderLeft: '10px solid transparent',
                        borderRight: '10px solid transparent',
                        borderTop: '10px solid #f5f5f5',
                    }}
                ></div>
            </div>
        )}

        <img
            src="/images/mascot.png"
            alt="Mascot"
            style={{
                width: '100px',
                userSelect: 'none',
                pointerEvents: 'none',
            }}
        />
    </div>
);

}

export default Mascot;
