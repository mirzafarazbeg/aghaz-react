import { useRef, useEffect, useCallback } from 'react';

/**
 * Manages a single tracked audio instance with automatic cleanup.
 * Use this when you need to stop the previous sound before playing a new one,
 * or when you need to pause audio on component unmount.
 *
 * For simple fire-and-forget sounds, use playSound() from utils/audio.js instead.
 */
export function useAudio() {
  const audioRef = useRef(null);

  const play = useCallback((fileOrPath) => {
    if (!fileOrPath) return;
    const path = fileOrPath.startsWith('/') ? fileOrPath : `/sounds/${fileOrPath}`;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const audio = new Audio(path);
    audioRef.current = audio;
    audio.play().catch(() => {});
    return audio;
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
  }, []);

  // Pause audio when component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return { play, stop, audioRef };
}
