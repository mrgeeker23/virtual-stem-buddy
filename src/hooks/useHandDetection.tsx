import { useEffect, useRef, useState } from 'react';
import { Hands, Results } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export const useHandDetection = (videoRef: React.RefObject<HTMLVideoElement>) => {
  const [hands, setHands] = useState<Results | null>(null);
  const [isReady, setIsReady] = useState(false);
  const handsInstanceRef = useRef<Hands | null>(null);
  const cameraRef = useRef<Camera | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    const handsInstance = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    handsInstance.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.5,
    });

    handsInstance.onResults((results: Results) => {
      setHands(results);
    });

    handsInstanceRef.current = handsInstance;

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current) {
          await handsInstance.send({ image: videoRef.current });
        }
      },
      width: 1280,
      height: 720,
    });

    cameraRef.current = camera;
    camera.start().then(() => setIsReady(true));

    return () => {
      camera.stop();
      handsInstance.close();
    };
  }, [videoRef]);

  return { hands, isReady };
};
