import { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker, HandLandmarkerResult } from '@mediapipe/tasks-vision';

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export const useHandDetection = (videoRef: React.RefObject<HTMLVideoElement>) => {
  const [hands, setHands] = useState<HandLandmarkerResult | null>(null);
  const [isReady, setIsReady] = useState(false);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    let isActive = true;

    const initializeHandDetection = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        
        const handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: '/models/hand_landmarker.task',
            delegate: 'GPU'
          },
          numHands: 2,
          runningMode: 'VIDEO',
          minHandDetectionConfidence: 0.7,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        handLandmarkerRef.current = handLandmarker;

        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 1280, height: 720 } 
        });
        
        if (videoRef.current && isActive) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setIsReady(true);
          detectHands();
        }
      } catch (error) {
        console.error('Error initializing hand detection:', error);
      }
    };

    const detectHands = () => {
      if (!isActive || !videoRef.current || !handLandmarkerRef.current) return;
      
      if (videoRef.current.readyState >= 2) {
        const detections = handLandmarkerRef.current.detectForVideo(
          videoRef.current,
          performance.now()
        );
        setHands(detections);
      }
      
      animationFrameRef.current = requestAnimationFrame(detectHands);
    };

    initializeHandDetection();

    return () => {
      isActive = false;
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      
      if (handLandmarkerRef.current) {
        handLandmarkerRef.current.close();
      }
    };
  }, [videoRef]);

  return { hands, isReady };
};
