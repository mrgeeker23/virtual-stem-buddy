import { useCallback, useState } from 'react';
import { VirtualPiano } from '@/components/VirtualPiano';
import { AudioControls } from '@/components/AudioControls';
import { useAudioPlayer, useOneShot } from '@/hooks/useAudioPlayer';
import { useToast } from '@/hooks/use-toast';

const VirtualStemPlayer = () => {
  const { toast } = useToast();
  const [keyAudios] = useState<HTMLAudioElement[]>(() =>
    Array.from({ length: 8 }, (_, i) => new Audio(`/audio/key${i + 1}.wav`))
  );

  const drums = useAudioPlayer('/audio/drums.wav', { loop: true, bpm: 85 });
  const bass = useAudioPlayer('/audio/bass.wav', { loop: true, bpm: 85 });
  const favorite = useOneShot('/audio/favorite.wav');

  const handleKeyPlay = useCallback((keyIndex: number) => {
    const audio = keyAudios[keyIndex];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch((error) => {
        console.error('Error playing key:', error);
      });
    }
  }, [keyAudios]);

  const handleFavoritePlay = useCallback(() => {
    favorite.play();
  }, [favorite]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="text-center space-y-2 py-4">
          <h1 className="text-3xl font-semibold text-foreground">Virtual Stem Player</h1>
          <p className="text-muted-foreground text-sm">
            Runaway - Kanye West | C# Minor | 85 BPM
          </p>
        </header>

        <div className="space-y-6">
          <VirtualPiano onKeyPlay={handleKeyPlay} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AudioControls
              label="Drums"
              isPlaying={drums.isPlaying}
              onToggle={drums.toggle}
              type="drums"
            />
            <AudioControls
              label="Bass"
              isPlaying={bass.isPlaying}
              onToggle={bass.toggle}
              type="bass"
            />
            <AudioControls
              label="Favorite"
              isPlaying={false}
              onToggle={handleFavoritePlay}
              type="favorite"
            />
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground bg-card rounded-xl p-4 border">
          <p className="font-medium mb-1">Setup Instructions</p>
          <p>Place your WAV files in the public/audio folder:</p>
          <p className="text-foreground/60">key1.wav - key8.wav, drums.wav, bass.wav, favorite.wav</p>
        </div>
      </div>
    </div>
  );
};

export default VirtualStemPlayer;
