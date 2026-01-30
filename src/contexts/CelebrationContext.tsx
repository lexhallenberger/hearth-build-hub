import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Confetti } from '@/components/animations/Confetti';

interface CelebrationContextType {
  celebrate: (type?: 'deal_won' | 'approval' | 'milestone') => void;
}

const CelebrationContext = createContext<CelebrationContextType | null>(null);

export function useCelebration() {
  const context = useContext(CelebrationContext);
  if (!context) {
    throw new Error('useCelebration must be used within a CelebrationProvider');
  }
  return context;
}

interface CelebrationProviderProps {
  children: ReactNode;
}

export function CelebrationProvider({ children }: CelebrationProviderProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [celebrationType, setCelebrationType] = useState<'deal_won' | 'approval' | 'milestone'>('deal_won');

  const celebrate = (type: 'deal_won' | 'approval' | 'milestone' = 'deal_won') => {
    setCelebrationType(type);
    setShowConfetti(true);
    
    // Auto-hide after animation
    setTimeout(() => {
      setShowConfetti(false);
    }, 3500);
  };

  const particleCount = celebrationType === 'deal_won' ? 80 : 
                        celebrationType === 'approval' ? 50 : 30;

  return (
    <CelebrationContext.Provider value={{ celebrate }}>
      {children}
      <Confetti 
        active={showConfetti} 
        particleCount={particleCount}
        duration={3000}
      />
    </CelebrationContext.Provider>
  );
}