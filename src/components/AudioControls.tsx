import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, Music2, Drum, Star } from 'lucide-react';

interface AudioControlsProps {
  label: string;
  isPlaying: boolean;
  onToggle: () => void;
  type: 'drums' | 'bass' | 'favorite';
}

const iconMap = {
  drums: Drum,
  bass: Music2,
  favorite: Star,
};

export const AudioControls = ({ label, isPlaying, onToggle, type }: AudioControlsProps) => {
  const Icon = iconMap[type];
  const isFavorite = type === 'favorite';

  return (
    <Card className="p-5 border shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-primary" />
          <h3 className="text-base font-semibold">{label}</h3>
        </div>
        
        <Button
          onClick={onToggle}
          variant={isPlaying && !isFavorite ? 'default' : 'outline'}
          size="lg"
          className={`w-full rounded-full h-12 transition-all duration-300 ${
            isFavorite 
              ? 'hover:scale-110 hover:shadow-lg active:scale-95' 
              : 'hover:scale-105'
          } ${
            isFavorite && isPlaying 
              ? 'animate-pulse bg-primary text-primary-foreground border-primary' 
              : ''
          }`}
        >
          {isFavorite ? (
            <>
              <Star className={`w-4 h-4 mr-2 fill-current transition-transform ${
                isPlaying ? 'animate-spin' : ''
              }`} />
              {isPlaying ? 'Playing...' : 'Play Sound'}
            </>
          ) : isPlaying ? (
            <>
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Play
            </>
          )}
        </Button>
        
        {!isFavorite && (
          <div className="text-xs text-muted-foreground">
            {isPlaying ? '● Playing' : '○ Stopped'}
          </div>
        )}
      </div>
    </Card>
  );
};
