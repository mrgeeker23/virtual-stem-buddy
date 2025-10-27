import { useRef, useCallback, useState } from 'react';

interface AudioPlayerOptions {
  loop?: boolean;
  bpm?: number;
}

export const useAudioPlayer = (audioSrc: string, options: AudioPlayerOptions = {}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const initAudio = useCallback(() => {
    if (!audioRef.current) {
      const audio = new Audio(audioSrc);
      audio.loop = options.loop || false;
      audio.addEventListener('canplaythrough', () => setIsLoaded(true));
      audio.addEventListener('ended', () => setIsPlaying(false));
      audioRef.current = audio;
    }
  }, [audioSrc, options.loop]);

  const play = useCallback(() => {
    initAudio();
    if (audioRef.current) {
      console.log('Playing audio:', audioSrc);
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', audioSrc, error);
      });
      setIsPlaying(true);
    }
  }, [initAudio, audioSrc]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  return { play, pause, stop, toggle, isPlaying, isLoaded };
};

export const useOneShot = (audioSrc: string) => {
  const play = useCallback(() => {
    console.log('Playing one-shot audio:', audioSrc);
    const audio = new Audio(audioSrc);
    audio.play().catch(error => {
      console.error('Error playing one-shot audio:', audioSrc, error);
    });
  }, [audioSrc]);

  return { play };
};
