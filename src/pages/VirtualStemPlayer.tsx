import { useCallback, useState } from 'react';
import { VirtualPiano } from '@/components/VirtualPiano';
import { AudioControls } from '@/components/AudioControls';
import { useAudioPlayer, useOneShot } from '@/hooks/useAudioPlayer';
import { useToast } from '@/hooks/use-toast';

const VirtualStemPlayer = () => {
  const { toast } = useToast();
  const [isFavoritePlaying, setIsFavoritePlaying] = useState(false);
  const [keyAudios] = useState<HTMLAudioElement[]>(() =>
    Array.from({ length: 8 }, (_, i) => new Audio(`/audio/key${i + 1}.mp3`))
  );

  const drums = useAudioPlayer('/audio/drums.mp3', { loop: true, bpm: 85 });
  const bass = useAudioPlayer('/audio/bass.mp3', { loop: true, bpm: 85 });
  const favorite = useOneShot('/audio/favorite.mp3');

  const handleKeyPlay = useCallback((keyIndex: number) => {
    console.log('Attempting to play key:', keyIndex);
    const audio = keyAudios[keyIndex];
    if (audio) {
      console.log('Audio element found, playing:', audio.src);
      audio.currentTime = 0;
      audio.play().catch((error) => {
        console.error('Error playing key:', keyIndex, error);
        toast({
          title: "Audio Error",
          description: `Could not play key${keyIndex + 1}.mp3. Make sure the file exists in /public/audio/`,
          variant: "destructive",
        });
      });
    } else {
      console.error('Audio element not found for key:', keyIndex);
    }
  }, [keyAudios, toast]);

  const handleFavoritePlay = useCallback(() => {
    favorite.play();
    setIsFavoritePlaying(true);
    setTimeout(() => setIsFavoritePlaying(false), 2000);
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
              isPlaying={isFavoritePlaying}
              onToggle={handleFavoritePlay}
              type="favorite"
            />
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground bg-card rounded-xl p-4 border">
          <p className="font-medium mb-1">Setup Instructions</p>
          <p>Place your MP3 files in the public/audio folder:</p>
          <p className="text-foreground/60">key1.mp3 - key8.mp3, drums.mp3, bass.mp3, favorite.mp3</p>
        </div>
      </div>
    </div>
  );
};

export default VirtualStemPlayer;
