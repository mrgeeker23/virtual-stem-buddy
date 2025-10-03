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
  { x: 22, y: 60, width: 10, height: 30, label: 'Key 2' },
  { x: 34, y: 60, width: 10, height: 30, label: 'Key 3' },
  { x: 46, y: 60, width: 10, height: 30, label: 'Key 4' },
  { x: 58, y: 60, width: 10, height: 30, label: 'Key 5' },
  { x: 70, y: 60, width: 10, height: 30, label: 'Key 6' },
  { x: 82, y: 60, width: 10, height: 30, label: 'Key 7' },
  { x: 94, y: 60, width: 10, height: 30, label: 'Key 8' },
];

export const VirtualPiano = ({ onKeyPlay }: VirtualPianoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { hands, isReady } = useHandDetection(videoRef);
  const [activeKeys, setActiveKeys] = useState<Set<number>>(new Set());
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

  const triggerKey = useCallback((keyIndex: number) => {
    const now = Date.now();
    const lastTrigger = lastTriggerRef.current.get(keyIndex) || 0;
    
    if (now - lastTrigger > 150) {
      onKeyPlay(keyIndex);
      lastTriggerRef.current.set(keyIndex, now);
      setActiveKeys(prev => new Set(prev).add(keyIndex));
      
      if (isRecording) {
        const timestamp = now - recordingStartRef.current;
        setRecordedSequence(prev => [...prev, { key: keyIndex, timestamp }]);
      }
      
      setTimeout(() => {
        setActiveKeys(prev => {
          const next = new Set(prev);
          next.delete(keyIndex);
          return next;
        });
      }, 150);
    }
  }, [onKeyPlay, isRecording]);

  useEffect(() => {
    if (!hands || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    KEY_POSITIONS.forEach((key, index) => {
      const isActive = activeKeys.has(index);
      const x = (key.x / 100) * canvas.width;
      const y = (key.y / 100) * canvas.height;
      const w = (key.width / 100) * canvas.width;
      const h = (key.height / 100) * canvas.height;
      
      // Create gradient for keys
      const gradient = ctx.createLinearGradient(x, y, x, y + h);
      if (isActive) {
        gradient.addColorStop(0, 'rgba(168, 85, 247, 0.9)');
        gradient.addColorStop(1, 'rgba(236, 72, 153, 0.9)');
      } else {
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
        gradient.addColorStop(1, 'rgba(34, 211, 238, 0.4)');
      }
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, w, h);
      
      // Neon border
      ctx.strokeStyle = isActive ? 'rgba(168, 85, 247, 1)' : 'rgba(34, 211, 238, 0.8)';
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, w, h);
      
      // Add glow effect for active keys
      if (isActive) {
        ctx.shadowColor = 'rgba(168, 85, 247, 0.8)';
        ctx.shadowBlur = 20;
        ctx.strokeRect(x, y, w, h);
        ctx.shadowBlur = 0;
      }
      
      // Key number
      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText(
        `${index + 1}`,
        x + w / 2,
        y + h / 2 + 6
      );
      ctx.shadowBlur = 0;
    });

    if (hands?.landmarks) {
      hands.landmarks.forEach((landmarks) => {
        const indexTip = landmarks[8];
        const middleTip = landmarks[12];
        
        [indexTip, middleTip].forEach((tip) => {
          const x = tip.x * canvas.width;
          const y = tip.y * canvas.height;
          
          // Draw neon finger tip with glow
          ctx.shadowColor = 'rgba(236, 72, 153, 1)';
          ctx.shadowBlur = 20;
          ctx.beginPath();
          ctx.arc(x, y, 12, 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(236, 72, 153, 0.8)';
          ctx.fill();
          
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(x, y, 8, 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.fill();
          ctx.shadowBlur = 0;
          
          KEY_POSITIONS.forEach((_, keyIndex) => {
            if (checkKeyCollision(x, y, keyIndex)) {
              triggerKey(keyIndex);
            }
          });
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
    <Card className="p-6 border-2 border-primary/30 shadow-glow-lg bg-card/80 backdrop-blur-sm">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Virtual Piano Keys
        </h2>
        
        <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border-2 border-primary/40 shadow-glow">
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
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
              <p className="text-primary-glow text-lg font-semibold animate-pulse">Initializing camera...</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-center flex-wrap">
          {!isRecording ? (
            <Button 
              onClick={startRecording} 
              className="bg-primary hover:bg-primary/90 shadow-glow transition-all hover:shadow-glow-lg"
            >
              Start Recording Loop
            </Button>
          ) : (
            <Button 
              onClick={stopRecording} 
              variant="destructive"
              className="shadow-glow animate-pulse-glow"
            >
              Stop Recording
            </Button>
          )}
          
          {recordedSequence.length > 0 && !isLooping && (
            <Button 
              onClick={playLoop} 
              className="bg-secondary hover:bg-secondary/90 shadow-glow transition-all hover:shadow-glow-lg"
            >
              Play Loop ({recordedSequence.length} keys)
            </Button>
          )}
          
          {isLooping && (
            <Button 
              onClick={stopLoop}
              className="bg-accent hover:bg-accent/90 shadow-accent-glow"
            >
              Stop Loop
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
