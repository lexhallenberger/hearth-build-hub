import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  scale: number;
  velocityX: number;
  velocityY: number;
  rotationVelocity: number;
}

interface ConfettiProps {
  active: boolean;
  duration?: number;
  particleCount?: number;
  className?: string;
}

const COLORS = [
  '#22c55e', // green
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#f59e0b', // amber
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f43f5e', // rose
  '#84cc16', // lime
];

export function Confetti({
  active,
  duration = 3000,
  particleCount = 50,
  className,
}: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (active) {
      setIsVisible(true);
      const newPieces: ConfettiPiece[] = [];
      
      for (let i = 0; i < particleCount; i++) {
        newPieces.push({
          id: i,
          x: 50 + (Math.random() - 0.5) * 20,
          y: -10,
          rotation: Math.random() * 360,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          scale: 0.5 + Math.random() * 0.5,
          velocityX: (Math.random() - 0.5) * 15,
          velocityY: Math.random() * 3 + 2,
          rotationVelocity: (Math.random() - 0.5) * 20,
        });
      }
      
      setPieces(newPieces);

      // Hide after duration
      const timer = setTimeout(() => {
        setIsVisible(false);
        setPieces([]);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [active, duration, particleCount]);

  if (!isVisible || pieces.length === 0) return null;

  return (
    <div className={cn('fixed inset-0 pointer-events-none overflow-hidden z-50', className)}>
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute w-3 h-3"
          style={{
            left: `${piece.x}%`,
            backgroundColor: piece.color,
            transform: `scale(${piece.scale}) rotate(${piece.rotation}deg)`,
            animation: `confetti-fall ${1.5 + Math.random()}s ease-out forwards`,
            animationDelay: `${Math.random() * 0.3}s`,
            borderRadius: Math.random() > 0.5 ? '50%' : '0',
            '--velocity-x': `${piece.velocityX}vw`,
            '--velocity-y': `${piece.velocityY}vh`,
            '--rotation': `${piece.rotationVelocity * 20}deg`,
          } as React.CSSProperties}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% {
            top: -5%;
            opacity: 1;
          }
          100% {
            top: 100%;
            transform: translateX(var(--velocity-x)) rotate(var(--rotation)) scale(0.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}