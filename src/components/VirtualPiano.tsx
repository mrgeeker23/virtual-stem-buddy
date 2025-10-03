import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useHandDetection } from '@/hooks/useHandDetection';
import { Card } from '@/components/ui/card';

interface KeyPress {
  key: number;
  timestamp: number;
}

interface VirtualPianoProps {
  onKeyPlay: (keyIndex: number) => void;
}

const KEY_POSITIONS = [
  { x: 10, y: 60, width: 10, height: 30, label: 'Key 1' },
  { x: 20, y: 60, width: 10, height: 30, label: 'Key 2' },
  { x: 30, y: 60, width: 10, height: 30, label: 'Key 3' },
  { x: 40, y: 60, width: 10, height: 30, label: 'Key 4' },
  { x: 50, y: 60, width: 10, height: 30, label: 'Key 5' },
  { x: 60, y: 60, width: 10, height: 30, label: 'Key 6' },
  { x: 70, y: 60, width: 10, height: 30, label: 'Key 7' },
  { x: 80, y: 60, width: 10, height: 30, label: 'Key 8' },
];

export const VirtualPiano = ({ onKeyPlay }: VirtualPianoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { hands, isReady } = useHandDetection(videoRef);
  const [activeKeys, setActiveKeys] = useState<Set<number>>(new Set());
  const [touchedKeys, setTouchedKeys] = useState<Set<number>>(new Set());
  const lastTriggerRef = useRef<Map<number, number>>(new Map());
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordedSequence, setRecordedSequence] = useState<KeyPress[]>([]);
  const [isLooping, setIsLooping] = useState(false);
  const recordingStartRef = useRef<number>(0);
  const loopIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkKeyCollision = useCallback((fingerX: number, fingerY: number, keyIndex: number) => {
    const key = KEY_POSITIONS[keyIndex];
    const canvasWidth = canvasRef.current?.width || 1280;
    const canvasHeight = canvasRef.current?.height || 720;
    
    const keyXMin = (key.x / 100) * canvasWidth;
    const keyXMax = ((key.x + key.width) / 100) * canvasWidth;
    const keyYMin = (key.y / 100) * canvasHeight;
    const keyYMax = ((key.y + key.height) / 100) * canvasHeight;
    
    return fingerX >= keyXMin && fingerX <= keyXMax && fingerY >= keyYMin && fingerY <= keyYMax;
  }, []);

  const triggerKey = useCallback((keyIndex: number, isTouching: boolean) => {
    if (isTouching && !touchedKeys.has(keyIndex)) {
      // First touch - play sound
      onKeyPlay(keyIndex);
      setTouchedKeys(prev => new Set(prev).add(keyIndex));
      
      if (isRecording) {
        const timestamp = Date.now() - recordingStartRef.current;
        setRecordedSequence(prev => [...prev, { key: keyIndex, timestamp }]);
      }
    }
  }, [onKeyPlay, isRecording, touchedKeys]);

  useEffect(() => {
    if (!hands || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Track which keys are currently being touched this frame
    const currentlyTouched = new Set<number>();

    if (hands?.landmarks) {
      hands.landmarks.forEach((landmarks) => {
        const indexTip = landmarks[8];
        const middleTip = landmarks[12];
        
        [indexTip, middleTip].forEach((tip) => {
          const x = tip.x * canvas.width;
          const y = tip.y * canvas.height;
          
          KEY_POSITIONS.forEach((_, keyIndex) => {
            if (checkKeyCollision(x, y, keyIndex)) {
              currentlyTouched.add(keyIndex);
            }
          });
        });
      });
    }

    // Update active keys based on current touches
    setActiveKeys(currentlyTouched);

    // Trigger sound for newly touched keys
    currentlyTouched.forEach(keyIndex => {
      triggerKey(keyIndex, true);
    });

    // Clear touched state for keys no longer being touched
    setTouchedKeys(prev => {
      const next = new Set(prev);
      prev.forEach(keyIndex => {
        if (!currentlyTouched.has(keyIndex)) {
          next.delete(keyIndex);
        }
      });
      return next;
    });

    // Draw piano keys
    KEY_POSITIONS.forEach((key, index) => {
      const isActive = activeKeys.has(index);
      const x = (key.x / 100) * canvas.width;
      const y = (key.y / 100) * canvas.height;
      const w = (key.width / 100) * canvas.width;
      const h = (key.height / 100) * canvas.height;
      
      // iOS-style subtle gradient
      if (isActive) {
        ctx.fillStyle = 'rgba(0, 122, 255, 0.8)';
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      }
      ctx.fillRect(x, y, w, h);
      
      // Clean border
      ctx.strokeStyle = isActive ? 'rgba(0, 122, 255, 1)' : 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);
      
      // Key number
      ctx.fillStyle = isActive ? 'white' : 'rgba(255, 255, 255, 0.9)';
      ctx.font = '600 14px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        `${index + 1}`,
        x + w / 2,
        y + h / 2 + 5
      );
    });

    // Draw finger indicators
    if (hands?.landmarks) {
      hands.landmarks.forEach((landmarks) => {
        const indexTip = landmarks[8];
        const middleTip = landmarks[12];
        
        [indexTip, middleTip].forEach((tip) => {
          const x = tip.x * canvas.width;
          const y = tip.y * canvas.height;
          
          // Clean iOS-style indicator
          ctx.beginPath();
          ctx.arc(x, y, 10, 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(0, 122, 255, 0.6)';
          ctx.fill();
          
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.fill();
        });
      });
    }
  }, [hands, activeKeys, checkKeyCollision, triggerKey]);

  const startRecording = useCallback(() => {
    setRecordedSequence([]);
    recordingStartRef.current = Date.now();
    setIsRecording(true);
  }, []);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
  }, []);

  const playLoop = useCallback(() => {
    if (recordedSequence.length === 0) return;
    
    setIsLooping(true);
    
    const playSequence = () => {
      recordedSequence.forEach((keyPress) => {
        setTimeout(() => {
          onKeyPlay(keyPress.key);
        }, keyPress.timestamp);
      });
      
      const totalDuration = recordedSequence[recordedSequence.length - 1].timestamp + 200;
      loopIntervalRef.current = setTimeout(playSequence, totalDuration);
    };
    
    playSequence();
  }, [recordedSequence, onKeyPlay]);

  const stopLoop = useCallback(() => {
    setIsLooping(false);
    if (loopIntervalRef.current) {
      clearTimeout(loopIntervalRef.current);
      loopIntervalRef.current = null;
    }
  }, []);

  return (
    <Card className="p-5 border shadow-sm">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-center">Virtual Piano Keys</h2>
        
        <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border">
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
            playsInline
          />
          <canvas
            ref={canvasRef}
            width={1280}
            height={720}
            className="absolute inset-0 w-full h-full scale-x-[-1]"
          />
          {!isReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/90">
              <p className="text-white text-sm">Initializing camera...</p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex gap-2 justify-center flex-wrap">
            {!isRecording ? (
              <Button 
                onClick={startRecording} 
                variant="default"
                className="rounded-full"
              >
                Start Recording
              </Button>
            ) : (
              <Button 
                onClick={stopRecording} 
                variant="destructive"
                className="rounded-full animate-pulse"
              >
                ● Stop Recording
              </Button>
            )}
            
            {recordedSequence.length > 0 && !isLooping && (
              <Button 
                onClick={playLoop} 
                variant="outline"
                className="rounded-full"
              >
                Play Loop ({recordedSequence.length})
              </Button>
            )}
            
            {isLooping && (
              <Button 
                onClick={stopLoop}
                variant="outline"
                className="rounded-full"
              >
                Stop Loop
              </Button>
            )}
          </div>
          
          <p className="text-xs text-center text-muted-foreground">
            Record your key sequence to loop it repeatedly (not saved to disk)
          </p>
        </div>
      </div>
    </Card>
  );
};
