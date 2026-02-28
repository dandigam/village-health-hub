import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';

interface CampContextType {
  selectedCamp: string;
  setSelectedCamp: (camp: string) => void;
  campId: number | null;
  campEventId: number | null;
}

const CampContext = createContext<CampContextType | undefined>(undefined);

export function CampProvider({ children }: { children: ReactNode }) {
  const [selectedCamp, setSelectedCamp] = useState('');
  const [campId, setCampId] = useState<number | null>(null);
  const [campEventId, setCampEventId] = useState<number | null>(null);

  return (
    <CampContext.Provider value={{ selectedCamp, setSelectedCamp, campId, campEventId }}>
      {children}
    </CampContext.Provider>
  );
}

/** Inner component that syncs auth context to camp context after AuthProvider is available */
export function CampAuthSync() {
  const { user } = useAuth();
  const camp = useCamp();

  useEffect(() => {
    if (user?.context?.campName && !camp.selectedCamp) {
      camp.setSelectedCamp(user.context.campName);
    }
  }, [user?.context?.campName]);

  return null;
}

export function useCamp() {
  const context = useContext(CampContext);
  if (context === undefined) {
    throw new Error('useCamp must be used within a CampProvider');
  }
  return context;
}
