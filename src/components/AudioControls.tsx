import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, Volume2 } from 'lucide-react';

interface AudioControlsProps {
  label: string;
  isPlaying: boolean;
  onToggle: () => void;
  type: 'drums' | 'bass' | 'favorite';
}

export const AudioControls = ({ label, isPlaying, onToggle, type }: AudioControlsProps) => {
  const getIcon = () => {
    if (type === 'favorite') return <Volume2 className="w-6 h-6" />;
    return isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />;
  };

  const getVariant = () => {
    if (type === 'favorite') return 'default';
    return isPlaying ? 'secondary' : 'default';
  };

  return (
    <Card className="p-4">
      <div className="flex flex-col items-center gap-3">
        <h3 className="text-lg font-semibold">{label}</h3>
        <Button
          onClick={onToggle}
          variant={getVariant()}
          size="lg"
          className="w-32 h-32 rounded-full text-lg"
        >
          {getIcon()}
        </Button>
        {type !== 'favorite' && (
          <p className="text-sm text-muted-foreground">
            {isPlaying ? 'Playing' : 'Paused'}
          </p>
        )}
      </div>
    </Card>
  );
};
