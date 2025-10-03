import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, Music, Drum, Heart } from 'lucide-react';

interface AudioControlsProps {
  label: string;
  isPlaying: boolean;
  onToggle: () => void;
  type: 'drums' | 'bass' | 'favorite';
}

const iconMap = {
  drums: Drum,
  bass: Music,
  favorite: Heart,
};

const colorMap = {
  drums: 'from-primary to-primary-glow',
  bass: 'from-secondary to-primary',
  favorite: 'from-accent to-secondary',
};

export const AudioControls = ({ label, isPlaying, onToggle, type }: AudioControlsProps) => {
  const Icon = iconMap[type];
  const gradient = colorMap[type];

  return (
    <Card className="p-6 border-2 border-primary/30 bg-card/80 backdrop-blur-sm hover:shadow-glow transition-all duration-300">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${gradient}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            {label}
          </h3>
        </div>
        <Button
          onClick={onToggle}
          className={`w-full text-base font-semibold transition-all duration-300 ${
            isPlaying 
              ? `bg-gradient-to-r ${gradient} shadow-glow-lg hover:shadow-glow` 
              : 'bg-muted hover:bg-muted/80 border-2 border-primary/40'
          }`}
          size="lg"
        >
          {isPlaying ? (
            <>
              <Pause className="w-5 h-5 mr-2" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              Play
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};
