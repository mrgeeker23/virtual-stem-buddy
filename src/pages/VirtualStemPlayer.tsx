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
    <div className="min-h-screen bg-background p-4 relative overflow-hidden">
      {/* Gradient background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none" />
      <div className="absolute top-20 left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        <header className="text-center space-y-3">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
            Virtual Stem Player
          </h1>
          <p className="text-muted-foreground text-lg font-medium">
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

        <div className="text-center text-sm text-muted-foreground border border-border/50 rounded-lg p-4 bg-card/50 backdrop-blur-sm">
          <p>Place your WAV files in the public/audio folder:</p>
          <p className="text-primary-glow">key1.wav - key8.wav, drums.wav, bass.wav, favorite.wav</p>
        </div>
      </div>
    </div>
  );
};

export default VirtualStemPlayer;
