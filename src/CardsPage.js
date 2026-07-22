// src/components/Mascot.js
import React, { useEffect, useState, useRef } from 'react';
// Fixed: was fetching /quotes.json at runtime (extra network request, possible cache miss).
// Now imports directly — consistent with how all other components access mascot quotes.
import { getRandomQuote } from '../utils/gameUtils';

function Mascot() {
    const [introComplete, setIntroComplete]     = useState(false);
    const [currentQuote, setCurrentQuote]       = useState('');
    const [showSpeechBubble, setShowSpeechBubble] = useState(false);
    const [position, setPosition]               = useState({ x: null, y: null });

    const mascotRef  = useRef(null);
    const isDragging = useRef(false);
    const offset     = useRef({ x: 0, y: 0 });

    // Inject intro keyframes once
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes mascotIntro {
                0%   { transform: translate(-50%, -50%) scale(3); }
                100% { transform: translateY(110%) scale(1); }
            }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    useEffect(() => {
        const id = setTimeout(() => setIntroComplete(true), 2000);
        return () => clearTimeout(id);
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

    // Mouse and touch drag handlers
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging.current) return;
            setPosition({ x: e.clientX - offset.current.x, y: e.clientY - offset.current.y });
        };
        const handleTouchMove = (e) => {
            if (!isDragging.current) return;
            const touch = e.touches[0];
            setPosition({ x: touch.clientX - offset.current.x, y: touch.clientY - offset.current.y });
        };
        const stopDrag = () => { isDragging.current = false; };

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
        isDragging.current = true;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const rect = mascotRef.current.getBoundingClientRect();
        offset.current = { x: clientX - rect.left, y: clientY - rect.top };
    };

    const handleClick = () => {
        if (isDragging.current) return;
        setCurrentQuote(getRandomQuote());
        setShowSpeechBubble(prev => !prev);
    };

    return (
        <div
            ref={mascotRef}
            onMouseDown={startDrag}
            onTouchStart={startDrag}
            onClick={handleClick}
            style={{
                position: 'fixed',
                left:   position.x !== null ? `${position.x}px` : 'auto',
                top:    position.y !== null ? `${position.y}px` : 'auto',
                bottom: position.x === null ? '10%'  : 'auto',
                right:  position.x === null ? '20px' : 'auto',
                zIndex: 1000,
                cursor: 'grab',
            }}
        >
            {showSpeechBubble && currentQuote && (
                <div style={{
                    position: 'absolute', bottom: '140px', right: '20px',
                    backgroundColor: '#f5f5f5', padding: '12px 18px',
                    borderRadius: '10px', fontFamily: 'Jameel Noori Nastaleeq',
                    fontSize: '16px', color: '#333',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                    width: '200px', maxWidth: '30vw',
                    lineHeight: 1.6, display: 'inline-block', zIndex: 20,
                }}>
                    {currentQuote}
                    <div style={{
                        position: 'absolute', bottom: '-10px', right: '40px',
                        width: 0, height: 0,
                        borderLeft: '10px solid transparent', borderRight: '10px solid transparent',
                        borderTop: '10px solid #f5f5f5',
                    }} />
                </div>
            )}

            <img
                src="/images/mascot.png"
                alt="Mascot"
                style={{ width: '100px', userSelect: 'none', pointerEvents: 'none' }}
            />
        </div>
    );
}

export default Mascot;
